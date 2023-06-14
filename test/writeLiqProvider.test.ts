import { JsonRpcProvider } from "@ethersproject/providers";
import { ethers } from "ethers";
// import AccountTrade from "../src/accountTrade";
import LiquidityProviderTool from "../src/liquidityProviderTool";
import MarketData from "../src/marketData";
import { NodeSDKConfig } from "../src/nodeSDKTypes";
import PerpetualDataHandler from "../src/perpetualDataHandler";
let pk: string = <string>process.env.PK;
let RPC: string = <string>process.env.RPC;

jest.setTimeout(150000);

let config: NodeSDKConfig;
// let proxyContract: ethers.Contract;
let mktData: MarketData;
// let orderIds: string[];
let wallet: ethers.Wallet;
// let accTrade: AccountTrade;
let liqProvTool: LiquidityProviderTool;

describe("LP: write and spoil gas and tokens", () => {
  beforeAll(async () => {
    config = PerpetualDataHandler.readSDKConfig("testnet");
    console.log(`config loaded: ${config.name} v${config.version}`);
    //config = PerpetualDataHandler.readSDKConfig("../config/oldConfig.json");
    if (RPC != undefined) {
      console.log(`using custom RPC ${RPC}`);
      config.nodeURL = RPC;
    }
    if (pk == undefined) {
      console.log(`Define private key: export PK="CA52A..."`);
      expect(true).toBeFalsy;
    }
    console.log("creating liquidity provision tool...");
    const lpWallet = new ethers.Wallet(pk);
    const provider = new JsonRpcProvider(config.nodeURL);
    liqProvTool = new LiquidityProviderTool(config, lpWallet.connect(provider));
    await liqProvTool.createProxyInstance(provider);
    console.log("success\n");
    mktData = new MarketData(config);
    await mktData.createProxyInstance();
    wallet = lpWallet;
  });
  describe("Liquidity Provider", () => {
    it("deposit", async () => {
      // let tx0 = await liqProvTool.setAllowance("USDC", 1_200_000);
      // console.log("allowance tx hash=", tx0.hash);
      let tx = await liqProvTool.addLiquidity("MATIC", 1_200);
      await tx.wait();
      console.log("deposit tx hash=", tx.hash);
    });
    it("getParticipationValue", async () => {
      let val2 = await mktData.getParticipationValue(wallet.address, "MATIC");
      console.log("pool sharetoken value via mkt", val2);
    });
    //it("initiate", async () => {
    //  let tx = await liqProvTool.initiateLiquidityWithdrawal("MATIC", 1_200_000);
    //  await tx.wait();
    //  console.log("init withdraw tx hash=", tx.hash);
    //});
    // it("execute", async () => {
    //   // OBS: this won't do much unless you let enough time pass since calling the initiate function above
    //   let tx = await liqProvTool.executeLiquidityWithdrawal("MATIC");
    //   await tx.wait();
    //   console.log("exec withdraw tx hash=", tx.hash);
    // });
    // it("getParticipationValue", async () => {
    //   let val = await liqProvTool.getParticipationValue("MATIC");
    //   console.log("pool sharetoken value", val);
    // });
  });
});
