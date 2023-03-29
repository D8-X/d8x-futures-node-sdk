import { ethers, BigNumber, ContractInterface } from "ethers";
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
  loadABIs,
  SYMBOL_LIST,
  ClientOrder,
  ZERO_ORDER_ID,
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
  PRICE_UPDATE_FEE_GWEI = 1;
  //map symbol of the form ETH-USD-MATIC into perpetual ID and other static info
  //this is initialized in the createProxyInstance function
  protected symbolToPerpStaticInfo: Map<string, PerpetualStaticInfo>;
  protected poolStaticInfos: Array<PoolStaticInfo>;
  protected symbolList: Map<string, string>;

  //map margin token of the form MATIC or ETH or USDC into
  //the address of the margin token
  protected symbolToTokenAddrMap: Map<string, string>;
  protected chainId: number;
  protected proxyContract: ethers.Contract | null = null;
  protected proxyABI: ethers.ContractInterface;
  protected proxyAddr: string;
  // limit order book
  protected lobFactoryContract: ethers.Contract | null = null;
  protected lobFactoryABI: ethers.ContractInterface;
  protected lobFactoryAddr: string | undefined;
  protected lobABI: ethers.ContractInterface;
  protected nodeURL: string;
  protected provider: ethers.providers.Provider | null = null;

  private signerOrProvider: ethers.Signer | ethers.providers.Provider | null = null;
  protected priceFeedGetter: PriceFeeds;

  // pools are numbered consecutively starting at 1
  // nestedPerpetualIDs contains an array for each pool
  // each pool-array contains perpetual ids
  protected nestedPerpetualIDs: number[][];

  public constructor(config: NodeSDKConfig) {
    this.symbolToPerpStaticInfo = new Map<string, PerpetualStaticInfo>();
    this.poolStaticInfos = new Array<PoolStaticInfo>();
    this.symbolToTokenAddrMap = new Map<string, string>();
    this.nestedPerpetualIDs = new Array<Array<number>>();
    this.chainId = config.chainId;
    this.proxyAddr = config.proxyAddr;
    this.nodeURL = config.nodeURL;
    this.proxyABI = config.proxyABI!;
    this.lobFactoryABI = config.lobFactoryABI!;
    this.lobABI = config.lobABI!;
    this.symbolList = SYMBOL_LIST;
    this.priceFeedGetter = new PriceFeeds(this, config.priceFeedConfigNetwork);
  }

  protected async initContractsAndData(signerOrProvider: ethers.Signer | ethers.providers.Provider) {
    this.signerOrProvider = signerOrProvider;
    // check network
    let network: ethers.providers.Network;
    try {
      if (signerOrProvider instanceof ethers.Signer) {
        network = await signerOrProvider.provider!.getNetwork();
      } else {
        network = await signerOrProvider.getNetwork();
      }
    } catch (error: any) {
      console.log(error);
      throw new Error(`Unable to retrieve network from provider.`);
    }
    if (network.chainId !== this.chainId) {
      throw new Error(`Provider: chain id ${network.chainId} does not match config (${this.chainId})`);
    }
    this.proxyContract = new ethers.Contract(this.proxyAddr, this.proxyABI, signerOrProvider);
    this.lobFactoryAddr = await this.proxyContract.getOrderBookFactoryAddress();
    this.lobFactoryContract = new ethers.Contract(this.lobFactoryAddr!, this.lobFactoryABI, signerOrProvider);
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
      let refRebates: number[] = [];

      for (let k = 0; k < perpetualIDs.length; k++) {
        let perp = await proxyContract.getPerpetual(perpetualIDs[k]);
        let base = contractSymbolToSymbol(perp.S2BaseCCY, this.symbolList);
        let quote = contractSymbolToSymbol(perp.S2QuoteCCY, this.symbolList);
        let base3 = contractSymbolToSymbol(perp.S3BaseCCY, this.symbolList);
        let quote3 = contractSymbolToSymbol(perp.S3QuoteCCY, this.symbolList);
        let sym = base + "-" + quote;
        let sym3 = base3 + "-" + quote3;
        requiredPairs.add(sym);
        if (sym3 != "-") {
          requiredPairs.add(sym3);
        } else {
          sym3 = "";
        }
        currentSymbols.push(sym);
        currentSymbolsS3.push(sym3);
        initRate.push(ABK64x64ToFloat(perp.fInitialMarginRate));
        mgnRate.push(ABK64x64ToFloat(perp.fMaintenanceMarginRate));
        lotSizes.push(ABK64x64ToFloat(perp.fLotSizeBC));
        refRebates.push(ABK64x64ToFloat(perp.fReferralRebateCC));
        // try to find a limit order book
        let lobAddr = await this.lobFactoryContract.getOrderBookAddress(perpetualIDs[k]);
        currentLimitOrderBookAddr.push(lobAddr);

        // we find out the pool currency by looking at all perpetuals
        // unless for quanto perpetuals, we know the pool currency
        // from the perpetual. This fails if we have a pool with only
        // quanto perpetuals
        if (perp.eCollateralCurrency == COLLATERAL_CURRENCY_BASE) {
          poolCCY = poolCCY ?? base;
          ccy.push(CollaterlCCY.BASE);
        } else if (perp.eCollateralCurrency == COLLATERAL_CURRENCY_QUOTE) {
          poolCCY = poolCCY ?? quote;
          ccy.push(CollaterlCCY.QUOTE);
        } else {
          poolCCY = poolCCY ?? base3;
          ccy.push(CollaterlCCY.QUANTO);
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
        // add price IDs
        let idsB32, isPyth;
        [idsB32, isPyth] = await proxyContract.getPriceInfo(perpetualIDs[k]);
        this.symbolToPerpStaticInfo.set(currentSymbols3[k], {
          id: perpetualIDs[k],
          limitOrderBookAddr: currentLimitOrderBookAddr[k],
          initialMarginRate: initRate[k],
          maintenanceMarginRate: mgnRate[k],
          collateralCurrencyType: ccy[k],
          S2Symbol: currentSymbols[k],
          S3Symbol: currentSymbolsS3[k],
          lotSizeBC: lotSizes[k],
          referralRebate: refRebates[k],
          priceIds: idsB32,
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
   * Get PriceFeedSubmission data required for blockchain queries that involve price data, and the corresponding
   * triangulated prices for the indices S2 and S3
   * @param symbol pool symbol of the form "ETH-USD-MATIC"
   * @returns PriceFeedSubmission and prices for S2 and S3. [S2price, 0] if S3 not defined.
   */
  public async fetchPriceSubmissionInfoForPerpetual(
    symbol: string
  ): Promise<{ submission: PriceFeedSubmission; pxS2S3: [number, number] }> {
    // fetch prices from required price-feeds (REST)
    return await this.priceFeedGetter.fetchFeedPriceInfoAndIndicesForPerpetual(symbol);
  }

  /**
   * Get the symbols required as indices for the given perpetual
   * @param symbol of the form ETH-USD-MATIC, specifying the perpetual
   * @returns name of underlying index prices, e.g. ["MATIC-USD", ""]
   */
  public getIndexSymbols(symbol: string): [string, string] {
    // get index
    let staticInfo = this.symbolToPerpStaticInfo.get(symbol);
    if (staticInfo == undefined) {
      throw new Error(`No static info for perpetual with symbol ${symbol}`);
    }
    return [staticInfo.S2Symbol, staticInfo.S3Symbol];
  }

  /**
   * Get the latest prices for a given perpetual from the offchain oracle
   * networks
   * @param symbol perpetual symbol of the form BTC-USD-MATIC
   * @returns array of price feed updates that can be submitted to the smart contract
   * and corresponding price information
   */
  public async fetchLatestFeedPriceInfo(symbol: string): Promise<PriceFeedSubmission> {
    return await this.priceFeedGetter.fetchLatestFeedPriceInfoForPerpetual(symbol);
  }

  /**
   * Get list of required pyth price source IDs for given perpetual
   * @param symbol perpetual symbol, e.g., BTC-USD-MATIC
   * @returns list of required pyth price sources for this perpetual
   */
  public getPriceIds(symbol: string): string[] {
    let perpInfo = this.symbolToPerpStaticInfo.get(symbol);
    if (perpInfo == undefined) {
      throw Error(`Perpetual with symbol ${symbol} not found. Check symbol or use createProxyInstance().`);
    }
    return perpInfo.priceIds;
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

  public static buildMarginAccountFromState(
    symbol: string,
    traderState: ethers.BigNumber[],
    symbolToPerpStaticInfo: Map<string, PerpetualStaticInfo>,
    _pxS2S3: [number, number]
  ): MarginAccount {
    const idx_cash = 3;
    const idx_notional = 4;
    const idx_locked_in = 5;
    const idx_mark_price = 8;
    const idx_lvg = 7;
    const idx_s3 = 9;
    let isEmpty = traderState[idx_notional].eq(0);
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
        _pxS2S3[0],
        symbolToPerpStaticInfo
      );
      fLockedIn = traderState[idx_locked_in];
      side = traderState[idx_locked_in].gt(0) ? BUY_SIDE : SELL_SIDE;
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

  public static async getMarginAccount(
    traderAddr: string,
    symbol: string,
    symbolToPerpStaticInfo: Map<string, PerpetualStaticInfo>,
    _proxyContract: ethers.Contract,
    _pxS2S3: [number, number]
  ): Promise<MarginAccount> {
    let perpId = Number(symbol);
    if (isNaN(perpId)) {
      perpId = PerpetualDataHandler.symbolToPerpetualId(symbol, symbolToPerpStaticInfo);
    }
    let traderState = await _proxyContract.getTraderState(
      perpId,
      traderAddr,
      _pxS2S3.map((x) => floatToABK64x64(x))
    );
    return PerpetualDataHandler.buildMarginAccountFromState(symbol, traderState, symbolToPerpStaticInfo, _pxS2S3);
  }

  protected static async _queryPerpetualPrice(
    symbol: string,
    tradeAmount: number,
    symbolToPerpStaticInfo: Map<string, PerpetualStaticInfo>,
    _proxyContract: ethers.Contract,
    indexPrices: [number, number]
  ): Promise<number> {
    let perpId = PerpetualDataHandler.symbolToPerpetualId(symbol, symbolToPerpStaticInfo);
    let fIndexPrices = indexPrices.map((x) => floatToABK64x64(x == undefined || Number.isNaN(x) ? 0 : x));
    let fPrice = await _proxyContract.queryPerpetualPrice(perpId, floatToABK64x64(tradeAmount), fIndexPrices);
    return ABK64x64ToFloat(fPrice);
  }

  protected static async _queryPerpetualMarkPrice(
    symbol: string,
    symbolToPerpStaticInfo: Map<string, PerpetualStaticInfo>,
    _proxyContract: ethers.Contract,
    indexPrices: [number, number]
  ): Promise<number> {
    let perpId = PerpetualDataHandler.symbolToPerpetualId(symbol, symbolToPerpStaticInfo);
    let [S2, S3] = indexPrices.map((x) => floatToABK64x64(x == undefined || Number.isNaN(x) ? 0 : x));
    let ammState = await _proxyContract.getAMMState(perpId, [S2, S3]);
    return ABK64x64ToFloat(ammState[6].mul(ONE_64x64.add(ammState[8])).div(ONE_64x64));
  }

  protected static async _queryPerpetualState(
    symbol: string,
    symbolToPerpStaticInfo: Map<string, PerpetualStaticInfo>,
    _proxyContract: ethers.Contract,
    indexPrices: [number, number, boolean, boolean]
  ): Promise<PerpetualState> {
    let perpId = PerpetualDataHandler.symbolToPerpetualId(symbol, symbolToPerpStaticInfo);
    let staticInfo = symbolToPerpStaticInfo.get(symbol)!;
    let ccy = symbol.split("-");
    let [S2, S3] = [indexPrices[0], indexPrices[1]];
    if (staticInfo.collateralCurrencyType == CollaterlCCY.BASE) {
      S3 = S2;
    } else if (staticInfo.collateralCurrencyType == CollaterlCCY.QUOTE) {
      S3 = 1;
    }
    let ammState = await _proxyContract.getAMMState(perpId, [S2, S3].map(floatToABK64x64));
    let markPrice = S2 * (1 + ABK64x64ToFloat(ammState[8]));
    let state: PerpetualState = {
      id: perpId,
      state: PERP_STATE_STR[ammState[13]],
      baseCurrency: ccy[0],
      quoteCurrency: ccy[1],
      indexPrice: S2,
      collToQuoteIndexPrice: S3,
      markPrice: markPrice,
      midPrice: ABK64x64ToFloat(ammState[10]),
      currentFundingRateBps: ABK64x64ToFloat(ammState[14]) * 1e4,
      openInterestBC: ABK64x64ToFloat(ammState[11]),
      isMarketClosed: indexPrices[2] || indexPrices[3],
    };
    return state;
  }

  /**
   * Liquidation price
   * @param symbol symbol of the form BTC-USD-MATIC
   * @param traderState BigInt array according to smart contract
   * @param S2 number, index price S2
   * @param symbolToPerpStaticInfo mapping symbol->PerpStaticInfo
   * @returns liquidation mark-price, corresponding collateral/quote conversion
   */
  protected static _calculateLiquidationPrice(
    symbol: string,
    traderState: BigNumber[],
    S2: number,
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
      unpaidFunding = unpaidFunding / S2;
    } else if (perpInfo.collateralCurrencyType == CollaterlCCY.QUANTO) {
      let S3 = S3Liq;
      S3Liq = S3;
      S2Liq = calculateLiquidationPriceCollateralQuanto(lockedInValueQC, position, cashCC, tau, S3, Sm);
      unpaidFunding = unpaidFunding / S3;
    } else {
      S2Liq = calculateLiquidationPriceCollateralQuote(lockedInValueQC, position, cashCC, tau);
    }
    // floor at 0
    S2Liq = S2Liq < 0 ? 0 : S2Liq;
    S3Liq = S3Liq && S3Liq < 0 ? 0 : S3Liq;
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

  /**
   * Converts a smart contract order to a client order
   * @param scOrder Smart contract order
   * @param parentChildIds Optional parent-child dependency
   * @returns Client order that can be submitted to the corresponding LOB
   */
  public static fromSmartContratOrderToClientOrder(
    scOrder: SmartContractOrder,
    parentChildIds?: [string, string]
  ): ClientOrder {
    return {
      flags: scOrder.flags,
      iPerpetualId: scOrder.iPerpetualId,
      brokerFeeTbps: scOrder.brokerFeeTbps,
      traderAddr: scOrder.traderAddr,
      brokerAddr: scOrder.brokerAddr,
      referrerAddr: scOrder.referrerAddr,
      brokerSignature: scOrder.brokerSignature,
      fAmount: scOrder.fAmount,
      fLimitPrice: scOrder.fLimitPrice,
      fTriggerPrice: scOrder.fTriggerPrice,
      fLeverage: scOrder.fLeverage,
      iDeadline: scOrder.iDeadline,
      createdTimestamp: scOrder.createdTimestamp,
      parentChildDigest1: parentChildIds ? parentChildIds[0] : ZERO_ORDER_ID,
      parentChildDigest2: parentChildIds ? parentChildIds[1] : ZERO_ORDER_ID,
    };
  }

  /**
   * Converts a user-friendly order to a client order
   * @param order Order
   * @param parentChildIds Optional parent-child dependency
   * @returns Client order that can be submitted to the corresponding LOB
   */
  public static toClientOrder(
    order: Order,
    traderAddr: string,
    perpStaticInfo: Map<string, PerpetualStaticInfo>,
    parentChildIds?: [string, string]
  ): ClientOrder {
    const scOrder = PerpetualDataHandler.toSmartContractOrder(order, traderAddr, perpStaticInfo);
    return PerpetualDataHandler.fromSmartContratOrderToClientOrder(scOrder, parentChildIds);
  }

  /**
   * Converts an order as stored in the LOB smart contract into a user-friendly order type
   * @param obOrder Order-book contract order type
   * @returns User friendly order struct
   */
  public static fromClientOrder(obOrder: ClientOrder, perpStaticInfo: Map<string, PerpetualStaticInfo>): Order {
    const scOrder = {
      flags: obOrder.flags,
      iPerpetualId: obOrder.iPerpetualId,
      brokerFeeTbps: obOrder.brokerFeeTbps,
      traderAddr: obOrder.traderAddr,
      brokerAddr: obOrder.brokerAddr,
      referrerAddr: obOrder.referrerAddr,
      brokerSignature: obOrder.brokerSignature,
      fAmount: obOrder.fAmount,
      fLimitPrice: obOrder.fLimitPrice,
      fTriggerPrice: obOrder.fTriggerPrice,
      fLeverage: obOrder.fLeverage,
      iDeadline: obOrder.iDeadline,
      createdTimestamp: obOrder.createdTimestamp,
    } as SmartContractOrder;
    const order = PerpetualDataHandler.fromSmartContractOrder(scOrder, perpStaticInfo);
    if (obOrder.parentChildDigest1 != ZERO_ORDER_ID || obOrder.parentChildDigest2 != ZERO_ORDER_ID) {
      order.parentChildOrderIds = [obOrder.parentChildDigest1, obOrder.parentChildDigest2];
    }
    return order;
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
   * Get NodeSDKConfig from a chain ID, known config name, or custom file location..
   * @param configNameOrfileLocation Name of a known default config, or chain ID, or json-file with required variables for config
   * @param version Config version number. Defaults to highest version if name or chain ID are not unique
   * @returns NodeSDKConfig
   */
  public static readSDKConfig(configNameOrChainIdOrFileLocation: string | number, version?: number): NodeSDKConfig {
    let config: NodeSDKConfig | undefined;
    if (typeof configNameOrChainIdOrFileLocation === "number") {
      // user entered a chain ID
      config = this.getConfigByChainId(configNameOrChainIdOrFileLocation, version);
    } else if (typeof configNameOrChainIdOrFileLocation === "string") {
      if (/\.json$/.test(configNameOrChainIdOrFileLocation)) {
        // user entered a string that ends in .json
        config = this.getConfigByLocation(configNameOrChainIdOrFileLocation);
      } else {
        // user entered a name
        config = this.getConfigByName(configNameOrChainIdOrFileLocation, version);
      }
    } else {
      // error
      throw Error(`Please specify a chain ID, config name, or custom file location.`);
    }
    if (config == undefined) {
      throw Error(`Config ${configNameOrChainIdOrFileLocation} not found.`);
    }
    return config;
  }

  /**
   * Get a NodeSDKConfig from its name
   * @param name Name of the known config
   * @param version Version of the config. Defaults to highest available.
   * @returns NodeSDKConfig
   */
  protected static getConfigByName(name: string, version?: number): NodeSDKConfig | undefined {
    let configFile = DEFAULT_CONFIG.filter((c: any) => c.name == name);
    if (configFile.length == 0) {
      throw Error(`No SDK config found with name ${name}.`);
    }
    if (configFile.length == 1) {
      return configFile[0];
    } else {
      if (version === undefined) {
        configFile = configFile.sort((conf) => -conf.version);
        return configFile[0];
      } else {
        return configFile.find((conf) => conf.version === version);
      }
    }
  }

  /**
   * Get a NodeSDKConfig from a json file.
   * @param filename Location of the file
   * @param version Version of the config. Defaults to highest available.
   * @returns NodeSDKConfig
   */
  protected static getConfigByLocation(filename: string) {
    // file path: this throws a warning during build - that's ok, it just won't work in react apps
    let configFile = require(filename) as NodeSDKConfig;
    loadABIs(configFile);
    return configFile;
  }

  /**
   * Get a NodeSDKConfig from its chain Id
   * @param chainId Chain Id
   * @param version Version of the config. Defaults to highest available.
   * @returns NodeSDKConfig
   */
  protected static getConfigByChainId(chainId: number, version?: number) {
    let configFile = DEFAULT_CONFIG.filter((c: any) => c.chainId == chainId);
    if (configFile.length == 0) {
      throw Error(`No SDK config found for chain ID ${chainId}.`);
    }
    if (configFile.length == 1) {
      return configFile[0];
    } else {
      if (version === undefined) {
        configFile = configFile.sort((conf) => -conf.version);
        return configFile[0];
      } else {
        return configFile.find((conf) => conf.version === version);
      }
    }
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

  public getABI(contract: string): ethers.ContractInterface | undefined {
    switch (contract) {
      case "proxy":
        return this.proxyABI;
      case "lob":
        return this.lobABI;
      default:
        return undefined;
    }
  }

  /**
   * Performs basic validity checks on a given order
   * @param order Order struct
   * @param traderAccount Trader account
   * @param perpStaticInfo Symbol to perpetual info map
   */
  protected static checkOrder(
    order: Order,
    traderAccount: MarginAccount,
    perpStaticInfo: Map<string, PerpetualStaticInfo>
  ) {
    // this throws error if not found
    let perpetualId = PerpetualDataHandler.symbolToPerpetualId(order.symbol, perpStaticInfo);

    // check side
    if (order.side != BUY_SIDE && order.side != SELL_SIDE) {
      throw Error(`order side must be ${BUY_SIDE} or ${SELL_SIDE}`);
    }

    // check amount
    let lotSize = perpStaticInfo.get(order.symbol)!.lotSizeBC;
    let curPos =
      traderAccount.side == CLOSED_SIDE
        ? 0
        : (traderAccount.side == BUY_SIDE ? 1 : -1) * traderAccount.positionNotionalBaseCCY;
    let newPos = curPos + (order.side == BUY_SIDE ? 1 : -1) * order.quantity;
    if (Math.abs(order.quantity) < lotSize || (Math.abs(newPos) >= lotSize && Math.abs(newPos) < 10 * lotSize)) {
      throw Error(`trade amount too small: ${order.quantity} ${perpStaticInfo.get(order.symbol)!.S2Symbol}`);
    }

    // check limit price
    if (order.side == BUY_SIDE && order.limitPrice != undefined && order.limitPrice <= 0) {
      throw Error(`invalid limit price for buy order: ${order.limitPrice}`);
    }

    // broker fee
    if (order.brokerFeeTbps != undefined && order.brokerFeeTbps < 0) {
      throw Error(`invalid broker fee: ${order.brokerFeeTbps / 10} bps`);
    }

    // stop price
    if (order.stopPrice != undefined && order.stopPrice < 0) {
      throw Error(`invalid stop price: ${order.stopPrice}`);
    }
  }
}
