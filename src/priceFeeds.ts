import MarketData from "./marketData";

export default class PriceFeeds {
  private priceAPIendpoint: string;
  private mktData : MarketData;

  constructor(priceAPIendpoint: string, mktData: MarketData) {
    this.priceAPIendpoint = priceAPIendpoint;
    this.mktData = mktData;
  }

  /**
   * 
   * @param symbol perpetual symbol of the form BTC-USD-MATIC
   * @returns array of price feed updates that can be submitted to the smart contract and corresponding timestamps
   */
  public async fetchCurrentPrices(symbol: string) : Promise<{pricefeeds: string[], timestamps: number[]}> {
    let query = this.priceAPIendpoint+"/latest_vaas_ts?";
    let feedIds = this.mktData.getPythIds(symbol);
    
    for (let k=0; k<feedIds.length; k++) {
      query = query + "ids[]="+feedIds[k]+"&"
    }
    const headers = {headers: {'Content-Type': 'application/json'}};
    let response = await fetch(query, headers);
    if (!response.ok) {
      throw new Error(`Failed to fetch posts (${response.status}): ${response.statusText}`);
    }
    let values=(await response.json()) as string[];
    const priceFeedUpdates = new Array<string>();
    const timestamps = new Array<number>();
    for(let k=0; k<values.length; k++) {
      priceFeedUpdates.push("0x" + Buffer.from(values[k][0], "base64").toString("hex"));
      timestamps.push(parseInt(values[k][1]));
    }
    return {pricefeeds: priceFeedUpdates, timestamps: timestamps};
  }

}