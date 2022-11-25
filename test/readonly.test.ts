import { ethers } from "ethers";
import { NodeSDKConfig, ExchangeInfo } from "../src/nodeSDKTypes";
import { ABK64x64ToFloat } from "../src/d8XMath";
import PerpetualDataHandler from "../src/perpetualDataHandler";
import MarketData from "../src/marketData";
import { to4Chars, toBytes4, fromBytes4, fromBytes4HexString } from "../src/utils";
import LiquidityProviderTool from "../src/liquidityProviderTool";
import LiquidatorTool from "../src/liquidatorTool";
import OrderReferrerTool from "../src/orderReferrerTool";
let pk: string = <string>process.env.PK;
let RPC: string = <string>process.env.RPC;

jest.setTimeout(150000);

let config: NodeSDKConfig;
let proxyContract: ethers.Contract;
let mktData: MarketData;
let liqProvTool: LiquidityProviderTool;
let liqTool: LiquidatorTool;
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

  describe("Oracle Routes", () => {
    beforeAll(async () => {
      const provider = new ethers.providers.JsonRpcProvider(RPC);
      let abi = require("../abi/IPerpetualManager.json");
      proxyContract = new ethers.Contract(config.proxyAddr, abi, provider);
    });
    it("routes", async () => {
      let ccyList = ["ETH-USD", "BTC-USD", "USD-USDC", "MATIC-USD"];

      for (let k = 0; k < ccyList.length; k++) {
        let basequote = ccyList[k].split("-");
        console.log("base, quote =", basequote);
        let px = await proxyContract.getOraclePrice([toBytes4(basequote[0]), toBytes4(basequote[1])]);
        console.log(`${basequote[0]}-${basequote[1]} = ${ABK64x64ToFloat(px)}`);
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
      let id = mktData.getPoolIdFromSymbol("ETH-USD-MATIC");
      console.log("pool id", id);
      let sym = mktData.getSymbolFromPoolId(id);
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
    it("should get number of open orders", async () => {
      let symbol = "ETH-USD-MATIC";
      let numOrders = await refTool.numberOfOpenOrders(symbol);
      console.log(`There are ${numOrders} currently open for symbol ${symbol}`);
    });
  });
  it("should get array of all open orders", async () => {
    let symbol = "ETH-USD-MATIC";
    let openOrders = await refTool.getAllOpenOrders(symbol);
    console.log(`Open orders for symbol ${symbol}:`);
    console.log(openOrders);
  });
});
