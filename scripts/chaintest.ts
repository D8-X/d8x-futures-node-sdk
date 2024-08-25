import PerpetualDataHandler from "../src/perpetualDataHandler";

import MarketData from "../src/marketData";
import AccountTrade from "../src/accountTrade";
import OrderExecutorTool from "../src/orderExecutorTool";
import { Order, OrderResponse } from "../src/nodeSDKTypes";

let pk: string = <string>process.env.PK;
let RPC: string = <string>process.env.RPC;

async function trade() {
  const sym = "TRUMP24-USD-USDC"; //"ETH-USD-WEETH"; //
  let config = PerpetualDataHandler.readSDKConfig(195); //42161); //
  if (RPC != undefined) {
    config.nodeURL = RPC;
  }
  const accTrade = new AccountTrade(config, pk);
  await accTrade.createProxyInstance();
  //let tx = await accTrade.setAllowance(sym);
  //await tx.wait();
  //console.log("allowance:", tx.hash);
  let order: Order = {
    symbol: sym,
    side: "SELL",
    type: "MARKET",
    quantity: 100,
    leverage: 1.25,
    executionTimestamp: Date.now() / 1000 - 10,
  };
  let resp: OrderResponse;

  /*
  let orderId = "";
  try {
    resp = await accTrade.order(order, undefined, { gasLimit: 800_000 });
    console.log("orderId =", resp.orderId);
    console.log("txn:", resp.tx);
    // execute trade
    orderId = resp.orderId;
  } catch (err) {
    console.log("Error=", err);
  }
  */
  const orderId = "0x2c68a080d1cee7f8a56ad1df66857ff4d394b18e3e8193bdd08547791e8cee81";
  console.log("order submitted id=", orderId);
  const oex = new OrderExecutorTool(config, pk);
  await oex.createProxyInstance();
  let tx = await oex.executeOrder("TRUMP24-USD-USDC", orderId);
  console.log(tx);
}

async function main() {
  let c = PerpetualDataHandler.getAvailableConfigs();
  console.log(c);
  let config = PerpetualDataHandler.readSDKConfig(195);

  let mktData = new MarketData(config);
  await mktData.createProxyInstance();
  let isP = mktData.isPredictionMarket("TRUMP24-USD-USDC");
  console.log(isP);

  let p = await mktData.fetchLatestFeedPriceInfo("TRUMP24-USD-USDC");
  console.log(p);
  let v = mktData.getPerpetualSymbolsInPool("USDC");

  console.log(v);
  let info = await mktData.exchangeInfo();
  console.log(info);

  //await trade();
}
//main();
trade();
