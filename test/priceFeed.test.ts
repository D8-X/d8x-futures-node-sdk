import PriceFeeds from "../src/priceFeeds";
import MarketData from "../src/marketData";
import PerpetualDataHandler from "../src/perpetualDataHandler";
import {
  NodeSDKConfig,
  PriceFeedSubmission,
  Order,
  PerpetualStaticInfo,
  BUY_SIDE,
  SELL_SIDE,
} from "../src/nodeSDKTypes";

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
    config = PerpetualDataHandler.readSDKConfig("testnet");
    if (RPC != undefined) {
      config.nodeURL = RPC;
    }
    config.priceFeedEndpoints = [{ type: "pyth", endpoint: "https://pyth.testnet.quantena.tech/api" }];
    mktData = new MarketData(config);
    await mktData.createProxyInstance();
  });
  it("get recent prices and submission info for perpetual", async () => {
    let priceFeeds = new PriceFeeds(mktData, config.priceFeedConfigNetwork);
    let prices = await priceFeeds.fetchLatestFeedPriceInfoForPerpetual("ETH-USDC-USDC");
    console.log("pyth price info = ", prices.prices);
    console.log("symbols = ", prices.symbols);
  });
  it("get recent prices for perpetual", async () => {
    let priceFeeds = new PriceFeeds(mktData, config.priceFeedConfigNetwork);
    let symbolSet = new Set<string>();
    symbolSet.add("ETH-USDC");
    priceFeeds.initializeTriangulations(symbolSet);
    let prices = await priceFeeds.fetchPricesForPerpetual("ETH-USDC-USDC");
    console.log("pyth price info = ", prices);
  });
  it("get recent prices", async () => {
    let priceFeeds = new PriceFeeds(mktData, config.priceFeedConfigNetwork);
    //let query = "https://pyth.testnet.quantena.tech/api/latest_price_feeds?ids[]=0x796d24444ff50728b58e94b1f53dc3a406b2f1ba9d0d0b91d4406c37491a6feb&ids[]=0xf9c0172ba10dfa4d19088d94f5bf61d3b54d5bd7483a322a982e1373ee8ea31b";
    let prices = await priceFeeds.fetchAllFeedPrices();
    console.log("pyth price info = ", prices);
  });

  it("get recent prices from market data directly", async () => {
    let prices = await mktData.fetchLatestFeedPriceInfo("MATIC-USDC-USDC");
    console.log("pyth price info = ", prices.prices);
    console.log("symbols = ", prices.symbols);
  });
  it("triangulation test", async () => {
    let priceFeeds = new PriceFeeds(mktData, config.priceFeedConfigNetwork);
    let symbolSet = new Set<string>();
    symbolSet.add("BTC-USD");
    symbolSet.add("BTC-USDC");
    symbolSet.add("ETH-USDC");
    priceFeeds.initializeTriangulations(symbolSet);
    let timestampSec = Math.floor(Date.now() / 1000);
    let fakeSubmission: PriceFeedSubmission = {
      symbols: ["BTC-USD", "ETH-USD", "USDC-USD"],
      priceFeedVaas: ["", "", ""],
      prices: [20000, 1400, 0.95],
      isMarketClosed: [false, true, false],
      timestamps: [timestampSec, timestampSec, timestampSec - 70_000],
    };
    let px = priceFeeds.calculateTriangulatedPricesFromFeedInfo(["ETH-USDC", "BTC-USDC", "ETH-USD"], fakeSubmission);
    let pricesExpected = [1400 / 0.95, 20000 / 0.95, 1400];
    expect(px[0][0]).toBeCloseTo(pricesExpected[0], 5);
    expect(px[0][1]).toBeCloseTo(pricesExpected[1], 5);
    expect(px[0][2]).toBeCloseTo(pricesExpected[2], 5);
    expect(px[1][0]).toBeTruthy();
    expect(px[1][1]).toBeFalsy();
    expect(px[1][2]).toBeTruthy(); // market closed
  });
  it("fetch info from data handler", async () => {
    let l = await mktData.fetchPriceSubmissionInfoForPerpetual("MATIC-USDC-USDC");
    console.log(l);
  });
});
