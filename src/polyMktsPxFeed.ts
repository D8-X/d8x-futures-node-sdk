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
  public async fetchPriceForSym(sym: string): Promise<PredMktPriceInfo> {
    const mkt = this.ids.get(sym);
    if (mkt == undefined) {
      throw new Error(`symbol not in polymarket universe: ${sym}`);
    }
    return this.fetchPrice(mkt.id);
  }

  // fetch price of the form 1+p from oracle, also fetches ema
  public async fetchPrice(tokenIdHex: string): Promise<PredMktPriceInfo> {
    const query = this.oracleEndpoint + tokenIdHex;
    let response = await fetch(query);
    if (response.status !== 200) {
      throw new Error(`unexpected status code: ${response.status}`);
    }
    if (!response.ok) {
      throw new Error(`failed to fetch posts (${response.status}): ${response.statusText} ${query}`);
    }
    const data = await response.json();
    const emaObj = data.parsed[0].ema_price as PriceFeedJson;
    const pxObj = data.parsed[0].price as PriceFeedJson;

    const px = Number(pxObj.price) * Math.pow(10, pxObj.expo);
    const ema = Number(emaObj.price) * Math.pow(10, emaObj.expo);
    const params = BigInt(emaObj.conf);
    const conf = BigInt(pxObj.conf);
    return { s2: px, ema: ema, s2MktClosed: false, conf: conf, predMktCLOBParams: params } as PredMktPriceInfo;
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
