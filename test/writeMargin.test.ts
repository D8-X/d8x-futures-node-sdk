import { JsonRpcProvider } from "@ethersproject/providers";
import { ethers } from "ethers";
import AccountTrade from "../src/accountTrade";
import LiquidatorTool from "../src/liquidatorTool";
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
let liqTool: LiquidatorTool;
let orderId: string;

/**
 *  You need an open position in BTC-USD-MATIC for this to work
 */
describe("write and spoil gas and tokens", () => {
  beforeAll(async function () {
    config = PerpetualDataHandler.readSDKConfig("cardona");
    if (RPC != undefined) {
      config.nodeURL = RPC;
    }
    expect(pk == undefined).toBeFalsy();
    const traderWallet = new ethers.Wallet(pk);
    const provider = new JsonRpcProvider(config.nodeURL);
    accTrade = new AccountTrade(config, traderWallet.connect(provider));
    await accTrade.createProxyInstance(provider);
  });

  it("set allowance", async () => {
    //*uncomment
    let tx = await accTrade.setAllowance("MATIC");
    console.log(`set allowance tx hash = ${tx.hash}`);
    //*/
  });
  it("add margin", async () => {
    //*uncomment
    let tx = await accTrade.addCollateral("BTC-USD-MATIC", 10);
    console.log(`add margin tx hash = ${tx.hash}`);
    //*/
  });
  it("remove margin", async () => {
    //*uncomment
    let tx = await accTrade.removeCollateral("BTC-USD-MATIC", 10);
    console.log(`remove margin tx hash = ${tx.hash}`);
    //*/
  });
});
