import { ethers } from "ethers";
import { NodeSDKConfig, ExchangeInfo, Order } from "../src/nodeSDKTypes";
import { ABK64x64ToFloat } from "../src/d8XMath";
import PerpetualDataHandler from "../src/perpetualDataHandler";
import AccountTrade from "../src/accountTrade";
import MarketData from "../src/marketData";
import { to4Chars, toBytes4, fromBytes4, fromBytes4HexString } from "../src/utils";
let pk: string = <string>process.env.PK;
let RPC: string = <string>process.env.RPC;

jest.setTimeout(150000);

let config: NodeSDKConfig;
let proxyContract: ethers.Contract;
let mktData: MarketData;
let orderIds: string[];
let wallet: ethers.Wallet;
let accTrade: AccountTrade;

describe("write and spoil gas and tokens", () => {
  beforeAll(async function () {
    config = PerpetualDataHandler.readSDKConfig("../config/defaultConfig.json");
    if (RPC != undefined) {
      config.nodeURL = RPC;
    }
    expect(pk == undefined).toBeFalsy();
    accTrade = new AccountTrade(config, pk);
    await accTrade.createProxyInstance();
  });

  it("set allowance", async () => {
    //*uncomment
    let txHash = await accTrade.setAllowance("MATIC");
    console.log(`set allowance tx hash = ${txHash}`);
    //*/
  });

  it("trade", async () => {
    let order: Order = {
      symbol: "ETH-USD-MATIC",
      side: "BUY",
      type: "MARKET",
      quantity: 0.5,
      leverage: 2,
      timestamp: Date.now(),
    };
    //* UNCOMMENT TO ENABLE TRADING
    let tx = await accTrade.order(order);
    console.log("trade transaction hash =", tx);
    //*/
  });
  it("post limit order", async () => {
    let order: Order = {
      symbol: "ETH-USD-MATIC",
      side: "BUY",
      type: "LIMIT",
      limitPrice: 4000,
      quantity: 0.5,
      leverage: 2,
      timestamp: Date.now(),
    };
    //* UNCOMMENT TO ENABLE TRADING
    let tx = await accTrade.order(order);
    console.log("limit order transaction hash =", tx);
    //*/
  });
});
