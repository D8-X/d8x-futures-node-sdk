import { ethers } from "ethers";
import { NodeSDKConfig, Order } from "../src/nodeSDKTypes";
import PerpetualDataHandler from "../src/perpetualDataHandler";
import AccountTrade from "../src/accountTrade";
import BrokerTool from "../src/brokerTool";

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

describe("broker tools that spend gas and tokens", () => {
  beforeAll(async function () {
    config = PerpetualDataHandler.readSDKConfig("../config/defaultConfig.json");
    if (RPC != undefined) {
      config.nodeURL = RPC;
    }
    expect(pk1 == undefined).toBeFalsy();
    brokerTool = new BrokerTool(config, pk1);
    await brokerTool.createProxyInstance();
  });

  it("should set allowance to deposit n lots", async () => {
    let lotsDeposit = 7;
    lotSize = await brokerTool.getLotSize("MATIC");
    // let txHash = await brokerTool.setAllowance("MATIC", lotsDeposit * lotSize);
    // console.log(`set allowance tx hash = ${txHash}`);
  });

  it("should deposit lots and see fee decrease", async () => {
    let symbol = "MATIC";
    let lotsDeposit = 1;
    let lotsBefore = await brokerTool.getBrokerDesignation(symbol);
    let feeBefore = await brokerTool.getFeeForBrokerDesignation(symbol);
    console.log(`current broker designation is ${lotsBefore} lots, with a fee of ${feeBefore * 10_000} bps`);
    // let tx = await brokerTool.brokerDepositToDefaultFund(symbol, lotsDeposit);
    // console.log(`broker deposit transaction hash = ${tx.hash}`);
    // // need to wait before next test to see lots increase
    // await tx.wait();
    let lotsAfter = await brokerTool.getBrokerDesignation(symbol);
    let feeAfter = await brokerTool.getFeeForBrokerDesignation(symbol);
    console.log(`new broker designation is ${lotsAfter} lots, with a fee of ${feeAfter * 10_000} bps`);
    // expect(lotsAfter).toEqual(lotsBefore + lotsDeposit);
    expect(feeAfter).toBeLessThanOrEqual(feeBefore);
  });

  it("should trade a lot (to increase broker traded volume)", async () => {
    //* UNCOMMENT TO ENABLE TRADING - this will spend tokens and not just on gas!
    let accTrade = new AccountTrade(config, pk1);
    const myAddress = new ethers.Wallet(pk1).address;
    await accTrade.createProxyInstance();
    let txHash = await accTrade.setAllowance("MATIC");
    let numOpenClose = 10;
    let brokerFee = 0.05;
    let deadline = Date.now() + 10000;
    for (var k = 0; k < numOpenClose; k++) {
      for (var j = 0; j < 2; j++) {
        let amount = (-1) ** j * 10_000;
        console.log(`trading ${amount} MATIC-USD:`);
        let order: Order = {
          symbol: "MATIC-USD-MATIC",
          side: "BUY",
          type: "MARKET",
          quantity: amount,
          leverage: 10,
          timestamp: Date.now(),
        };
        let signedOrder = await brokerTool.signOrder(order, myAddress, brokerFee, deadline);
        let tx = await accTrade.order(signedOrder);
        console.log("trade transaction hash =", tx);
        let fee = await brokerTool.getFeeForBrokerVolume("MATIC");
        console.log(`fee based on broker volume is ${10_000 * fee!} bps`);
      }
    }
  });

  it("should transfer ownership", async () => {
    // TODO: uncomment when new contracts are deployed, this only spends tokens for gas
    let symbol = "MATIC";
    let oldAddress = new ethers.Wallet(pk1).address;
    let newAddress = new ethers.Wallet(pk2).address;
    let lotsBefore = await brokerTool.getBrokerDesignation(symbol);
    let designationInducedFeeBefore = await brokerTool.getFeeForBrokerDesignation(symbol);
    let volumeInducedFeeBefore = await brokerTool.getFeeForBrokerVolume(symbol);
    // // transfer
    // let tx = await brokerTool.transferOwnership("MATIC", newAddress);
    // await tx.wait();

    // // check old address
    // let lotsAfter = await brokerTool.getBrokerDesignation(symbol);
    // // check new address
    // let brokerTool2 = new BrokerTool(config, pk2);
    // await brokerTool2.createProxyInstance();
    // let lotsNew = await brokerTool2.getBrokerDesignation(symbol);
    // let designationInducedFeeNew = await brokerTool2.getFeeForBrokerDesignation(symbol);
    // let volumeInducedFeeNew = await brokerTool2.getFeeForBrokerVolume(symbol);
    // // new address may already have lots
    // expect(lotsNew).toBeGreaterThanOrEqual(lotsBefore);

    // // old address should be empty
    // expect(lotsAfter).toEqual(0);

    // // new fees should not be higher, excecpt possibly for stake which we don't check here
    // expect(designationInducedFeeNew).toBeLessThanOrEqual(designationInducedFeeBefore);
    // expect(volumeInducedFeeNew).toBeLessThanOrEqual(volumeInducedFeeBefore);

    // // transfer back
    // tx = await brokerTool2.transferOwnership("MATIC", oldAddress);
    // await tx.wait();
    let lotsBack = await brokerTool.getBrokerDesignation(symbol);
    expect(lotsBack).toBeGreaterThanOrEqual(lotsBefore);
  });
});
