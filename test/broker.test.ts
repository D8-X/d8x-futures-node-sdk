import { ethers } from "ethers";
import { NodeSDKConfig, Order } from "../src/nodeSDKTypes";
import PerpetualDataHandler from "../src/perpetualDataHandler";
import AccountTrade from "../src/accountTrade";
import BrokerTool from "../src/brokerTool";

const delay = (ms: number) => new Promise((res: any) => setTimeout(res, ms));

/**
 * These tests require 2 funded accounts:
 * export PK1="F1R5T..."
 * export PK2="S3C0ND..."
 */

jest.setTimeout(300000);
let pk1: string = <string>process.env.PK1;
let pk2: string = <string>process.env.PK2;
let RPC: string = <string>process.env.RPC;
let config: NodeSDKConfig;
let brokerTool: BrokerTool;
let lotSize: number;
let lotsDeposit: number;
describe("broker tools that spend gas and tokens", () => {
  beforeAll(async function () {
    const chainId = 80001;
    config = PerpetualDataHandler.readSDKConfig(chainId);
    if (RPC != undefined) {
      config.nodeURL = RPC;
    }
    expect(pk1 == undefined).toBeFalsy();
    brokerTool = new BrokerTool(config, pk1);
    await brokerTool.createProxyInstance();
  });

  it("should set allowance to deposit n lots", async () => {
    lotsDeposit = 1;
    lotSize = await brokerTool.getLotSize("MATIC");
    let txHash = await brokerTool.setAllowance("MATIC");
    console.log(`set allowance tx hash = ${txHash}`);
  });

  it("should deposit lots and see fee decrease", async () => {
    let symbol = "MATIC";
    let lotsBefore = await brokerTool.getBrokerDesignation(symbol);
    let feeBefore = await brokerTool.getFeeForBrokerDesignation(symbol);
    console.log(`current broker designation is ${lotsBefore} lots, with an induced fee of ${feeBefore * 10_000} bps`);
    let tx = await brokerTool.brokerDepositToDefaultFund(symbol, lotsDeposit);
    console.log(`broker deposit transaction hash = ${tx.hash}`);
    // need to wait before next test to see lots increase
    await tx.wait();
    let lotsAfter = await brokerTool.getBrokerDesignation(symbol);
    let feeAfter = await brokerTool.getFeeForBrokerDesignation(symbol);
    console.log(`new broker designation is ${lotsAfter} lots, with an induced fee of ${feeAfter * 10_000} bps`);
    expect(lotsAfter).toEqual(lotsBefore + lotsDeposit);
    expect(feeAfter).toBeLessThanOrEqual(feeBefore);
  });

  it("should trade a lot (to increase broker traded volume)", async () => {
    //* UNCOMMENT TO ENABLE TRADING - this will spend tokens and not just on gas!
    let accTrade = new AccountTrade(config, pk2);
    await accTrade.createProxyInstance();

    // trade
    console.log("trader address:", accTrade.getAddress());

    let tx = await accTrade.setAllowance("MATIC");
    await tx.wait();
    let numOpenClose = 3;
    let brokerFeeTbps = 10; // 0.01%
    for (var k = 0; k < numOpenClose; k++) {
      for (var j = 0; j < 2; j++) {
        let amount = 1_000;
        let side = j == 0 ? "BUY" : "SELL";
        console.log(`trading ${amount * (-1) ** j} MATIC-USD:`);
        let order: Order = {
          symbol: "MATIC-USD-MATIC",
          side: side,
          type: "MARKET",
          quantity: amount,
          leverage: 10,
          executionTimestamp: Math.round(Date.now() / 1000),
          brokerFeeTbps: brokerFeeTbps,
          deadline: Math.round(Date.now() / 1000) + 100000,
        };
        let signedOrder = await brokerTool.signOrder(order, accTrade.getAddress());
        let resp = await accTrade.order(signedOrder);
        // wait for 10 seconds, enough for the order to be executed
        await delay(10000);
        console.log("trade transaction hash =", resp.tx.hash);
        let fee1 = await brokerTool.getFeeForBrokerVolume("MATIC");
        let fee2 = await accTrade.queryExchangeFee("MATIC");
        console.log(`fee based on broker volume is ${10_000 * fee1!} bps`);
        console.log(`exchange fee without a broker ${10_000 * fee2!} bps`);
      }
    }
  });

  it("should transfer ownership", async () => {
    let symbol = "MATIC";
    let oldAddress = new ethers.Wallet(pk1).address;
    let newAddress = new ethers.Wallet(pk2).address;
    let lotsBefore = await brokerTool.getBrokerDesignation(symbol);
    let designationInducedFeeBefore = await brokerTool.getFeeForBrokerDesignation(symbol);
    let volumeInducedFeeBefore = await brokerTool.getFeeForBrokerVolume(symbol);
    // second brokerage account:
    let brokerTool2 = new BrokerTool(config, pk2);
    await brokerTool2.createProxyInstance();
    let lotsInNewAccountBefore = await brokerTool2.getBrokerDesignation(symbol);
    // transfer
    let tx1 = await brokerTool.transferOwnership(symbol, newAddress);
    console.log(`first transfer tx hash=${tx1.hash}`);
    await tx1.wait();

    // check old address
    let lotsAfter = await brokerTool.getBrokerDesignation(symbol);
    // check new address

    let lotsNew = await brokerTool2.getBrokerDesignation(symbol);
    let designationInducedFeeNew = await brokerTool2.getFeeForBrokerDesignation(symbol);
    let volumeInducedFeeNew = await brokerTool2.getFeeForBrokerVolume(symbol);
    // new address may already have lots
    console.log(`lots in first broker's account before transfer: ${lotsBefore}`);
    console.log(`lots in second broker's account before transfer: ${lotsInNewAccountBefore}`);
    console.log(`lots in first broker's account after transfer: ${lotsAfter}`);
    console.log(`lots in second broker's account after transfer: ${lotsNew}`);
    expect(lotsNew).toBeGreaterThanOrEqual(lotsBefore);

    // old address should be empty
    expect(lotsAfter).toEqual(0);

    // new fees should not be higher, excecpt possibly for stake which we don't check here
    expect(designationInducedFeeNew).toBeLessThanOrEqual(designationInducedFeeBefore);
    expect(volumeInducedFeeNew).toBeLessThanOrEqual(volumeInducedFeeBefore);

    // transfer back
    let tx2 = await brokerTool2.transferOwnership(symbol, oldAddress);
    console.log(`second transfer tx hash=${tx2.hash}`);
    await tx2.wait();
    let lotsBack = await brokerTool.getBrokerDesignation(symbol);
    let lotsBackSecond = await brokerTool2.getBrokerDesignation(symbol);

    console.log(`lots in first broker's account after transfer back: ${lotsBack}`);
    console.log(`lots in second broker's account after transfer back: ${lotsBackSecond}`);
    expect(lotsBack).toBeGreaterThanOrEqual(lotsBefore);
  });
});
