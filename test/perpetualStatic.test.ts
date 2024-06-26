import PerpetualDataHandler from "../src/perpetualDataHandler";
import MarketData from "../src/marketData";
import { NodeSDKConfig } from "../src/nodeSDKTypes";
let config: NodeSDKConfig;
let mktData;
let RPC: string | undefined = <string>process.env.RPC;
jest.setTimeout(150000);

describe("perpetualStatic", () => {
  beforeAll(() => {
    config = PerpetualDataHandler.readSDKConfig("arbitrum");
    if (RPC != undefined) {
      config.nodeURL = RPC;
    }
    // temporary override
    config.proxyAddr = "0xE3F78A83fcF95C4fC33694d3023754258290e08c";
  });

  describe("Market Data", () => {
    it("read all config types", async () => {
      mktData = new MarketData(config);
      await mktData.createProxyInstance();
      let info = await mktData.exchangeInfo();
      console.log(info);
      let s = mktData.getPerpetualStaticInfo("BTC-USD-STUSD");
      console.log(s);
    });
  });
});
