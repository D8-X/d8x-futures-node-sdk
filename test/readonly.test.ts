import { ethers } from "ethers";
import { NodeSDKConfig, ExchangeInfo } from "../src/nodeSDKTypes";
import { ABK64x64ToFloat } from "../src/d8XMath";
import PerpetualDataHandler from "../src/perpetualDataHandler";
import MarketData from "../src/marketData";
import { to4Chars, toBytes4, fromBytes4, fromBytes4HexString } from "../src/utils";
import LiquidityProviderTool from "../src/liquidityProviderTool";
let pk: string = <string>process.env.PK;
let RPC: string = <string>process.env.RPC;

jest.setTimeout(150000);

let config: NodeSDKConfig;
let proxyContract: ethers.Contract;
let mktData: MarketData;
let liqProvTool: LiquidityProviderTool;
let orderIds: string[];
let wallet: ethers.Wallet;

describe("readOnly", () => {
  beforeAll(async function () {
    config = PerpetualDataHandler.readSDKConfig("testnet");
    if (RPC != undefined) {
      config.nodeURL = RPC;
    }
    const provider = new ethers.providers.JsonRpcProvider(RPC);
    let abi = require("../abi/IPerpetualManager.json");
    proxyContract = new ethers.Contract(config.proxyAddr, abi, provider);
  });

  describe("Oracle Routes", () => {
    it("routes", async () => {
      let ccyList = ["ETH-USD", "BTC-USD", "USD-USDC", "MATIC-USD"];

      for (let k = 0; k < ccyList.length; k++) {
        let basequote = ccyList[k].split("-");
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
});
