import { ethers } from "ethers";
import { PerpetualDataHandler, ZERO_ADDRESS } from "@d8x/perpetuals-sdk";
import { TraderInterface } from "@d8x/perpetuals-sdk";
import { NodeSDKConfig, ExchangeInfo, Order } from "../src/nodeSDKTypes";
// npm link "@d8x/perpetuals-sdk"

describe("Front-end-like functionality", () => {
  beforeAll(async () => {});
  it("order digest", async () => {
    let pk: string = <string>process.env.PK;
    let config = PerpetualDataHandler.readSDKConfig("testnet");
    let apiInterface = new TraderInterface(config);
    await apiInterface.createProxyInstance();
    let wallet = new ethers.Wallet(pk);
    let order: Order = {
      symbol: "BTC-USD-MATIC",
      side: "BUY",
      type: "MARKET",
      quantity: -0.05,
      leverage: 2,
      timestamp: Date.now() / 1000,
    };
    let orderSC = await apiInterface.createSmartContractOrder(order, wallet.address);
    let res = await apiInterface.orderDigest(orderSC);
    console.log(res);
    let fee = await apiInterface.queryExchangeFee("MATIC", wallet.address, ZERO_ADDRESS);
    console.log("fee=", fee);
  });
});
