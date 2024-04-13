import PerpetualDataHandler from "../src/perpetualDataHandler";

import MarketData from "../src/marketData";

let pk: string = <string>process.env.PK;

let RPC: string = <string>process.env.RPC;

async function main() {
  let config = PerpetualDataHandler.readSDKConfig(196);

  let mktData = new MarketData(config);

  await mktData.createProxyInstance();

  let v = mktData.getPerpetualSymbolsInPool("OKB");

  console.log(v);
  let info = await mktData.exchangeInfo();
  console.log(info);
}
main();
