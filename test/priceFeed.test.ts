import PriceFeeds from "../src/priceFeeds";
import MarketData from "../src/marketData";
import PerpetualDataHandler from "../src/perpetualDataHandler";
import { NodeSDKConfig, ExchangeInfo, Order, PerpetualStaticInfo, BUY_SIDE, SELL_SIDE } from "../src/nodeSDKTypes";

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
    console.log("pyth price info = ", prices.priceInfo);
    console.log("symbols = ", prices.symbols);
  });
  it("get recent prices from market data directly", async()=> {
    let prices = await mktData.fetchLatestFeedPrices("ETH-USD-MATIC");
    console.log("pyth price info = ", prices.priceInfo);
    console.log("symbols = ", prices.symbols);
  });
});
  