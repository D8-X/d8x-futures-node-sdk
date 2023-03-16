import { ethers, BigNumber } from "ethers";
import {
  NodeSDKConfig,
  MAX_64x64,
  Order,
  SmartContractOrder,
  CollaterlCCY,
  PerpetualStaticInfo,
  COLLATERAL_CURRENCY_BASE,
  COLLATERAL_CURRENCY_QUOTE,
  BUY_SIDE,
  SELL_SIDE,
  CLOSED_SIDE,
  ORDER_MAX_DURATION_SEC,
  ZERO_ADDRESS,
  ORDER_TYPE_LIMIT,
  ORDER_TYPE_MARKET,
  ORDER_TYPE_STOP_MARKET,
  ORDER_TYPE_STOP_LIMIT,
  MASK_LIMIT_ORDER,
  MASK_CLOSE_ONLY,
  MASK_KEEP_POS_LEVERAGE,
  MASK_MARKET_ORDER,
  MASK_STOP_ORDER,
  MarginAccount,
  PoolStaticInfo,
  ONE_64x64,
  PERP_STATE_STR,
  PerpetualState,
  DEFAULT_CONFIG,
  DEFAULT_CONFIG_MAINNET_NAME,
  PriceFeedSubmission,
} from "./nodeSDKTypes";
import {
  fromBytes4HexString,
  to4Chars,
  combineFlags,
  containsFlag,
  contractSymbolToSymbol,
  symbol4BToLongSymbol,
} from "./utils";
import {
  ABK64x64ToFloat,
  floatToABK64x64,
  div64x64,
  calculateLiquidationPriceCollateralQuanto,
  calculateLiquidationPriceCollateralBase,
  calculateLiquidationPriceCollateralQuote,
} from "./d8XMath";
import PriceFeeds from "./priceFeeds";

/**
 * Parent class for MarketData and WriteAccessHandler that handles
 * common data and chain operations.
 */
export default class PerpetualDataHandler {
  //map symbol of the form ETH-USD-MATIC into perpetual ID and other static info
  //this is initialized in the createProxyInstance function
  protected symbolToPerpStaticInfo: Map<string, PerpetualStaticInfo>;
  protected poolStaticInfos: Array<PoolStaticInfo>;
  protected symbolList: Map<string, string>;

  //map margin token of the form MATIC or ETH or USDC into
  //the address of the margin token
  protected symbolToTokenAddrMap: Map<string, string>;

  protected proxyContract: ethers.Contract | null = null;
  protected proxyABI: ethers.ContractInterface;
  protected proxyAddr: string;
  // limit order book
  protected lobFactoryContract: ethers.Contract | null = null;
  protected lobFactoryABI: ethers.ContractInterface;
  protected lobFactoryAddr: string;
  protected lobABI: ethers.ContractInterface;
  protected nodeURL: string;
  protected provider: ethers.providers.JsonRpcProvider | null = null;

  private signerOrProvider: ethers.Signer | ethers.providers.Provider | null = null;
  private priceFeedGetter : PriceFeeds;

  // pools are numbered consecutively starting at 1
  // nestedPerpetualIDs contains an array for each pool
  // each pool-array contains perpetual ids
  protected nestedPerpetualIDs: number[][];

  public constructor(config: NodeSDKConfig) {
    this.symbolToPerpStaticInfo = new Map<string, PerpetualStaticInfo>();
    this.poolStaticInfos = new Array<PoolStaticInfo>();
    this.symbolToTokenAddrMap = new Map<string, string>();
    this.nestedPerpetualIDs = new Array<Array<number>>();
    this.proxyAddr = config.proxyAddr;
    this.lobFactoryAddr = config.limitOrderBookFactoryAddr;
    this.nodeURL = config.nodeURL;
    this.proxyABI = require(config.proxyABILocation);
    this.lobFactoryABI = require(config.limitOrderBookFactoryABILocation);
    this.lobABI = require(config.limitOrderBookABILocation);
    this.symbolList = new Map<string, string>(Object.entries(require(config.symbolListLocation)));
    this.priceFeedGetter = new PriceFeeds(this, config.priceFeedConfigNetwork);
  }

  protected async initContractsAndData(signerOrProvider: ethers.Signer | ethers.providers.Provider) {
    this.signerOrProvider = signerOrProvider;
    this.proxyContract = new ethers.Contract(this.proxyAddr, this.proxyABI, signerOrProvider);
    this.lobFactoryContract = new ethers.Contract(this.lobFactoryAddr, this.lobFactoryABI, signerOrProvider);
    await this._fillSymbolMaps(this.proxyContract);
  }

  /**
   * Returns the order-book contract for the symbol if found or fails
   * @param symbol symbol of the form ETH-USD-MATIC
   * @returns order book contract for the perpetual
   */
  public getOrderBookContract(symbol: string): ethers.Contract {
    let orderBookAddr = this.symbolToPerpStaticInfo.get(symbol)?.limitOrderBookAddr;
    if (orderBookAddr == "" || orderBookAddr == undefined || this.signerOrProvider == null) {
      throw Error(`no limit order book found for ${symbol} or no signer`);
    }
    let lobContract = new ethers.Contract(orderBookAddr, this.lobABI, this.signerOrProvider);
    return lobContract;
  }

  /**
   * Called when initializing. This function fills this.symbolToTokenAddrMap,
   * and this.nestedPerpetualIDs and this.symbolToPerpStaticInfo
   *
   */
  protected async _fillSymbolMaps(proxyContract: ethers.Contract) {
    if (proxyContract == null || this.lobFactoryContract == null) {
      throw Error("proxy or limit order book not defined");
    }
    this.nestedPerpetualIDs = await PerpetualDataHandler.getNestedPerpetualIds(proxyContract);
    let requiredPairs = new Set<string>();
    for (let j = 0; j < this.nestedPerpetualIDs.length; j++) {
      let pool = await proxyContract.getLiquidityPool(j + 1);
      let poolMarginTokenAddr = pool.marginTokenAddress;
      let perpetualIDs = this.nestedPerpetualIDs[j];
      let poolCCY: string | undefined = undefined;
      let currentSymbols: string[] = [];
      let currentSymbolsS3: string[] = [];
      let currentLimitOrderBookAddr: string[] = [];
      let ccy: CollaterlCCY[] = [];
      let initRate: number[] = [];
      let mgnRate: number[] = [];
      let lotSizes: number[] = [];

      for (let k = 0; k < perpetualIDs.length; k++) {
        let perp = await proxyContract.getPerpetual(perpetualIDs[k]);
        let base = contractSymbolToSymbol(perp.S2BaseCCY, this.symbolList);
        let quote = contractSymbolToSymbol(perp.S2QuoteCCY, this.symbolList);
        let base3 = contractSymbolToSymbol(perp.S3BaseCCY, this.symbolList);
        let quote3 = contractSymbolToSymbol(perp.S3QuoteCCY, this.symbolList);
        let sym = base + "-" + quote;
        let sym3 = base3 + "-" + quote3;
        requiredPairs.add(sym);
        if (sym3!="-") {
          requiredPairs.add(sym3);
        }
        currentSymbols.push(sym);
        currentSymbolsS3.push(sym3);
        initRate.push(ABK64x64ToFloat(perp.fInitialMarginRate));
        mgnRate.push(ABK64x64ToFloat(perp.fMaintenanceMarginRate));
        lotSizes.push(ABK64x64ToFloat(perp.fLotSizeBC));
        // try to find a limit order book
        let lobAddr = await this.lobFactoryContract.getOrderBookAddress(perpetualIDs[k]);
        currentLimitOrderBookAddr.push(lobAddr);
        if (poolCCY == undefined) {
          // we find out the pool currency by looking at all perpetuals
          // unless for quanto perpetuals, we know the pool currency
          // from the perpetual. This fails if we have a pool with only
          // quanto perpetuals
          if (perp.eCollateralCurrency == COLLATERAL_CURRENCY_BASE) {
            poolCCY = base;
            ccy.push(CollaterlCCY.BASE);
          } else if (perp.eCollateralCurrency == COLLATERAL_CURRENCY_QUOTE) {
            poolCCY = quote;
            ccy.push(CollaterlCCY.QUOTE);
          } else {
            poolCCY = base3;
            ccy.push(CollaterlCCY.QUANTO);
          }
        }
      }
      if (perpetualIDs.length == 0) {
        continue;
      }
      let oracleFactoryAddr = await proxyContract.getOracleFactory();
      let info: PoolStaticInfo = {
        poolId: j + 1,
        poolMarginSymbol: poolCCY!,
        poolMarginTokenAddr: poolMarginTokenAddr,
        shareTokenAddr: pool.shareTokenAddress,
        oracleFactoryAddr: oracleFactoryAddr, 
      };
      this.poolStaticInfos.push(info);
      let currentSymbols3 = currentSymbols.map((x) => x + "-" + poolCCY);
      // push into map
      for (let k = 0; k < perpetualIDs.length; k++) {
        // add pyth IDs
        let idsB32 = await proxyContract.getPythIds(perpetualIDs[k]);

        this.symbolToPerpStaticInfo.set(currentSymbols3[k], {
          id: perpetualIDs[k],
          limitOrderBookAddr: currentLimitOrderBookAddr[k],
          initialMarginRate: initRate[k],
          maintenanceMarginRate: mgnRate[k],
          collateralCurrencyType: ccy[k],
          S2Symbol: currentSymbols[k],
          S3Symbol: currentSymbolsS3[k],
          lotSizeBC: lotSizes[k],
          pythIds: idsB32
        });
      }
      // push margin token address into map
      this.symbolToTokenAddrMap.set(poolCCY!, poolMarginTokenAddr);
    }
    // pre-calculate all triangulation paths so we can easily get from
    // the prices of price-feeds to the index price required, e.g. 
    // BTC-USDC : BTC-USD / USDC-USD 
    this.priceFeedGetter.initializeTriangulations(requiredPairs);
  }

  /**
   * Get pool symbol given a pool Id.
   * @param {number} poolId Pool Id.
   * @returns {symbol} Pool symbol, e.g. "USDC".
   */
  public getSymbolFromPoolId(poolId: number): string {
    return PerpetualDataHandler._getSymbolFromPoolId(poolId, this.poolStaticInfos);
  }

  /**
   * Get pool Id given a pool symbol.
   * @param {string} symbol Pool symbol.
   * @returns {number} Pool Id.
   */
  public getPoolIdFromSymbol(symbol: string): number {
    return PerpetualDataHandler._getPoolIdFromSymbol(symbol, this.poolStaticInfos);
  }

  /**
   * Get perpetual Id given a perpetual symbol.
   * @param {string} symbol Perpetual symbol, e.g. "BTC-USD-MATIC".
   * @returns {number} Perpetual Id.
   */
  public getPerpIdFromSymbol(symbol: string): number {
    return PerpetualDataHandler.symbolToPerpetualId(symbol, this.symbolToPerpStaticInfo);
  }

  /**
   * Get the symbol in long format of the perpetual id
   * @param perpId perpetual id
   */
  public getSymbolFromPerpId(perpId: number): string | undefined {
    return PerpetualDataHandler.perpetualIdToSymbol(perpId, this.symbolToPerpStaticInfo);
  }

  public symbol4BToLongSymbol(sym: string): string {
    return symbol4BToLongSymbol(sym, this.symbolList);
  }

  /**
   * Get the latest prices for a given perpetual from the offchain oracle
   * networks
   * @param symbol perpetual symbol of the form BTC-USD-MATIC
   * @returns array of price feed updates that can be submitted to the smart contract 
   * and corresponding price information 
   */
  public async fetchLatestFeedPrices(symbol: string) : Promise<PriceFeedSubmission> {
    return await this.priceFeedGetter.fetchLatestFeedPrices(symbol);
  }

  /**
   * Get list of required pyth price source IDs for given perpetual
   * @param symbol perpetual symbol, e.g., BTC-USD-MATIC
   * @returns list of required pyth price sources for this perpetual
   */
  public getPythIds(symbol: string): string[] {
    let perpInfo = this.symbolToPerpStaticInfo.get(symbol);
    if (perpInfo == undefined) {
      throw Error(`Perpetual with symbol ${symbol} not found. Check symbol or use createProxyInstance().`);
    }
    return perpInfo.pythIds;
  }

  protected static _getSymbolFromPoolId(poolId: number, staticInfos: PoolStaticInfo[]): string {
    let idx = poolId - 1;
    return staticInfos[idx].poolMarginSymbol;
  }

  protected static _getPoolIdFromSymbol(symbol: string, staticInfos: PoolStaticInfo[]): number {
    let symbols = symbol.split("-");
    //in case user provided ETH-USD-MATIC instead of MATIC; or similar
    if (symbols.length == 3) {
      symbol = symbols[2];
    }
    let j = 0;
    while (j < staticInfos.length && staticInfos[j].poolMarginSymbol != symbol) {
      j++;
    }
    if (j == staticInfos.length) {
      throw new Error(`no pool found for symbol ${symbol}`);
    }
    return j + 1;
  }

  public static async getNestedPerpetualIds(_proxyContract: ethers.Contract): Promise<number[][]> {
    let poolCount = await _proxyContract.getPoolCount();
    let poolIds: number[][] = new Array(poolCount);
    for (let i = 1; i < poolCount + 1; i++) {
      let perpetualCount = await _proxyContract.getPerpetualCountInPool(i);
      poolIds[i - 1] = new Array(perpetualCount);
      for (let j = 0; j < perpetualCount; j++) {
        let id = await _proxyContract.getPerpetualId(i, j);
        poolIds[i - 1][j] = id;
      }
    }
    return poolIds;
  }

  public static async getMarginAccount(
    traderAddr: string,
    symbol: string,
    symbolToPerpStaticInfo: Map<string, PerpetualStaticInfo>,
    _proxyContract: ethers.Contract
  ): Promise<MarginAccount> {
    let perpId = Number(symbol);
    if (isNaN(perpId)) {
      perpId = PerpetualDataHandler.symbolToPerpetualId(symbol, symbolToPerpStaticInfo);
    }
    const idx_cash = 3;
    const idx_notional = 4;
    const idx_locked_in = 5;
    const idx_mark_price = 8;
    const idx_lvg = 7;
    const idx_s3 = 9;
    let traderState = await _proxyContract.getTraderState(perpId, traderAddr);
    let isEmpty = traderState[idx_notional] == 0;
    let cash = ABK64x64ToFloat(traderState[idx_cash]);
    let S2Liq = 0,
      S3Liq = 0,
      tau = Infinity,
      pnl = 0,
      unpaidFundingCC = 0,
      fLockedIn = BigNumber.from(0),
      side = CLOSED_SIDE,
      entryPrice = 0;
    if (!isEmpty) {
      [S2Liq, S3Liq, tau, pnl, unpaidFundingCC] = PerpetualDataHandler._calculateLiquidationPrice(
        symbol,
        traderState,
        symbolToPerpStaticInfo
      );
      fLockedIn = traderState[idx_locked_in];
      side = traderState[idx_locked_in] > 0 ? BUY_SIDE : SELL_SIDE;
      entryPrice = ABK64x64ToFloat(div64x64(fLockedIn, traderState[idx_notional]));
    }
    let mgn: MarginAccount = {
      symbol: symbol,
      positionNotionalBaseCCY: isEmpty ? 0 : ABK64x64ToFloat(traderState[idx_notional].abs()),
      side: isEmpty ? CLOSED_SIDE : side,
      entryPrice: isEmpty ? 0 : entryPrice,
      leverage: isEmpty ? 0 : ABK64x64ToFloat(traderState[idx_lvg]),
      markPrice: ABK64x64ToFloat(traderState[idx_mark_price].abs()),
      unrealizedPnlQuoteCCY: isEmpty ? 0 : pnl,
      unrealizedFundingCollateralCCY: isEmpty ? 0 : unpaidFundingCC,
      collateralCC: cash,
      liquidationLvg: isEmpty ? 0 : 1 / tau,
      liquidationPrice: isEmpty ? [0, 0] : [S2Liq, S3Liq],
      collToQuoteConversion: ABK64x64ToFloat(traderState[idx_s3]),
    };
    return mgn;
  }

  protected static async _queryPerpetualPrice(
    symbol: string,
    tradeAmount: number,
    symbolToPerpStaticInfo: Map<string, PerpetualStaticInfo>,
    _proxyContract: ethers.Contract
  ): Promise<number> {
    let perpId = PerpetualDataHandler.symbolToPerpetualId(symbol, symbolToPerpStaticInfo);
    let fPrice = await _proxyContract.queryPerpetualPrice(perpId, floatToABK64x64(tradeAmount));
    return ABK64x64ToFloat(fPrice);
  }

  protected static async _queryPerpetualMarkPrice(
    symbol: string,
    symbolToPerpStaticInfo: Map<string, PerpetualStaticInfo>,
    _proxyContract: ethers.Contract
  ): Promise<number> {
    let perpId = PerpetualDataHandler.symbolToPerpetualId(symbol, symbolToPerpStaticInfo);
    let ammState = await _proxyContract.getAMMState(perpId);
    return ABK64x64ToFloat(ammState[6].mul(ONE_64x64.add(ammState[8])).div(ONE_64x64));
  }

  protected static async _queryPerpetualState(
    symbol: string,
    symbolToPerpStaticInfo: Map<string, PerpetualStaticInfo>,
    _proxyContract: ethers.Contract
  ): Promise<PerpetualState> {
    let perpId = PerpetualDataHandler.symbolToPerpetualId(symbol, symbolToPerpStaticInfo);
    let ccy = symbol.split("-");
    let ammState = await _proxyContract.getAMMState(perpId);
    let markPrice = ABK64x64ToFloat(ammState[6].mul(ONE_64x64.add(ammState[8])).div(ONE_64x64));
    let state = {
      id: perpId,
      state: PERP_STATE_STR[ammState[13]],
      baseCurrency: ccy[0],
      quoteCurrency: ccy[1],
      indexPrice: ABK64x64ToFloat(ammState[6]),
      collToQuoteIndexPrice: ABK64x64ToFloat(ammState[7]),
      markPrice: markPrice,
      midPrice: ABK64x64ToFloat(ammState[10]),
      currentFundingRateBps: ABK64x64ToFloat(ammState[14]) * 1e4,
      openInterestBC: ABK64x64ToFloat(ammState[11]),
      maxPositionBC: ABK64x64ToFloat(ammState[12]),
    };
    if (symbolToPerpStaticInfo.get(symbol)?.collateralCurrencyType == CollaterlCCY.BASE) {
      state.collToQuoteIndexPrice = state.indexPrice;
    } else if (symbolToPerpStaticInfo.get(symbol)?.collateralCurrencyType == CollaterlCCY.QUOTE) {
      state.collToQuoteIndexPrice = 1;
    }
    return state;
  }

  /**
   * Liquidation price
   * @param symbol symbol of the form BTC-USD-MATIC
   * @param traderState BigInt array according to smart contract
   * @param symbolToPerpStaticInfo mapping symbol->PerpStaticInfo
   * @returns liquidation mark-price, corresponding collateral/quote conversion
   */
  protected static _calculateLiquidationPrice(
    symbol: string,
    traderState: BigNumber[],
    symbolToPerpStaticInfo: Map<string, PerpetualStaticInfo>
  ): [number, number, number, number, number] {
    const idx_availableCashCC = 2;
    const idx_cash = 3;
    const idx_notional = 4;
    const idx_locked_in = 5;
    const idx_mark_price = 8;
    const idx_s3 = 9;
    const idx_s2 = 10;
    let S2Liq: number;
    let S3Liq: number = ABK64x64ToFloat(traderState[idx_s3]);
    let perpInfo: PerpetualStaticInfo | undefined = symbolToPerpStaticInfo.get(symbol);
    if (perpInfo == undefined) {
      throw new Error(`no info for perpetual ${symbol}`);
    }
    let tau = perpInfo.maintenanceMarginRate;
    let lockedInValueQC = ABK64x64ToFloat(traderState[idx_locked_in]);
    let position = ABK64x64ToFloat(traderState[idx_notional]);
    let cashCC = ABK64x64ToFloat(traderState[idx_availableCashCC]);
    let Sm = ABK64x64ToFloat(traderState[idx_mark_price]);
    let unpaidFundingCC = ABK64x64ToFloat(traderState[idx_availableCashCC].sub(traderState[idx_cash]));
    let unpaidFunding = unpaidFundingCC;

    if (perpInfo.collateralCurrencyType == CollaterlCCY.BASE) {
      S2Liq = calculateLiquidationPriceCollateralBase(lockedInValueQC, position, cashCC, tau);
      S3Liq = S2Liq;
      unpaidFunding = unpaidFunding / ABK64x64ToFloat(traderState[idx_s2]);
    } else if (perpInfo.collateralCurrencyType == CollaterlCCY.QUANTO) {
      let S3 = S3Liq;
      S3Liq = S3;
      S2Liq = calculateLiquidationPriceCollateralQuanto(lockedInValueQC, position, cashCC, tau, S3, Sm);
      unpaidFunding = unpaidFunding / S3;
    } else {
      S2Liq = calculateLiquidationPriceCollateralQuote(lockedInValueQC, position, cashCC, tau);
    }
    // account cash + pnl = avail cash + pos Sm - L = margin balance
    let pnl = position * Sm - lockedInValueQC + unpaidFunding;
    return [S2Liq, S3Liq, tau, pnl, unpaidFundingCC];
  }

  /**
   * Finds the perpetual id for a symbol of the form
   * <base>-<quote>-<collateral>. The function first converts the
   * token names into bytes4 representation
   * @param symbol                  symbol (e.g., BTC-USD-MATC)
   * @param symbolToPerpStaticInfo  map that contains the bytes4-symbol to PerpetualStaticInfo
   * including id mapping
   * @returns perpetual id or it fails
   */
  protected static symbolToPerpetualId(
    symbol: string,
    symbolToPerpStaticInfo: Map<string, PerpetualStaticInfo>
  ): number {
    let id = symbolToPerpStaticInfo.get(symbol)?.id;
    if (id == undefined) {
      throw Error(`No perpetual found for symbol ${symbol}`);
    }
    return id;
  }

  /**
   * Find the long symbol ("ETH-USD-MATIC") of the given perpetual id
   * @param id perpetual id
   * @param symbolToPerpStaticInfo map that contains the bytes4-symbol to PerpetualStaticInfo
   * @returns symbol string or undefined
   */
  protected static perpetualIdToSymbol(
    id: number,
    symbolToPerpStaticInfo: Map<string, PerpetualStaticInfo>
  ): string | undefined {
    let symbol;
    for (symbol of symbolToPerpStaticInfo.keys()) {
      if (symbolToPerpStaticInfo.get(symbol)?.id == id) {
        return symbol;
      }
    }
    return undefined;
  }

  protected static symbolToBytes4Symbol(symbol: string): string {
    //split by dashes BTC-USD-MATIC
    let symbols: string[] = symbol.split("-");
    if (symbols.length != 3) {
      throw Error(`Symbol ${symbol} not valid. Expecting CCY-CCY-CCY format`);
    }
    //transform into bytes4 currencies (without the space): "BTC", "USD", "MATC"
    symbols = symbols.map((x) => {
      let v = to4Chars(x);
      v = v.replace(/\0/g, "");
      return v;
    });
    // concatenate and find perpetual Id in map
    return symbols[0] + "-" + symbols[1] + "-" + symbols[2];
  }

  private static _getByValue(map: any, searchValue: any, valueField: any) {
    for (let [key, value] of map.entries()) {
      if (value[valueField] === searchValue) {
        return key;
      }
    }
    return undefined;
  }

  protected static fromSmartContractOrder(
    order: SmartContractOrder,
    symbolToPerpInfoMap: Map<string, PerpetualStaticInfo>
  ): Order {
    // find symbol of perpetual id
    let symbol = PerpetualDataHandler._getByValue(symbolToPerpInfoMap, order.iPerpetualId, "id");
    if (symbol == undefined) {
      throw Error(`Perpetual id ${order.iPerpetualId} not found. Check with marketData.exchangeInfo().`);
    }
    let side = order.fAmount > 0 ? BUY_SIDE : SELL_SIDE;
    let limitPrice, stopPrice;
    let fLimitPrice: BigNumber | undefined = BigNumber.from(order.fLimitPrice);
    if (fLimitPrice.eq(0)) {
      limitPrice = side == BUY_SIDE ? undefined : 0;
    } else if (fLimitPrice.eq(MAX_64x64)) {
      limitPrice = side == BUY_SIDE ? Infinity : undefined;
    } else {
      limitPrice = ABK64x64ToFloat(fLimitPrice);
    }
    let fStopPrice: BigNumber | undefined = BigNumber.from(order.fTriggerPrice);
    if (fStopPrice.eq(0) || fStopPrice.eq(MAX_64x64)) {
      stopPrice = undefined;
    } else {
      stopPrice = ABK64x64ToFloat(fStopPrice);
    }
    let userOrder: Order = {
      symbol: symbol!,
      side: side,
      type: PerpetualDataHandler._flagToOrderType(order),
      quantity: Math.abs(ABK64x64ToFloat(BigNumber.from(order.fAmount))),
      reduceOnly: containsFlag(BigNumber.from(order.flags), MASK_CLOSE_ONLY),
      limitPrice: limitPrice,
      keepPositionLvg: containsFlag(BigNumber.from(order.flags), MASK_KEEP_POS_LEVERAGE),
      brokerFeeTbps: order.brokerFeeTbps == 0 ? undefined : Number(order.brokerFeeTbps),
      brokerAddr: order.brokerAddr == ZERO_ADDRESS ? undefined : order.brokerAddr,
      brokerSignature: order.brokerSignature == "0x" ? undefined : order.brokerSignature,
      stopPrice: stopPrice,
      leverage: ABK64x64ToFloat(BigNumber.from(order.fLeverage)),
      deadline: Number(order.iDeadline),
      timestamp: Number(order.createdTimestamp),
      submittedBlock: Number(order.submittedBlock),
    };
    return userOrder;
  }
  /**
   * Transform the convenient form of the order into a smart-contract accepted type of order
   * @param order                 order type
   * @param traderAddr            address of the trader
   * @param symbolToPerpetualMap  mapping of symbol to perpetual Id
   * @returns SmartContractOrder
   */
  protected static toSmartContractOrder(
    order: Order,
    traderAddr: string,
    perpStaticInfo: Map<string, PerpetualStaticInfo>
  ): SmartContractOrder {
    let flags = PerpetualDataHandler._orderTypeToFlag(order);

    let brokerSig = order.brokerSignature == undefined ? [] : order.brokerSignature;
    let perpetualId = PerpetualDataHandler.symbolToPerpetualId(order.symbol, perpStaticInfo);
    let fAmount: BigNumber;
    if (order.side == BUY_SIDE) {
      fAmount = floatToABK64x64(Math.abs(order.quantity));
    } else if (order.side == SELL_SIDE) {
      fAmount = floatToABK64x64(-Math.abs(order.quantity));
    } else {
      throw Error(`invalid side in order spec, use ${BUY_SIDE} or ${SELL_SIDE}`);
    }
    let fLimitPrice: BigNumber;
    if (order.limitPrice == undefined) {
      // we need to set the limit price to infinity or zero for
      // the trade to go through
      // Also: stop orders always have limits set, so even  for this case
      // we set the limit to 0 or infinity
      fLimitPrice = order.side == BUY_SIDE ? MAX_64x64 : BigNumber.from(0);
    } else {
      fLimitPrice = floatToABK64x64(order.limitPrice);
    }

    let iDeadline = order.deadline == undefined ? Date.now() / 1000 + ORDER_MAX_DURATION_SEC : order.deadline;
    let fTriggerPrice = order.stopPrice == undefined ? BigNumber.from(0) : floatToABK64x64(order.stopPrice);

    let smOrder: SmartContractOrder = {
      flags: flags,
      iPerpetualId: BigNumber.from(perpetualId),
      brokerFeeTbps: order.brokerFeeTbps == undefined ? BigNumber.from(0) : BigNumber.from(order.brokerFeeTbps),
      traderAddr: traderAddr,
      brokerAddr: order.brokerAddr == undefined ? ZERO_ADDRESS : order.brokerAddr,
      referrerAddr: ZERO_ADDRESS,
      brokerSignature: brokerSig,
      fAmount: fAmount,
      fLimitPrice: fLimitPrice,
      fTriggerPrice: fTriggerPrice,
      fLeverage: order.leverage == undefined ? BigNumber.from(0) : floatToABK64x64(order.leverage),
      iDeadline: BigNumber.from(Math.round(iDeadline)),
      createdTimestamp: BigNumber.from(Math.round(order.timestamp)),
      submittedBlock: 0,
    };
    return smOrder;
  }

  private static _flagToOrderType(order: SmartContractOrder): string {
    let flag = BigNumber.from(order.flags);
    let isLimit = containsFlag(flag, MASK_LIMIT_ORDER);
    let hasLimit = !BigNumber.from(order.fLimitPrice).eq(0) || !BigNumber.from(order.fLimitPrice).eq(MAX_64x64);
    let isStop = containsFlag(flag, MASK_STOP_ORDER);

    if (isStop && hasLimit) {
      return ORDER_TYPE_STOP_LIMIT;
    } else if (isStop && !hasLimit) {
      return ORDER_TYPE_STOP_MARKET;
    } else if (isLimit && !isStop) {
      return ORDER_TYPE_LIMIT;
    } else {
      return ORDER_TYPE_MARKET;
    }
  }

  /**
   * Determine the correct order flags based on the order-properties.
   * Checks for some misspecifications.
   * @param order     order type
   * @returns BigNumber flags
   */
  private static _orderTypeToFlag(order: Order): BigNumber {
    let flag: BigNumber;
    order.type = order.type.toUpperCase();
    switch (order.type) {
      case ORDER_TYPE_LIMIT:
        flag = MASK_LIMIT_ORDER;
        break;
      case ORDER_TYPE_MARKET:
        flag = MASK_MARKET_ORDER;
        break;
      case ORDER_TYPE_STOP_MARKET:
        flag = MASK_STOP_ORDER;
        break;
      case ORDER_TYPE_STOP_LIMIT:
        flag = MASK_STOP_ORDER;
        break;
      default: {
        throw Error(`Order type ${order.type} not found.`);
      }
    }
    if (order.keepPositionLvg != undefined && order.keepPositionLvg) {
      flag = combineFlags(flag, MASK_KEEP_POS_LEVERAGE);
    }
    if (order.reduceOnly != undefined && order.reduceOnly) {
      flag = combineFlags(flag, MASK_CLOSE_ONLY);
    }
    if ((order.type == ORDER_TYPE_LIMIT || order.type == ORDER_TYPE_STOP_LIMIT) && order.limitPrice == undefined) {
      throw Error(`Order type ${order.type} requires limit price.`);
    }
    if ((order.type == ORDER_TYPE_STOP_MARKET || order.type == ORDER_TYPE_STOP_LIMIT) && order.stopPrice == undefined) {
      throw Error(`Order type ${order.type} requires trigger price.`);
    }
    if ((order.type == ORDER_TYPE_MARKET || order.type == ORDER_TYPE_LIMIT) && order.stopPrice != undefined) {
      throw Error(`Order type ${order.type} has no trigger price.`);
    }
    if (order.type != ORDER_TYPE_STOP_LIMIT && order.type != ORDER_TYPE_STOP_MARKET && order.stopPrice != undefined) {
      throw Error(`Order type ${order.type} has no trigger price.`);
    }
    return flag;
  }

  protected static _getLotSize(symbol: string, symbolToPerpStaticInfo: Map<string, PerpetualStaticInfo>): number {
    let perpInfo: PerpetualStaticInfo | undefined = symbolToPerpStaticInfo.get(symbol);
    if (perpInfo == undefined) {
      throw new Error(`no info for perpetual ${symbol}`);
    }
    return perpInfo.lotSizeBC;
  }

  protected static _getMinimalPositionSize(
    symbol: string,
    symbolToPerpStaticInfo: Map<string, PerpetualStaticInfo>
  ): number {
    return 10 * PerpetualDataHandler._getLotSize(symbol, symbolToPerpStaticInfo);
  }

  /**
   * Read config file into NodeSDKConfig interface
   * @param configNameOrfileLocation json-file with required variables for config, or name of a default known config
   * @returns NodeSDKConfig
   */
  public static readSDKConfig(configNameOrFileLocation: string, version?: string): NodeSDKConfig {
    let config;
    if (/\.json$/.test(configNameOrFileLocation)) {
      // file path
      let configFile = require(configNameOrFileLocation);
      config = <NodeSDKConfig>configFile;
    } else {
      // name
      let configFile = require(DEFAULT_CONFIG);
      configFile = configFile.filter((c: any) => c.name == configNameOrFileLocation);
      if (configFile.length == 0) {
        throw Error(`Config name ${configNameOrFileLocation} not found.`);
      } else if (configFile.length > 1) {
        throw Error(`Config name ${configNameOrFileLocation} not unique.`);
      }
      for (let configItem of configFile) {
        if (configItem.name == configNameOrFileLocation) {
          config = <NodeSDKConfig>configItem;
          break;
        }
      }
    }
    if (config == undefined) {
      throw Error(`Config file ${configNameOrFileLocation} not found.`);
    }
    return config;
    // if (configNameOrfileLocation == DEFAULT_CONFIG_MAINNET_NAME) {
    //   configNameOrfileLocation = DEFAULT_CONFIG_MAINNET;
    // } else if (configNameOrfileLocation == DEFAULT_CONFIG_TESTNET_NAME) {
    //   configNameOrfileLocation = DEFAULT_CONFIG_TESTNET;
    // } else {
    //   let config = require(DEFAULT_CONFIG);
    //   // check names stored in default config
    // }
    // let configFile = require(configNameOrfileLocation);
    // let config: NodeSDKConfig = <NodeSDKConfig>configFile;
    // return config;
  }

  /**
   * Get the ABI of a function in a given contract
   * @param contract A contract instance, e.g. this.proxyContract
   * @param functionName Name of the function whose ABI we want
   * @returns Function ABI as a single JSON string
   */
  protected static _getABIFromContract(contract: ethers.Contract, functionName: string): string {
    const FormatTypes = ethers.utils.FormatTypes;
    return contract.interface.getFunction(functionName).format(FormatTypes.full);
  }

  /**
   * Gets the pool index (in exchangeInfo) corresponding to a given symbol.
   * @param symbol Symbol of the form ETH-USD-MATIC
   * @returns Pool index
   */
  public getPoolIndexFromSymbol(symbol: string): number {
    let pools = this.poolStaticInfos!;
    let poolId = PerpetualDataHandler._getPoolIdFromSymbol(symbol, this.poolStaticInfos);
    let k = 0;
    while (k < pools.length) {
      if (pools[k].poolId == poolId) {
        // pool found
        return k;
      }
      k++;
    }
    return -1;
  }

  public getMarginTokenFromSymbol(symbol: string): string | undefined {
    let pools = this.poolStaticInfos!;
    let poolId = PerpetualDataHandler._getPoolIdFromSymbol(symbol, this.poolStaticInfos);
    let k = 0;
    while (k < pools.length) {
      if (pools[k].poolId == poolId) {
        // pool found
        return pools[k].poolMarginTokenAddr;
      }
      k++;
    }
    return undefined;
  }
}
