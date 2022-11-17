import { ethers } from "ethers";
import { NodeSDKConfig, ExchangeInfo, Order } from "../src/nodeSDKTypes";
import { ABK64x64ToFloat } from "../src/d8XMath";
import PerpetualDataHandler from "../src/perpetualDataHandler";
import AccountTrade from "../src/accountTrade";
import MarketData from "../src/marketData";
import { to4Chars, toBytes4, fromBytes4, fromBytes4HexString } from "../src/utils";
import BrokerTool from "../src/brokerTool";
let pk: string = <string>process.env.PK;
let RPC: string = <string>process.env.RPC;

jest.setTimeout(150000);

let config: NodeSDKConfig;
let proxyContract: ethers.Contract;
let mktData: MarketData;
let orderIds: string[];
let wallet: ethers.Wallet;
let brokerTool: BrokerTool;
let lotSize: number;

describe("write and spoil gas and tokens", () => {
  beforeAll(async function () {
    config = PerpetualDataHandler.readSDKConfig("../config/defaultConfig.json");
    if (RPC != undefined) {
      config.nodeURL = RPC;
    }
    expect(pk == undefined).toBeFalsy();
    brokerTool = new BrokerTool(config, pk);
    await brokerTool.createProxyInstance();
  });

  it("should get lot size", async () => {
    let symbol = "MATIC";
    let lotSizeSC = await brokerTool.getLotSize(symbol);
    if (lotSizeSC == undefined) {
      console.log(`could not retrieve lot size for symbol ${symbol}`);
      expect(false);
    } else {
      console.log(`lot size for ${symbol} is ${lotSizeSC} MATIC`);
      lotSize = lotSizeSC;
    }
  });

  it("should set allowance to one lot", async () => {
    let txHash = await brokerTool.setAllowance("MATIC", lotSize);
    console.log(`set allowance tx hash = ${txHash}`);
  });

  it("should deposit a lot", async () => {
    let symbol = "MATIC";
    //** UNCOMENT TO ENABLE DEPOSIT
    //let tx = await brokerTool.brokerDepositToDefaultFund(symbol, 1);
    //console.log(`broker deposit transaction hash = ${tx}`);
    //
  });

  it("should determine exchange fee", async () => {
    let order: Order = {
      symbol: "ETH-USD-MATIC",
      side: "BUY",
      type: "MARKET",
      quantity: 0.5,
      leverage: 2,
      timestamp: Date.now(),
    };
    let fee = await brokerTool.determineExchangeFee(order);
    console.log(`exchange fee is ${fee} basis points`);
  });
});
