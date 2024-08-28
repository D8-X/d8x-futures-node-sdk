import { ethers, ZeroAddress } from "ethers";
import TraderInterface from "../src/traderInterface";
import PerpetualDataHandler from "../src/perpetualDataHandler";
import { NodeSDKConfig, ExchangeInfo, Order } from "../src/nodeSDKTypes";
import { pmFindMaxPersonalTradeSizeAtLeverage, pmExchangeFee } from "../src/d8XMath";
// npm link "@d8x/perpetuals-sdk"
jest.setTimeout(300000);
describe("Front-end-like functionality", () => {
  beforeAll(async () => {});
  it("pmFindMaxPersonalTradeSizeAtLeverage", async () => {
    let marginCollateral = 20;
    let currentPosition = 1;
    let currentLockedInValue = currentPosition * 1.545;
    let markPrice = 1.54;
    let indexPriceS2 = 1.54;
    let indexPriceS3 = 0.95;
    let tot_long = 200;
    let tot_short = 600;
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
      tot_long,
      tot_short,
      maxShort,
      maxLong
    );
    const expected = Math.floor(267.221800621 / 10) * 10;
    expect(s).toBeCloseTo(expected, 4);
  });
  it("order digest", async () => {
    const prob = 1.3839300926543954 - 1;
    const m = 0.18;
    const totShort = 200;
    const totLong = 0;
    const tradeAmt = 200;
    const lvgs = [1, 1.4, 2];
    for (let k = 0; k < lvgs.length; k++) {
      let f = pmExchangeFee(prob, m, totShort, totLong, tradeAmt, 1 / lvgs[k]);
      console.log(f);
    }
    console.log("done");
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
