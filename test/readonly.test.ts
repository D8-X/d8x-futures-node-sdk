import { BigNumber, ContractInterface, ethers } from "ethers";
import { NodeSDKConfig, ExchangeInfo, Order, PerpetualStaticInfo, BUY_SIDE, SELL_SIDE } from "../src/nodeSDKTypes";
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
import PriceFeeds from "../src/priceFeeds";

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
  beforeEach(() => {
    config = PerpetualDataHandler.readSDKConfig("central-park");
    if (RPC != undefined) {
      config.nodeURL = RPC;
    }
  });

  describe("Read config", () => {
    it("read all config types", () => {
      let configs = ["testnet", "mainnet", "../config/oldConfig.json", "central-park"];

      for (let i = 0; i < configs.length; i++) {
        config = PerpetualDataHandler.readSDKConfig(configs[i]);
        // console.log(`${configs[i]} config:\n`, config);
        expect(/json$/.test(configs[i]) || config.name == configs[i]).toBeTruthy;
      }
    });
  });

  describe("Oracle Routes", () => {
    beforeAll(() => {
      const provider = new ethers.providers.JsonRpcProvider(config.nodeURL);
      let abi = require("../abi/IPerpetualManager.json");
      proxyContract = new ethers.Contract(config.proxyAddr, abi, provider);
    });
    it("routes", async () => {
      let ccyList = ["ETH-USD", "BTC-USD", "USD-USDC", "MATIC-USD"];
      let magnitude = [
        [100, 10_000],
        [1_000, 1_000_000],
        [0.1, 2],
        [0.1, 10],
      ];

      for (let k = 0; k < ccyList.length; k++) {
        let basequote = ccyList[k].split("-");
        let pxABK = await proxyContract.getOraclePrice([toBytes4(basequote[0]), toBytes4(basequote[1])]);
        let px = ABK64x64ToFloat(pxABK);
        let isMagnitudeOk = px > magnitude[k][0] && px < magnitude[k][1];
        if (!isMagnitudeOk) {
          console.log(`Not ok: ${basequote[0]}-${basequote[1]} = ${px}`);
        }
        expect(isMagnitudeOk).toBeTruthy;
      }
    });
  });

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
      let isHex = /^0x/.test(res);
      if (!isHex) {
        console.log(res);
      }
      expect(isHex).toBeTruthy;
    });
    it("get proxy ABI", async () => {
      // Signer or provider
      const provider = new ethers.providers.JsonRpcProvider(config.nodeURL);
      // Address of the contract
      let contractAddr = apiInterface.getProxyAddress();
      // ABI as it would come from the API:
      let abi = apiInterface.getProxyABI("getOraclePrice");
      if (abi.length < 3) {
        console.log(abi);
      }
      expect(abi.length > 2).toBeTruthy;
      // contract instance
      let contract = new ethers.Contract(contractAddr, [abi], provider);
      let px = await contract.getOraclePrice([toBytes4("MATIC"), toBytes4("USD")]);
      expect(px.gt(0)).toBeTruthy;
      // console.log(`price of MATIC-USD: ${ABK64x64ToFloat(px)}`);
    });
    it("get LOB ABI", async () => {
      // Signer or provider
      const provider = new ethers.providers.JsonRpcProvider(config.nodeURL);
      // Address of the contract
      let contractAddr = apiInterface.getOrderBookAddress("MATIC-USD-MATIC");
      // ABI as it would come from the API:
      let abi = apiInterface.getOrderBookABI("MATIC-USD-MATIC", "orderCount");
      if (abi.length < 3) {
        console.log(abi);
      }
      expect(abi.length > 2).toBeTruthy;
      // contract instance
      let contract = new ethers.Contract(contractAddr, [abi], provider);
      let numOrders = await contract.orderCount();
      expect(numOrders >= 0).toBeTruthy;
      if (numOrders > 0) {
        console.log(`orderCount in MATIC-USD-MATIC order book: ${numOrders}`);
      }
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
        console.log(`Perpetuals in ${pool.poolSymbol} pool:\n`, pool.perpetuals);
      }
    });
    it("perp static info", async () => {
      let info: PerpetualStaticInfo = await mktData.getPerpetualStaticInfo("MATIC-USD-MATIC");
      console.log(info);
    });
    it("get pyth ids", async () => {
      let pyhIds: string[] = mktData.getPriceIds("ETH-USD-MATIC");
      console.log(`pyth ids = ${pyhIds}`);
    });

    it("oracle routes", async () => {
      let ccyList = ["ETH-USD", "BTC-USD", "USD-USDC", "MATIC-USD"];

      for (let k = 0; k < ccyList.length; k++) {
        let basequote = ccyList[k].split("-");
        let px = await mktData.getOraclePrice(basequote[0], basequote[1]);
        console.log(`${basequote[0]}-${basequote[1]} = ${px}`);
      }
    });
    it("getWalletBalance", async () => {
      let bal = await mktData.getWalletBalance(wallet.address, "ETH-USD-MATIC");
      console.log(`balance of ${wallet.address}: ${bal}`);
    });
    it("maxOrderSizeForTrader (long)", async () => {
      let pos = await mktData.positionRisk(wallet.address, "ETH-USD-MATIC");
      let bal = await mktData.getWalletBalance(wallet.address, "ETH-USD-MATIC");
      let perpState = await mktData.getPerpetualState("ETH-USD-MATIC");
      // without wallet
      let maxTradeSize = await mktData.maxOrderSizeForTrader(BUY_SIDE, pos, perpState);
      // with wallet
      let maxTradeSize2 = await mktData.maxOrderSizeForTrader(BUY_SIDE, pos, perpState, bal);
      console.log(`max long trade size w/o   wallet: ${maxTradeSize}`);
      console.log(`max long trade size w/   wallet: ${maxTradeSize2}`);
    });
    it("maxOrderSizeForTrader (short)", async () => {
      let pos = await mktData.positionRisk(wallet.address, "ETH-USD-MATIC");
      let bal = await mktData.getWalletBalance(wallet.address, "ETH-USD-MATIC");
      let perpState = await mktData.getPerpetualState("ETH-USD-MATIC");
      // without wallet
      let maxTradeSize = await mktData.maxOrderSizeForTrader(SELL_SIDE, pos, perpState);
      // with wallet
      let maxTradeSize2 = await mktData.maxOrderSizeForTrader(SELL_SIDE, pos, perpState, bal);
      console.log(`max short trade size w/o  wallet: ${maxTradeSize}`);
      console.log(`max short trade size w/  wallet: ${maxTradeSize2}`);
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
        quantity: 200,
        leverage: 1,
        timestamp: Date.now() / 1000,
      };
      let mgnAfter = await mktData.positionRiskOnTrade(wallet.address, order);
      let mgnAfter2 = await mktData.positionRiskOnTrade(wallet.address, order, mgnBefore);
      console.log("mgnBefore:", mgnBefore);
      console.log("mgnAfter :", mgnAfter);
      console.log("mgnAfter2:", mgnAfter2);
    });
    it("get margin info if collateral is added", async () => {
      let mgnBefore = await mktData.positionRisk(wallet.address, "MATIC-USD-MATIC");
      let deposit = 100;
      let mgnAfter = await mktData.positionRiskOnCollateralAction(deposit, mgnBefore);
      console.log("mgnBefore:", mgnBefore);
      console.log("mgnAfter :", mgnAfter);
    });
    it("get margin info if collateral is removed", async () => {
      let mgnBefore = await mktData.positionRisk(wallet.address, "MATIC-USD-MATIC");
      let deposit = -100;
      let mgnAfter = await mktData.positionRiskOnCollateralAction(deposit, mgnBefore);
      console.log("mgnBefore:", mgnBefore);
      console.log("mgnAfter :", mgnAfter);
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
      let accounts = await liqTool.getActiveAccountsByChunks(symbol, 0, 1);
      if (accounts.length > 0) {
        let traderAddr = accounts[0];
        let isLiquidatable = !(await liqTool.isMaintenanceMarginSafe(symbol, traderAddr));
        let posRisk = await mktData.positionRisk(traderAddr, symbol);
        let matchLiqAndLvg =
          (isLiquidatable && posRisk.leverage >= posRisk.liquidationLvg) ||
          (!isLiquidatable && posRisk.leverage < posRisk.liquidationLvg);
        if (!matchLiqAndLvg) {
          console.log(`Trader ${traderAddr} position risk:`, posRisk);
        }
        expect(matchLiqAndLvg).toBeTruthy;
      } else {
        console.log("no active accounts for symbol", symbol);
      }
    });
  });

  describe("Broker", () => {
    beforeAll(async function () {
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
      let isFeeReasonable = fee <= 0.0002 && fee >= 0.00001;
      if (!isFeeReasonable) {
        console.log(`broker fee induced by his stake is ${10_000 * fee!} bps`);
      }
      expect(isFeeReasonable).toBeTruthy;
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
      let isFeeReasonable = fee <= 0.0002 && fee >= 0.00001;
      if (!isFeeReasonable) {
        console.log(
          `exchange fee for an order with my address and no broker signature is ${10_000 * fee} basis points`
        );
      }
      expect(isFeeReasonable).toBeTruthy;
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
      let isFeeReasonable = fee <= 0.0002 && fee >= 0.00001;
      if (!isFeeReasonable) {
        console.log(`exchange fee for a broker-signed order with my address is ${10_000 * fee} basis points`);
      }
      expect(isFeeReasonable).toBeTruthy;
    });
  });

  describe("Referrer", () => {
    beforeAll(async () => {
      expect(pk == undefined).toBeFalsy;
      refTool = new OrderReferrerTool(config, pk);
      await refTool.createProxyInstance();
    });
    it("get order by id/digest", async () => {
      let ordersStruct = await mktData.openOrders(wallet.address, "MATIC-USD-MATIC");
      orderIds = ordersStruct.orderIds;
      if (orderIds.length > 0) {
        let order = await refTool.getOrderById("ETH-USD-MATIC", orderIds[0]);
        console.log(order);
      }
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
