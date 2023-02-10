import { BigNumber, ethers } from "ethers";
import { stringify } from "querystring";
import { sys } from "typescript";
import AccountTrade from "../src/accountTrade";
import MarketData from "../src/marketData";
import {
  NodeSDKConfig,
  Order,
  OrderResponse,
  PerpetualState,
  PoolState,
  SmartContractOrder,
} from "../src/nodeSDKTypes";
import PerpetualDataHandler from "../src/perpetualDataHandler";
import PerpetualEventHandler from "../src/perpetualEventHandler";
/**
 * Requirements: export PK1 and PK2, private keys of two different funded wallets
 */

let pk1: string = <string>process.env.PK1;
let pk2: string = <string>process.env.PK2;
let RPC: string = <string>process.env.RPC;

jest.setTimeout(150000);
// jest.useFakeTimers();

let config: NodeSDKConfig;
let mktData: MarketData;
let eventHandler: PerpetualEventHandler;
let proxyContract: ethers.Contract;
let accTrade1: AccountTrade, accTrade2: AccountTrade;
let LOBContracts = new Map<string, ethers.Contract>();

let poolSymbols = new Array<string>(); // e.g. [USDC, MATIC]
let perpSymbols = new Map<string, string[]>(); // e.g. {USDC: [BTC, ETH, GBP], MATIC: [BTC, ETH, MATIC]}

const delay = (ms: number) => new Promise((res: any) => setTimeout(res, ms));
const flushPromises = () => {
  return new Promise((resolve) => setImmediate(resolve));
};

describe("Front-end-like functionality", () => {
  beforeAll(async () => {
    config = PerpetualDataHandler.readSDKConfig("../config/defaultConfig.json");
    if (RPC != undefined) {
      config.nodeURL = RPC;
    }
    if (pk1 == undefined || pk2 == undefined) {
      console.log(`Provide two private keys:\nexport PK1="F1R5T..."\nexport PK2="5EC0ND..."`);
      expect(true).toBeFalsy;
    }
    // FE mkt data instance
    mktData = new MarketData(config);
    await mktData.createProxyInstance();

    let symbol = mktData.getSymbolFromPerpId(100000);
    console.log(`symbolFromPerpetualId ${100000} -> ${symbol}`);
    // exchangeInfo to determine pools and perpetuals
    let info = await mktData.exchangeInfo();
    for (var pool of info.pools) {
      poolSymbols.push(pool.poolSymbol);
      perpSymbols.set(
        pool.poolSymbol,
        pool.perpetuals.map((x: PerpetualState) => `${x.baseCurrency}-${x.quoteCurrency}-${pool.poolSymbol}`)
      );
    }

    console.log("poolSymbols =", poolSymbols);
    console.log("perpSymbols =", perpSymbols);

    // Main trader's wallet
    accTrade1 = new AccountTrade(config, pk1);
    await accTrade1.createProxyInstance();
    accTrade1.setAllowance("MATIC");

    // A different trader interacting with the contracts somewhere else
    accTrade2 = new AccountTrade(config, pk2);
    await accTrade2.createProxyInstance();
    accTrade2.setAllowance("MATIC");

    // Event handler for FE
    eventHandler = new PerpetualEventHandler(mktData, accTrade1.getAddress());
    await eventHandler.initialize();

    // contracts that we will be listening to:

    // perpetual proxy/manager
    proxyContract = mktData.getReadOnlyProxyInstance();

    // limit order books for each perp
    for (var poolSymbol of poolSymbols) {
      for (var perpSymbol of perpSymbols.get(poolSymbol)!) {
        LOBContracts.set(perpSymbol, mktData.getOrderBookContract(perpSymbol));
      }
    }

    // create listeners
    // listen to mark price updates, to keep perp state up to date
    proxyContract.on("UpdateMarkPrice", (perpetualId, fMidPricePremium, fMarkPricePremium, fSpotIndexPrice) => {
      eventHandler.onUpdateMarkPrice(perpetualId, fMidPricePremium, fMarkPricePremium, fSpotIndexPrice);
    });

    // listen to trades to keep the connected trader's info up to date
    proxyContract.on(
      "Trade",
      (
        perpetualId: number,
        trader: string,
        positionId: string,
        order: SmartContractOrder,
        orderDigest: string,
        newPositionSizeBC: BigNumber,
        price: BigNumber
      ) => {
        if (trader == accTrade1.getAddress()) {
          eventHandler.onTrade(perpetualId, trader, positionId, order, orderDigest, newPositionSizeBC, price);
        }
      }
    );

    // listen to limit order books to keep the connected trader's info up to date
    for (let poolSymbol of poolSymbols) {
      for (let perpSymbol of perpSymbols.get(poolSymbol)!) {
        LOBContracts.get(perpSymbol)!.on(
          "PerpetualLimitOrderCreated",
          (
            perpetualId: number,
            trader: string,
            referrerAddr: string,
            brokerAddr: string,
            Order: SmartContractOrder,
            digest: string
          ) => {
            if (trader == accTrade1.getAddress()) {
              // console.log(`PerpetualLimitOrderCreated event for connected trader caught, perpetualId = ${perpetualId}`);
              eventHandler.onPerpetualLimitOrderCreated(perpetualId, trader, referrerAddr, brokerAddr, Order, digest);
            }
          }
        );
      }
    }
  });

  afterAll((done) => {
    done();
  });

  it("reacts on order posted by trader", async () => {
    let symbol = "MATIC-USD-MATIC";

    // trader data before he does anything
    let positionRiskBefore = eventHandler.getCurrentPositionRisk(symbol);

    // post an order
    let order: Order = {
      symbol: symbol,
      side: "BUY",
      type: "MARKET",
      quantity: 200,
      leverage: 10,
      timestamp: Date.now() / 1000,
    };

    let resp: OrderResponse = await accTrade1.order(order);
    console.log("open trade transaction hash =", resp.tx.hash);
    console.log("open orderId =", resp.orderId);
    await resp.tx.wait();

    // wait for 5 blocks ~ 10 seconds or so, so the order is executed on chain
    await delay(10000);

    // check event handler updated trader data
    let positionRiskAfter = eventHandler.getCurrentPositionRisk(symbol);

    // await flushPromises();
    expect(positionRiskAfter!.positionNotionalBaseCCY != positionRiskBefore!.positionNotionalBaseCCY);
  });

  it("reacts on mark price updates", async () => {
    let symbol = "MATIC-USD-MATIC";
    let perpDataBefore = eventHandler.getPerpetualData(symbol);
    // close previous order
    let order: Order = {
      symbol: symbol,
      side: "BUY",
      type: "MARKET",
      quantity: 200,
      leverage: 10,
      timestamp: Date.now() / 1000,
    };
    order.side = "SELL";
    let resp: OrderResponse = await accTrade1.order(order);
    console.log("close trade transaction hash =", resp.tx.hash);
    console.log("close orderId =", resp.orderId);
    await resp.tx.wait();

    // wait for 5 blocks ~ 10 seconds or so, so the order is executed on chain
    await delay(10000);
    let perpDataAfter = eventHandler.getPerpetualData(symbol);

    // await flushPromises();
    expect(perpDataAfter!.markPrice != perpDataBefore!.markPrice);
  });
});
