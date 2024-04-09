import { Contract } from "@ethersproject/contracts";
import { StaticJsonRpcProvider } from "@ethersproject/providers";
import { decNToFloat } from "./d8XMath";
import { BigNumber } from "ethers";

/**
 * OnChainPxFeed: get a price from a chainlink-style oracle
 */
export default class OnChainPxFeed {
  private lastResponseTs: number = 0;
  private lastPx: number = 0;
  private lastRpc: number = 0;
  private delayMs = 2000;
  public rpcs: string[];
  private provider: StaticJsonRpcProvider;
  //weETH/eETH on Arbitrum One 42161
  private ctrctAddr;
  private decimals;
  //static ctrctAddr = "0x119A190b510c9c0D5Ec301b60B2fE70A50356aE9";
  static abi = require("./abi/redStoneAbi.json");

  public constructor(ctrctAddr: string, decimals: number, rpcs: string[]) {
    this.rpcs = rpcs;
    this.lastRpc = Math.floor(Math.random() * rpcs.length);
    this.provider = new StaticJsonRpcProvider(this.rpcs[this.lastRpc]);
    this.ctrctAddr = ctrctAddr;
    this.decimals = decimals;
  }

  public async getPrice() {
    if (Date.now() - this.lastResponseTs < this.delayMs) {
      return this.lastPx;
    }
    this.lastResponseTs = Date.now();
    let hasErr = false;
    for (let trial = 0; trial < this.rpcs.length; trial++) {
      try {
        let proxyContract = new Contract(this.ctrctAddr, OnChainPxFeed.abi, this.provider);
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
      console.log("onChainPxSources not successful returning last price");
      return this.lastPx;
    }
    return this.lastPx;
  }

  private setRpc() {
    this.lastRpc = (this.lastRpc + 1) % this.rpcs.length;
    this.provider = new StaticJsonRpcProvider(this.rpcs[this.lastRpc]);
  }
}
