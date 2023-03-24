import { BigNumber, ethers } from "ethers";
import {
  ABK64x64ToFloat,
  calculateLiquidationPriceCollateralBase,
  calculateLiquidationPriceCollateralQuanto,
  calculateLiquidationPriceCollateralQuote,
  floatToABK64x64,
  getDepositAmountForLvgTrade,
  getMarginRequiredForLeveragedTrade,
  getMaxSignedPositionSize,
  getNewPositionLeverage,
} from "./d8XMath";
import "./nodeSDKTypes";
import {
  BUY_SIDE,
  CLOSED_SIDE,
  COLLATERAL_CURRENCY_BASE,
  COLLATERAL_CURRENCY_QUANTO,
  COLLATERAL_CURRENCY_QUOTE,
  CollaterlCCY,
  ERC20_ABI,
  ExchangeInfo,
  MarginAccount,
  NodeSDKConfig,
  Order,
  PerpetualState,
  PerpetualStaticInfo,
  PERP_STATE_STR,
  PoolState,
  PoolStaticInfo,
  SELL_SIDE,
  SmartContractOrder,
  ZERO_ADDRESS,
} from "./nodeSDKTypes";
import PerpetualDataHandler from "./perpetualDataHandler";
import PriceFeeds from "./priceFeeds";
import { contractSymbolToSymbol, toBytes4 } from "./utils";

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
   * Get the proxy address
   * @returns Address of the perpetual proxy contract
   */
  public getProxyAddress(): string {
    if (this.proxyContract == null) {
      throw Error("no proxy contract initialized. Use createProxyInstance().");
    }
    return this.proxyContract.address;
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
    return await MarketData._exchangeInfo(
      this.proxyContract,
      this.poolStaticInfos,
      this.symbolToPerpStaticInfo,
      this.symbolList,
      this.priceFeedGetter
    );
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
   * @returns {MarginAccount} Position risk of trader.
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

  /**
   * Estimates what the position risk will be if a given order is executed.
   * @param traderAddr Address of trader
   * @param order Order to be submitted
   * @param currentPositionRisk Position risk before trade
   * @returns {MarginAccount} Position risk after trade
   */
  public async positionRiskOnTrade(
    traderAddr: string,
    order: Order,
    currentPositionRisk?: MarginAccount,
    indexPriceInfo?: [number, number, boolean, boolean]
  ): Promise<MarginAccount> {
    if (this.proxyContract == null) {
      throw Error("no proxy contract initialized. Use createProxyInstance().");
    }
    if (currentPositionRisk == undefined) {
      currentPositionRisk = await this.positionRisk(traderAddr, order.symbol);
    }
    if (indexPriceInfo == undefined) {
      let obj = await this.priceFeedGetter.fetchPricesForPerpetual(currentPositionRisk.symbol);
      indexPriceInfo = [obj.idxPrices[0], obj.idxPrices[1], obj.mktClosed[0], obj.mktClosed[1]];
    }
    let poolId = PerpetualDataHandler._getPoolIdFromSymbol(order.symbol, this.poolStaticInfos);
    // price for this order = limit price (conservative) if given, else the current perp price
    let tradeAmount = Math.abs(order.quantity) * (order.side == BUY_SIDE ? 1 : -1);
    let tradePrice = order.limitPrice ?? (await this.getPerpetualPrice(order.symbol, tradeAmount));
    // total fee rate = exchange fee + broker fee
    let feeRate =
      ((await this.proxyContract.queryExchangeFee(poolId, traderAddr, order.brokerAddr ?? ZERO_ADDRESS)) +
        (order.brokerFeeTbps ?? 0)) /
      100_000;
    let perpetualState = await this.getPerpetualState(order.symbol, indexPriceInfo);

    return MarketData._positionRiskOnAccountAction(
      order.symbol,
      tradeAmount,
      0,
      order.leverage,
      order.keepPositionLvg,
      tradePrice,
      feeRate,
      perpetualState,
      currentPositionRisk,
      this.symbolToPerpStaticInfo
    );
  }

  /**
   * Estimates what the position risk will be if given amount of collateral is added/removed from the account.
   * @param traderAddr Address of trader
   * @param deltaCollateral Amount of collateral to add or remove (signed)
   * @param currentPositionRisk Position risk before
   * @returns {MarginAccount} Position risk after
   */
  public async positionRiskOnCollateralAction(
    deltaCollateral: number,
    currentPositionRisk: MarginAccount,
    indexPriceInfo?: [number, number, boolean, boolean]
  ): Promise<MarginAccount> {
    if (this.proxyContract == null) {
      throw Error("no proxy contract initialized. Use createProxyInstance().");
    }
    if (indexPriceInfo == undefined) {
      let obj = await this.priceFeedGetter.fetchPricesForPerpetual(currentPositionRisk.symbol);
      indexPriceInfo = [obj.idxPrices[0], obj.idxPrices[1], obj.mktClosed[0], obj.mktClosed[1]];
    }
    let perpetualState = await this.getPerpetualState(currentPositionRisk.symbol, indexPriceInfo);

    return MarketData._positionRiskOnAccountAction(
      currentPositionRisk.symbol,
      0,
      deltaCollateral,
      undefined,
      false,
      0,
      0,
      perpetualState,
      currentPositionRisk,
      this.symbolToPerpStaticInfo
    );
  }

  protected static _positionRiskOnAccountAction(
    symbol: string,
    tradeAmount: number,
    marginDeposit: number,
    tradeLeverage: number | undefined,
    keepPositionLvg: boolean | undefined,
    tradePrice: number,
    feeRate: number,
    perpetualState: PerpetualState,
    currentPositionRisk: MarginAccount,
    symbolToPerpStaticInfo: Map<string, PerpetualStaticInfo>
  ): MarginAccount {
    let currentSide = currentPositionRisk.side;
    let currentPosition = (currentSide == BUY_SIDE ? 1 : -1) * currentPositionRisk.positionNotionalBaseCCY;
    let newPosition = currentPosition + tradeAmount;
    let newSide = newPosition > 0 ? BUY_SIDE : newPosition < 0 ? SELL_SIDE : CLOSED_SIDE;
    let lockedInValue = currentPositionRisk.entryPrice * currentPosition;
    let newLockedInValue = lockedInValue + tradeAmount * tradePrice;
    let newEntryPrice = newPosition == 0 ? 0 : Math.abs(newLockedInValue / newPosition);
    if (tradeAmount == 0) {
      keepPositionLvg = false;
    }
    let isOpen = newPosition != 0 && (tradeAmount == 0 || currentPosition == 0 || tradeAmount * currentPosition > 0);
    let isFlip = Math.abs(tradeAmount) > Math.abs(currentPosition) && !isOpen;
    let keepPositionLvgOnClose = keepPositionLvg && !isOpen;
    // need these for leverage/margin calculations
    let [markPrice, indexPriceS2, indexPriceS3] = [
      perpetualState.markPrice,
      perpetualState.indexPrice,
      perpetualState.collToQuoteIndexPrice,
    ];
    let newCollateral: number;
    let newLeverage: number;
    if (keepPositionLvg) {
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
        tradePrice,
        indexPriceS3,
        markPrice
      );
    } else if (tradeAmount != 0) {
      let deltaCash: number;
      if (!isOpen && !isFlip && !keepPositionLvgOnClose) {
        // cash comes from realized pnl
        deltaCash = (tradeAmount * (tradePrice - currentPositionRisk.entryPrice)) / indexPriceS3;
        newLockedInValue = lockedInValue + currentPositionRisk.entryPrice * tradeAmount;
      } else {
        // target lvg will default current lvg if not specified
        let targetLvg = isFlip || isOpen ? tradeLeverage ?? 0 : 0;
        let b0, pos0;
        [b0, pos0] = isOpen ? [0, 0] : [currentPositionRisk.collateralCC, currentPosition];
        // cash comes from trader wallet
        deltaCash = getDepositAmountForLvgTrade(b0, pos0, tradeAmount, targetLvg, tradePrice, indexPriceS3, markPrice);
        // premium/instantaneous pnl
        // deltaCash -= (tradeAmount * (tradePrice - indexPriceS2)) / indexPriceS3;
        newLockedInValue = lockedInValue + tradeAmount * tradePrice;
      }
      newCollateral = currentPositionRisk.collateralCC + deltaCash; // - (feeRate * Math.abs(tradeAmount) * indexPriceS2) / indexPriceS3;
      // the new leverage corresponds to increasing the position and collateral according to the order
      newLeverage = getNewPositionLeverage(
        0,
        newCollateral,
        newPosition,
        newLockedInValue,
        tradePrice,
        indexPriceS3,
        markPrice
      );
    } else {
      // there is no order, adding/removing collateral
      newCollateral = currentPositionRisk.collateralCC + marginDeposit;
      newLeverage = getNewPositionLeverage(
        0,
        newCollateral,
        currentPosition,
        lockedInValue,
        indexPriceS2,
        indexPriceS3,
        markPrice
      );
    }

    // liquidation vars
    let S2Liq: number, S3Liq: number | undefined;
    let tau = symbolToPerpStaticInfo.get(symbol)!.maintenanceMarginRate;
    let ccyType = symbolToPerpStaticInfo.get(symbol)!.collateralCurrencyType;
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
      positionNotionalBaseCCY: Math.abs(newPosition),
      side: newSide,
      entryPrice: newEntryPrice,
      leverage: newLeverage,
      markPrice: markPrice,
      unrealizedPnlQuoteCCY: newPosition * markPrice - newLockedInValue,
      unrealizedFundingCollateralCCY: currentPositionRisk.unrealizedFundingCollateralCCY,
      collateralCC: newCollateral,
      collToQuoteConversion: indexPriceS3,
      liquidationPrice: [S2Liq, S3Liq],
      liquidationLvg: 1 / tau,
    };
    return newPositionRisk;
  }

  /**
   * Gets the wallet balance in the collateral currency corresponding to a given perpetual symbol.
   * @param address Address to check
   * @param symbol Symbol of the form ETH-USD-MATIC.
   * @returns Balance
   */
  public async getWalletBalance(address: string, symbol: string): Promise<number> {
    let poolIdx = this.getPoolIndexFromSymbol(symbol);
    let marginTokenAddr = this.poolStaticInfos[poolIdx].poolMarginTokenAddr;
    let token = new ethers.Contract(marginTokenAddr, ERC20_ABI, this.provider!);
    let walletBalanceDec18 = await token.balanceOf(address);
    return walletBalanceDec18 / 10 ** 18;
  }

  /**
   * Gets the maximal order size considering the existing position, state of the perpetual, and optionally any additional collateral to be posted.
   * @param side BUY or SELL
   * @param positionRisk Current position risk (as seen in positionRisk)
   * @param perpetualState Current perpetual state (as seen in exchangeInfo)
   * @param walletBalance Optional wallet balance to consider in the calculation
   * @returns Maximal trade size, not signed
   */
  public async maxOrderSizeForTrader(
    side: string,
    positionRisk: MarginAccount,
    perpetualState: PerpetualState,
    walletBalance?: number
  ): Promise<number> {
    if (walletBalance != undefined) {
      positionRisk = await this.positionRiskOnCollateralAction(walletBalance, positionRisk);
    }
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
    let curPosition = side == BUY_SIDE ? positionRisk.positionNotionalBaseCCY : -positionRisk.positionNotionalBaseCCY;
    let tradeAmount = maxPosition - curPosition;
    let perpId = this.getPerpIdFromSymbol(positionRisk.symbol);
    let perpMaxPositionABK = await this.proxyContract!.getMaxSignedTradeSizeForPos(
      perpId,
      floatToABK64x64(curPosition),
      floatToABK64x64(tradeAmount)
    );
    return ABK64x64ToFloat(perpMaxPositionABK.abs());
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

  public async getOrderStatus(symbol: string, orderId: string): Promise<string> {
    if (this.proxyContract == null) {
      throw Error("no proxy contract initialized. Use createProxyInstance().");
    }
    let orderBookContract: ethers.Contract | null = null;
    orderBookContract = this.getOrderBookContract(symbol);
    let status = await orderBookContract.getOrderStatus(orderId);
    return status;
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
  public async getMarkPrice(symbol: string, indexPrices?: [number, number]): Promise<number> {
    if (this.proxyContract == null) {
      throw Error("no proxy contract initialized. Use createProxyInstance().");
    }
    if (indexPrices == undefined) {
      let obj = await this.priceFeedGetter.fetchPricesForPerpetual(symbol);
      indexPrices = [obj.idxPrices[0], obj.idxPrices[1]];
    }
    return await PerpetualDataHandler._queryPerpetualMarkPrice(
      symbol,
      this.symbolToPerpStaticInfo,
      this.proxyContract,
      indexPrices
    );
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
  public async getPerpetualPrice(symbol: string, quantity: number, indexPrices?: [number, number]): Promise<number> {
    if (this.proxyContract == null) {
      throw Error("no proxy contract initialized. Use createProxyInstance().");
    }
    if (indexPrices == undefined) {
      // fetch from API
      let obj = await this.priceFeedGetter.fetchPricesForPerpetual(symbol);
      indexPrices = [obj.idxPrices[0], obj.idxPrices[1]];
    }
    return await PerpetualDataHandler._queryPerpetualPrice(
      symbol,
      quantity,
      this.symbolToPerpStaticInfo,
      this.proxyContract,
      indexPrices
    );
  }

  /**
   * Query recent perpetual state from blockchain
   * @param symbol symbol of the form ETH-USD-MATIC
   * @param indexPrices S2 and S3 prices/isMarketOpen if not provided fetch via REST API
   * @returns PerpetualState reference
   */
  public async getPerpetualState(
    symbol: string,
    indexPriceInfo?: [number, number, boolean, boolean]
  ): Promise<PerpetualState> {
    if (this.proxyContract == null) {
      throw Error("no proxy contract initialized. Use createProxyInstance().");
    }
    if (indexPriceInfo == undefined) {
      let obj = await this.priceFeedGetter.fetchPricesForPerpetual(symbol);
      indexPriceInfo = [obj.idxPrices[0], obj.idxPrices[1], obj.mktClosed[0], obj.mktClosed[1]];
    }
    let state: PerpetualState = await PerpetualDataHandler._queryPerpetualState(
      symbol,
      this.symbolToPerpStaticInfo,
      this.proxyContract,
      indexPriceInfo
    );
    return state;
  }

  /**
   * Query perpetual static info.
   * This information is queried once at createProxyInstance-time and remains static after that.
   * @param symbol symbol of the form ETH-USD-MATIC
   * @returns PerpetualStaticInfo copy.
   */
  public getPerpetualStaticInfo(symbol: string): PerpetualStaticInfo {
    let perpInfo = this.symbolToPerpStaticInfo.get(symbol);
    if (perpInfo == undefined) {
      throw Error(`Perpetual with symbol ${symbol} not found. Check symbol or use createProxyInstance().`);
    }
    // return new copy, not a reference
    let res: PerpetualStaticInfo = {
      id: perpInfo.id,
      limitOrderBookAddr: perpInfo.limitOrderBookAddr,
      initialMarginRate: perpInfo.initialMarginRate,
      maintenanceMarginRate: perpInfo.maintenanceMarginRate,
      collateralCurrencyType: perpInfo.collateralCurrencyType,
      S2Symbol: perpInfo.S2Symbol,
      S3Symbol: perpInfo.S3Symbol,
      lotSizeBC: perpInfo.lotSizeBC,
      priceIds: perpInfo.priceIds,
    };
    return res;
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

  public async getAvailableMargin(traderAddr: string, symbol: string, indexPrices?: [number, number]): Promise<number> {
    if (this.proxyContract == null) {
      throw Error("no proxy contract initialized. Use createProxyInstance().");
    }
    let mgnAcct = await PerpetualDataHandler.getMarginAccount(
      traderAddr,
      symbol,
      this.symbolToPerpStaticInfo,
      this.proxyContract
    );
    if (indexPrices == undefined) {
      // fetch from API
      let obj = await this.priceFeedGetter.fetchPricesForPerpetual(symbol);
      indexPrices = [obj.idxPrices[0], obj.idxPrices[1]];
    }
    let S2 = indexPrices[0];
    let ccyType = this.getPerpetualStaticInfo(symbol).collateralCurrencyType;
    let S3 = ccyType == COLLATERAL_CURRENCY_QUANTO ? indexPrices[1] : ccyType == COLLATERAL_CURRENCY_QUOTE ? 1 : S2;
    let perpInfo = this.symbolToPerpStaticInfo.get(symbol);
    let balanceCC = mgnAcct.collateralCC + mgnAcct.unrealizedPnlQuoteCCY / S3;
    let initalMarginCC = Math.abs(
      (perpInfo!.initialMarginRate * mgnAcct.positionNotionalBaseCCY * mgnAcct.markPrice) /
        mgnAcct.collToQuoteConversion
    );
    return balanceCC - initalMarginCC;
  }

  /**
   * Calculate a type of exchange loyality score based on trader volume
   * @param traderAddr address of the trader
   * @param brokerAddr address of the trader's broker or undefined
   * @returns a loyality score (4 worst, 1 best)
   */
  public async getTraderLoyalityScore(traderAddr: string, brokerAddr?: string) : Promise<number> {
    if (this.proxyContract == null) {
      throw Error("no proxy contract or wallet initialized. Use createProxyInstance().");
    }
    // loop over all pools and query volumes
    let brokerProm : Array<Promise<BigNumber>>= [];
    let traderProm : Array<Promise<BigNumber>>= [];
    for(let k=0; k<this.poolStaticInfos.length; k++) {
      if (brokerAddr!="" && brokerAddr!=undefined) {
        let brkrVol = this.proxyContract.getCurrentBrokerVolume(this.poolStaticInfos[k].poolId, brokerAddr);
        brokerProm.push(brkrVol);
      }
      let trdrVol = this.proxyContract.getCurrentTraderVolume(this.poolStaticInfos[k].poolId, traderAddr);
      traderProm.push(trdrVol);
    }
    // sum
    let totalBrokerVolume = 0;
    let totalTraderVolume = 0;
    let brkrVol = await Promise.all(brokerProm);
    let trdrVol = await Promise.all(traderProm);
    for(let k=0; k<this.poolStaticInfos.length; k++) {
      if (brokerAddr!="" && brokerAddr!=undefined) {
        totalBrokerVolume += ABK64x64ToFloat(brkrVol[k]);
      }
      totalTraderVolume += ABK64x64ToFloat(trdrVol[k]);
    }
    const volumeCap = 500_000;
    let score = totalBrokerVolume==0 ? totalTraderVolume/volumeCap : totalBrokerVolume;
    // 5 different equally spaced categories: (4 is best, 1 worst)
    let rank4 = 1+Math.floor(Math.min(score,1-1e-15)*4);
    // desired ranking starts at 4 (worst) and ends at 1 (best)
    return 5-rank4;
  }

  public static async _exchangeInfo(
    _proxyContract: ethers.Contract,
    _poolStaticInfos: Array<PoolStaticInfo>,
    _symbolToPerpStaticInfo: Map<string, PerpetualStaticInfo>,
    _symbolList: Map<string, string>,
    _priceFeedGetter: PriceFeeds
  ): Promise<ExchangeInfo> {
    let nestedPerpetualIDs = await PerpetualDataHandler.getNestedPerpetualIds(_proxyContract);
    let factory = await _proxyContract.getOracleFactory();
    let info: ExchangeInfo = { pools: [], oracleFactoryAddr: factory, proxyAddr: _proxyContract.address };
    const numPools = nestedPerpetualIDs.length;

    // get all prices
    let allSym = new Set<string>();
    for (let perpSymbol of _symbolToPerpStaticInfo.keys()) {
      let sInfo: PerpetualStaticInfo | undefined = _symbolToPerpStaticInfo.get(perpSymbol);
      allSym.add(sInfo!.S2Symbol);
      if (sInfo!.S3Symbol != "") {
        allSym.add(sInfo!.S3Symbol);
      }
    }
    let allSymArr = Array.from(allSym.values());
    let idxPriceMap: Map<string, [number, boolean]> = await _priceFeedGetter.fetchPrices(allSymArr);

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
      let poolSymbol = PoolState.poolSymbol;
      for (var k = 0; k < perpetualIDs.length; k++) {
        let perp = await _proxyContract.getPerpetual(perpetualIDs[k]);
        let symS2 =
          contractSymbolToSymbol(perp.S2BaseCCY, _symbolList) +
          "-" +
          contractSymbolToSymbol(perp.S2QuoteCCY, _symbolList);
        let symS3 =
          contractSymbolToSymbol(perp.S3BaseCCY, _symbolList) +
          "-" +
          contractSymbolToSymbol(perp.S3QuoteCCY, _symbolList);
        let perpSymbol = symS2 + "-" + poolSymbol;
        //console.log("perpsymbol=",perpSymbol);
        let res = idxPriceMap.get(symS2);
        if (res == undefined) {
          throw new Error(`Price for index ${symS2} could not be fetched - config issue`);
        }
        let [indexS2, isS2MktClosed]: [number, boolean] = [res[0], res[1]];
        let indexS3 = 1;
        let isS3MktClosed = false;
        if (perp.eCollateralCurrency == COLLATERAL_CURRENCY_BASE) {
          indexS3 = indexS2;
        } else if (perp.eCollateralCurrency == COLLATERAL_CURRENCY_QUANTO) {
          res = idxPriceMap.get(symS3);
          if (res == undefined) {
            throw new Error(`Price for index ${symS3} could not be fetched - config issue`);
          } else {
            indexS3 = res[0];
            isS3MktClosed = res[1];
          }
        }
        let fMidPrice = await _proxyContract.queryPerpetualPrice(perpetualIDs[k], BigNumber.from(0), [
          floatToABK64x64(indexS2),
          floatToABK64x64(indexS3),
        ]);

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
          maxPositionBC: Infinity,
          isMarketClosed: isS2MktClosed || isS3MktClosed,
        };
        PoolState.perpetuals.push(PerpetualState);
      }
      info.pools.push(PoolState);
    }
    return info;
  }
}
