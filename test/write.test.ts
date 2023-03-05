import { ethers } from "ethers";
import { NodeSDKConfig, ExchangeInfo, Order, OrderResponse } from "../src/nodeSDKTypes";
import { ABK64x64ToFloat, floatToABK64x64 } from "../src/d8XMath";
import PerpetualDataHandler from "../src/perpetualDataHandler";
import AccountTrade from "../src/accountTrade";
import MarketData from "../src/marketData";
import { to4Chars, toBytes4, fromBytes4, fromBytes4HexString } from "../src/utils";
import LiquidatorTool from "../src/liquidatorTool";
import OrderReferrerTool from "../src/orderReferrerTool";
let pk: string = <string>process.env.PK;
let RPC: string = <string>process.env.RPC;

const delay = (ms: number) => new Promise((res: any) => setTimeout(res, ms));

jest.setTimeout(150000);

let config: NodeSDKConfig;
let proxyContract: ethers.Contract;
let mktData: MarketData;
let orderIds: string[];
let wallet: ethers.Wallet;
let accTrade: AccountTrade;
let liqTool: LiquidatorTool;
let orderId: string;

describe("write and spoil gas and tokens", () => {
  beforeAll(async function () {
    config = PerpetualDataHandler.readSDKConfig("../config/defaultConfig.json");
    if (RPC != undefined) {
      config.nodeURL = RPC;
    }
    expect(pk == undefined).toBeFalsy();
    accTrade = new AccountTrade(config, pk);
    await accTrade.createProxyInstance();
    liqTool = new LiquidatorTool(config, pk);
    await liqTool.createProxyInstance();
    mktData = new MarketData(config);
    await mktData.createProxyInstance();
  });

  it("set allowance", async () => {
    //*uncomment
    let tx = await accTrade.setAllowance("MATIC");
    console.log(`set allowance tx hash = ${tx.hash}`);
    //*/
  });

  // it("add collateral", async () => {
  //   //*uncomment
  //   let tx = await accTrade.addCollateral("MATIC-USD-MATIC", 10);
  //   console.log(`add collateral tx hash = ${tx.hash}`);
  //   //*/
  // });

  // it("rempve collateral", async () => {
  //   //*uncomment
  //   let tx = await accTrade.removeCollateral("MATIC-USD-MATIC", 10);
  //   console.log(`remove collateral tx hash = ${tx.hash}`);
  //   //*/
  // });

  it("trade", async () => {
    // let order: Order = {
    //   symbol: "BTC-USD-MATIC",
    //   side: "BUY",
    //   type: "MARKET",
    //   quantity: 0.05,
    //   leverage: 2,
    //   timestamp: Date.now() / 1000,
    // };
    // let order: Order = {
    //   symbol: "ETH-USD-MATIC",
    //   side: "BUY",
    //   type: "LIMIT",
    //   limitPrice: 0,
    //   quantity: 1,
    //   leverage: 5,
    //   reduceOnly: true,
    //   keepPositionLvg: false,
    //   timestamp: 1677588583,
    //   deadline: 1677617383,
    // };

    // //* UNCOMMENT TO ENABLE TRADING
    // let resp: OrderResponse;
    // try {
    //   resp = await accTrade.order(order);
    //   console.log("trade transaction hash =", resp.tx.hash);
    //   console.log("orderId =", resp.orderId);
    //   // execute trade
    //   orderId = resp.orderId;
    // } catch (err) {
    //   console.log("Error=", err);
    // }
    console.log(floatToABK64x64(Infinity));

    //   //*/
  });
  // it("post & execute market order", async () => {
  //   let refTool = new OrderReferrerTool(config, pk);
  //   await refTool.createProxyInstance();
  //   let order: Order = {
  //     symbol: "BTC-USD-MATIC",
  //     side: "BUY",
  //     type: "MARKET",
  //     quantity: 0.01,
  //     leverage: 10,
  //     timestamp: Date.now() / 1000,
  //   };
  //   let resp = await accTrade.order(order);
  //   await delay(4000);
  //   let tx = await refTool.executeOrder("BTC-USD-MATIC", resp.orderId);
  //   console.log("tx hash = ", tx.hash);
  // });
  // it("post limit order", async () => {
  //   let order: Order = {
  //     symbol: "MATIC-USD-MATIC",
  //     side: "BUY",
  //     type: "LIMIT",
  //     limitPrice: 4,
  //     quantity: 10,
  //     leverage: 2,
  //     timestamp: Date.now() / 1000,
  //   };
  //   //* UNCOMMENT TO ENABLE TRADING
  //   let tx = await accTrade.order(order);
  //   console.log("limit order transaction hash =", tx);
  //   //*/
  // });

  // it("failt to post limit order with small trade size", async () => {
  //   let order: Order = {
  //     symbol: "MATIC-USD-MATIC",
  //     side: "BUY",
  //     type: "LIMIT",
  //     limitPrice: 4,
  //     quantity: 20,
  //     leverage: 2,
  //     timestamp: Date.now() / 1000,
  //   };
  //   //* UNCOMMENT TO ENABLE TRADING
  //   let orderPosted = false;
  //   try {
  //     let tx = await accTrade.order(order);
  //     orderPosted = true;
  //   } catch (e) {
  //     console.log(e);
  //   }
  //   expect(orderPosted).toBeFalsy;

  //   //*/
  // });

  // it("should query exchange fee based on broker and trader", async () => {
  //   const myAddress = new ethers.Wallet(pk).address;
  //   // fee1 : no broker
  //   let fee1 = await accTrade.queryExchangeFee("MATIC");
  //   // fee2: using myAddress as broker
  //   let fee2 = await accTrade.queryExchangeFee("MATIC", myAddress);
  //   console.log(
  //     `exchange fees for my address, with and without broker, are ${10_000 * fee1} and ${
  //       10_000 * fee2
  //     } basis points, respectively`
  //   );
  // });

  // it("should liquidate trader", async () => {
  //   let posRisk = await mktData.positionRisk(accTrade.getAddress(), "BTC-USD-MATIC");
  //   console.log("trying to liquidate account:");
  //   console.log(posRisk);
  //   let tx = await liqTool.liquidateTrader("BTC-USD-MATIC", accTrade.getAddress());
  //   let txReceipt = await tx.wait();
  //   let liqEvent = txReceipt.events!.filter((x) => x.event == "Liquidate");
  //   if (liqEvent == undefined || liqEvent.length == 0) {
  //     console.log("not liquidated");
  //     expect(posRisk.leverage < 20).toBeTruthy();
  //   } else {
  //     console.log("liquidate event:", liqEvent[0]);
  //     expect(posRisk.leverage > 10).toBeTruthy();
  //   }
  //   console.log(liqEvent);
  // });
});
