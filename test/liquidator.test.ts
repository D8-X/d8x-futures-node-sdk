import LiquidatorTool from "../src/liquidatorTool";
import fetchPricesForPerpetual from "../src/marketData";
import { NodeSDKConfig } from "../src/nodeSDKTypes";
import PerpetualDataHandler from "../src/perpetualDataHandler";
import { pmExcessBalance } from "../src/d8XMath";
import MarketData from "../src/marketData";
import { SELL_SIDE } from "../src/constants";
let pk: string = <string>process.env.PK;
let RPC: string | undefined = <string>process.env.RPC;

jest.setTimeout(150000);

let liquidator: LiquidatorTool;
let marketData: MarketData;
let config: NodeSDKConfig;

describe("liquidation functionality", () => {
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
    liquidator = new LiquidatorTool(config, pk);
    marketData = new MarketData(config);
    await liquidator.createProxyInstance();
    await marketData.createProxyInstance();
  });
  it("liquidatable accounts", async () => {
    //const sym = "BTLJ-USD-USDC";
    const sym = "TRUMP24-USD-USDC";
    let addr = await liquidator.getAllActiveAccounts(sym);
    let indexPrices = await marketData.fetchPricesForPerpetual(sym);
    for (let k = 0; k < addr.length; k++) {
      let traderState = await liquidator.getMarginAccount(addr[k], sym, indexPrices);
      let pos = traderState.positionNotionalBaseCCY;
      if (traderState.side == SELL_SIDE) {
        pos = -pos;
      }
      const markPrice = traderState.markPrice;
      const prem = markPrice - indexPrices.s2;
      console.log("premium=", prem);
      const ex = pmExcessBalance(
        pos,
        markPrice,
        indexPrices.s3!,
        traderState.entryPrice * pos,
        traderState.collateralCC + traderState.unrealizedFundingCollateralCCY,
        0.18
      );
      const isSafe1 = ex > 0;
      const isSafe2 = await liquidator.isMaintenanceMarginSafe(sym, addr[k], [indexPrices.ema, indexPrices.s3!]);
      console.log(isSafe1);
      console.log(isSafe2);
    }
  });
});
