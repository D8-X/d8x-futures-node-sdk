import OnChainPxFeed from "../src/onChainPxFeed";
import OnChainPxFactory from "../src/onChainPxFactory";
import PerpetualDataHandler from "../src/perpetualDataHandler";
import MarketData from "../src/marketData";
import PriceFeeds from "../src/priceFeeds";
jest.setTimeout(300000);

let RPC: string = <string>process.env.RPC;

let och: OnChainPxFeed;
let px0: number;
describe("onChainPxSources", () => {
  beforeAll(async () => {});
  it("instantiate and get price", async () => {
    let rpcs = ["https://arbitrum.llamarpc.com", "https://1rpc.io/arb"];
    och = new OnChainPxFeed("0x119A190b510c9c0D5Ec301b60B2fE70A50356aE9", 8, rpcs);
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
  describe("onChainPxSources", () => {
    beforeAll(async () => {});
    it("price feed", async () => {
      let config = PerpetualDataHandler.readSDKConfig("arbitrumSepolia");
      if (RPC != undefined) {
        config.nodeURL = RPC;
      }
      let mktData = new MarketData(config);
      await mktData.createProxyInstance();
      let priceFeeds = new PriceFeeds(mktData, config.priceFeedConfigNetwork);
      let prices,
        _ = await priceFeeds.fetchFeedPrices(["WEETH-ETH"]);
      console.log("price = ", prices);
    });
  });
});
