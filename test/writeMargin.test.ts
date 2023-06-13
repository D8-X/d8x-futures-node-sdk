import { ethers } from "ethers";
import { NodeSDKConfig, ExchangeInfo, Order, OrderResponse } from "../src/nodeSDKTypes";
import { ABK64x64ToFloat, floatToABK64x64 } from "../src/d8XMath";
import PerpetualDataHandler from "../src/perpetualDataHandler";
import AccountTrade from "../src/accountTrade";
import MarketData from "../src/marketData";
import LiquidatorTool from "../src/liquidatorTool";
import { JsonRpcProvider } from "@ethersproject/providers";
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
    config = PerpetualDataHandler.readSDKConfig("testnet");
    if (RPC != undefined) {
      config.nodeURL = RPC;
    }
    expect(pk == undefined).toBeFalsy();
    const traderWallet = new ethers.Wallet(pk);
    const provider = new JsonRpcProvider(config.nodeURL);
    accTrade = new AccountTrade(config, undefined, traderWallet.connect(provider));
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
