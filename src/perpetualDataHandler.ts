import { FormatTypes, Interface } from "@ethersproject/abi";
import { Signer } from "@ethersproject/abstract-signer";
import { BigNumber } from "@ethersproject/bignumber";
import { AddressZero } from "@ethersproject/constants";
import { CallOverrides, Contract, ContractInterface } from "@ethersproject/contracts";
import { Provider, type Network } from "@ethersproject/providers";
import {
  BUY_SIDE,
  CLOSED_SIDE,
  COLLATERAL_CURRENCY_BASE,
  COLLATERAL_CURRENCY_QUOTE,
  CollaterlCCY,
  DEFAULT_CONFIG,
  ERC20_ABI,
  MASK_CLOSE_ONLY,
  MASK_KEEP_POS_LEVERAGE,
  MASK_LIMIT_ORDER,
  MASK_MARKET_ORDER,
  MASK_STOP_ORDER,
  MAX_64x64,
  MULTICALL_ADDRESS,
  ORDER_MAX_DURATION_SEC,
  ORDER_TYPE_LIMIT,
  ORDER_TYPE_MARKET,
  ORDER_TYPE_STOP_LIMIT,
  ORDER_TYPE_STOP_MARKET,
  PERP_STATE_STR,
  SELL_SIDE,
  SYMBOL_LIST,
  ZERO_ADDRESS,
  ZERO_ORDER_ID,
} from "./constants";
import {
  IPerpetualManager__factory,
  LimitOrderBookFactory__factory,
  LimitOrderBook__factory,
  Multicall3__factory,
  OracleFactory__factory,
  type IPerpetualManager,
  type LimitOrderBook,
  type LimitOrderBookFactory,
  type Multicall3,
} from "./contracts";
import { type ERC20Interface } from "./contracts/ERC20";
import { type IPerpetualOrder } from "./contracts/IPerpetualManager";
import { type IClientOrder } from "./contracts/LimitOrderBook";
import {
  ABDK29ToFloat,
  ABK64x64ToFloat,
  calculateLiquidationPriceCollateralBase,
  calculateLiquidationPriceCollateralQuanto,
  calculateLiquidationPriceCollateralQuote,
  div64x64,
  floatToABK64x64,
} from "./d8XMath";
import {
  TypeSafeOrder,
  type ClientOrder,
  type MarginAccount,
  type NodeSDKConfig,
  type Order,
  type PerpetualState,
  type PerpetualStaticInfo,
  type PoolStaticInfo,
  type PriceFeedSubmission,
  type SmartContractOrder,
} from "./nodeSDKTypes";
import PriceFeeds from "./priceFeeds";
import {
  combineFlags,
  containsFlag,
  contractSymbolToSymbol,
  loadConfigAbis,
  symbol4BToLongSymbol,
  to4Chars,
} from "./utils";

/**
 * Parent class for MarketData and WriteAccessHandler that handles
 * common data and chain operations.
 */
export default class PerpetualDataHandler {
  PRICE_UPDATE_FEE_GWEI = 1;
  //map symbol of the form ETH-USD-MATIC into perpetual ID and other static info
  //this is initialized in the createProxyInstance function
  protected symbolToPerpStaticInfo: Map<string, PerpetualStaticInfo>; // maps symbol of the form BTC-USD-MATIC to static info
  protected perpetualIdToSymbol: Map<number, string>; // maps unique perpetual id to symbol of the form BTC-USD-MATIC
  protected poolStaticInfos: Array<PoolStaticInfo>;
  protected symbolList: Map<string, string>; //mapping 4-digit symbol <-> long format

  // config
  public config: NodeSDKConfig;
  //map margin token of the form MATIC or ETH or USDC into
  //the address of the margin token
  protected symbolToTokenAddrMap: Map<string, string>;
  public chainId: number;
  protected proxyContract: IPerpetualManager | null = null;
  protected proxyABI: ContractInterface;
  protected proxyAddr: string;
  // limit order book
  protected lobFactoryContract: LimitOrderBookFactory | null = null;
  protected lobFactoryABI: ContractInterface;
  protected lobFactoryAddr: string | undefined;
  protected lobABI: ContractInterface;
  // share token
  protected shareTokenABI: ContractInterface;
  // multicall
  protected multicall: Multicall3 | null = null;
  // provider
  protected nodeURL: string;
  protected provider: Provider | null = null;
  // pyth
  protected pythAddr: string | undefined;

  protected signerOrProvider: Signer | Provider | null = null;
  protected priceFeedGetter: PriceFeeds;

  // pools are numbered consecutively starting at 1
  // nestedPerpetualIDs contains an array for each pool
  // each pool-array contains perpetual ids
  protected nestedPerpetualIDs: number[][];

  public constructor(config: NodeSDKConfig) {
    this.config = config;
    this.symbolToPerpStaticInfo = new Map<string, PerpetualStaticInfo>();
    this.poolStaticInfos = new Array<PoolStaticInfo>();
    this.symbolToTokenAddrMap = new Map<string, string>();
    this.perpetualIdToSymbol = new Map<number, string>();
    this.nestedPerpetualIDs = new Array<Array<number>>();
    this.chainId = config.chainId;
    this.proxyAddr = config.proxyAddr;
    this.nodeURL = config.nodeURL;
    this.proxyABI = config.proxyABI!;
    this.lobFactoryABI = config.lobFactoryABI!;
    this.lobABI = config.lobABI!;
    this.shareTokenABI = config.shareTokenABI!;
    this.symbolList = SYMBOL_LIST;
    this.priceFeedGetter = new PriceFeeds(this, config.priceFeedConfigNetwork);
  }

  protected async initContractsAndData(signerOrProvider: Signer | Provider, overrides?: CallOverrides) {
    this.signerOrProvider = signerOrProvider;
    // check network
    let network: Network;
    try {
      if (signerOrProvider instanceof Signer) {
        network = await signerOrProvider.provider!.getNetwork();
      } else {
        network = await signerOrProvider.getNetwork();
      }
    } catch (error: any) {
      console.error(error);
      throw new Error(`Unable to connect to network.`);
    }
    if (network.chainId !== this.chainId) {
      throw new Error(`Provider: chain id ${network.chainId} does not match config (${this.chainId})`);
    }
    this.proxyContract = IPerpetualManager__factory.connect(this.proxyAddr, signerOrProvider);
    this.multicall = Multicall3__factory.connect(MULTICALL_ADDRESS, this.signerOrProvider);
    await this._fillSymbolMaps(overrides);
  }

  /**
   * Returns the order-book contract for the symbol if found or fails
   * @param symbol symbol of the form ETH-USD-MATIC
   * @returns order book contract for the perpetual
   */
  public getOrderBookContract(symbol: string): Contract & LimitOrderBook {
    let orderBookAddr = this.symbolToPerpStaticInfo.get(symbol)?.limitOrderBookAddr;
    console.log("orderBookAddr", orderBookAddr);
    if (orderBookAddr == "" || orderBookAddr == undefined || this.signerOrProvider == null) {
      throw Error(`no limit order book found for ${symbol} or no signer`);
    }
    let lobContract = LimitOrderBook__factory.connect(orderBookAddr, this.signerOrProvider);
    return lobContract;
  }

  /**
   * Called when initializing. This function fills this.symbolToTokenAddrMap,
   * and this.nestedPerpetualIDs and this.symbolToPerpStaticInfo
   *
   */
  protected async _fillSymbolMaps(overrides?: CallOverrides) {
    if (this.proxyContract == null || this.multicall == null || this.signerOrProvider == null) {
      throw new Error("proxy or multicall not defined");
    }
    let poolInfo = await PerpetualDataHandler.getPoolStaticInfo(this.proxyContract, overrides);

    this.nestedPerpetualIDs = poolInfo.nestedPerpetualIDs;

    const IERC20 = new Interface(ERC20_ABI) as ERC20Interface;

    const proxyCalls: Multicall3.Call3Struct[] = poolInfo.poolMarginTokenAddr.map((tokenAddr) => ({
      target: tokenAddr,
      allowFailure: true,
      callData: IERC20.encodeFunctionData("decimals"),
    }));
    proxyCalls.push({
      target: this.proxyAddr,
      allowFailure: false,
      callData: this.proxyContract.interface.encodeFunctionData("getOrderBookFactoryAddress"),
    });

    // multicall
    const encodedResults = await this.multicall.callStatic.aggregate3(proxyCalls, overrides || {});

    // decimals
    for (let j = 0; j < poolInfo.nestedPerpetualIDs.length; j++) {
      const decimals =
        poolInfo.poolMarginTokenAddr[j] == ZERO_ADDRESS
          ? undefined
          : (IERC20.decodeFunctionResult("decimals", encodedResults[j].returnData)[0] as number);
      let info: PoolStaticInfo = {
        poolId: j + 1,
        poolMarginSymbol: "", //fill later
        poolMarginTokenAddr: poolInfo.poolMarginTokenAddr[j],
        poolMarginTokenDecimals: decimals,
        shareTokenAddr: poolInfo.poolShareTokenAddr[j],
        oracleFactoryAddr: poolInfo.oracleFactory,
        isRunning: poolInfo.poolShareTokenAddr[j] != AddressZero,
      };
      this.poolStaticInfos.push(info);
    }
    //pyth
    const oracle = OracleFactory__factory.connect(poolInfo.oracleFactory, this.signerOrProvider);
    this.pythAddr = await oracle.pyth();

    // order book factory
    this.lobFactoryAddr = this.proxyContract.interface.decodeFunctionResult(
      "getOrderBookFactoryAddress",
      encodedResults[encodedResults.length - 1].returnData
    )[0] as string;
    this.lobFactoryContract = LimitOrderBookFactory__factory.connect(this.lobFactoryAddr, this.signerOrProvider);

    let perpStaticInfos = await PerpetualDataHandler.getPerpetualStaticInfo(
      this.proxyContract,
      this.nestedPerpetualIDs,
      this.symbolList,
      overrides
    );

    let requiredPairs = new Set<string>();
    // 1) determine pool currency based on its perpetuals
    // 2) determine which triangulations we need
    // 3) fill mapping this.symbolToPerpStaticInf
    for (let j = 0; j < perpStaticInfos.length; j++) {
      const perp = perpStaticInfos[j];
      requiredPairs.add(perp.S2Symbol);
      if (perp.S3Symbol != "") {
        requiredPairs.add(perp.S3Symbol);
      }
      let poolCCY = this.poolStaticInfos[perp.poolId - 1].poolMarginSymbol;
      if (poolCCY == "") {
        //not already filled
        const [base, quote] = perp.S2Symbol.split("-");
        const base3 = perp.S3Symbol.split("-")[0];
        // we find out the pool currency by looking at all perpetuals
        // from the perpetual.
        if (perp.collateralCurrencyType == COLLATERAL_CURRENCY_BASE) {
          poolCCY = base;
        } else if (perp.collateralCurrencyType == COLLATERAL_CURRENCY_QUOTE) {
          poolCCY = quote;
        } else {
          poolCCY = base3;
        }
        // set pool currency
        this.poolStaticInfos[perp.poolId - 1].poolMarginSymbol = poolCCY;
        // push pool margin token address into map
        this.symbolToTokenAddrMap.set(poolCCY, this.poolStaticInfos[perp.poolId - 1].poolMarginTokenAddr);
      }
      let currentSymbol3 = perp.S2Symbol + "-" + poolCCY;
      this.symbolToPerpStaticInfo.set(currentSymbol3, perpStaticInfos[j]);
    }
    // pre-calculate all triangulation paths so we can easily get from
    // the prices of price-feeds to the index price required, e.g.
    // BTC-USDC : BTC-USD / USDC-USD
    this.priceFeedGetter.initializeTriangulations(requiredPairs);

    // fill this.perpetualIdToSymbol
    for (let [key, info] of this.symbolToPerpStaticInfo) {
      this.perpetualIdToSymbol.set(info.id, key);
    }
  }

  public getAllMappings() {
    return {
      nestedPerpetualIDs: this.nestedPerpetualIDs,
      poolStaticInfos: this.poolStaticInfos,
      symbolToTokenAddrMap: this.symbolToTokenAddrMap,
      symbolToPerpStaticInfo: this.symbolToPerpStaticInfo,
      perpetualIdToSymbol: this.perpetualIdToSymbol,
    };
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
   * Get pool Id given a pool symbol. Pool IDs start at 1.
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
    return this.perpetualIdToSymbol.get(perpId);
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

  /**
   * Get perpetual symbols for a given pool
   * @param poolSymbol pool symbol such as "MATIC"
   * @returns array of perpetual symbols in this pool
   */
  public getPerpetualSymbolsInPool(poolSymbol: string): string[] {
    const j = PerpetualDataHandler._getPoolIdFromSymbol(poolSymbol, this.poolStaticInfos);
    const perpIds = this.nestedPerpetualIDs[j - 1];
    const perpSymbols = perpIds.map((k) => {
      let s = this.getSymbolFromPerpId(k);
      if (s == undefined) {
        return "";
      }
      return s;
    });
    return perpSymbols;
  }

  public getNestedPerpetualIds(): number[][] {
    return this.nestedPerpetualIDs;
  }

  /**
   * Collect all perpetuals static info
   * @param {ethers.Contract} _proxyContract perpetuals contract with getter
   * @param {Array<Array<number>>} nestedPerpetualIDs perpetual id-array for each pool
   * @param {Map<string, string>} symbolList mapping of symbols to convert long-format <-> blockchain-format
   * @returns array with PerpetualStaticInfo for each perpetual
   */
  public static async getPerpetualStaticInfo(
    _proxyContract: IPerpetualManager,
    nestedPerpetualIDs: Array<Array<number>>,
    symbolList: Map<string, string>,
    overrides?: CallOverrides
  ): Promise<Array<PerpetualStaticInfo>> {
    // flatten perpetual ids into chunks
    const chunkSize = 10;
    let ids = PerpetualDataHandler.nestedIDsToChunks(chunkSize, nestedPerpetualIDs);
    // query blockchain in chunks
    const infoArr = new Array<PerpetualStaticInfo>();
    for (let k = 0; k < ids.length; k++) {
      let perpInfos = await _proxyContract.getPerpetualStaticInfo(ids[k], overrides || {});
      for (let j = 0; j < perpInfos.length; j++) {
        let base = contractSymbolToSymbol(perpInfos[j].S2BaseCCY, symbolList);
        let quote = contractSymbolToSymbol(perpInfos[j].S2QuoteCCY, symbolList);
        let base3 = contractSymbolToSymbol(perpInfos[j].S3BaseCCY, symbolList);
        let quote3 = contractSymbolToSymbol(perpInfos[j].S3QuoteCCY, symbolList);
        let sym2 = base + "-" + quote;
        let sym3 = base3 == "" ? "" : base3 + "-" + quote3;
        let info: PerpetualStaticInfo = {
          id: perpInfos[j].id,
          poolId: Math.floor(perpInfos[j].id / 100_000), //uint24(_iPoolId) * 100_000 + iPerpetualIndex;
          limitOrderBookAddr: perpInfos[j].limitOrderBookAddr,
          initialMarginRate: ABDK29ToFloat(perpInfos[j].fInitialMarginRate),
          maintenanceMarginRate: ABDK29ToFloat(perpInfos[j].fMaintenanceMarginRate),
          collateralCurrencyType: perpInfos[j].collCurrencyType,
          S2Symbol: sym2,
          S3Symbol: sym3,
          lotSizeBC: ABK64x64ToFloat(perpInfos[j].fLotSizeBC),
          referralRebate: ABK64x64ToFloat(perpInfos[j].fReferralRebateCC),
          priceIds: perpInfos[j].priceIds,
        };
        infoArr.push(info);
      }
    }
    return infoArr;
  }

  /**
   * Breaks up an array of nested arrays into chunks of a specified size.
   * @param {number} chunkSize The size of each chunk.
   * @param {number[][]} nestedIDs The array of nested arrays to chunk.
   * @returns {number[][]} An array of subarrays, each containing `chunkSize` or fewer elements from `nestedIDs`.
   */
  public static nestedIDsToChunks(chunkSize: number, nestedIDs: Array<Array<number>>): Array<Array<number>> {
    const chunkIDs: number[][] = [];
    let currentChunk: number[] = [];
    for (let k = 0; k < nestedIDs.length; k++) {
      const currentPoolIds = nestedIDs[k];
      for (let j = 0; j < currentPoolIds.length; j++) {
        currentChunk.push(currentPoolIds[j]);
        if (currentChunk.length === chunkSize) {
          chunkIDs.push(currentChunk);
          currentChunk = [];
        }
      }
    }
    if (currentChunk.length > 0) {
      chunkIDs.push(currentChunk);
    }
    return chunkIDs;
  }

  public static async getPoolStaticInfo(
    _proxyContract: IPerpetualManager,
    overrides?: CallOverrides
  ): Promise<{
    nestedPerpetualIDs: Array<Array<number>>;
    poolShareTokenAddr: Array<string>;
    poolMarginTokenAddr: Array<string>;
    oracleFactory: string;
  }> {
    let idxFrom = 1;
    const len = 10;
    let lenReceived = 10;
    let nestedPerpetualIDs: Array<Array<number>> = [];
    let poolShareTokenAddr: Array<string> = [];
    let poolMarginTokenAddr: Array<string> = [];
    let oracleFactory: string = "";
    while (lenReceived == len) {
      let res = await _proxyContract.getPoolStaticInfo(idxFrom, idxFrom + len - 1, overrides || {});
      lenReceived = res.length;
      nestedPerpetualIDs = nestedPerpetualIDs.concat(res[0]);
      poolShareTokenAddr = res[1];
      poolMarginTokenAddr = res[2];
      oracleFactory = res[3];
      idxFrom = idxFrom + len;
    }
    return {
      nestedPerpetualIDs: nestedPerpetualIDs,
      poolShareTokenAddr: poolShareTokenAddr,
      poolMarginTokenAddr: poolMarginTokenAddr,
      oracleFactory: oracleFactory,
    };
  }

  public static buildMarginAccountFromState(
    symbol: string,
    traderState: BigNumber[],
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
      entryPrice = ABK64x64ToFloat(div64x64(fLockedIn, traderState[idx_notional]).abs());
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

  /**
   * Get trader state from the blockchain and parse into a human-readable margin account
   * @param traderAddr Trader address
   * @param symbol Perpetual symbol
   * @param symbolToPerpStaticInfo Symbol to perp static info mapping
   * @param _proxyContract Proxy contract instance
   * @param _pxS2S3 Prices [S2, S3]
   * @param overrides Optional overrides for eth_call
   * @returns A Margin account
   */
  public static async getMarginAccount(
    traderAddr: string,
    symbol: string,
    symbolToPerpStaticInfo: Map<string, PerpetualStaticInfo>,
    _proxyContract: IPerpetualManager,
    _pxS2S3: [number, number],
    overrides?: CallOverrides
  ): Promise<MarginAccount> {
    let perpId = Number(symbol);
    if (isNaN(perpId)) {
      perpId = PerpetualDataHandler.symbolToPerpetualId(symbol, symbolToPerpStaticInfo);
    }
    let traderState = await _proxyContract.getTraderState(
      perpId,
      traderAddr,
      _pxS2S3.map((x) => floatToABK64x64(x)) as [BigNumber, BigNumber],
      overrides || {}
    );
    return PerpetualDataHandler.buildMarginAccountFromState(symbol, traderState, symbolToPerpStaticInfo, _pxS2S3);
  }

  /**
   * Get trader states from the blockchain and parse into a list of human-readable margin accounts
   * @param traderAddrs List of trader addresses
   * @param symbols List of symbols
   * @param symbolToPerpStaticInfo Symbol to perp static info mapping
   * @param _multicall Multicall3 contract instance
   * @param _proxyContract Proxy contract instance
   * @param _pxS2S3s  List of price pairs, [[S2, S3] (1st perp), [S2, S3] (2nd perp), ... ]
   * @param overrides Optional eth_call overrides
   * @returns List of margin accounts
   */
  public static async getMarginAccounts(
    traderAddrs: string[],
    symbols: string[],
    symbolToPerpStaticInfo: Map<string, PerpetualStaticInfo>,
    _multicall: Multicall3,
    _proxyContract: IPerpetualManager,
    _pxS2S3s: number[][],
    overrides?: CallOverrides
  ): Promise<MarginAccount[]> {
    if (
      traderAddrs.length != symbols.length ||
      traderAddrs.length != _pxS2S3s.length ||
      symbols.length != _pxS2S3s.length
    ) {
      throw new Error("traderAddr, symbol and pxS2S3 should all have the same length");
    }
    const proxyCalls: Multicall3.Call3Struct[] = traderAddrs.map((_addr, i) => ({
      target: _proxyContract.address,
      allowFailure: true,
      callData: _proxyContract.interface.encodeFunctionData("getTraderState", [
        PerpetualDataHandler.symbolToPerpetualId(symbols[i], symbolToPerpStaticInfo),
        _addr,
        _pxS2S3s[i].map((x) => floatToABK64x64(x)) as [BigNumber, BigNumber],
      ]),
    }));
    const encodedResults = await _multicall.callStatic.aggregate3(proxyCalls, overrides || {});
    const traderStates: BigNumber[][] = encodedResults.map(({ success, returnData }, i) => {
      if (!success) throw new Error(`Failed to get perp info for ${symbols[i]}`);
      return _proxyContract.interface.decodeFunctionResult("getTraderState", returnData)[0];
    });
    return traderStates.map((traderState, i) =>
      PerpetualDataHandler.buildMarginAccountFromState(symbols[i], traderState, symbolToPerpStaticInfo, [
        _pxS2S3s[i][0],
        _pxS2S3s[i][1],
      ])
    );
  }

  protected static async _queryPerpetualPrice(
    symbol: string,
    tradeAmount: number,
    symbolToPerpStaticInfo: Map<string, PerpetualStaticInfo>,
    _proxyContract: IPerpetualManager,
    indexPrices: [number, number],
    overrides?: CallOverrides
  ): Promise<number> {
    let perpId = PerpetualDataHandler.symbolToPerpetualId(symbol, symbolToPerpStaticInfo);
    let fIndexPrices = indexPrices.map((x) => floatToABK64x64(x == undefined || Number.isNaN(x) ? 0 : x));
    let fPrice = await _proxyContract.queryPerpetualPrice(
      perpId,
      floatToABK64x64(tradeAmount),
      fIndexPrices as [BigNumber, BigNumber],
      overrides || {}
    );
    return ABK64x64ToFloat(fPrice);
  }

  protected static async _queryPerpetualMarkPrice(
    symbol: string,
    symbolToPerpStaticInfo: Map<string, PerpetualStaticInfo>,
    _proxyContract: IPerpetualManager,
    indexPrices: [number, number],
    overrides?: CallOverrides
  ): Promise<number> {
    let perpId = PerpetualDataHandler.symbolToPerpetualId(symbol, symbolToPerpStaticInfo);
    let [S2, S3] = indexPrices.map((x) => floatToABK64x64(x == undefined || Number.isNaN(x) ? 0 : x));
    let ammState = await _proxyContract.getAMMState(perpId, [S2, S3], overrides || {});
    // ammState[6] == S2 == indexPrices[0] up to rounding errors (indexPrices is most accurate)
    return indexPrices[0] * (1 + ABK64x64ToFloat(ammState[8]));
  }

  protected static async _queryPerpetualState(
    symbol: string,
    symbolToPerpStaticInfo: Map<string, PerpetualStaticInfo>,
    _proxyContract: IPerpetualManager,
    indexPrices: [number, number, boolean, boolean],
    overrides?: CallOverrides
  ): Promise<PerpetualState> {
    let perpId = PerpetualDataHandler.symbolToPerpetualId(symbol, symbolToPerpStaticInfo);
    let staticInfo = symbolToPerpStaticInfo.get(symbol)!;
    let [S2, S3] = [indexPrices[0], indexPrices[1]];
    if (staticInfo.collateralCurrencyType == CollaterlCCY.BASE) {
      S3 = S2;
    } else if (staticInfo.collateralCurrencyType == CollaterlCCY.QUOTE) {
      S3 = 1;
    }
    let ammState = await _proxyContract.getAMMState(
      perpId,
      [S2, S3].map(floatToABK64x64) as [BigNumber, BigNumber],
      overrides || {}
    );
    return PerpetualDataHandler._parseAMMState(symbol, ammState, indexPrices, symbolToPerpStaticInfo);
  }

  protected static _parseAMMState(
    symbol: string,
    ammState: BigNumber[],
    indexPrices: [number, number, boolean, boolean],
    symbolToPerpStaticInfo: Map<string, PerpetualStaticInfo>
  ) {
    let perpId = PerpetualDataHandler.symbolToPerpetualId(symbol, symbolToPerpStaticInfo);
    let staticInfo = symbolToPerpStaticInfo.get(symbol)!;
    let ccy = symbol.split("-");
    let [S2, S3] = [indexPrices[0], indexPrices[1]];
    if (staticInfo.collateralCurrencyType == CollaterlCCY.BASE) {
      S3 = S2;
    } else if (staticInfo.collateralCurrencyType == CollaterlCCY.QUOTE) {
      S3 = 1;
    }
    let markPrice = S2 * (1 + ABK64x64ToFloat(ammState[8]));
    let state: PerpetualState = {
      id: perpId,
      state: PERP_STATE_STR[ammState[13].toNumber()],
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
    // const idx_s2 = 10;
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
    order: SmartContractOrder | IPerpetualOrder.OrderStruct,
    symbolToPerpInfoMap: Map<string, PerpetualStaticInfo>
  ): Order {
    // find symbol of perpetual id
    let symbol = PerpetualDataHandler._getByValue(symbolToPerpInfoMap, order.iPerpetualId, "id");
    if (symbol == undefined) {
      throw Error(`Perpetual id ${order.iPerpetualId} not found. Check with marketData.exchangeInfo().`);
    }
    let side = order.fAmount > BigNumber.from(0) ? BUY_SIDE : SELL_SIDE;
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
      type: PerpetualDataHandler._flagToOrderType(BigNumber.from(order.flags), BigNumber.from(order.fLimitPrice)),
      quantity: Math.abs(ABK64x64ToFloat(BigNumber.from(order.fAmount))),
      reduceOnly: containsFlag(BigNumber.from(order.flags), MASK_CLOSE_ONLY),
      limitPrice: limitPrice,
      keepPositionLvg: containsFlag(BigNumber.from(order.flags), MASK_KEEP_POS_LEVERAGE),
      brokerFeeTbps: order.brokerFeeTbps == 0 ? undefined : Number(order.brokerFeeTbps),
      brokerAddr: order.brokerAddr == ZERO_ADDRESS ? undefined : order.brokerAddr,
      brokerSignature: order.brokerSignature == "0x" ? undefined : order.brokerSignature,
      stopPrice: stopPrice,
      leverage: Number(order.leverageTDR) / 100,
      deadline: Number(order.iDeadline),
      executionTimestamp: Number(order.executionTimestamp),
      submittedTimestamp: Number(order.submittedTimestamp),
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
    // this revers if order is invalid
    PerpetualDataHandler.checkOrder(order, perpStaticInfo);
    // translate order
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
      iPerpetualId: perpetualId,
      brokerFeeTbps: order.brokerFeeTbps == undefined ? 0 : order.brokerFeeTbps,
      traderAddr: traderAddr,
      brokerAddr: order.brokerAddr == undefined ? ZERO_ADDRESS : order.brokerAddr,
      executorAddr: ZERO_ADDRESS,
      brokerSignature: brokerSig,
      fAmount: fAmount,
      fLimitPrice: fLimitPrice,
      fTriggerPrice: fTriggerPrice,
      leverageTDR: order.leverage == undefined ? 0 : Math.round(100 * order.leverage),
      iDeadline: Math.round(iDeadline),
      executionTimestamp: Math.round(order.executionTimestamp),
      submittedTimestamp: 0,
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
      executorAddr: scOrder.executorAddr,
      brokerSignature: scOrder.brokerSignature,
      fAmount: scOrder.fAmount,
      fLimitPrice: scOrder.fLimitPrice,
      fTriggerPrice: scOrder.fTriggerPrice,
      leverageTDR: scOrder.leverageTDR,
      iDeadline: scOrder.iDeadline,
      executionTimestamp: scOrder.executionTimestamp,
      parentChildDigest1: parentChildIds ? parentChildIds[0] : ZERO_ORDER_ID,
      parentChildDigest2: parentChildIds ? parentChildIds[1] : ZERO_ORDER_ID,
      callbackTarget: ZERO_ADDRESS,
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
  public static fromClientOrder(
    obOrder: IClientOrder.ClientOrderStruct | IClientOrder.ClientOrderStructOutput,
    perpStaticInfo: Map<string, PerpetualStaticInfo>
  ): Order {
    const scOrder = {
      flags: obOrder.flags,
      iPerpetualId: obOrder.iPerpetualId,
      brokerFeeTbps: obOrder.brokerFeeTbps,
      traderAddr: obOrder.traderAddr,
      brokerAddr: obOrder.brokerAddr,
      brokerSignature: obOrder.brokerSignature,
      fAmount: obOrder.fAmount,
      fLimitPrice: obOrder.fLimitPrice,
      fTriggerPrice: obOrder.fTriggerPrice,
      leverageTDR: obOrder.leverageTDR,
      iDeadline: obOrder.iDeadline,
      executionTimestamp: obOrder.executionTimestamp,
    } as SmartContractOrder;
    const order = PerpetualDataHandler.fromSmartContractOrder(scOrder, perpStaticInfo);
    if (
      obOrder.parentChildDigest1.toString() != ZERO_ORDER_ID ||
      obOrder.parentChildDigest2.toString() != ZERO_ORDER_ID
    ) {
      order.parentChildOrderIds = [obOrder.parentChildDigest1.toString(), obOrder.parentChildDigest2.toString()];
    }
    return order;
  }

  private static _flagToOrderType(orderFlags: BigNumber, orderLimitPrice: BigNumber): string {
    let flag = BigNumber.from(orderFlags);
    let isLimit = containsFlag(flag, MASK_LIMIT_ORDER);
    let hasLimit = !BigNumber.from(orderLimitPrice).eq(0) || !BigNumber.from(orderLimitPrice).eq(MAX_64x64);
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
    // eslint-disable-next-line
    let configFile = require(filename) as NodeSDKConfig;
    loadConfigAbis(configFile);
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
  protected static _getABIFromContract(contract: Contract, functionName: string): string {
    return contract.interface.getFunction(functionName).format(FormatTypes.full);
  }

  /**
   * Gets the pool index (starting at 0 in exchangeInfo, not ID!) corresponding to a given symbol.
   * @param symbol Symbol of the form ETH-USD-MATIC
   * @returns Pool index
   */
  public getPoolStaticInfoIndexFromSymbol(symbol: string): number {
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

  /**
   *
   * @param symbol Symbol of the form USDC
   * @returns Address of the corresponding token
   */
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

  /**
   *
   * @param symbol Symbol of the form USDC
   * @returns Decimals of the corresponding token
   */
  public getMarginTokenDecimalsFromSymbol(symbol: string): number | undefined {
    let pools = this.poolStaticInfos!;
    let poolId = PerpetualDataHandler._getPoolIdFromSymbol(symbol, this.poolStaticInfos);
    let k = 0;
    while (k < pools.length) {
      if (pools[k].poolId == poolId) {
        // pool found
        return pools[k].poolMarginTokenDecimals;
      }
      k++;
    }
    return undefined;
  }

  /**
   * Get ABI for LimitOrderBook, Proxy, or Share Pool Token
   * @param contract name of contract: proxy|lob|sharetoken
   * @returns ABI for the requested contract
   */
  public getABI(contract: string): ContractInterface | undefined {
    switch (contract) {
      case "proxy":
        return this.proxyABI;
      case "lob":
        return this.lobABI;
      case "sharetoken":
        return this.shareTokenABI;
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
    // traderAccount: MarginAccount,
    perpStaticInfo: Map<string, PerpetualStaticInfo>
  ) {
    // check side
    if (order.side != BUY_SIDE && order.side != SELL_SIDE) {
      throw Error(`order side must be ${BUY_SIDE} or ${SELL_SIDE}`);
    }

    // check amount
    let lotSize = perpStaticInfo.get(order.symbol)!.lotSizeBC;
    // let curPos =
    //   traderAccount.side == CLOSED_SIDE
    //     ? 0
    //     : (traderAccount.side == BUY_SIDE ? 1 : -1) * traderAccount.positionNotionalBaseCCY;
    // let newPos = curPos + (order.side == BUY_SIDE ? 1 : -1) * order.quantity;
    // if (Math.abs(order.quantity) < lotSize || (Math.abs(newPos) >= lotSize && Math.abs(newPos) < 10 * lotSize)) {
    if (Math.abs(order.quantity) < lotSize) {
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

  /**
   * Converts a client order (with BigNumberish types) to a type-safe order (with number/bigint types)
   * @param order Client order
   * @returns Order that can be submitted to the corresponding LOB via ethers v6 or viem
   */
  public static fromClientOrderToTypeSafeOrder(order: ClientOrder): TypeSafeOrder {
    return {
      iPerpetualId: +order.iPerpetualId.toString(),
      fLimitPrice: BigInt(BigNumber.from(order.fLimitPrice).toString()),
      leverageTDR: +order.leverageTDR.toString(),
      executionTimestamp: +order.executionTimestamp.toString(),
      flags: BigInt(BigNumber.from(order.flags).toString()),
      iDeadline: +order.iDeadline.toString(),
      brokerAddr: order.brokerAddr,
      fTriggerPrice: BigInt(BigNumber.from(order.fTriggerPrice).toString()),
      fAmount: BigInt(BigNumber.from(order.fAmount).toString()),
      parentChildDigest1: order.parentChildDigest1,
      traderAddr: order.traderAddr,
      parentChildDigest2: order.parentChildDigest2,
      brokerFeeTbps: +order.brokerFeeTbps.toString(),
      brokerSignature: order.brokerSignature.toString(),
      callbackTarget: order.callbackTarget,
    };
  }
}
