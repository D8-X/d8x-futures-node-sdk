import { ContractInterface, ethers } from "ethers";
import { NodeSDKConfig, ExchangeInfo, Order, PerpetualStaticInfo } from "../src/nodeSDKTypes";
import { ABK64x64ToFloat } from "../src/d8XMath";
import PerpetualDataHandler from "../src/perpetualDataHandler";
import MarketData from "../src/marketData";
import { to4Chars, toBytes4, fromBytes4, fromBytes4HexString } from "../src/utils";
import LiquidityProviderTool from "../src/liquidityProviderTool";
import LiquidatorTool from "../src/liquidatorTool";
import OrderReferrerTool from "../src/orderReferrerTool";
import BrokerTool from "../src/brokerTool";
import AccountTrade from "../src/accountTrade";
import TraderInterface from "../src/traderInterface";
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
let accTrade: AccountTrade;
let orderIds: string[];
let apiInterface: TraderInterface;
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
  describe("APIInteface", () => {
    beforeAll(async () => {
      apiInterface = new TraderInterface(config);
      await apiInterface.createProxyInstance();
      wallet = new ethers.Wallet(pk);
    });
    it("order digest", async () => {
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
    });
    it("get proxy ABI", async () => {
      // Signer or provider
      const provider = new ethers.providers.JsonRpcProvider(config.nodeURL);
      // Address of the contract
      let contractAddr = apiInterface.getProxyAddress();
      // ABI as it would come from the API:
      let abi = apiInterface.getProxyABI("getOraclePrice");
      console.log(abi);
      // contract instance
      let contract = new ethers.Contract(contractAddr, [abi], provider);
      let px = await contract.getOraclePrice([toBytes4("MATIC"), toBytes4("USD")]);
      console.log(`price of MATIC-USD: ${ABK64x64ToFloat(px)}`);
    });
    it("get LOB ABI", async () => {
      // Signer or provider
      const provider = new ethers.providers.JsonRpcProvider(config.nodeURL);
      // Address of the contract
      let contractAddr = apiInterface.getOrderBookAddress("MATIC-USD-MATIC");
      // ABI as it would come from the API:
      let abi = apiInterface.getOrderBookABI("MATIC-USD-MATIC", "orderCount");
      console.log(abi);
      // contract instance
      let contract = new ethers.Contract(contractAddr, [abi], provider);
      let numOrders = await contract.orderCount();
      console.log(`orderCount in MATIC-USD-MATIC order book: ${numOrders}`);
    });
  });

  describe("MarketData", () => {
    beforeAll(async () => {
      if (pk == undefined) {
        console.log(`Define private key: export PK="CA52A..."`);
        expect(false);
      }
      mktData = new MarketData(config);
      await mktData.createProxyInstance();
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
    it("perp static info", async () => {
      let info: PerpetualStaticInfo = await mktData.getPerpetualStaticInfo("MATIC-USD-MATIC");
      console.log(info);
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
      let ordersStruct = await mktData.openOrders(wallet.address, "MATIC-USD-MATIC");
      console.log("order ids=", ordersStruct.orderIds);
      console.log("orders   =", ordersStruct.orders);
      orderIds = ordersStruct.orderIds;
    });
    it("get margin info", async () => {
      let mgn = await mktData.positionRisk(wallet.address, "MATIC-USD-MATIC");
      console.log("mgn=", mgn);
    });
    it("get margin info if a trade was performed", async () => {
      let mgnBefore = await mktData.positionRisk(wallet.address, "MATIC-USD-MATIC");
      let order: Order = {
        symbol: "MATIC-USD-MATIC",
        side: "BUY",
        type: "MARKET",
        quantity: 5,
        leverage: 2,
        timestamp: Date.now() / 1000,
      };
      let mgnAfter = await mktData.positionRiskOnTrade(wallet.address, order);
      let mgnAfter2 = await mktData.positionRiskOnTrade(wallet.address, order, mgnBefore);
      console.log("mgnBefore:", mgnBefore);
      console.log("mgnAfter :", mgnAfter);
      console.log("mgnAfter2:", mgnAfter2);
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

  describe("Account and Trade", () => {
    beforeAll(async () => {
      if (pk == undefined) {
        console.log(`Define private key: export PK="CA52A..."`);
        expect(false);
      }
      accTrade = new AccountTrade(config, pk);
      await accTrade.createProxyInstance();
    });
    it("getOrderIds", async () => {
      let ids = await accTrade.getOrderIds("ETH-USD-MATIC");
      console.log("Order Ids for trader:");
      console.log(ids);
    });
    it("getOrderStatus", async () => {
      let ids = await accTrade.getOrderIds("ETH-USD-MATIC");
      if (ids.length > 0) {
        let status = await mktData.getOrderStatus("ETH-USD-MATIC", ids[0]);
        console.log(status);
      }
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
      let symbol = "BTC-USD-MATIC";
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
      let volume = await brokerTool.getCurrentBrokerVolume(symbol); // uncomment when implemented
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
        timestamp: Date.now() / 1000,
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
        timestamp: Date.now() / 1000,
        brokerFeeTbps: 500,
        deadline: Math.round(Date.now() / 1000) + 10000,
      };
      const myAddress = new ethers.Wallet(pk).address;
      let signedOrder = await brokerTool.signOrder(order, myAddress);
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
      console.log(`There are ${numOrders} orders currently open for symbol ${symbol}`);
    });
    it("should get array of all open orders", async () => {
      let symbol = "ETH-USD-MATIC";
      let openOrders = await refTool.getAllOpenOrders(symbol);
      console.log(`Open orders for symbol ${symbol}:\n${openOrders}`);
      // console.log(openOrders);
    });
    it("should check if an order is tradeable", async () => {
      let symbol = "MATIC-USD-MATIC";
      let openOrders = await refTool.getAllOpenOrders(symbol);
      let isTradeable = await refTool.isTradeable(openOrders[0][0]);
      console.log(isTradeable);
    });
    it("should check if a batch of orders is tradeable", async () => {
      let symbol = "MATIC-USD-MATIC";
      let openOrders = await refTool.getAllOpenOrders(symbol);
      let isTradeable = await refTool.isTradeableBatch([openOrders[0][0], openOrders[0][1]]);
      console.log(isTradeable);
    });
    it("poll limit orders", async () => {
      let val = await refTool.pollLimitOrders("MATIC-USD-MATIC", 15, undefined);
      console.log("val=", val);
    });
  });
});
