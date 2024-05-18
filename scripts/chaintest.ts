import PerpetualDataHandler from "../src/perpetualDataHandler";

import MarketData from "../src/marketData";
import AccountTrade from "../src/accountTrade";
import OrderExecutorTool from "../src/orderExecutorTool";
import { Order, OrderResponse } from "../src/nodeSDKTypes";

let pk: string = <string>process.env.PK;
let RPC: string = <string>process.env.RPC;

async function trade() {
  const sym = "WOKB-USD-WOKB"; //"ETH-USD-WEETH"; //
  let config = PerpetualDataHandler.readSDKConfig(196); //42161); //
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
    quantity: 2,
    leverage: 2,
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
  }*/
  const orderId = "0xc1e068db1b15de6e27d77c79c3d8a508e049bab56ae0f829021b41f181b5a1f0";
  console.log("order submitted id=", orderId);
  const oex = new OrderExecutorTool(config, pk);
  await oex.createProxyInstance();
  let tx = await oex.executeOrder("BS-BS-BS", orderId);
  console.log(tx);
}

async function main() {
  let c = PerpetualDataHandler.getAvailableConfigs();
  console.log(c);
  let config = PerpetualDataHandler.readSDKConfig(196);

  let mktData = new MarketData(config);

  await mktData.createProxyInstance();

  let v = mktData.getPerpetualSymbolsInPool("WOKB");

  console.log(v);
  let info = await mktData.exchangeInfo();
  console.log(info);

  //await trade();
}
main();
//trade();
