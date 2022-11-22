import { ethers } from "ethers";
import { NodeSDKConfig, ExchangeInfo, Order, ZERO_ADDRESS } from "../src/nodeSDKTypes";
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

  it("should get lot size and some fees", async () => {
    let symbol = "MATIC";
    let lotSizeSC = await brokerTool.getLotSize(symbol);
    console.log(`lot size for ${symbol} pool is ${lotSizeSC} MATIC`);
    lotSize = lotSizeSC;
    let designations = [1, 2, 5, 10, 15]; //, 20, 25, 40, 60, 100, 400, 600];
    console.log("Some broker designations and fees:");
    for (var k = 0; k < designations.length; k++) {
      let lots = designations[k];
      let fee = await brokerTool.getFeeForBrokerDesignation(symbol, lots);
      console.log(`Exchange fee for ${lots} lots is ${100 * fee} %`);
    }
  });

  it("should get broker designation [1]", async () => {
    let symbol = "ETH-USD-MATIC";
    let lots = await brokerTool.getBrokerDesignation(symbol);
    let fee = await brokerTool.getFeeForBrokerDesignation(symbol);
    console.log(`current broker designation is ${lots} lots, with a fee of ${fee * 100} %`);
  });

  it("should set allowance to 10 lots", async () => {
    // let txHash = await brokerTool.setAllowance("MATIC", 10 * lotSize);
    // console.log(`set allowance tx hash = ${txHash}`);
  });

  it("should deposit a lot", async () => {
    let symbol = "MATIC";
    //** UNCOMENT TO ENABLE DEPOSIT
    // let tx = await brokerTool.brokerDepositToDefaultFund(symbol, 7);
    // console.log(`broker deposit transaction hash = ${tx.hash}`);
    // need to wait before next test to see lots increase
    // await tx.wait();
    //*/
  });

  it("should get broker designation [2]", async () => {
    let symbol = "BTC-USD-MATIC";
    let lots = await brokerTool.getBrokerDesignation(symbol);
    let fee = await brokerTool.getFeeForBrokerDesignation(symbol);
    console.log(`current broker designation is ${lots} lots, with a fee of ${fee * 100} %`);
    console.log(`new broker designation: ${lots}`);
  });

  it("should get fee for broker volume", async () => {
    let symbol = "BTC-USD-MATIC";
    let fee = await brokerTool.getFeeForBrokerVolume(symbol);
    console.log(`fee based on broker volume is ${10_000 * fee!} bps`);
  });

  it("should determine the exchange fee, for a trader that isn't signed up", async () => {
    let order: Order = {
      symbol: "MATIC-USD-MATIC",
      side: "BUY",
      type: "MARKET",
      quantity: 0.5,
      leverage: 2,
      timestamp: Date.now(),
    };
    const myAddress = new ethers.Wallet(pk).address;
    let fee = await brokerTool.determineExchangeFee(order, myAddress);
    console.log(`exchange fee for an order with my address and no broker signature is ${10_000 * fee} basis points`);
  });

  it("should query exchange fee based on broker and trader", async () => {
    const myAddress = new ethers.Wallet(pk).address;
    let fee = await brokerTool.queryExchangeFee("MATIC", myAddress);
    console.log(`exchange fee for my address and this broker is ${10_000 * fee} basis points`);
  });

  it("should determine total exchange fee, for a trader who signed up [1]", async () => {
    let order: Order = {
      symbol: "ETH-USD-MATIC",
      side: "BUY",
      type: "MARKET",
      quantity: 0.5,
      leverage: 2,
      timestamp: Date.now(),
    };
    const myAddress = new ethers.Wallet(pk).address;
    let brokerFee = 0.05;
    let deadline = Date.now() + 10000;
    let signedOrder = await brokerTool.signOrder(order, myAddress, brokerFee, deadline);
    let fee = await brokerTool.determineExchangeFee(signedOrder, myAddress);
    console.log(`exchange fee for a broker-signed order with my address is ${10_000 * fee} basis points`);
  });

  it("should trade a very large amount (to increase traded volume)", async () => {
    //* UNCOMMENT TO ENABLE TRADING
    // let accTrade = new AccountTrade(config, pk);
    // await accTrade.createProxyInstance();
    // let txHash = await accTrade.setAllowance("MATIC");
    // let numOpenClose = 10;
    // for (var k = 0; k < numOpenClose; k++) {
    //   for (var j = 0; j < 2; j++) {
    //     let amount = (-1) ** j * 10_000;
    //     let order: Order = {
    //       symbol: "MATIC-USD-MATIC",
    //       side: "BUY",
    //       type: "MARKET",
    //       quantity: amount,
    //       leverage: 10,
    //       timestamp: Date.now(),
    //     };
    //     let tx = await accTrade.order(order);
    //     console.log("trade transaction hash =", tx);
    //   }
    // }
    //*/
  });

  it("should determine total exchange fee, for a trader who signed up [1]", async () => {
    let order: Order = {
      symbol: "ETH-USD-MATIC",
      side: "BUY",
      type: "MARKET",
      quantity: 0.5,
      leverage: 2,
      timestamp: Date.now(),
    };
    const myAddress = ZERO_ADDRESS; //new ethers.Wallet(pk).address;
    let brokerFee = 0.05;
    let deadline = Date.now() + 10000;
    let signedOrder = await brokerTool.signOrder(order, myAddress, brokerFee, deadline);
    let fee = await brokerTool.determineExchangeFee(signedOrder, myAddress);
    console.log(`exchange fee for a broker-signed order is ${10_000 * fee} basis points`);
  });
});
