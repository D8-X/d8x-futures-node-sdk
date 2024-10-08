import { ethers, JsonRpcProvider } from "ethers";
import {
  NodeSDKConfig,
  ExchangeInfo,
  Order,
  PerpetualStaticInfo,
  PerpetualData,
  LiquidityPoolData,
} from "../src/nodeSDKTypes";
import { ABK64x64ToFloat } from "../src/d8XMath";
import PerpetualDataHandler from "../src/perpetualDataHandler";
import MarketData from "../src/marketData";
import { toBytes4 } from "../src/utils";
import LiquidityProviderTool from "../src/liquidityProviderTool";
import LiquidatorTool from "../src/liquidatorTool";
import OrderExecutorTool from "../src/orderExecutorTool";
import BrokerTool from "../src/brokerTool";
import AccountTrade from "../src/accountTrade";
import TraderInterface from "../src/traderInterface";
import { IPerpetualManager, IPerpetualManager__factory } from "../src/contracts";
import { BUY_SIDE, SELL_SIDE } from "../src/constants";

let pk: string = <string>process.env.PK;
let RPC: string | undefined = <string>process.env.RPC;

jest.setTimeout(150000);

let config: NodeSDKConfig;
let proxyContract: IPerpetualManager;
let mktData: MarketData;
let liqProvTool: LiquidityProviderTool;
let liqTool: LiquidatorTool;
let brokerTool: BrokerTool;
let refTool: OrderExecutorTool;
let accTrade: AccountTrade;
let orderIds: string[];
let apiInterface: TraderInterface;
let wallet: ethers.Wallet;

describe("readOnly", () => {
  beforeAll(() => {
    config = PerpetualDataHandler.readSDKConfig("arbitrumSepolia");
    if (RPC != undefined) {
      config.nodeURL = RPC;
    }
  });

  describe("Read config", () => {
    it("read all config types", () => {
      let configs = ["zkevm", "cardona", 1101, "bartio"];

      for (let i = 0; i < configs.length; i++) {
        let config = PerpetualDataHandler.readSDKConfig(configs[i]);
        // console.log(`${configs[i]} config:\n`, config);
        expect(
          (typeof configs[i] === "string" && (/json$/.test(configs[i] as string) || config.name == configs[i])) ||
            (typeof configs[i] === "number" && config.chainId == configs[i])
        ).toBeTruthy;
      }
    });
  });

  // describe("Oracle Routes", () => {
  //   beforeAll(() => {
  //     const provider = new ethers.providers.JsonRpcProvider(config.nodeURL);
  //     proxyContract = IPerpetualManager__factory.connect(config.proxyAddr, provider);
  //   });
  //   it("routes", async () => {
  //     let ccyList = ["ETH-USD", "BTC-USD", "USD-USDC", "MATIC-USD"];
  //     let magnitude = [
  //       [100, 10_000],
  //       [1_000, 1_000_000],
  //       [0.1, 2],
  //       [0.1, 10],
  //     ];

  //     for (let k = 0; k < ccyList.length; k++) {
  //       let basequote = ccyList[k].split("-");
  //       let pxABK = await proxyContract.getOraclePrice([toBytes4(basequote[0]), toBytes4(basequote[1])]);
  //       let px = ABK64x64ToFloat(pxABK);
  //       let isMagnitudeOk = px > magnitude[k][0] && px < magnitude[k][1];
  //       if (!isMagnitudeOk) {
  //         console.log(`Not ok: ${basequote[0]}-${basequote[1]} = ${px}`);
  //       }
  //       expect(isMagnitudeOk).toBeTruthy;
  //     }
  //   });
  // });

  describe("APIInterface", () => {
    beforeAll(async () => {
      if (pk == undefined) {
        console.log(`Define private key: export PK="CA52A..."`);
        expect(false);
        return;
      }
      apiInterface = new TraderInterface(config);
      await apiInterface.createProxyInstance();
      wallet = new ethers.Wallet(pk);
    });
    it("Read ABI", () => {
      let proxyABI = apiInterface.getABI("sharetoken");
      expect(proxyABI != undefined).toBeTruthy;
    });

    it("order digest", async () => {
      let order: Order = {
        symbol: "BTC-USDC-USDC",
        side: "BUY",
        type: "MARKET",
        quantity: -0.05,
        leverage: 2,
        executionTimestamp: Date.now() / 1000,
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
      const provider = new JsonRpcProvider(config.nodeURL);
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
      let px = (await contract.getOraclePrice([toBytes4("USDC"), toBytes4("USD")])) as bigint;
      expect(px > 0).toBeTruthy;
      // console.log(`price of USDC-USD: ${ABK64x64ToFloat(px)}`);
    });
    it("get LOB ABI", async () => {
      // Signer or provider
      const provider = new JsonRpcProvider(config.nodeURL);
      // Address of the contract
      let contractAddr = apiInterface.getOrderBookAddress("ETH-USDC-USDC");
      // ABI as it would come from the API:
      let abi = apiInterface.getOrderBookABI("ETH-USDC-USDC", "orderCount");
      if (abi.length < 3) {
        console.log(abi);
      }
      expect(abi.length > 2).toBeTruthy;
      // contract instance
      let contract = new ethers.Contract(contractAddr, [abi], provider);
      let numOrders = await contract.orderCount();
      expect(numOrders >= 0).toBeTruthy;
      if (numOrders > 0) {
        console.log(`orderCount in ETH-USDC-USDC order book: ${numOrders}`);
      }
    });
  });

  describe("MarketData", () => {
    beforeAll(async () => {
      if (pk == undefined) {
        console.log(`Define private key: export PK="CA52A..."`);
        expect(false);
        return;
      }
      mktData = new MarketData(config);
      wallet = new ethers.Wallet(pk);
      await mktData.createProxyInstance();
    });
    it("fetchPrdMktMetaData", async () => {
      let q = await mktData.fetchPrdMktMetaData("TRUMP24-USD");
      console.log(q);
      q = await mktData.fetchPrdMktMetaData("BTLJ-USD");
      console.log(q);
    });
    it("init from instance", async () => {
      let mktData2 = new MarketData(config);
      await mktData2.createProxyInstance(mktData);
      expect(mktData2.getReadOnlyProxyInstance() !== null);
    });
    it("perpetual symbols in pool", async () => {
      let v = mktData.getPerpetualSymbolsInPool("USDC");
      console.log("***\nPerpetuals for symbol USDC:\n", v, "\n***");
      expect(v.length).toBeGreaterThan(1);
    });
    it("exchange info", async () => {
      let info: ExchangeInfo = await mktData.exchangeInfo();
      console.log(info);
      for (var k = 0; k < info.pools.length; k++) {
        let pool = info.pools[k];
        console.log(`Perpetuals in ${pool.poolSymbol} pool:\n`, pool.perpetuals);
        console.log("Closed markets:");
        for (let j = 0; j < pool.perpetuals.length; j++) {
          let perp = pool.perpetuals[j];
          const symbol = perp.baseCurrency + "-" + perp.quoteCurrency + "-" + pool.poolSymbol;
          if (perp.isMarketClosed) {
            console.log(perp.baseCurrency + "-" + perp.quoteCurrency + ":" + perp.state + " - " + perp.isMarketClosed);
          }
          let isClosedDirect = await mktData.isMarketClosed(symbol);
          expect(isClosedDirect).toEqual(perp.isMarketClosed);
        }
      }
    });
    it("exchange info: custom provider", async () => {
      let info: ExchangeInfo = await mktData.exchangeInfo({ rpcURL: config.nodeURL });
      console.log(info);
      for (var k = 0; k < info.pools.length; k++) {
        let pool = info.pools[k];
        console.log(`Perpetuals in ${pool.poolSymbol} pool:\n`, pool.perpetuals);
        console.log("Closed markets:");
        for (let j = 0; j < pool.perpetuals.length; j++) {
          let perp = pool.perpetuals[j];
          const symbol = perp.baseCurrency + "-" + perp.quoteCurrency + "-" + pool.poolSymbol;
          if (perp.isMarketClosed) {
            console.log(perp.baseCurrency + "-" + perp.quoteCurrency + ":" + perp.state + " - " + perp.isMarketClosed);
          }
          let isClosedDirect = await mktData.isMarketClosed(symbol);
          expect(isClosedDirect).toEqual(perp.isMarketClosed);
        }
      }
    });
    it("get perpetual data", async () => {
      let perps: PerpetualData[] = await mktData.getPerpetuals([100000]);
      expect(perps[0].id).toEqual(100000);
    });
    it("get pool data", async () => {
      let pools: LiquidityPoolData[] = await mktData.getLiquidityPools(1, 1);
      expect(pools[0].id).toEqual(1);
    });
    it("mark price", async () => {
      // base, quote, quanto
      for (let symbol of ["BTC-USDC-USDC", "ETH-USDC-USDC"]) {
        let markPrice1 = await mktData.getMarkPrice(symbol);
        let state = await mktData.getPerpetualState(symbol);
        let markPrice2 = state.indexPrice * (1 + state.markPremium);
        let success = Math.abs((markPrice1 - markPrice2) / markPrice1) < 1e-6;
        if (!success) {
          console.log(`markPrice direct: ${markPrice1}, markPrice from state: ${markPrice2}`);
        }
        expect(success).toBeTruthy;
      }
    });
    it("pool state", async () => {
      let symbol = "USDC";
      let pool = await mktData.getPoolState(symbol);
      console.log(pool);
      expect(pool.pnlParticipantCashCC > 0);
    });
    it("max positions", async () => {
      let maxLong = await mktData.maxSignedPosition(BUY_SIDE, "BTC-USDC-USDC");
      let maxShort = await mktData.maxSignedPosition(SELL_SIDE, "BTC-USDC-USDC");
      console.log("max long=" + maxLong + " max short=" + maxShort);
    });

    it("perp static info", async () => {
      let info: PerpetualStaticInfo = await mktData.getPerpetualStaticInfo("ETH-USDC-USDC");
      console.log(info);
    });
    it("get pyth ids", async () => {
      let pyhIds: string[] = mktData.getPriceIds("ETH-USDC-USDC");
      console.log(`pyth ids = ${pyhIds}`);
    });

    it("oracle routes", async () => {
      let ccyList = ["ETH-USD", "BTC-USD", "USD-USDC"];

      for (let k = 0; k < ccyList.length; k++) {
        let basequote = ccyList[k].split("-");
        let px = await mktData.getOraclePrice(basequote[0], basequote[1]);
        console.log(`${basequote[0]}-${basequote[1]} = ${px}`);
      }
    });
    it("getWalletBalance", async () => {
      let bal = await mktData.getWalletBalance(wallet.address, "ETH-USDC-USDC");
      console.log(`balance of ${wallet.address}: ${bal}`);
    });
    it("loyality score", async () => {
      let score = await mktData.getTraderLoyalityScore(wallet.address);
      console.log(`loyality score of ${wallet.address}: ${score}`);
    });
    it("position risks in pool", async () => {
      let pos = await mktData.positionRisk(wallet.address, "USDC");
      console.log(`Position risks in USDC pool`);
      console.log(pos);
    });
    it("position risks in exchange", async () => {
      let pos = await mktData.positionRisk(wallet.address);
      console.log(`All position risks`);
      console.log(pos);
    });
    it("maxOrderSizeForTrader USDC", async () => {
      let pos = await mktData.positionRisk(wallet.address, "ETH-USDC-USDC");
      let maxTradeSize = await mktData.maxOrderSizeForTrader(wallet.address, "ETH-USDC-USDC");
      console.log(`max trade sizes for symbol ETH-USDC-USDC`, maxTradeSize);
    });
    it("maxOrderSizeForTrader USDC", async () => {
      let pos = await mktData.positionRisk(wallet.address, "BTC-USDC-USDC");
      let maxTradeSize = await mktData.maxOrderSizeForTrader(wallet.address, "BTC-USDC-USDC");
      console.log(`max trade sizes for symbol BTC-USDC-USDC`, maxTradeSize);
    });

    it("openOrders in perpetual", async () => {
      let ordersStruct = await mktData.openOrders(wallet.address, "ETH-USDC-USDC");
      console.log("order ids in perpetual=", ordersStruct[0].orderIds);
      console.log("orders in perpetual  =", ordersStruct[0].orders);
      orderIds = ordersStruct[0].orderIds;
    });
    it("openOrders in pool", async () => {
      let ordersStruct = await mktData.openOrders(wallet.address, "USDC");
      console.log("orders in pool =", ordersStruct);
    });
    it("openOrders in exchange", async () => {
      let ordersStruct = await mktData.openOrders(wallet.address);
      console.log("all orders =", ordersStruct);
    });
    it("get margin info", async () => {
      let mgn = await mktData.positionRisk(wallet.address, "BTC-USDC-USDC");
      console.log("mgn=", mgn);
    });

    it("get margin info if an opening trade was performed", async () => {
      let mgnBefore = (await mktData.positionRisk(wallet.address, "ETH-USDC-USDC"))[0];
      let order: Order = {
        symbol: "ETH-USDC-USDC",
        side: "BUY",
        type: "MARKET",
        quantity: 200,
        leverage: 2,
        executionTimestamp: Date.now() / 1000,
      };
      let { newPositionRisk, orderCost, maxLongTrade, maxShortTrade } = await mktData.positionRiskOnTrade(
        wallet.address,
        order,
        0,
        100
      );
      console.log("mgn before opening=", mgnBefore, "\norder=", order);
      console.log("mgn after  opening=", newPositionRisk, "\ndeposit =", orderCost);
      console.log("max long", maxLongTrade);
      console.log("max short", maxShortTrade);
    });

    it("get margin info if a closing trade was performed", async () => {
      let mgnBefore = (await mktData.positionRisk(wallet.address, "BTC-USDC-USDC"))[0];
      let order: Order = {
        symbol: "BTC-USDC-USDC",
        side: "SELL",
        type: "MARKET",
        quantity: 0.001,
        leverage: 5,
        executionTimestamp: Date.now() / 1000,
      };
      let { newPositionRisk, orderCost, maxLongTrade, maxShortTrade } = await mktData.positionRiskOnTrade(
        wallet.address,
        order,
        0,
        100
      );
      console.log("mgn before closing=", mgnBefore, "\norder=", order);
      console.log("mgn after  closing=", newPositionRisk, "\ndeposit =", orderCost);
      console.log("max long", maxLongTrade);
      console.log("max short", maxShortTrade);
    });
    it("get margin info if collateral is added", async () => {
      let mgnBefore = (await mktData.positionRisk(wallet.address, "ETH-USDC-USDC"))[0];
      let deposit = 100;
      let mgnAfter = await mktData.positionRiskOnCollateralAction(deposit, mgnBefore);
      console.log("mgnBefore:", mgnBefore);
      console.log("mgnAfter :", mgnAfter);
    });
    it("get margin info if collateral is removed", async () => {
      let mgnBefore = (await mktData.positionRisk(wallet.address, "ETH-USDC-USDC"))[0];
      let deposit = -2;
      let errored = false;
      try {
        let mgnAfter = await mktData.positionRiskOnCollateralAction(deposit, mgnBefore);
        console.log("mgnBefore:", mgnBefore);
        console.log("mgnAfter :", mgnAfter);
      } catch (e) {
        errored = true;
        console.log(e);
      }
      expect(
        errored ==
          deposit + mgnBefore.collateralCC + mgnBefore.unrealizedPnlQuoteCCY / mgnBefore.collToQuoteConversion < 0
      ).toBeTruthy();
    });

    it("get pool id", async () => {
      let perpSymbol = "ETH-USDC-USDC";
      let id = mktData.getPoolIdFromSymbol(perpSymbol);
      let poolSymbol = mktData.getSymbolFromPoolId(id);
      console.log(`Perp symbol ${perpSymbol} -> pool ID ${id} -> pool symbol ${poolSymbol}`);
    });

    it("get readonly instance", async () => {
      await mktData.getReadOnlyProxyInstance();
    });

    it("get price", async () => {
      let perpSymbol = "ETH-USDC-USDC";
      let pxLong = await mktData.getPerpetualPrice(perpSymbol, 2);
      let pxShort = await mktData.getPerpetualPrice(perpSymbol, -2);
      console.log(`Perp price long ${pxLong} / short ${pxShort}`);
    });
    it("get mark price", async () => {
      let perpSymbol = "ETH-USDC-USDC";
      let pxMark = await mktData.getMarkPrice(perpSymbol);
      console.log(`Perp mark price ${pxMark}`);
    });

    it("get price in USD: perp", async () => {
      let symbol = "ETH-USDC-USDC";
      let pxMap = await mktData.getPriceInUSD(symbol);
      console.log(pxMap);
    });

    it("get price in USD: pool", async () => {
      let symbol = "USDC";
      let pxMap = await mktData.getPriceInUSD(symbol);
      console.log(pxMap);
    });

    it("get price in USD: all", async () => {
      let pxMap = await mktData.getPriceInUSD();
      console.log(pxMap);
    });
  });

  // describe("Account and Trade", () => {
  //   beforeAll(async () => {
  //     if (pk == undefined) {
  //       console.log(`Define private key: export PK="CA52A..."`);
  //       expect(false);
  //     }
  //     accTrade = new AccountTrade(config, pk);
  //     await accTrade.createProxyInstance();
  //   });
  //   it("getOrderIds", async () => {
  //     let ids = await accTrade.getOrderIds("MATIC-USDC-USDC");
  //     console.log("Order Ids for trader:");
  //     console.log(ids);
  //   });
  //   it("getOrderStatus", async () => {
  //     let ids = await accTrade.getOrderIds("ETH-USDC-USDC");
  //     if (ids.length > 0) {
  //       let status = await mktData.getOrderStatus("ETH-USDC-USDC", ids[0]);
  //       console.log(status);
  //     }
  //   });
  //   it("getOrdersStatus", async () => {
  //     let ids = await accTrade.getOrderIds("ETH-USDC-USDC");
  //     if (ids.length > 0) {
  //       let status = await mktData.getOrdersStatus("ETH-USDC-USDC", ids);
  //       console.log(status);
  //     }
  //   });
  // });

  // describe("Liquidity Provider", () => {
  //   beforeAll(async () => {
  //     if (pk == undefined) {
  //       console.log(`Define private key: export PK="CA52A..."`);
  //       expect(false);
  //     }
  //     liqProvTool = new LiquidityProviderTool(config, pk);
  //     await liqProvTool.createProxyInstance();
  //   });
  //   it("getParticipationValue", async () => {
  //     let val = await mktData.getParticipationValue(wallet.address, "USDC");
  //     console.log("pool sharetoken value", val.value);
  //   });
  // });

  // describe("Liquidator", () => {
  //   beforeAll(async () => {
  //     if (pk == undefined) {
  //       console.log(`Define private key: export PK="CA52A..."`);
  //       expect(false);
  //     }
  //     liqTool = new LiquidatorTool(config, pk);
  //     await liqTool.createProxyInstance();
  //   });
  //   it("should get number of active accounts", async () => {
  //     let symbol = "ETH-USDC-USDC";
  //     let numAccounts = await liqTool.countActivePerpAccounts(symbol);
  //     console.log(`number of active accounts for symbol ${symbol} = ${numAccounts}`);
  //   });
  //   it("should get first n active accounts", async () => {
  //     let symbol = "ETH-USDC-USDC";
  //     let firstN = 2;
  //     let firstNAccounts = await liqTool.getActiveAccountsByChunks(symbol, 0, firstN);
  //     console.log(`first ${firstN} active accounts for ${symbol}:`);
  //     console.log(firstNAccounts);
  //   });
  //   it("should get all active accounts", async () => {
  //     let symbol = "ETH-USDC-USDC";
  //     let allAccounts = await liqTool.getAllActiveAccounts(symbol);
  //     console.log(`all active accounts for ${symbol}:`);
  //     console.log(allAccounts);
  //   });
  //   it("check available margin", async () => {
  //     let symbol = "BTC-USDC-USDC";
  //     let accounts = await liqTool.getActiveAccountsByChunks(symbol, 0, 1);
  //     if (accounts.length > 0) {
  //       let traderAddr = accounts[0];
  //       let mgn = await mktData.getAvailableMargin(traderAddr, symbol);
  //       console.log("available mgn = ", mgn);
  //       expect(mgn).toBeGreaterThanOrEqual(0);
  //     }
  //   });

  //   it("should check if trader is liquidatable", async () => {
  //     let symbol = "BTC-USDC-USDC";
  //     let accounts = await liqTool.getActiveAccountsByChunks(symbol, 0, 1);
  //     if (accounts.length > 0) {
  //       let traderAddr = accounts[0];
  //       let isLiquidatable = !(await liqTool.isMaintenanceMarginSafe(symbol, traderAddr));
  //       let posRisk = (await mktData.positionRisk(traderAddr, symbol))[0];
  //       let matchLiqAndLvg =
  //         (isLiquidatable && posRisk.leverage >= posRisk.liquidationLvg) ||
  //         (!isLiquidatable && posRisk.leverage < posRisk.liquidationLvg);
  //       if (!matchLiqAndLvg) {
  //         console.log(`Trader ${traderAddr} position risk:`, posRisk);
  //       }
  //       expect(matchLiqAndLvg).toBeTruthy;
  //     } else {
  //       console.log("no active accounts for symbol", symbol);
  //     }
  //   });
  // });

  // describe("Broker", () => {
  //   beforeAll(async function () {
  //     expect(pk == undefined).toBeFalsy();
  //     brokerTool = new BrokerTool(config, pk);
  //     await brokerTool.createProxyInstance();
  //   });
  //   it("should get lot size and fees for some numbers of lots", async () => {
  //     let symbol = "USDC";
  //     let lotSizeSC = await brokerTool.getLotSize(symbol);
  //     console.log(`lot size for ${symbol} pool is ${lotSizeSC} USDC`);
  //     let designations = [1, 2, 5, 10, 15]; //, 20, 25, 40, 60, 100, 400, 600];
  //     console.log("Some broker designations and fees:");
  //     for (var k = 0; k < designations.length; k++) {
  //       let lots = designations[k];
  //       let fee = await brokerTool.getFeeForBrokerDesignation(symbol, lots);
  //       console.log(`Exchange fee for ${lots} lots is ${100 * fee} %`);
  //     }
  //   });

  //   it("should get broker designation and fee", async () => {
  //     let symbol = "USDC";
  //     let lots = await brokerTool.getBrokerDesignation(symbol);
  //     let fee = await brokerTool.getFeeForBrokerDesignation(symbol);
  //     console.log(`broker designation is ${lots} lots, with an induced fee of ${fee * 10_000} bps`);
  //   });

  //   it("should get broker volume and fee", async () => {
  //     let symbol = "USDC";
  //     let volume = await brokerTool.getCurrentBrokerVolume(symbol); // uncomment when implemented
  //     let fee = await brokerTool.getFeeForBrokerVolume(symbol);
  //     console.log(`broker volume is ${volume}, with an induced fee of ${10_000 * fee!} bps`);
  //   });

  //   it("should get broker stake induced fee", async () => {
  //     // this is based on stake only, independent of the pool
  //     let fee = await brokerTool.getFeeForBrokerStake();
  //     let isFeeReasonable = fee <= 0.0002 && fee >= 0.00001;
  //     if (!isFeeReasonable) {
  //       console.log(`broker fee induced by his stake is ${10_000 * fee!} bps`);
  //     }
  //     expect(isFeeReasonable).toBeTruthy;
  //   });

  //   it("should determine the exchange fee for an order not signed by this broker", async () => {
  //     let order: Order = {
  //       symbol: "MATIC-USDC-USDC",
  //       side: "BUY",
  //       type: "MARKET",
  //       quantity: 500,
  //       leverage: 2,
  //       executionTimestamp: Date.now() / 1000,
  //     };
  //     const myAddress = new ethers.Wallet(pk).address;
  //     let fee = await brokerTool.determineExchangeFee(order, myAddress);
  //     let isFeeReasonable = fee <= 0.0002 && fee >= 0.00001;
  //     if (!isFeeReasonable) {
  //       console.log(
  //         `exchange fee for an order with my address and no broker signature is ${10_000 * fee} basis points`
  //       );
  //     }
  //     expect(isFeeReasonable).toBeTruthy;
  //   });

  //   it("should determine the exchange fee for an order signed by this broker", async () => {
  //     let order: Order = {
  //       symbol: "ETH-USDC-USDC",
  //       side: "BUY",
  //       type: "MARKET",
  //       quantity: 0.5,
  //       leverage: 2,
  //       executionTimestamp: Date.now() / 1000,
  //       brokerFeeTbps: 500,
  //       deadline: Math.round(Date.now() / 1000) + 10000,
  //     };
  //     const myAddress = new ethers.Wallet(pk).address;
  //     let signedOrder = await brokerTool.signOrder(order, myAddress);
  //     let fee = await brokerTool.determineExchangeFee(signedOrder, myAddress);
  //     let isFeeReasonable = fee <= 0.0002 && fee >= 0.00001;
  //     if (!isFeeReasonable) {
  //       console.log(`exchange fee for a broker-signed order with my address is ${10_000 * fee} basis points`);
  //     }
  //     expect(isFeeReasonable).toBeTruthy;
  //   });
  // });

  describe("Executor", () => {
    beforeAll(async () => {
      expect(pk == undefined).toBeFalsy;
      wallet = new ethers.Wallet(pk);
      refTool = new OrderExecutorTool(config, pk);
      await refTool.createProxyInstance(mktData);
    });
    it("get order by id/digest", async () => {
      let ordersStruct = await mktData.openOrders(wallet.address, "ETH-USDC-USDC");
      orderIds = ordersStruct[0].orderIds;
      if (orderIds.length > 0) {
        let order = await refTool.getOrderById("ETH-USDC-USDC", orderIds[0]);
        console.log("orderById from openOrders", order);
      }
    });
    it("should get number of open orders", async () => {
      let symbol = "ETH-USDC-USDC";
      let numOrders = await refTool.numberOfOpenOrders(symbol);
      console.log(`There are ${numOrders} orders currently open for symbol ${symbol}`);
    });
    it("should get array of all open orders", async () => {
      let symbol = "ETH-USDC-USDC";
      let openOrders = await refTool.getAllOpenOrders(symbol);
      console.log(`Open orders for symbol ${symbol}:\n${openOrders}`);
      orderIds = openOrders[1];
      if (orderIds.length > 0) {
        let order = await refTool.getOrderById("ETH-USDC-USDC", orderIds[0]);
        console.log("orderById from getAllOpenOrders", order);
      }
      // console.log(openOrders);
    });
    it("should check if an order is tradeable", async () => {
      let symbol = "ETH-USDC-USDC";
      let openOrders = await refTool.getAllOpenOrders(symbol);
      if (openOrders[0].length > 0) {
        let isTradeable = await refTool.isTradeable(openOrders[0][0], openOrders[1][0]);
        console.log("isTradeable", isTradeable);
      } else {
        console.warn("no orders to check");
      }
    });
    it("should check if a batch of orders is tradeable", async () => {
      let symbol = "ETH-USDC-USDC";
      let openOrders = await refTool.getAllOpenOrders(symbol);
      if (openOrders[0].length > 0) {
        let isTradeable = await refTool.isTradeableBatch(
          [openOrders[0][0], openOrders[0][1]],
          [openOrders[1][0], openOrders[1][1]]
        );
        console.log("isTradeable", isTradeable);
      }
    });
    it("poll limit orders", async () => {
      let val = await refTool.pollLimitOrders("ETH-USDC-USDC", 15, undefined);
      console.log("val=", val);
    });
  });
});
