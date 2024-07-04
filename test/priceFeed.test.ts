import MarketData from "../src/marketData";
import { NodeSDKConfig, PriceFeedConfig, PriceFeedSubmission } from "../src/nodeSDKTypes";
import PerpetualDataHandler from "../src/perpetualDataHandler";
import PriceFeeds from "../src/priceFeeds";

let pk: string = <string>process.env.PK;
let RPC: string = <string>process.env.RPC;

jest.setTimeout(150000);

let config: NodeSDKConfig;
let mktData: MarketData;
let perp = "BTC-USD-STUSD";
describe("priceFeed", () => {
  beforeAll(async () => {
    if (pk == undefined) {
      console.log(`Define private key: export PK="CA52A..."`);
      expect(false);
    }
    //config = PerpetualDataHandler.readSDKConfig("xlayer");
    //perp="BTC-USDT-USDT"
    config = PerpetualDataHandler.readSDKConfig("arbitrum");
    perp = "BTC-USD-STUSD";
    if (RPC != undefined) {
      config.nodeURL = RPC;
    }
    config.priceFeedEndpoints = [
      { type: "pyth", endpoints: ["https://hermes.pyth.network/api"], writeEndpoints: [] }, //, "https://xc-testnet.pyth.network/api"] },
    ];
    mktData = new MarketData(config);
    await mktData.createProxyInstance();
  });

  it("should correctly construct non-unique price id price feeds", async () => {
    const FakePriceFeedsConfig: PriceFeedConfig = {
      endpoints: [{ endpoints: ["https://hermes.pyth.network"], type: "pyth", writeEndpoints: [] }],
      network: "pyth",
      ids: [
        {
          symbol: "STUSD-USD",
          id: "0x2b89b9dc8fdf9f34709a5b106b472f0f39bb6ca9ce04b0fd7f2e971688e2e53b",
          type: "pyth",
          origin: "Crypto.USDT/USD",
        },
        {
          symbol: "anotherSTUSD-USD",
          id: "0x2b89b9dc8fdf9f34709a5b106b472f0f39bb6ca9ce04b0fd7f2e971688e2e53b",
          type: "pyth",
          origin: "Crypto.USDT/USD",
        },
        {
          symbol: "GBP-USD",
          id: "0x84c2dde9633d93d1bcad84e7dc41c9d56578b7ec52fabedc1f335d673df0a7c1",
          type: "pyth",
          origin: "FX.GBP/USD",
        },
      ],
    };
    let [priceFeeds, endpoints] = PriceFeeds._constructFeedInfo(FakePriceFeedsConfig, false);
    console.log("FEEDS", priceFeeds, endpoints);
    expect(priceFeeds).toEqual(
      new Map(
        Object.entries({
          "0x2b89b9dc8fdf9f34709a5b106b472f0f39bb6ca9ce04b0fd7f2e971688e2e53b": [
            { symbol: "STUSD-USD", endpointId: 0 },
            { symbol: "ANOTHERSTUSD-USD", endpointId: 0 },
          ],
          "0x84c2dde9633d93d1bcad84e7dc41c9d56578b7ec52fabedc1f335d673df0a7c1": [
            {
              symbol: "GBP-USD",
              endpointId: 0,
            },
          ],
        })
      )
    );
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
    let prices = await priceFeeds.fetchLatestFeedPriceInfoForPerpetual(perp);
    console.log("pyth price info = ", prices.prices);
    console.log("symbols = ", prices.symbols);
  });
  it("get recent prices for perpetual", async () => {
    let priceFeeds = new PriceFeeds(mktData, config.priceFeedConfigNetwork);
    let symbolSet = new Set<string>();
    symbolSet.add("ETH-USDC");
    priceFeeds.initializeTriangulations(symbolSet);
    let prices = await priceFeeds.fetchPricesForPerpetual(perp);
    console.log("pyth price info = ", prices);
  });
  it("get recent prices", async () => {
    let priceFeeds = new PriceFeeds(mktData, config.priceFeedConfigNetwork);
    let prices = await priceFeeds.fetchAllFeedPrices();
    console.log("pyth price info = ", prices);
  });

  it("get recent prices from market data directly", async () => {
    let prices = await mktData.fetchLatestFeedPriceInfo(perp);
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
    let l = await mktData.fetchPriceSubmissionInfoForPerpetual(perp);
    console.log(l);
  });

  it("should correctly override endpoints of same type", () => {
    const result = PriceFeeds.overridePriceEndpointsOfSameType(
      [
        { endpoints: ["a", "b", "c"], type: "pyth", writeEndpoints: ["w1", "w2"] },
        { endpoints: ["a", "b", "c"], type: "non-overriden-pyth", writeEndpoints: ["w-pyth-3"] },
        { endpoints: ["a", "b", "c"], type: "pyth-2-empty-write", writeEndpoints: [] },
      ],
      [
        { endpoints: ["user-provided-endpoint"], type: "pyth", writeEndpoints: ["w-user-1"] },
        { endpoints: ["d", "e", "f"], type: "pyth-2-empty-write", writeEndpoints: ["write-1", "write-2"] },
      ]
    );

    expect(result).toEqual([
      { endpoints: ["user-provided-endpoint"], type: "pyth", writeEndpoints: ["w-user-1"] },
      { endpoints: ["a", "b", "c"], type: "non-overriden-pyth", writeEndpoints: ["w-pyth-3"] },
      { endpoints: ["d", "e", "f"], type: "pyth-2-empty-write", writeEndpoints: ["write-1", "write-2"] },
    ]);
  });
});
