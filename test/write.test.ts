import { ethers } from "ethers";
import { NodeSDKConfig, Order, OrderResponse } from "../src/nodeSDKTypes";
// import { ABK64x64ToFloat, floatToABK64x64 } from "../src/d8XMath";
import AccountTrade from "../src/accountTrade";
import MarketData from "../src/marketData";
import PerpetualDataHandler from "../src/perpetualDataHandler";
// import { to4Chars, toBytes4, fromBytes4, fromBytes4HexString } from "../src/utils";
import LiquidatorTool from "../src/liquidatorTool";
import OrderExecutorTool from "../src/orderExecutorTool";
let pk: string = <string>process.env.PK;
// let RPC: string = <string>process.env.RPC;

const delay = (ms: number) => new Promise((res: any) => setTimeout(res, ms));

jest.setTimeout(150000);

let config: NodeSDKConfig;
// let proxyContract: ethers.Contract;
let mktData: MarketData;
// let orderIds: string[];
let wallet: ethers.Wallet;
let accTrade: AccountTrade;
let liqTool: LiquidatorTool;
let execTool: OrderExecutorTool;
let orderId: string;

describe("write and spoil gas and tokens", () => {
  beforeAll(async function () {
    config = PerpetualDataHandler.readSDKConfig("arbitrumSepolia");
    // if (RPC != undefined) {
    //   config.nodeURL = RPC;
    // }
    expect(pk == undefined).toBeFalsy();
    wallet = new ethers.Wallet(pk);
    accTrade = new AccountTrade(config, pk);
    await accTrade.createProxyInstance();
    // liqTool = new LiquidatorTool(config, pk);
    // await liqTool.createProxyInstance();
    mktData = new MarketData(config);
    await mktData.createProxyInstance();
    execTool = new OrderExecutorTool(config, pk);
    await execTool.createProxyInstance();
  });

  it("set allowance", async () => {
    //*uncomment
    let tx = await accTrade.setAllowance("USDC");
    console.log(`set allowance tx hash = ${tx.hash}`);
    await tx.wait();
    //*/
  });

  // it("swaps MATIC for mock token", async () => {
  //   await accTrade.swapForMockToken("USDC", "0.001");
  // });

  it("add collateral", async () => {
    //*uncomment
    let tx = await accTrade.addCollateral("BTC-USDC-USDC", 200);
    console.log(`add collateral tx hash = ${tx.hash}`);
    await tx.wait();
    //*/
  });

  // it("remove collateral", async () => {
  //   //*uncomment
  //   let tx = await accTrade.removeCollateral("MATIC-USD-MATIC", 10);
  //   console.log(`remove collateral tx hash = ${tx.hash}`);
  //   //*/
  // });

  it("trade", async () => {
    let order: Order = {
      symbol: "ETH-USDC-USDC",
      side: "SELL",
      type: "MARKET",
      quantity: 0.25,
      leverage: 20,
      executionTimestamp: Date.now() / 1000 - 10,
    };
    /*
    let order: Order = {
      symbol: "ETH-USD-MATIC",
      side: "BUY",
      type: "LIMIT",
      limitPrice: 0,
      quantity: 1,
      leverage: 5,
      reduceOnly: true,
      keepPositionLvg: false,
      executionTimestamp: 1677588583,
      deadline: 1677617383,
    };*/

    //* UNCOMMENT TO ENABLE TRADING
    let resp: OrderResponse;
    try {
      resp = await accTrade.order(order, undefined, { gasLimit: 800_000 });
      console.log("orderId =", resp.orderId);
      console.log("txn:", resp.tx);
      orderId = resp.orderId;
      // cancel order
      console.log("order submitted");
      await resp.tx.wait();
      let txCancel = await accTrade.cancelOrder("ETH-USDC-USDC", orderId);
      console.log("cancel order hash = ", txCancel.hash);
    } catch (err) {
      console.log("Error=", err);
    }
  });

  // it("execute order", async () => {
  //   let symbol = "ETH-USD-MATIC";
  //   let myOrders = await mktData.openOrders(wallet.address, symbol);
  //   let idx = myOrders.findIndex((bundle) => bundle.orderIds.length > 0);
  //   if (idx < 0) {
  //     // no orders
  //     expect(true).toBeTruthy;
  //   } else {
  //     let orderId = myOrders[idx].orderIds[0];
  //     console.log("executing order", orderId, "symbol", symbol);
  //     let tx = await execTool.executeOrder(symbol, orderId);
  //     console.log(tx);
  //   }
  // });

  // it("execute orders", async () => {
  //   let symbol = "MATIC-USDC-USDC";
  //   let myOrders = await mktData.openOrders(wallet.address, symbol);
  //   let idx = myOrders.findIndex((bundle) => bundle.orderIds.length > 0);
  //   if (idx < 0) {
  //     // no orders
  //     expect(true).toBeTruthy;
  //   } else {
  //     let orderId = myOrders[idx].orderIds[0];
  //     console.log("executing order", orderId, "symbol", symbol);
  //     let tx = await execTool.executeOrders(symbol, [orderId]);
  //     console.log(tx);
  //   }
  // });

  // it("post & execute market order", async () => {
  //   let refTool = new OrderExecutorTool(config, pk);
  //   await refTool.createProxyInstance();
  //   let symbol = "BTC-USD-MATIC";
  //   let order: Order = {
  //     symbol: symbol,
  //     side: "BUY",
  //     type: "MARKET",
  //     quantity: 0.1,
  //     leverage: 10,
  //     executionTimestamp: Date.now() / 1000,
  //   };
  //   // let resp = await accTrade.order(order);
  //   // await delay(4000);
  //   let orderId = "0x9cd4c44471636a7b7c8e3caab55a0a8af54b66fafe9fa8a828b54b1bf92ed953"; // resp.orderId;
  //   let tx = await refTool.executeOrder(symbol, orderId);
  //   console.log("tx hash = ", tx.hash);
  //   wallet = new ethers.Wallet(pk);
  //   let pos = (await mktData.positionRisk(wallet.address, symbol))[0];
  //   if (Math.abs(pos.leverage - order.leverage!) > 0.1) {
  //     console.log(`Leverage expected ${10}, leverage realized ${pos.leverage}`);
  //   }
  //   expect(pos.leverage).toBeCloseTo(10, 0);
  // });

  // it("post limit order", async () => {
  //   let order: Order = {
  //     symbol: "MATIC-USD-MATIC",
  //     side: "BUY",
  //     type: "LIMIT",
  //     limitPrice: 4,
  //     quantity: 10,
  //     leverage: 2,
  //     executionTimestamp: Date.now() / 1000,
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
  //     executionTimestamp: Date.now() / 1000,
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
  //   let posRisk = (await mktData.positionRisk(accTrade.getAddress(), "BTC-USD-MATIC"))[0];
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
