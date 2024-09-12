import { ethers, ZeroAddress } from "ethers";
import TraderInterface from "../src/traderInterface";
import MarketData from "../src/marketData";
import PerpetualDataHandler from "../src/perpetualDataHandler";
import { NodeSDKConfig, ExchangeInfo, Order, PerpetualState } from "../src/nodeSDKTypes";
import { pmFindMaxPersonalTradeSizeAtLeverage, pmExchangeFee } from "../src/d8XMath";
// npm link "@d8x/perpetuals-sdk"
jest.setTimeout(300000);

let marketData: MarketData;
let pk: string = <string>process.env.PK;
let RPC: string | undefined = <string>process.env.RPC;
let config;

describe("package tests", () => {
  beforeAll(async () => {
    const chainId = 421614;
    if (pk == undefined) {
      console.log(`Define private key: export PK="CA52A..."`);
      expect(false);
      return;
    }
    config = PerpetualDataHandler.readSDKConfig(chainId);
    if (RPC != undefined) {
      config.nodeURL = RPC;
    }
    marketData = new MarketData(config);
    await marketData.createProxyInstance();
  });

  it("Pred Mkts maxOrderSizeForTrader", async () => {
    //const traderAddr = "0x863AD9Ce46acF07fD9390147B619893461036194";
    const traderAddr = "0xdef43CF2Dd024abc5447C1Dcdc2fE3FE58547b84";
    const sym = "TRUMP24-USD-USDC";
    //let maxls = await marketData.getMaxShortLongPos(10007, traderAddr, )

    let personalMax = await marketData.maxOrderSizeForTrader(traderAddr, sym);
    console.log("personalMax = ", personalMax);
  });

  it("Reg Mkts  maxOrderSizeForTrader", async () => {
    //const traderAddr = "0x863AD9Ce46acF07fD9390147B619893461036194";
    const traderAddr = "0xdef43CF2Dd024abc5447C1Dcdc2fE3FE58547b84";
    const sym = "BTC-USDC-USDC";
    //let maxls = await marketData.getMaxShortLongPos(10007, traderAddr, )

    let personalMax = await marketData.maxOrderSizeForTrader(traderAddr, sym);
    console.log("personalMax = ", personalMax);
  });

  it("pmFindMaxPersonalTradeSizeAtLeverage", async () => {
    let marginCollateral = 20;
    let currentPosition = 1;
    let currentLockedInValue = currentPosition * 1.545;
    let markPrice = 1.54;
    let indexPriceS2 = 1.54;
    let indexPriceS3 = 0.95;
    let trade_lvg = 1.5;
    let wallet_bal_cc = 50;
    let slippage = 0.01;
    const maxLong = 300;
    const maxShort = 100;
    const dir = 1;
    let s = pmFindMaxPersonalTradeSizeAtLeverage(
      dir,
      trade_lvg,
      wallet_bal_cc,
      slippage,
      currentPosition,
      marginCollateral,
      currentLockedInValue,
      indexPriceS2,
      markPrice,
      indexPriceS3,
      maxLong
    );
    const expected = Math.floor(267.221800621 / 10) * 10;
    expect(s).toBeCloseTo(expected, 4);
  });
  it("exchange fee", async () => {
    //const prob = 1.3839300926543954 - 1;
    const prob = 1.4338 - 1;
    const m = 0.18;
    const tradeAmt = -8000;
    const lvgs = [1, 1.4, 2];
    for (let k = 0; k < lvgs.length; k++) {
      let f = pmExchangeFee(prob, m, tradeAmt, 1 / lvgs[k]);
      console.log(f);
    }
    console.log("done");
  });
  it("exchange fee 2", async () => {
    const mark = 1.4233;
    const tradeAmts = [1000, 2440, 6660];
    const traderPosBC = 1000;
    const lvgs = [1];
    for (let j = 0; j < tradeAmts.length; j++) {
      let tradeAmt = tradeAmts[j];
      for (let k = 0; k < lvgs.length; k++) {
        // @ts-ignore
        let f = MarketData.exchangeFeePrdMkts(0.18, mark, tradeAmt, traderPosBC, 1 / lvgs[k]);
        console.log(`lvg  = ${lvgs[k]}, tradeAmt=${tradeAmt} -> fee=${f}`);
      }
    }
  });
  it("pmFindMaxPersonalTradeSizeAtLeverage", async () => {
    const direction = -1;
    const leverage = 1;
    const walletBalCC = 925_022.48;
    const slippage = 0.02;
    const currentPosition = 0;
    const currentCashCC = 0;
    const currentLockedInValue = 0;
    const indexPrice = 1.519;
    const markPrice = 1.52;
    const collToQuoteIndexPrice = 0.99999;
    const maxTraderOrderSize = 4009;
    let personalMax = pmFindMaxPersonalTradeSizeAtLeverage(
      direction,
      leverage,
      walletBalCC,
      slippage,
      currentPosition,
      currentCashCC,
      currentLockedInValue,
      indexPrice,
      markPrice,
      collToQuoteIndexPrice,
      maxTraderOrderSize
    );
    console.log("personalMax = ", personalMax);
  });
  it("order digest", async () => {
    let pk: string = <string>process.env.PK;
    let config = PerpetualDataHandler.readSDKConfig("arbitrumSepolia");
    let apiInterface = new TraderInterface(config);
    await apiInterface.createProxyInstance();
    let wallet = new ethers.Wallet(pk);
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
    console.log(res);
    let fee = await apiInterface.queryExchangeFee("USDC", wallet.address, ZeroAddress);
    console.log("fee=", fee);
    let vol = await apiInterface.getCurrentTraderVolume("USDC", wallet.address);
    console.log("vol=", vol);
  });
});
