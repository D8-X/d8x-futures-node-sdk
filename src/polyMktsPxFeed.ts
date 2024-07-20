import { probToPrice } from "./d8XMath";
import type { PriceFeedConfig } from "./nodeSDKTypes";

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

  constructor(config: PriceFeedConfig) {
    this.ids = new Map<string, PolyConfig>();
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
  }

  public isPolyMktsSym(sym: string) {
    return this.ids.get(sym) == undefined;
  }

  public async fetchPriceForSym(sym: string): Promise<number> {
    const mkt = this.ids.get(sym);
    if (mkt == undefined) {
      throw new Error(`symbol not in polymarket universe: ${sym}`);
    }
    return this.fetchPrice(mkt.idDec);
  }

  public async fetchPrice(tokenIdDec: string): Promise<number> {
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
