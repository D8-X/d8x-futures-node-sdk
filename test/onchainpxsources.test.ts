import OnChainPxFeedRedStone from "../src/onChainPxFeedRedStone";
import OnChainPxFeed from "../src/onChainPxFeed";
import OnChainPxFactory from "../src/onChainPxFactory";
import PerpetualDataHandler from "../src/perpetualDataHandler";
import { NodeSDKConfig, ExchangeInfo } from "../src/nodeSDKTypes";
import MarketData from "../src/marketData";
import PriceFeeds from "../src/priceFeeds";

jest.setTimeout(300000);

let RPC: string = <string>process.env.RPC;

let och: OnChainPxFeed;
let px0: number;
let priceFeeds: PriceFeeds;
let config: NodeSDKConfig;

describe("onChainPxSources", () => {
  describe("positionRisk", () => {
    let mktData: MarketData;
    beforeAll(async () => {
      config = PerpetualDataHandler.readSDKConfig("arbitrum");
      mktData = new MarketData(config);
      await mktData.createProxyInstance();
    });
    it("should get price via positionRisk", async () => {
      //let p = await mktData.positionRisk("0x2BAC2B1243Ab69E8Ab7b6eaA1cb0A55CF6214F1B", "ETH-USD-WEETH");
      for (let k = 0; k < 3; k++) {
        let p = await mktData.positionRisk("0x2BAC2B1243Ab69E8Ab7b6eaA1cb0A55CF6214F1B");
        console.log(p);
      }
    });
  });
  beforeAll(async () => {});
  it("instantiate and get price", async () => {
    let rpcs = ["https://arbitrum.llamarpc.com", "https://1rpc.io/arb"];
    och = new OnChainPxFeedRedStone("0x119A190b510c9c0D5Ec301b60B2fE70A50356aE9", 8, rpcs);
    px0 = await och.getPrice();
    expect(px0).toBeGreaterThan(1);
    console.log("price =", px0);
  });
  it("bombard with px requests", async () => {
    for (let k = 0; k < 20; k++) {
      const px = await och.getPrice();
      expect(px).toBeGreaterThanOrEqual(px0);
      px0 = px;
    }
  });
  it("factory test", async () => {
    let f = OnChainPxFactory.createFeed("WEETH-ETH")!;
    const px = await f.getPrice();
    console.log("price =", px);
    expect(px).toBeGreaterThanOrEqual(1);
  });
  describe("Angle", () => {
    it("stUSD to USDC", async () => {
      const f: OnChainPxFeed | undefined = OnChainPxFactory.createFeed("STUSD-USDC");
      const px = await f!.getPrice();
      console.log(`STUSD/USDC = ${px}`);
    });
  });
  describe("onChainPxSources", () => {
    beforeAll(async () => {});
    it("price feed", async () => {
      config = PerpetualDataHandler.readSDKConfig("arbitrumSepolia");
      if (RPC != undefined) {
        config.nodeURL = RPC;
      }
      let mktData = new MarketData(config);
      await mktData.createProxyInstance();
      priceFeeds = new PriceFeeds(mktData, config.priceFeedConfigNetwork);
      let prices = await priceFeeds.fetchFeedPrices(["WEETH-ETH"]);
      console.log("price = ", prices);
    });
    it("triangulated price", async () => {
      let s = new Set<string>();
      s.add("WEETH-USD");
      priceFeeds.initializeTriangulations(s);
      let prices = await priceFeeds.fetchPrices(["WEETH-USD"]);
      console.log(prices.get("WEETH-USD"));
    });
    it("triangulated price via market data", async () => {
      let mktData = new MarketData(config);
      await mktData.createProxyInstance();
      let info: ExchangeInfo = await mktData.exchangeInfo();
      console.log(info);
      //let markPrice1 = await mktData.getMarkPrice("ETH-USD-WEETH");
      //await mktData.
      //https://api-mainnet.arb-42161.d8x.xyz/position-risk?traderAddr=0x2BAC2B1243Ab69E8Ab7b6eaA1cb0A55CF6214F1B&t=1712825020702
    });
  });
});
