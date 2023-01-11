import { ethers } from "ethers";
import AccountTrade from "../src/accountTrade";
import LiquidityProviderTool from "../src/liquidityProviderTool";
import MarketData from "../src/marketData";
import { NodeSDKConfig } from "../src/nodeSDKTypes";
import PerpetualDataHandler from "../src/perpetualDataHandler";
let pk: string = <string>process.env.PK;
let RPC: string = <string>process.env.RPC;

jest.setTimeout(150000);

let config: NodeSDKConfig;
let proxyContract: ethers.Contract;
let mktData: MarketData;
let orderIds: string[];
let wallet: ethers.Wallet;
let accTrade: AccountTrade;
let liqProvTool: LiquidityProviderTool;

describe("LP: write and spoil gas and tokens", () => {
  beforeAll(async () => {
    config = PerpetualDataHandler.readSDKConfig("../config/defaultConfig.json");
    //config = PerpetualDataHandler.readSDKConfig("../config/oldConfig.json");
    if (RPC != undefined) {
      config.nodeURL = RPC;
    }
    if (pk == undefined) {
      console.log(`Define private key: export PK="CA52A..."`);
      expect(true).toBeFalsy;
    }
    liqProvTool = new LiquidityProviderTool(config, pk);
    await liqProvTool.createProxyInstance();
  });
  describe("Liquidity Provider", () => {
    it("deposit", async () => {
      let tx = await liqProvTool.addLiquidity("MATIC", 250);
      await tx.wait();
      console.log("tx hash=", tx.hash);
    });
    it("getParticipationValue", async () => {
      let val = await liqProvTool.getParticipationValue("MATIC");
      console.log("pool sharetoken value", val);
    });
    it("remove", async () => {
      let tx = await liqProvTool.removeLiquidity("MATIC", 25);
      await tx.wait();
      console.log("tx hash=", tx.hash);
    });
    it("getParticipationValue", async () => {
      let val = await liqProvTool.getParticipationValue("MATIC");
      console.log("pool sharetoken value", val);
    });
  });
});
