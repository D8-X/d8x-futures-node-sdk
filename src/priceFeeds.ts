import {BigNumber} from "ethers";
import MarketData from "./marketData";
import {PriceFeedConfig, PriceFeedSubmission, VaaPxExtension} from "./nodeSDKTypes"
import {decNToFloat} from "./d8XMath";

export default class PriceFeeds {
  private config: PriceFeedConfig;
  private feedEndpoints: Array<string>; //feedEndpoints[endpointId] = endpointstring
  private feedInfo: Map<string, {symbol:string, endpointId: number}>; // priceFeedId -> symbol, endpointId
  private mktData : MarketData;
 
  constructor(mktData: MarketData, priceFeedConfigNetwork: string) {
    
    let configs = <PriceFeedConfig[]>require("../config/priceFeedConfig.json");
    this.config = PriceFeeds.selectConfig(configs, priceFeedConfigNetwork);
    [this.feedInfo, this.feedEndpoints] = PriceFeeds.constructFeedInfo(this.config);
    this.mktData = mktData;
  }

  static selectConfig(configs: PriceFeedConfig[], network: string) {
    let k=0;
    while(k<configs.length) {
      if (configs[k].network==network) {
        return configs[k];
      }
      k=k+1;
    }
    throw new Error(`PriceFeeds: config not found for network ${network}`);
  }

  static constructFeedInfo(config: PriceFeedConfig) : [Map<string, {symbol:string, endpointId: number}>, string[]]{
    let feed = new Map<string, {symbol:string, endpointId: number}>();
    let endpointId = -1;
    let type="";
    let feedEndpoints = new Array<string>();
    for(let k=0; k<config.endpoints.length; k++) {
      feedEndpoints.push(config.endpoints[k].endpoint);
    }
    for(let k=0; k<config.ids.length; k++) {
      if (type!=config.ids[k].type) {
        type = config.ids[k].type;
        let j=0;
        while(j<config.endpoints.length) {
          if(config.endpoints[j].type == type) {
            endpointId = j;
            j=config.endpoints.length;
          }
          j++;
        }
        if(config.endpoints[endpointId].type!=type) {
          throw new Error(`priceFeeds: no enpoint found for ${type} check priceFeedConfig`);
        }
      }
      feed.set(config.ids[k].id, {symbol: config.ids[k].symbol, endpointId: endpointId });
    }
    return [feed, feedEndpoints];
  }

  /**
   * 
   * @param symbol perpetual symbol of the form BTC-USD-MATIC
   * @returns array of price feed updates that can be submitted to the smart contract 
   * and corresponding price information 
   */
  public async getLatestFeedPrices(symbol: string) : Promise<PriceFeedSubmission> {
    let feedIds = this.mktData.getPythIds(symbol);
    let queries = new Array<string>(this.feedEndpoints.length);
    // we need to preserve the order of the price feeds
    let orderEndpointNumber = new Array<number>();
    // count how many prices per endpoint
    let idCountPriceFeeds = new Array<number>(this.feedEndpoints.length)
    let symbols = new Array<string>();
    for (let k=0; k<feedIds.length; k++) {
      let info = this.feedInfo.get(feedIds[k]);
      if (info==undefined) {
        throw new Error(`priceFeeds: config for symbol ${symbol} insufficient`);
      }
      let id = info.endpointId;
      symbols.push(info.symbol);
      if (queries[id]==undefined) {
        // each id can have a different endpoint, but we cluster
        // the queries into one per endpoint
        queries[id] = this.feedEndpoints[id]+"/latest_vaas_px?";
        idCountPriceFeeds[id]=0;
      }
      queries[id] = queries[id] + "ids[]="+feedIds[k]+"&"
      orderEndpointNumber.push(id*100+idCountPriceFeeds[id]);
      idCountPriceFeeds[id] = idCountPriceFeeds[id]+1;
    }
       
    let data = await Promise.all(queries.map(async (q) => {
      if(q!=undefined) {
        return this.fetchQuery(q);
      } else {
        return [[], []];
      }}));

    // re-order arrays so we preserve the order of the feeds
    const priceFeedUpdates = new Array<string>();
    const prices = new Array<{px: number, timestamp: number}>();
    for(let k=0; k<orderEndpointNumber.length; k++) {
      let endpointId = Math.floor(orderEndpointNumber[k]/100);
      let idWithinEndpoint = orderEndpointNumber[k]-100*endpointId;
      priceFeedUpdates.push(data[endpointId][0][idWithinEndpoint]);
      let pxInfo : VaaPxExtension = data[endpointId][1][idWithinEndpoint];
      let price = decNToFloat(BigNumber.from(pxInfo.price), -pxInfo.expo);
      let pxInfo2 = {px: price, timestamp: pxInfo.publish_time};
      prices.push(pxInfo2);
    }
    
    return {"symbols": symbols, priceFeedVaas: priceFeedUpdates, priceInfo: prices};
  }

  private async fetchQuery(query: string) : Promise<[string[], VaaPxExtension[]]> {
    const headers = {headers: {'Content-Type': 'application/json'}};
    let response = await fetch(query, headers);
    if (!response.ok) {
      throw new Error(`Failed to fetch posts (${response.status}): ${response.statusText}`);
    }
    let values=(await response.json()) as Array<[string, VaaPxExtension]>;
    const priceFeedUpdates = new Array<string>();
    const px = new Array<VaaPxExtension>();
    for(let k=0; k<values.length; k++) {
      priceFeedUpdates.push("0x" + Buffer.from(values[k][0], "base64").toString("hex"));
      px.push(values[k][1]);
    }
    return [priceFeedUpdates, px];
  }
}