import {BigNumber} from "ethers";
import PerpetualDataHandler from "./perpetualDataHandler";
import Triangulator from "./triangulator";
import {PriceFeedConfig, PriceFeedSubmission, VaaPxExtension} from "./nodeSDKTypes"
import {decNToFloat} from "./d8XMath";

/**
 * This class communicates with the REST API that provides price-data that is
 * to be submitted to the smart contracts for certain functions such as
 * trader liquidations, trade executions, change of trader margin amount.
 */
export default class PriceFeeds {
  private config: PriceFeedConfig;
  private feedEndpoints: Array<string>; //feedEndpoints[endpointId] = endpointstring
  private feedInfo: Map<string, {symbol:string, endpointId: number}>; // priceFeedId -> symbol, endpointId
  private dataHandler : PerpetualDataHandler;
  // store triangulation paths given the price feeds
  private triangulations : Map<string, [string[], boolean[]]>; 

  constructor(dataHandler: PerpetualDataHandler, priceFeedConfigNetwork: string) {
    
    let configs = <PriceFeedConfig[]>require("../config/priceFeedConfig.json");
    this.config = PriceFeeds._selectConfig(configs, priceFeedConfigNetwork);
    [this.feedInfo, this.feedEndpoints] = PriceFeeds._constructFeedInfo(this.config);
    this.dataHandler = dataHandler;
    this.triangulations = new Map<string, [string[], boolean[]]>(); 
  }

  /**
   * Pre-processing of triangulations for symbols, given the price feeds
   * @param symbols set of symbols we want to triangulate from price feeds
   */
  public initializeTriangulations(symbols: Set<string>) {
    let feedSymbols = new Array<string>();
    for(let [key, value] of this.feedInfo) {
      feedSymbols.push(value.symbol);
    }
    for(let symbol of symbols.values()) {
      let triangulation = Triangulator.triangulate(feedSymbols, symbol);
      this.triangulations.set(symbol, triangulation);
    }
  }
  
  /**
   * Get the latest prices for a given perpetual from the offchain oracle
   * networks
   * @param symbol perpetual symbol of the form BTC-USD-MATIC
   * @returns array of price feed updates that can be submitted to the smart contract
   * and corresponding price information
   */
  public async fetchLatestFeedPrices(symbol: string) : Promise<PriceFeedSubmission> {
    let feedIds = this.dataHandler.getPythIds(symbol);
    let queries = new Array<string>(this.feedEndpoints.length);
    // we need to preserve the order of the price feeds
    let orderEndpointNumber = new Array<number>();
    // count how many prices per endpoint
    let idCountPriceFeeds = new Array<number>(this.feedEndpoints.length);
    let symbols = new Array<string>();
    for (let k = 0; k < feedIds.length; k++) {
      let info = this.feedInfo.get(feedIds[k]);
      if (info == undefined) {
        throw new Error(`priceFeeds: config for symbol ${symbol} insufficient`);
      }
      let id = info.endpointId;
      symbols.push(info.symbol);
      if (queries[id] == undefined) {
        // each id can have a different endpoint, but we cluster
        // the queries into one per endpoint
        queries[id] = this.feedEndpoints[id] + "/latest_vaas_px?";
        idCountPriceFeeds[id] = 0;
      }
      queries[id] = queries[id] + "ids[]=" + feedIds[k] + "&";
      orderEndpointNumber.push(id * 100 + idCountPriceFeeds[id]);
      idCountPriceFeeds[id] = idCountPriceFeeds[id] + 1;
    }

    let data = await Promise.all(
      queries.map(async (q) => {
        if (q != undefined) {
          return this.fetchQuery(q);
        } else {
          return [[], []];
        }
      })
    );

    // re-order arrays so we preserve the order of the feeds
    const priceFeedUpdates = new Array<string>();
    const prices = new Array<number>()
    const timestamps = new Array<number>();
    for(let k=0; k<orderEndpointNumber.length; k++) {
      let endpointId = Math.floor(orderEndpointNumber[k]/100);
      let idWithinEndpoint = orderEndpointNumber[k]-100*endpointId;
      priceFeedUpdates.push(data[endpointId][0][idWithinEndpoint]);
      let pxInfo: VaaPxExtension = data[endpointId][1][idWithinEndpoint];
      let price = decNToFloat(BigNumber.from(pxInfo.price), -pxInfo.expo);
      prices.push(price);
      timestamps.push(pxInfo.publish_time);
    }
    
    return {"symbols": symbols, priceFeedVaas: priceFeedUpdates, prices: prices, timestamps: timestamps};
  }

  /**
   * Extract pair-prices from underlying price feeds via triangulation
   * The function either needs a direct price feed or a defined triangulation to succesfully
   * return a triangulated price
   * @param symbols array of pairs for which we want prices, e.g., [BTC-USDC, ETH-USD]
   * @param feeds data obtained via fetchLatestFeedPrices
   * @returns array of prices with same order as symbols
   */
  public calculateTriangulatedPricesFromFeeds(symbols: string[], feeds: PriceFeedSubmission) : number[] {
    let prices = new Array<number>();
    let priceMap = new Map<string, number>();
    for(let j=0; j<feeds.prices.length; j++) {
      priceMap.set(feeds.symbols[j], feeds.prices[j]);
    }
    for(let k=0; k<symbols.length; k++) {
      let triangulation : [string[], boolean[]] | undefined = this.triangulations.get(symbols[k]);
      if(triangulation==undefined) {
        let feedPrice = priceMap.get(symbols[k]);
        if (feedPrice==undefined) {
          throw new Error(`PriceFeeds: no triangulation defined for ${symbols[k]}`);
        } else {
          prices.push(feedPrice);
          continue;
        }
      }
      let px = Triangulator.calculateTriangulatedPrice(triangulation, priceMap);
      prices.push(px);
    }
    return prices;
  }

  /**
   * Queries the REST endpoint and returns parsed price data
   * @param query query price-info from endpoint
   * @returns vaa and price info
   */
  private async fetchQuery(query: string) : Promise<[string[], VaaPxExtension[]]> {
    const headers = {headers: {'Content-Type': 'application/json'}};
    let response = await fetch(query, headers);
    if (!response.ok) {
      throw new Error(`Failed to fetch posts (${response.status}): ${response.statusText}`);
    }
    let values = (await response.json()) as Array<[string, VaaPxExtension]>;
    const priceFeedUpdates = new Array<string>();
    const px = new Array<VaaPxExtension>();
    for (let k = 0; k < values.length; k++) {
      priceFeedUpdates.push("0x" + Buffer.from(values[k][0], "base64").toString("hex"));
      px.push(values[k][1]);
    }
    return [priceFeedUpdates, px];
  }

  /**
   * Searches for configuration for given network
   * @param configs pricefeed configuration from json 
   * @param network e.g. testnet
   * @returns selected configuration
   */
  static _selectConfig(configs: PriceFeedConfig[], network: string) : PriceFeedConfig {
    let k=0;
    while(k<configs.length) {
      if (configs[k].network==network) {
        return configs[k];
      }
      k=k+1;
    }
    throw new Error(`PriceFeeds: config not found for network ${network}`);
  }

  /**
   * Wraps configuration into convenient data-structure
   * @param config configuration for the selected network
   * @returns feedInfo-map and endPoints-array
   */
  static _constructFeedInfo(config: PriceFeedConfig) : [Map<string, {symbol:string, endpointId: number}>, string[]]{
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

}
