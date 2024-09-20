import { decNToFloat } from "./d8XMath";
import { sleepForSec } from "./utils";
import OnChainPxFeed from "./onChainPxFeed";
import { Contract } from "ethers";

/**
 * OnChainPxFeedRedStone: get a price from a chainlink-style oracle
 */
export default class OnChainPxFeedRedStone extends OnChainPxFeed {
  private delayMs = 5000;

  //weETH/eETH on Arbitrum One 42161
  private ctrctAddr;
  private decimals;
  private fetchInProgress = false;
  //static ctrctAddr = "0x119A190b510c9c0D5Ec301b60B2fE70A50356aE9";
  static abi = require("./abi/redStoneAbi.json");

  public constructor(ctrctAddr: string, decimals: number, rpcs: string[]) {
    super(rpcs);

    this.ctrctAddr = ctrctAddr;
    this.decimals = decimals;
  }

  protected override async fetchPrice(delay: boolean): Promise<void> {
    if (!this.fetchInProgress) {
      this.fetchInProgress = true;
      this.lastResponseTs = Date.now();
      let hasErr = false;
      for (let trial = 0; trial < this.rpcs.length; trial++) {
        try {
          let proxyContract = new Contract(this.ctrctAddr, OnChainPxFeedRedStone.abi, this.provider);
          let data = await proxyContract.latestRoundData();
          this.lastPx = decNToFloat(data.answer, this.decimals);
          break;
        } catch (err) {
          console.log(`onChainPxSources error ${this.rpcs[this.lastRpc]}: retrying with other rpc`);
          hasErr = true;
        }
        this.setRpc();
      }
      if (hasErr) {
        console.log("onChainPxSources not successful");
      }

      if (delay) {
        await sleepForSec(this.delayMs / 1000);
      }
      this.fetchInProgress = false;
    }
  }
}
