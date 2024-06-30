import { StaticJsonRpcProvider } from "@ethersproject/providers";

/**
 * OnChainPxFeed: get a price from a chainlink-style oracle
 */
export default abstract class OnChainPxFeed {
  public rpcs: string[];
  protected lastRpc: number = 0;
  protected lastPx: number | undefined;
  protected provider: StaticJsonRpcProvider;
  protected lastResponseTs: number = 0;

  protected abstract fetchPrice(delay: boolean): Promise<void>;

  public constructor(rpcs: string[]) {
    this.rpcs = rpcs;
    this.lastRpc = Math.floor(Math.random() * rpcs.length);
    this.provider = new StaticJsonRpcProvider(this.rpcs[this.lastRpc]);
  }

  protected setRpc() {
    this.lastRpc = (this.lastRpc + 1) % this.rpcs.length;
    this.provider = new StaticJsonRpcProvider(this.rpcs[this.lastRpc]);
  }

  public async getPrice(): Promise<number> {
    if (this.lastPx == undefined || Date.now() - this.lastResponseTs > 10 * 60 * 1000) {
      await this.fetchPrice(false);
      return this.lastPx!;
    }
    this.fetchPrice(true);
    return this.lastPx;
  }
}
