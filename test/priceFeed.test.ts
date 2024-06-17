import MarketData from "../src/marketData";
import { NodeSDKConfig, PriceFeedSubmission } from "../src/nodeSDKTypes";
import PerpetualDataHandler from "../src/perpetualDataHandler";
import PriceFeeds from "../src/priceFeeds";

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
    config = PerpetualDataHandler.readSDKConfig("xlayer");
    if (RPC != undefined) {
      config.nodeURL = RPC;
    }
    config.priceFeedEndpoints = [
      { type: "pyth", endpoints: ["https://hermes.pyth.network/api"] }, //, "https://xc-testnet.pyth.network/api"] },
    ];
    mktData = new MarketData(config);
    await mktData.createProxyInstance();
  });

  it("trimEndpoint", async () => {
    let v = "https://blabla.xyz/api/";
    let res = PriceFeeds.trimEndpoint(v);
    expect(res == "https://blabla.xyz").toBeTruthy;

    v = "https://blabla.xyz/api";
    res = PriceFeeds.trimEndpoint(v);
    expect(res == "https://blabla.xyz").toBeTruthy;

    v = "https://blabla.xyz/";
    res = PriceFeeds.trimEndpoint(v);
    expect(res == "https://blabla.xyz").toBeTruthy;

    v = "https://blabla.xyz/api/blabla/";
    res = PriceFeeds.trimEndpoint(v);
    expect(res == "https://blabla.xyz/api/blabla").toBeTruthy;
  });

  it("get recent prices and submission info for perpetual", async () => {
    let priceFeeds = new PriceFeeds(mktData, config.priceFeedConfigNetwork);
    let prices = await priceFeeds.fetchLatestFeedPriceInfoForPerpetual("BTC-USDT-USDT");
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
    let prices = await priceFeeds.fetchAllFeedPrices();
    console.log("pyth price info = ", prices);
  });

  it("get recent prices from market data directly", async () => {
    let prices = await mktData.fetchLatestFeedPriceInfo("BTC-USDT-USDT");
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
    let symbols = new Map<string, string[]>();
    let ids = new Array<string>();
    let s = ["BTC-USD", "ETH-USD", "USDC-USD"];
    for (let j = 0; j < s.length; j++) {
      const id = "0x" + j.toString();
      symbols[id] = [s[j]];
      ids.push(id);
    }
    let fakeSubmission: PriceFeedSubmission = {
      symbols: symbols,
      ids: ids,
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
    let l = await mktData.fetchPriceSubmissionInfoForPerpetual("WOKB-USD-WOKB");
    console.log(l);
  });
});
