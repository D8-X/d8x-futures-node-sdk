import PriceFeeds from "../src/priceFeeds";
import MarketData from "../src/marketData";
import PerpetualDataHandler from "../src/perpetualDataHandler";
import { NodeSDKConfig, PriceFeedSubmission, Order, PerpetualStaticInfo, BUY_SIDE, SELL_SIDE } from "../src/nodeSDKTypes";

let pk: string = <string>process.env.PK;
let RPC: string = <string>process.env.RPC;

jest.setTimeout(150000);

let config: NodeSDKConfig;
let mktData: MarketData;


describe("priceFeed", () => {
  beforeAll(async () => {
    if (pk == undefined) {
      console.log(`Define private key: export PK="CA52A..."`);
      expect(false);
    }
    config = PerpetualDataHandler.readSDKConfig("central-park");
    if (RPC != undefined) {
      config.nodeURL = RPC;
    }
    mktData = new MarketData(config);
    await mktData.createProxyInstance();
  });
  it("get recent prices", async()=> {
    let priceFeeds = new PriceFeeds(mktData, "testnet");
    let prices = await priceFeeds.fetchLatestFeedPrices("ETH-USD-MATIC");
    console.log("pyth price info = ", prices.prices);
    console.log("symbols = ", prices.symbols);
  });
  it("get recent prices from market data directly", async()=> {
    let prices = await mktData.fetchLatestFeedPrices("ETH-USD-MATIC");
    console.log("pyth price info = ", prices.prices);
    console.log("symbols = ", prices.symbols);
  });
  it("triangulation test", async()=> {
    let priceFeeds = new PriceFeeds(mktData, "testnet");
    let symbolSet = new Set<string>();
    symbolSet.add("BTC-USD");
    symbolSet.add("BTC-USDC");
    symbolSet.add("ETH-USDC");
    priceFeeds.initializeTriangulations(symbolSet);
    let timestampSec = Math.floor(Date.now()/1000);
    let fakeSubmission : PriceFeedSubmission = 
      {symbols: ["BTC-USD", "ETH-USD", "USDC-USD"], priceFeedVaas: ["","",""],
      prices: [20000, 1400, 0.95],
      timestamps: [timestampSec, timestampSec, timestampSec]};
    let px = priceFeeds.calculateTriangulatedPricesFromFeeds(["ETH-USDC", "BTC-USDC", "ETH-USD"], fakeSubmission);
    let pricesExpected = [1400/0.95, 20000/0.95, 1400];
    expect(px[0]).toBeCloseTo(pricesExpected[0], 5);
    expect(px[1]).toBeCloseTo(pricesExpected[1], 5);
    expect(px[2]).toBeCloseTo(pricesExpected[2], 5);

    
  });
});
  