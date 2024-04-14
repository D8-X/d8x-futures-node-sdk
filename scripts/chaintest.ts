import PerpetualDataHandler from "../src/perpetualDataHandler";

import MarketData from "../src/marketData";
import AccountTrade from "../src/accountTrade";

import { Order, OrderResponse } from "../src/nodeSDKTypes";

let pk: string = <string>process.env.PK;
let RPC: string = <string>process.env.RPC;

async function trade() {
  let config = PerpetualDataHandler.readSDKConfig(196);
  const accTrade = new AccountTrade(config, pk);
  await accTrade.createProxyInstance();
  let tx = await accTrade.setAllowance("OKB-USD-OKB");
  await tx.wait();
  console.log("allowance:", tx.hash);
  let order: Order = {
    symbol: "OKB-USD-OKB",
    side: "SELL",
    type: "MARKET",
    quantity: 2,
    leverage: 2,
    executionTimestamp: Date.now() / 1000 - 10,
  };
  let resp: OrderResponse;
  let orderId;
  try {
    resp = await accTrade.order(order, undefined, { gasLimit: 800_000 });
    console.log("orderId =", resp.orderId);
    console.log("txn:", resp.tx);
    // execute trade
    orderId = resp.orderId;
  } catch (err) {
    console.log("Error=", err);
  }
  console.log("order submitted");
}

async function main() {
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
