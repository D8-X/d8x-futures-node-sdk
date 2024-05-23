import { FeedInfo } from "./nodeSDKTypes";

export class PriceFeedInfo {
  constructor(public feeds: FeedInfo, public endpoints: string[]) {}

  /**
   * retrieves endpoint index within endpoints array for given
   * price feed id and symbol
   * @param priceFeedId
   * @param symbol
   * @returns
   */
  public getEndpointIndex(priceFeedId: string, symbol: string): number | undefined {
    return this.feeds.get(priceFeedId)?.find((x) => x.symbol.toLowerCase() === symbol.toLowerCase())?.endpointId;
  }

  /**
   * @returns a list of all symbols
   */
  public getAllSymbols(): string[] {
    const res: string[] = [];
    for (let [, values] of this.feeds) {
      values.forEach(({ symbol }) => res.push(symbol));
    }
    return res;
  }

  public numEndpoints(): number {
    return this.endpoints.length;
  }

  public getEndpointByIndex(idx: number) {
    return this.endpoints[idx];
  }

  public getFeedInfoByPriceId(priceId: string) {
    return this.feeds.get(priceId);
  }
}
