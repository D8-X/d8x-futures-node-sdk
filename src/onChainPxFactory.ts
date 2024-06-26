import OnChainPxFeedRedStone from "./onChainPxFeedRedStone";
import OnChainPxFeedAngle from "./onChainPxFeedAngle";
import OnChainPxFeed from "./onChainPxFeed";

export interface PriceFeedOnChainConfig {
  name: string;
  rpcs: Array<string>;
  pxFeedAddress: string;
  decimals: number;
}

export default class OnChainPxFeedFactory {
  static createFeed(symbol: string): OnChainPxFeed | undefined {
    let f = require("./config/priceFeedOnChain.json") as PriceFeedOnChainConfig[];
    for (let k = 0; k < f.length; k++) {
      if (f[k].name == symbol) {
        if (symbol == "WEETH-ETH") {
          return new OnChainPxFeedRedStone(f[k].pxFeedAddress, f[k].decimals, f[k].rpcs);
        } else if (symbol == "STUSD-USDC") {
          return new OnChainPxFeedAngle(f[k].rpcs);
        }
      }
    }
    return undefined;
  }
}
