import { BigNumber, ethers } from "ethers";
import { sys } from "typescript";
import AccountTrade from "../src/accountTrade";
import MarketData from "../src/marketData";
import { NodeSDKConfig, Order, OrderResponse, SmartContractOrder } from "../src/nodeSDKTypes";
import PerpetualDataHandler from "../src/perpetualDataHandler";
import PerpetualEventHandler from "../src/perpetualEventHandler";

let pk: string = <string>process.env.PK;
let RPC: string = <string>process.env.RPC;

jest.setTimeout(150000);

let config: NodeSDKConfig;
let mktData: MarketData;
let orderIds: string[];
let wallet: ethers.Wallet;
let eventHandler: PerpetualEventHandler;
let proxyContract: ethers.Contract;
let accTrade: AccountTrade;

describe("Front-end-like functionality", () => {
  beforeAll(async () => {
    config = PerpetualDataHandler.readSDKConfig("../config/defaultConfig.json");
    if (RPC != undefined) {
      config.nodeURL = RPC;
    }
    if (pk == undefined) {
      console.log(`Define private key: export PK="CA52A..."`);
      expect(true).toBeFalsy;
    }
    // FE mkt data instance
    mktData = new MarketData(config);
    await mktData.createProxyInstance();
    // Trader's wallet
    accTrade = new AccountTrade(config, pk);
    await accTrade.createProxyInstance();
    // Event handler for FE
    eventHandler = new PerpetualEventHandler(mktData, accTrade.getAddress());
    await eventHandler.initialize();
    // contracts that we will be listening to
    proxyContract = mktData.getReadOnlyProxyInstance();
    // TODO: add LOBs
  });

  it("reacts on trade", async () => {
    expect.assertions(2);

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
        if (trader != accTrade.getAddress()) {
          console.log("Trade caught, not this trader");
          return;
        }
        let tradeEvent = eventHandler.onTrade(
          perpetualId,
          trader,
          positionId,
          order,
          orderDigest,
          newPositionSizeBC,
          price
        );
        expect(tradeEvent.perpetualId == perpetualId);
      }
    );

    let order: Order = {
      symbol: "MATIC-USD-MATIC",
      side: "BUY",
      type: "MARKET",
      quantity: 200,
      leverage: 10,
      timestamp: Date.now() / 1000,
    };

    let resp: OrderResponse;
    try {
      // open
      resp = await accTrade.order(order);
      console.log("open trade transaction hash =", resp.tx.hash);
      console.log("open orderId =", resp.orderId);

      // close
      order.side = "SELL";
      resp = await accTrade.order(order);
      console.log("close trade transaction hash =", resp.tx.hash);
      console.log("close orderId =", resp.orderId);
    } catch (err) {
      console.log("Error=", err);
    }
  });
});
