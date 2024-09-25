import { probToPrice } from "./d8XMath";
import type { PriceFeedConfig, PriceFeedJson, PredMktPriceInfo } from "./nodeSDKTypes";

interface PolyConfig {
  sym: string;
  idDec: string;
  id: string;
}

/**
 * PolyMktsPxFeed gets prices from the official polymarket api
 * and applies the 1+px transformation
 *
 */
export default class PolyMktsPxFeed {
  private ids: Map<string, PolyConfig>;
  private oracleEndpoint: string;

  constructor(config: PriceFeedConfig) {
    this.ids = new Map<string, PolyConfig>();
    this.oracleEndpoint = "";
    for (let k = 0; k < config.endpoints.length; k++) {
      if (config.endpoints[k].type == "polymarket") {
        let endp = config.endpoints[k].writeEndpoints;
        this.oracleEndpoint = endp[Math.floor(Math.random() * endp.length)];
        break;
      }
    }
    if (this.oracleEndpoint == "") {
      throw Error("no polymarkets write endpoint defined in priceFeedConfig");
    }
    for (let k = 0; k < config.ids.length; k++) {
      if (config.ids[k].type == "polymarket") {
        const sym = config.ids[k].symbol;
        const idDec = PolyMktsPxFeed.hexToDecimalString(config.ids[k].id);
        const el: PolyConfig = {
          sym: sym,
          id: config.ids[k].id,
          idDec: idDec,
        };
        this.ids.set(sym, el);
      }
    }

    this.oracleEndpoint = this.oracleEndpoint.replace(/\/$/, "") + "/v2/updates/price/latest?encoding=base64&ids[]=";
  }

  public isPolyMktsSym(sym: string) {
    return this.ids.get(sym) == undefined;
  }

  // returns index price, ema price, conf in tbps, parameters for order book
  // for the provided symbols
  public async fetchPricesForSyms(syms: string[]): Promise<PredMktPriceInfo[]> {
    let ids = new Array<string>();
    for (let k = 0; k < syms.length; k++) {
      const mkt = this.ids.get(syms[k]);
      if (mkt == undefined) {
        throw new Error(`symbol not in polymarket universe: ${syms[k]}`);
      }
      ids.push(mkt.id);
    }
    return this.fetchPrices(ids);
  }

  // fetch price of the form 1+p from oracle, also fetches ema
  public async fetchPrices(tokenIdHex: string[]): Promise<PredMktPriceInfo[]> {
    // build query
    let query = this.oracleEndpoint + tokenIdHex[0];
    for (let k = 1; k < tokenIdHex.length; k++) {
      query += "&ids[]=" + tokenIdHex[k];
    }

    let response = await fetch(query);
    if (response.status !== 200) {
      throw new Error(`unexpected status code: ${response.status}`);
    }
    if (!response.ok) {
      throw new Error(`failed to fetch posts (${response.status}): ${response.statusText} ${query}`);
    }
    const data = await response.json();
    let res = new Array<PredMktPriceInfo>();
    for (let k = 0; k < tokenIdHex.length; k++) {
      const emaObj = data.parsed[k].ema_price as PriceFeedJson;
      const pxObj = data.parsed[k].price as PriceFeedJson;
      const marketClosed = data.parsed[k].metadata.market_closed;
      const px = Number(pxObj.price) * Math.pow(10, pxObj.expo);
      const ema = Number(emaObj.price) * Math.pow(10, emaObj.expo);
      const params = BigInt(emaObj.conf);
      const conf = BigInt(pxObj.conf);
      const info = {
        s2: px,
        ema: ema,
        s2MktClosed: marketClosed,
        conf: conf,
        predMktCLOBParams: params,
      } as PredMktPriceInfo;
      res.push(info);
    }
    return res;
  }

  public async fetchPriceFromAPI(tokenIdDec: string): Promise<number> {
    const query = "https://clob.polymarket.com/midpoint?token_id=" + tokenIdDec;
    let response = await fetch(query);
    if (response.status !== 200) {
      throw new Error(`unexpected status code: ${response.status}`);
    }
    if (!response.ok) {
      throw new Error(`failed to fetch posts (${response.status}): ${response.statusText} ${query}`);
    }
    const data = await response.json();
    const px = Number(data.mid);
    return probToPrice(px);
  }

  static hexToDecimalString(hexString: string): string {
    // Remove the "0x" prefix if it exists
    if (hexString.startsWith("0x")) {
      hexString = hexString.slice(2);
    }

    // Convert the hex string to a BigInt
    const bigIntValue = BigInt("0x" + hexString);

    // Convert the BigInt to a decimal string
    return bigIntValue.toString(10);
  }
}
