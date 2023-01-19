import {
  ExchangeInfo,
  NodeSDKConfig,
  MarginAccount,
  PoolState,
  PerpetualState,
  COLLATERAL_CURRENCY_BASE,
  COLLATERAL_CURRENCY_QUANTO,
  PERP_STATE_STR,
  ZERO_ADDRESS,
  PoolStaticInfo,
  BUY_SIDE,
  CLOSED_SIDE,
  SELL_SIDE,
  CollaterlCCY,
} from "./nodeSDKTypes";
import { BigNumber, BytesLike, ethers } from "ethers";
import {
  floatToABK64x64,
  ABK64x64ToFloat,
  getNewPositionLeverage,
  getMarginRequiredForLeveragedTrade,
  calculateLiquidationPriceCollateralBase,
  calculateLiquidationPriceCollateralQuanto,
  calculateLiquidationPriceCollateralQuote,
  getMaxSignedPositionSize,
} from "./d8XMath";
import { contractSymbolToSymbol, fromBytes4HexString, toBytes4 } from "./utils";
import PerpetualDataHandler from "./perpetualDataHandler";
import { SmartContractOrder, Order } from "./nodeSDKTypes";
import "./nodeSDKTypes";

/**
 * Functions to access market data (e.g., information on open orders, information on products that can be traded).
 * This class requires no private key and is blockchain read-only.
 * No gas required for the queries here.
 * @extends PerpetualDataHandler
 */
export default class MarketData extends PerpetualDataHandler {
  /**
   * Constructor
   * @param {NodeSDKConfig} config Configuration object, see
   * PerpetualDataHandler.readSDKConfig.
   * @example
   * import { MarketData, PerpetualDataHandler } from '@d8x/perpetuals-sdk';
   * async function main() {
   *   console.log(MarketData);
   *   // load configuration for testnet
   *   const config = PerpetualDataHandler.readSDKConfig("testnet");
   *   // MarketData (read only, no authentication needed)
   *   let mktData = new MarketData(config);
   *   // Create a proxy instance to access the blockchain
   *   await mktData.createProxyInstance();
   * }
   * main();
   *
   */
  public constructor(config: NodeSDKConfig) {
    super(config);
  }

  /**
   * Initialize the marketData-Class with this function
   * to create instance of D8X perpetual contract and gather information
   * about perpetual currencies
   * @param provider optional provider
   */
  public async createProxyInstance(provider?: ethers.providers.JsonRpcProvider) {
    if (provider == undefined) {
      this.provider = new ethers.providers.JsonRpcProvider(this.nodeURL);
    } else {
      this.provider = provider;
    }
    await this.initContractsAndData(this.provider);
  }

  /**
   * Convert the smart contract output of an order into a convenient format of type "Order"
   * @param smOrder SmartContractOrder, as obtained e.g., by PerpetualLimitOrderCreated event
   * @returns more convenient format of order, type "Order"
   */
  public smartContractOrderToOrder(smOrder: SmartContractOrder): Order {
    return PerpetualDataHandler.fromSmartContractOrder(smOrder, this.symbolToPerpStaticInfo);
  }

  /**
   * Get contract instance. Useful for event listening.
   * @example
   * import { MarketData, PerpetualDataHandler } from '@d8x/perpetuals-sdk';
   * async function main() {
   *   console.log(MarketData);
   *   // setup
   *   const config = PerpetualDataHandler.readSDKConfig("testnet");
   *   let mktData = new MarketData(config);
   *   await mktData.createProxyInstance();
   *   // Get contract instance
   *   let proxy = await mktData.getReadOnlyProxyInstance();
   *   console.log(proxy);
   * }
   * main();
   *
   * @returns read-only proxy instance
   */
  public getReadOnlyProxyInstance(): ethers.Contract {
    if (this.proxyContract == null) {
      throw Error("no proxy contract initialized. Use createProxyInstance().");
    }
    return this.proxyContract;
  }

  /**
   * Information about the products traded in the exchange.
   * @example
   * import { MarketData, PerpetualDataHandler } from '@d8x/perpetuals-sdk';
   * async function main() {
   *   console.log(MarketData);
   *   // setup
   *   const config = PerpetualDataHandler.readSDKConfig("testnet");
   *   let mktData = new MarketData(config);
   *   await mktData.createProxyInstance();
   *   // Get exchange info
   *   let info = await mktData.exchangeInfo();
   *   console.log(info);
   * }
   * main();
   *
   * @returns {ExchangeInfo} Array of static data for all the pools and perpetuals in the system.
   */
  public async exchangeInfo(): Promise<ExchangeInfo> {
    if (this.proxyContract == null) {
      throw Error("no proxy contract initialized. Use createProxyInstance().");
    }
    return await MarketData._exchangeInfo(this.proxyContract, this.poolStaticInfos, this.symbolList);
  }

  /**
   * All open orders for a trader-address and a symbol.
   * @param {string} traderAddr Address of the trader for which we get the open orders.
   * @param {string} symbol Symbol of the form ETH-USD-MATIC.
   * @example
   * import { MarketData, PerpetualDataHandler } from '@d8x/perpetuals-sdk';
   * async function main() {
   *   console.log(MarketData);
   *   // setup
   *   const config = PerpetualDataHandler.readSDKConfig("testnet");
   *   let mktData = new MarketData(config);
   *   await mktData.createProxyInstance();
   *   // Get all open orders for a trader/symbol
   *   let opOrder = await mktData.openOrders("0xAb5801a7D398351b8bE11C439e05C5B3259aeC9B",
   *       "ETH-USD-MATIC");
   *   console.log(opOrder);
   * }
   * main();
   *
   * @returns {Array<Array<Order>, Array<string>>} Array of open orders and corresponding order-ids.
   */
  public async openOrders(traderAddr: string, symbol: string): Promise<{ orders: Order[]; orderIds: string[] }> {
    // open orders requested only for given symbol
    let orderBookContract = this.getOrderBookContract(symbol);
    let [orders, digests] = await Promise.all([
      this.openOrdersOnOrderBook(traderAddr, orderBookContract),
      MarketData.orderIdsOfTrader(traderAddr, orderBookContract),
    ]);
    return { orders: orders, orderIds: digests };
  }

  /**
   * Information about the position open by a given trader in a given perpetual contract.
   * @param {string} traderAddr Address of the trader for which we get the position risk.
   * @param {string} symbol Symbol of the form ETH-USD-MATIC. Can also be the perpetual id as string
   * @example
   * import { MarketData, PerpetualDataHandler } from '@d8x/perpetuals-sdk';
   * async function main() {
   *   console.log(MarketData);
   *   // setup
   *   const config = PerpetualDataHandler.readSDKConfig("testnet");
   *   let mktData = new MarketData(config);
   *   await mktData.createProxyInstance();
   *   // Get position risk info
   *   let posRisk = await mktData.positionRisk("0xAb5801a7D398351b8bE11C439e05C5B3259aeC9B",
   *       "ETH-USD-MATIC");
   *   console.log(posRisk);
   * }
   * main();
   *
   * @returns {MarginAccount}
   */
  public async positionRisk(traderAddr: string, symbol: string): Promise<MarginAccount> {
    if (this.proxyContract == null) {
      throw Error("no proxy contract initialized. Use createProxyInstance().");
    }
    let mgnAcct = await PerpetualDataHandler.getMarginAccount(
      traderAddr,
      symbol,
      this.symbolToPerpStaticInfo,
      this.proxyContract
    );
    return mgnAcct;
  }

  public async positionRiskOnTrade(
    traderAddr: string,
    order: Order,
    perpetualState: PerpetualState,
    currentPositionRisk?: MarginAccount
  ): Promise<MarginAccount> {
    if (this.proxyContract == null) {
      throw Error("no proxy contract initialized. Use createProxyInstance().");
    }
    if (currentPositionRisk == undefined) {
      currentPositionRisk = await this.positionRisk(traderAddr, order.symbol);
    }
    let tradeAmount = order.quantity * (order.side == BUY_SIDE ? 1 : -1);
    let currentPosition = currentPositionRisk.positionNotionalBaseCCY;
    let newPosition = currentPositionRisk.positionNotionalBaseCCY + tradeAmount;
    let side = newPosition > 0 ? BUY_SIDE : newPosition < 0 ? SELL_SIDE : CLOSED_SIDE;
    let lockedInValue = currentPositionRisk.entryPrice * currentPosition;
    let poolId = PerpetualDataHandler._getPoolIdFromSymbol(order.symbol, this.poolStaticInfos);

    // total fee rate = exchange fee + broker fee
    let feeRate =
      (await this.proxyContract.queryExchangeFee(poolId, traderAddr, order.brokerAddr ?? ZERO_ADDRESS)) +
      (order.brokerFeeTbps ?? 0) / 100_000;

    // price for this order = limit price (conservative) if given, else the current perp price
    let tradePrice = order.limitPrice ?? (await this.getPerpetualPrice(order.symbol, tradeAmount));

    // need these for leverage/margin calculations
    let [markPrice, indexPriceS2, indexPriceS3] = [
      perpetualState.markPrice,
      perpetualState.indexPrice,
      perpetualState.collToQuoteIndexPrice,
    ];
    let newCollateral: number;
    let newLeverage: number;
    if (order.keepPositionLvg) {
      // we have a target leverage for the resulting position
      // this gives us the total margin needed in the account so that it satisfies the leverage condition
      newCollateral = getMarginRequiredForLeveragedTrade(
        currentPositionRisk.leverage,
        currentPosition,
        lockedInValue,
        tradeAmount,
        markPrice,
        indexPriceS2,
        indexPriceS3,
        tradePrice,
        feeRate
      );
      // the new leverage follows from the updated margin and position
      newLeverage = getNewPositionLeverage(
        tradeAmount,
        newCollateral,
        currentPosition,
        lockedInValue,
        indexPriceS2,
        indexPriceS3,
        markPrice,
        tradePrice,
        feeRate
      );
    } else {
      // the order has its own leverage and margin requirements
      let tradeCollateral = getMarginRequiredForLeveragedTrade(
        order.leverage,
        0,
        0,
        tradeAmount,
        markPrice,
        indexPriceS2,
        indexPriceS3,
        tradePrice,
        feeRate
      );
      newCollateral = currentPositionRisk.collateralCC + tradeCollateral;
      // the new leverage corresponds to increasing the position and collateral according to the order
      newLeverage = getNewPositionLeverage(
        tradeAmount,
        newCollateral,
        currentPosition,
        lockedInValue,
        indexPriceS2,
        indexPriceS3,
        markPrice,
        tradePrice,
        feeRate
      );
    }
    let newLockedInValue = lockedInValue + tradeAmount * tradePrice;

    // liquidation vars
    let S2Liq: number, S3Liq: number | undefined;
    let tau = this.symbolToPerpStaticInfo.get(order.symbol)!.maintenanceMarginRate;
    let ccyType = this.symbolToPerpStaticInfo.get(order.symbol)!.collateralCurrencyType;
    if (ccyType == CollaterlCCY.BASE) {
      S2Liq = calculateLiquidationPriceCollateralBase(newLockedInValue, newPosition, newCollateral, tau);
      S3Liq = S2Liq;
    } else if (ccyType == CollaterlCCY.QUANTO) {
      S3Liq = indexPriceS3;
      S2Liq = calculateLiquidationPriceCollateralQuanto(
        newLockedInValue,
        newPosition,
        newCollateral,
        tau,
        indexPriceS3,
        markPrice
      );
    } else {
      S2Liq = calculateLiquidationPriceCollateralQuote(newLockedInValue, newPosition, newCollateral, tau);
    }
    let newPositionRisk: MarginAccount = {
      symbol: currentPositionRisk.symbol,
      positionNotionalBaseCCY: newPosition,
      side: side,
      entryPrice: Math.abs(newLockedInValue / newPosition),
      leverage: newLeverage,
      markPrice: markPrice,
      unrealizedPnlQuoteCCY: tradeAmount * (markPrice - tradePrice),
      unrealizedFundingCollateralCCY: currentPositionRisk.unrealizedFundingCollateralCCY,
      collateralCC: newCollateral,
      collToQuoteConversion: indexPriceS3,
      liquidationPrice: [S2Liq, S3Liq],
      liquidationLvg: 1 / tau,
    };
    return newPositionRisk;
  }

  public maxOrderSizeForTrader(side: string, positionRisk: MarginAccount, perpetualState: PerpetualState): number {
    let initialMarginRate = this.symbolToPerpStaticInfo.get(positionRisk.symbol)!.initialMarginRate;
    // fees not considered here
    let maxPosition = getMaxSignedPositionSize(
      positionRisk.collateralCC,
      positionRisk.positionNotionalBaseCCY,
      positionRisk.entryPrice * positionRisk.positionNotionalBaseCCY,
      side == BUY_SIDE ? 1 : -1,
      perpetualState.markPrice,
      initialMarginRate,
      0,
      perpetualState.markPrice,
      perpetualState.indexPrice,
      perpetualState.collToQuoteIndexPrice
    );
    return maxPosition - positionRisk.positionNotionalBaseCCY;
  }

  /**
   * Uses the Oracle(s) in the exchange to get the latest price of a given index in a given currency, if a route exists.
   * @param {string} base Index name, e.g. ETH.
   * @param {string} quote Quote currency, e.g. USD.
   * @example
   * import { MarketData, PerpetualDataHandler } from '@d8x/perpetuals-sdk';
   * async function main() {
   *   console.log(MarketData);
   *   // setup
   *   const config = PerpetualDataHandler.readSDKConfig("testnet");
   *   let mktData = new MarketData(config);
   *   await mktData.createProxyInstance();
   *   // get oracle price
   *   let price = await mktData.getOraclePrice("ETH", "USD");
   *   console.log(price);
   * }
   * main();
   *
   * @returns {number} Price of index in given currency.
   */
  public async getOraclePrice(base: string, quote: string): Promise<number | undefined> {
    if (this.proxyContract == null) {
      throw Error("no proxy contract initialized. Use createProxyInstance().");
    }
    let px = await this.proxyContract.getOraclePrice([toBytes4(base), toBytes4(quote)]);
    return px == undefined ? undefined : ABK64x64ToFloat(px);
  }

  /**
   * Get the current mark price
   * @param symbol symbol of the form ETH-USD-MATIC
   * @example
   * import { MarketData, PerpetualDataHandler } from '@d8x/perpetuals-sdk';
   * async function main() {
   *   console.log(MarketData);
   *   // setup
   *   const config = PerpetualDataHandler.readSDKConfig("testnet");
   *   let mktData = new MarketData(config);
   *   await mktData.createProxyInstance();
   *   // get mark price
   *   let price = await mktData.getMarkPrice("ETH-USD-MATIC");
   *   console.log(price);
   * }
   * main();
   *
   * @returns mark price
   */
  public async getMarkPrice(symbol: string): Promise<number> {
    if (this.proxyContract == null) {
      throw Error("no proxy contract initialized. Use createProxyInstance().");
    }
    return await PerpetualDataHandler._queryPerpetualMarkPrice(symbol, this.symbolToPerpStaticInfo, this.proxyContract);
  }

  /**
   * get the current price for a given quantity
   * @param symbol symbol of the form ETH-USD-MATIC
   * @param quantity quantity to be traded, negative if short
   * @example
   * import { MarketData, PerpetualDataHandler } from '@d8x/perpetuals-sdk';
   * async function main() {
   *   console.log(MarketData);
   *   // setup
   *   const config = PerpetualDataHandler.readSDKConfig("testnet");
   *   let mktData = new MarketData(config);
   *   await mktData.createProxyInstance();
   *   // get perpetual price
   *   let price = await mktData.getPerpetualPrice("ETH-USD-MATIC", 1);
   *   console.log(price);
   * }
   * main();
   *
   * @returns price (number)
   */
  public async getPerpetualPrice(symbol: string, quantity: number): Promise<number> {
    if (this.proxyContract == null) {
      throw Error("no proxy contract initialized. Use createProxyInstance().");
    }
    return await PerpetualDataHandler._queryPerpetualPrice(
      symbol,
      quantity,
      this.symbolToPerpStaticInfo,
      this.proxyContract
    );
  }

  /**
   * get the current mid-price for a perpetual
   * @param symbol symbol of the form ETH-USD-MATIC
   * @example
   * import { MarketData, PerpetualDataHandler } from '@d8x/perpetuals-sdk';
   * async function main() {
   *   console.log(MarketData);
   *   // setup
   *   const config = PerpetualDataHandler.readSDKConfig("testnet");
   *   let mktData = new MarketData(config);
   *   await mktData.createProxyInstance();
   *   // get perpetual mid price
   *   let midPrice = await mktData.getPerpetualMidPrice("ETH-USD-MATIC");
   *   console.log(midPrice);
   * }
   * main();
   *
   * @returns {number} price
   */
  public async getPerpetualMidPrice(symbol: string): Promise<number> {
    if (this.proxyContract == null) {
      throw Error("no proxy contract initialized. Use createProxyInstance().");
    }
    return await this.getPerpetualPrice(symbol, 0);
  }

  /**
   * Query smart contract to get user orders and convert to user friendly order format.
   * @param {string} traderAddr Address of trader.
   * @param {ethers.Contract} orderBookContract Instance of order book.
   * @returns {Order[]} Array of user friendly order struct.
   * @ignore
   */
  protected async openOrdersOnOrderBook(traderAddr: string, orderBookContract: ethers.Contract): Promise<Order[]> {
    let orders: SmartContractOrder[] = await orderBookContract.getOrders(traderAddr, 0, 15);
    //eliminate empty orders and map to user friendly orders
    let userFriendlyOrders: Order[] = new Array<Order>();
    let k = 0;
    while (k < orders.length && orders[k].traderAddr != ZERO_ADDRESS) {
      userFriendlyOrders.push(PerpetualDataHandler.fromSmartContractOrder(orders[k], this.symbolToPerpStaticInfo));
      k++;
    }
    return userFriendlyOrders;
  }

  /**
   *
   * @param traderAddr Address of the trader
   * @param orderBookContract Instance of order book contract
   * @returns Array of order-id's
   * @ignore
   */
  public static async orderIdsOfTrader(traderAddr: string, orderBookContract: ethers.Contract): Promise<string[]> {
    let digestsRaw: string[] = await orderBookContract.limitDigestsOfTrader(traderAddr, 0, 15);
    let k: number = 0;
    let digests: string[] = [];
    while (k < digestsRaw.length && BigNumber.from(digestsRaw[k]).gt(0)) {
      digests.push(digestsRaw[k]);
      k++;
    }
    return digests;
  }

  public static async _exchangeInfo(
    _proxyContract: ethers.Contract,
    _poolStaticInfos: Array<PoolStaticInfo>,
    _symbolList: Array<{ [key: string]: string }>
  ): Promise<ExchangeInfo> {
    let nestedPerpetualIDs = await PerpetualDataHandler.getNestedPerpetualIds(_proxyContract);
    let factory = await _proxyContract.getOracleFactory();
    let info: ExchangeInfo = { pools: [], oracleFactoryAddr: factory };
    const numPools = nestedPerpetualIDs.length;
    for (var j = 0; j < numPools; j++) {
      let perpetualIDs = nestedPerpetualIDs[j];
      let pool = await _proxyContract.getLiquidityPool(j + 1);
      let PoolState: PoolState = {
        isRunning: pool.isRunning,
        poolSymbol: _poolStaticInfos[j].poolMarginSymbol,
        marginTokenAddr: pool.marginTokenAddress,
        poolShareTokenAddr: pool.shareTokenAddress,
        defaultFundCashCC: ABK64x64ToFloat(pool.fDefaultFundCashCC),
        pnlParticipantCashCC: ABK64x64ToFloat(pool.fPnLparticipantsCashCC),
        totalAMMFundCashCC: ABK64x64ToFloat(pool.fAMMFundCashCC),
        totalTargetAMMFundSizeCC: ABK64x64ToFloat(pool.fTargetAMMFundSize),
        brokerCollateralLotSize: ABK64x64ToFloat(pool.fBrokerCollateralLotSize),
        perpetuals: [],
      };
      for (var k = 0; k < perpetualIDs.length; k++) {
        let perp = await _proxyContract.getPerpetual(perpetualIDs[k]);
        let fIndexS2 = await _proxyContract.getOraclePrice([perp.S2BaseCCY, perp.S2QuoteCCY]);
        let fMidPrice = await _proxyContract.queryPerpetualPrice(perpetualIDs[k], BigNumber.from(0));
        let indexS2 = ABK64x64ToFloat(fIndexS2);
        let indexS3 = 1;
        if (perp.eCollateralCurrency == COLLATERAL_CURRENCY_BASE) {
          indexS3 = indexS2;
        } else if (perp.eCollateralCurrency == COLLATERAL_CURRENCY_QUANTO) {
          indexS3 = ABK64x64ToFloat(await _proxyContract.getOraclePrice([perp.S3BaseCCY, perp.S3QuoteCCY]));
        }
        let markPremiumRate = ABK64x64ToFloat(perp.currentMarkPremiumRate.fPrice);
        let currentFundingRateBps = 1e4 * ABK64x64ToFloat(perp.fCurrentFundingRate);
        let state = PERP_STATE_STR[perp.state];
        let PerpetualState: PerpetualState = {
          id: perp.id,
          state: state,
          baseCurrency: contractSymbolToSymbol(perp.S2BaseCCY, _symbolList)!,
          quoteCurrency: contractSymbolToSymbol(perp.S2QuoteCCY, _symbolList)!,
          indexPrice: indexS2,
          collToQuoteIndexPrice: indexS3,
          markPrice: indexS2 * (1 + markPremiumRate),
          midPrice: ABK64x64ToFloat(fMidPrice),
          currentFundingRateBps: currentFundingRateBps,
          openInterestBC: ABK64x64ToFloat(perp.fOpenInterest),
          maxPositionBC: ABK64x64ToFloat(perp.fMaxPositionBC),
        };
        PoolState.perpetuals.push(PerpetualState);
      }
      info.pools.push(PoolState);
    }
    return info;
  }
}
