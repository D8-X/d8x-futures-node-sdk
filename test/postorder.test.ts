import LiquidatorTool from "../src/liquidatorTool";
import { NodeSDKConfig, Order, OrderResponse } from "../src/nodeSDKTypes";
import PerpetualDataHandler from "../src/perpetualDataHandler";
import MarketData from "../src/marketData";
import AccountTrade from "../src/accountTrade";
let pk: string = <string>process.env.PK;
let RPC: string | undefined = <string>process.env.RPC;

jest.setTimeout(150000);

let liquidator: LiquidatorTool;
let marketData: MarketData;
let config: NodeSDKConfig;
let accTrade: AccountTrade;

describe("liquidation functionality", () => {
  beforeAll(async () => {
    const chainId = 421614;
    if (pk == undefined) {
      console.log(`Define private key: export PK="CA52A..."`);
      expect(false);
      return;
    }
    config = PerpetualDataHandler.readSDKConfig(chainId);
    if (RPC != undefined) {
      config.nodeURL = RPC;
    }
    accTrade = new AccountTrade(config, pk);
    await accTrade.createProxyInstance();
  });
  it("liquidatable accounts", async () => {
    const sym = "BTLJ-USD-USDC";
    let order: Order = {
      symbol: sym,
      side: "BUY",
      type: "MARKET",
      quantity: 100,
      leverage: 1,
      executionTimestamp: Date.now() / 1000,
    };
    let resp = await accTrade.order(order);
    console.log(resp);
  });
});
