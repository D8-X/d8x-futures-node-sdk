import { ethers } from "ethers";
import { NodeSDKConfig, ExchangeInfo, Order } from "../src/nodeSDKTypes";
import { ABK64x64ToFloat } from "../src/d8XMath";
import PerpetualDataHandler from "../src/perpetualDataHandler";
import MarketData from "../src/marketData";
import { to4Chars, toBytes4, fromBytes4, fromBytes4HexString } from "../src/utils";
import LiquidityProviderTool from "../src/liquidityProviderTool";
import LiquidatorTool from "../src/liquidatorTool";
import OrderReferrerTool from "../src/orderReferrerTool";
import BrokerTool from "../src/brokerTool";
let pk: string = <string>process.env.PK;
let RPC: string = <string>process.env.RPC;

jest.setTimeout(150000);

let config: NodeSDKConfig;
let proxyContract: ethers.Contract;
let mktData: MarketData;
let liqProvTool: LiquidityProviderTool;
let liqTool: LiquidatorTool;
let brokerTool: BrokerTool;
let refTool: OrderReferrerTool;
let orderIds: string[];
let wallet: ethers.Wallet;

describe("readOnly", () => {
  beforeAll(async function () {
    config = PerpetualDataHandler.readSDKConfig("testnet");
    if (RPC != undefined) {
      config.nodeURL = RPC;
    }
  });

  // describe("Oracle Routes", () => {
  //   beforeAll(async () => {
  //     const provider = new ethers.providers.JsonRpcProvider(RPC);
  //     let abi = require("../abi/IPerpetualManager.json");
  //     proxyContract = new ethers.Contract(config.proxyAddr, abi, provider);
  //   });
  //   it("routes", async () => {
  //     let ccyList = ["ETH-USD", "BTC-USD", "USD-USDC", "MATIC-USD"];

  //     for (let k = 0; k < ccyList.length; k++) {
  //       let basequote = ccyList[k].split("-");
  //       console.log("base, quote =", basequote);
  //       let px = await proxyContract.getOraclePrice([toBytes4(basequote[0]), toBytes4(basequote[1])]);
  //       console.log(`${basequote[0]}-${basequote[1]} = ${ABK64x64ToFloat(px)}`);
  //     }
  //   });
  // });

  describe("MarketData", () => {
    beforeAll(async () => {
      if (pk == undefined) {
        console.log(`Define private key: export PK="CA52A..."`);
        expect(false);
      }
      mktData = new MarketData(config);
      await mktData.createProxyInstance();
      wallet = new ethers.Wallet(pk);
    });
    it("exchange info", async () => {
      let info: ExchangeInfo = await mktData.exchangeInfo();
      console.log(info);
      for (var k = 0; k < info.pools.length; k++) {
        let pool = info.pools[k];
        console.log(`Perpetuals in ${k}-th pool:`);
        console.log(pool.perpetuals);
      }
    });
    it("oracle routes", async () => {
      let ccyList = ["ETH-USD", "BTC-USD", "USD-USDC", "MATIC-USD"];

      for (let k = 0; k < ccyList.length; k++) {
        let basequote = ccyList[k].split("-");
        let px = await mktData.getOraclePrice(basequote[0], basequote[1]);
        console.log(`${basequote[0]}-${basequote[1]} = ${px}`);
      }
    });
    it("openOrders", async () => {
      let ordersStruct = await mktData.openOrders(wallet.address, "ETH-USD-MATIC");
      console.log("order ids=", ordersStruct.orderIds);
      console.log("orders   =", ordersStruct.orders);
      orderIds = ordersStruct.orderIds;
    });
    it("get margin info", async () => {
      let mgn = await mktData.positionRisk(wallet.address, "ETH-USD-MATIC");
      console.log("mgn=", mgn);
    });

    it("get pool id", async () => {
      let perpSymbol = "ETH-USD-MATIC";
      let id = mktData.getPoolIdFromSymbol(perpSymbol);
      let poolSymbol = mktData.getSymbolFromPoolId(id);
      console.log(`Perp symbol ${perpSymbol} -> pool ID ${id} -> pool symbol ${poolSymbol}`);
    });

    it("get readonly instance", async () => {
      let proxy = await mktData.getReadOnlyProxyInstance();
    });

    it("get price", async () => {
      let perpSymbol = "ETH-USD-MATIC";
      let pxLong = await mktData.getPerpetualPrice(perpSymbol, 2);
      let pxShort = await mktData.getPerpetualPrice(perpSymbol, -2);
      console.log(`Perp price long ${pxLong} / short ${pxShort}`);
    });
    it("get mark price", async () => {
      let perpSymbol = "ETH-USD-MATIC";
      let pxMark = await mktData.getMarkPrice(perpSymbol);
      console.log(`Perp mark price ${pxMark}`);
    });
  });

  describe("Liquidity Provider", () => {
    beforeAll(async () => {
      if (pk == undefined) {
        console.log(`Define private key: export PK="CA52A..."`);
        expect(false);
      }
      liqProvTool = new LiquidityProviderTool(config, pk);
      await liqProvTool.createProxyInstance();
    });
    it("getParticipationValue", async () => {
      let val = await liqProvTool.getParticipationValue("MATIC");
      console.log("pool sharetoken value", val.value);
    });
  });

  describe("Liquidator", () => {
    beforeAll(async () => {
      if (pk == undefined) {
        console.log(`Define private key: export PK="CA52A..."`);
        expect(false);
      }
      liqTool = new LiquidatorTool(config, pk);
      await liqTool.createProxyInstance();
    });
    it("should get number of active accounts", async () => {
      let symbol = "ETH-USD-MATIC";
      let numAccounts = await liqTool.countActivePerpAccounts(symbol);
      console.log(`number of active accounts for symbol ${symbol} = ${numAccounts}`);
    });
    it("should get first n active accounts", async () => {
      let symbol = "ETH-USD-MATIC";
      let firstN = 2;
      let firstNAccounts = await liqTool.getActiveAccountsByChunks(symbol, 0, firstN);
      console.log(`first ${firstN} active accounts for ${symbol}:`);
      console.log(firstNAccounts);
    });
    it("should get all active accounts", async () => {
      let symbol = "ETH-USD-MATIC";
      let allAccounts = await liqTool.getAllActiveAccounts(symbol);
      console.log(`all active accounts for ${symbol}:`);
      console.log(allAccounts);
    });
    it("should check if trader is liquidatable", async () => {
      let symbol = "ETH-USD-MATIC";
      let traderAddr = (await liqTool.getActiveAccountsByChunks(symbol, 0, 1))[0];
      let isLiquidatable = !(await liqTool.isMaintenanceMarginSafe(symbol, traderAddr));
      console.log(`Trader with address ${traderAddr} is ${isLiquidatable ? "" : "NOT"} liquidatable`);
    });
  });

  describe("Broker", () => {
    beforeAll(async function () {
      config = PerpetualDataHandler.readSDKConfig("../config/defaultConfig.json");
      if (RPC != undefined) {
        config.nodeURL = RPC;
      }
      expect(pk == undefined).toBeFalsy();
      brokerTool = new BrokerTool(config, pk);
      await brokerTool.createProxyInstance();
    });
    it("should get lot size and fees for some numbers of lots", async () => {
      let symbol = "MATIC";
      let lotSizeSC = await brokerTool.getLotSize(symbol);
      console.log(`lot size for ${symbol} pool is ${lotSizeSC} MATIC`);
      let designations = [1, 2, 5, 10, 15]; //, 20, 25, 40, 60, 100, 400, 600];
      console.log("Some broker designations and fees:");
      for (var k = 0; k < designations.length; k++) {
        let lots = designations[k];
        let fee = await brokerTool.getFeeForBrokerDesignation(symbol, lots);
        console.log(`Exchange fee for ${lots} lots is ${100 * fee} %`);
      }
    });

    it("should get broker designation and fee", async () => {
      let symbol = "MATIC";
      let lots = await brokerTool.getBrokerDesignation(symbol);
      let fee = await brokerTool.getFeeForBrokerDesignation(symbol);
      console.log(`broker designation is ${lots} lots, with an induced fee of ${fee * 10_000} bps`);
    });

    it("should get broker volume and fee", async () => {
      let symbol = "MATIC";
      let volume = 0; //await brokerTool.getCurrentBrokerVolume(symbol); // uncomment when implemented
      let fee = await brokerTool.getFeeForBrokerVolume(symbol);
      console.log(`broker volume is ${volume}, with an induced fee of ${10_000 * fee!} bps`);
    });

    it("should get broker stake induced fee", async () => {
      // this is based on stake only, independent of the pool
      let fee = await brokerTool.getFeeForBrokerStake();
      console.log(`broker fee induced by his stake is ${10_000 * fee!} bps`);
    });

    it("should determine the exchange fee for an order not signed by this broker", async () => {
      let order: Order = {
        symbol: "MATIC-USD-MATIC",
        side: "BUY",
        type: "MARKET",
        quantity: 5,
        leverage: 2,
        timestamp: Date.now(),
      };
      const myAddress = new ethers.Wallet(pk).address;
      let fee = await brokerTool.determineExchangeFee(order, myAddress);
      console.log(`exchange fee for an order with my address and no broker signature is ${10_000 * fee} basis points`);
    });

    it("should determine the exchange fee for an order signed by this broker", async () => {
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
  });

  describe("Referrer", () => {
    beforeAll(async () => {
      if (pk == undefined) {
        console.log(`Define private key: export PK="CA52A..."`);
        expect(false);
      }
      refTool = new OrderReferrerTool(config, pk);
      await refTool.createProxyInstance();
    });
    it("get order by id/digest", async () => {
      let order = await refTool.getOrderById("ETH-USD-MATIC", orderIds[0]);
      console.log(order);
    });
    it("should get number of open orders", async () => {
      let symbol = "ETH-USD-MATIC";
      let numOrders = await refTool.numberOfOpenOrders(symbol);
      console.log(`There are ${numOrders} currently open for symbol ${symbol}`);
    });
    it("should get array of all open orders", async () => {
      let symbol = "ETH-USD-MATIC";
      let openOrders = await refTool.getAllOpenOrders(symbol);
      console.log(`Open orders for symbol ${symbol}:`);
      console.log(openOrders);
    });
    it("poll limit orders", async () => {
      let val = await refTool.pollLimitOrders("ETH-USD-MATIC", 15, undefined);
      console.log("val=", val);
    });
  });
});
