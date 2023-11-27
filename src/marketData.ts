import { Interface } from "@ethersproject/abi";
import { BigNumber } from "@ethersproject/bignumber";
import type { CallOverrides, Contract } from "@ethersproject/contracts";
import { Provider, StaticJsonRpcProvider } from "@ethersproject/providers";
import { formatUnits } from "@ethersproject/units";
import {
  BUY_SIDE,
  CLOSED_SIDE,
  COLLATERAL_CURRENCY_BASE,
  COLLATERAL_CURRENCY_QUANTO,
  CollaterlCCY,
  ERC20_ABI,
  MULTICALL_ADDRESS,
  OrderStatus,
  ORDER_TYPE_MARKET,
  PERP_STATE_STR,
  SELL_SIDE,
  ZERO_ADDRESS,
  ZERO_ORDER_ID,
} from "./constants";
import {
  ERC20__factory,
  IPerpetualManager__factory,
  LimitOrderBook__factory,
  Multicall3__factory,
  type IPerpetualManager,
  type LimitOrderBook,
  type Multicall3,
} from "./contracts";
import { type ERC20Interface } from "./contracts/ERC20";
import { type PerpStorage } from "./contracts/IPerpetualManager";
import { type IClientOrder } from "./contracts/LimitOrderBook";
import {
  ABK64x64ToFloat,
  calculateLiquidationPriceCollateralBase,
  calculateLiquidationPriceCollateralQuanto,
  calculateLiquidationPriceCollateralQuote,
  dec18ToFloat,
  decNToFloat,
  floatToABK64x64,
  getDepositAmountForLvgTrade,
  getMaxSignedPositionSize,
} from "./d8XMath";
import {
  type ExchangeInfo,
  type MarginAccount,
  type NodeSDKConfig,
  type Order,
  type PerpetualState,
  type PerpetualStaticInfo,
  type PoolState,
  type PoolStaticInfo,
  type SmartContractOrder,
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
   *   // load configuration for Polygon zkEVM (testnet)
   *   const config = PerpetualDataHandler.readSDKConfig("zkevmTestnet");
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
   * @param provider optional provider to perform blockchain calls
   */
  public async createProxyInstance(provider?: Provider, overrides?: CallOverrides): Promise<void>;

  /**
   * Initialize the marketData-Class with this function
   * to create instance of D8X perpetual contract and gather information
   * about perpetual currencies
   * @param marketData Initialized market data object to save on blokchain calls
   */
  public async createProxyInstance(marketData: MarketData): Promise<void>;

  /**
   * Initialize the marketData-Class with this function
   * to create instance of D8X perpetual contract and gather information
   * about perpetual currencies
   * @param providerOrMarketData optional provider or existing market data instance
   */
  public async createProxyInstance(
    providerOrMarketData?: Provider | MarketData,
    overrides?: CallOverrides
  ): Promise<void> {
    if (providerOrMarketData == undefined || Provider.isProvider(providerOrMarketData)) {
      this.provider = providerOrMarketData ?? new StaticJsonRpcProvider(this.nodeURL);
      await this.initContractsAndData(this.provider, overrides);
    } else {
      const mktData = providerOrMarketData;
      this.nodeURL = mktData.config.nodeURL;
      this.provider = new StaticJsonRpcProvider(mktData.config.nodeURL);
      this.proxyContract = IPerpetualManager__factory.connect(mktData.getProxyAddress(), this.provider);
      this.multicall = Multicall3__factory.connect(MULTICALL_ADDRESS, this.provider);
      ({
        nestedPerpetualIDs: this.nestedPerpetualIDs,
        poolStaticInfos: this.poolStaticInfos,
        symbolToTokenAddrMap: this.symbolToTokenAddrMap,
        symbolToPerpStaticInfo: this.symbolToPerpStaticInfo,
        perpetualIdToSymbol: this.perpetualIdToSymbol,
      } = mktData.getAllMappings());
      this.priceFeedGetter.setTriangulations(mktData.getTriangulations());
      this.signerOrProvider = this.provider;
    }
  }

  /**
   * Get the proxy address
   * @returns {string} Address of the perpetual proxy contract
   */
  public getProxyAddress(): string {
    if (this.proxyContract == null) {
      throw Error("no proxy contract initialized. Use createProxyInstance().");
    }
    return this.proxyContract.address;
  }

  /**
   * Get the pre-computed triangulations
   * @returns Triangulations
   */
  public getTriangulations() {
    return this.priceFeedGetter.getTriangulations();
  }

  /**
   * Convert the smart contract output of an order into a convenient format of type "Order"
   * @param {SmartContractOrder} smOrder SmartContractOrder, as obtained e.g., by PerpetualLimitOrderCreated event
   * @returns {Order} more convenient format of order, type "Order"
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
   *   const config = PerpetualDataHandler.readSDKConfig("zkevmTestnet");
   *   let mktData = new MarketData(config);
   *   await mktData.createProxyInstance();
   *   // Get contract instance
   *   let proxy = await mktData.getReadOnlyProxyInstance();
   *   console.log(proxy);
   * }
   * main();
   *
   * @returns {Contract} read-only proxy instance
   */
  public getReadOnlyProxyInstance(): Contract & IPerpetualManager {
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
   *   const config = PerpetualDataHandler.readSDKConfig("zkevmTestnet");
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
  public async exchangeInfo(overrides?: CallOverrides & { rpcURL?: string }): Promise<ExchangeInfo> {
    if (this.proxyContract == null || this.multicall == null) {
      throw Error("no proxy contract initialized. Use createProxyInstance().");
    }
    let rpcURL: string | undefined;
    if (overrides) {
      ({ rpcURL, ...overrides } = overrides);
    }
    const provider = new StaticJsonRpcProvider(rpcURL ?? this.nodeURL);
    return await MarketData._exchangeInfo(
      IPerpetualManager__factory.connect(this.proxyAddr, provider),
      Multicall3__factory.connect(MULTICALL_ADDRESS, provider),
      this.poolStaticInfos,
      this.symbolToPerpStaticInfo,
      this.perpetualIdToSymbol,
      this.nestedPerpetualIDs,
      this.symbolList,
      this.priceFeedGetter,
      this.oraclefactoryAddr!, // not undefined if proxy contract was initialized
      overrides as CallOverrides
    );
  }

  /**
   * All open orders for a trader-address and a symbol.
   * @param {string} traderAddr Address of the trader for which we get the open orders.
   * @param {string} symbol Symbol of the form ETH-USD-MATIC or a pool symbol, or undefined.
   * If a poolSymbol is provided, the response includes orders in all perpetuals of the given pool.
   * If no symbol is provided, the response includes orders from all perpetuals in all pools.
   * @example
   * import { MarketData, PerpetualDataHandler } from '@d8x/perpetuals-sdk';
   * async function main() {
   *   console.log(MarketData);
   *   // setup
   *   const config = PerpetualDataHandler.readSDKConfig("zkevmTestnet");
   *   let mktData = new MarketData(config);
   *   await mktData.createProxyInstance();
   *   // Get all open orders for a trader/symbol
   *   let opOrder = await mktData.openOrders("0xAb5801a7D398351b8bE11C439e05C5B3259aeC9B",
   *       "ETH-USD-MATIC");
   *   console.log(opOrder);
   * }
   * main();
   *
   * @returns For each perpetual an array of open orders and corresponding order-ids.
   */
  public async openOrders(
    traderAddr: string,
    symbol?: string,
    overrides?: CallOverrides & { rpcURL?: string }
  ): Promise<{ orders: Order[]; orderIds: string[] }[]> {
    // open orders requested only for given symbol
    let resArray: Array<{ orders: Order[]; orderIds: string[] }> = [];
    let symbols: Array<string>;
    if (symbol) {
      symbols = symbol.split("-").length == 1 ? this.getPerpetualSymbolsInPool(symbol) : [symbol];
    } else {
      symbols = this.poolStaticInfos.reduce(
        (syms, pool) => syms.concat(this.getPerpetualSymbolsInPool(pool.poolMarginSymbol)),
        new Array<string>()
      );
    }
    let rpcURL: string | undefined;
    if (overrides) {
      ({ rpcURL, ...overrides } = overrides);
    }
    const provider = new StaticJsonRpcProvider(rpcURL ?? this.nodeURL);
    if (symbols.length < 1) {
      throw new Error(`No perpetuals found for symbol ${symbol}`);
    } else if (symbols.length < 2) {
      let res = await this._openOrdersOfPerpetual(traderAddr, symbols[0], provider, overrides);
      resArray.push(res!);
    } else {
      resArray = await this._openOrdersOfPerpetuals(traderAddr, symbols, provider, overrides);
    }
    return resArray;
  }

  /**
   * All open orders for a trader-address and a given perpetual symbol.
   * @param {string} traderAddr Address of the trader for which we get the open orders.
   * @param {string} symbol perpetual-symbol of the form ETH-USD-MATIC
   * @returns open orders and order ids
   * @ignore
   */
  private async _openOrdersOfPerpetual(
    traderAddr: string,
    symbol: string,
    provider: Provider,
    overrides?: CallOverrides
  ): Promise<{ orders: Order[]; orderIds: string[] }> {
    // open orders requested only for given symbol
    const orderBookContract = LimitOrderBook__factory.connect(this.getOrderBookContract(symbol).address, provider);
    const orders = await MarketData.openOrdersOnOrderBook(
      traderAddr,
      orderBookContract,
      this.symbolToPerpStaticInfo,
      overrides
    );
    const digests = await MarketData.orderIdsOfTrader(traderAddr, orderBookContract, overrides);
    return { orders: orders, orderIds: digests };
  }

  /**
   * All open orders for a trader-address and a given perpetual symbol.
   * @param {string} traderAddr Address of the trader for which we get the open orders.
   * @param {string} symbol perpetual-symbol of the form ETH-USD-MATIC
   * @returns open orders and order ids
   * @ignore
   */
  private async _openOrdersOfPerpetuals(
    traderAddr: string,
    symbols: string[],
    provider: Provider,
    overrides?: CallOverrides
  ): Promise<{ orders: Order[]; orderIds: string[] }[]> {
    // open orders requested only for given symbol
    const orderBookContracts = symbols.map((symbol) =>
      LimitOrderBook__factory.connect(this.getOrderBookContract(symbol).address, provider)
    );
    const multicall = Multicall3__factory.connect(MULTICALL_ADDRESS, provider);
    const { orders, digests } = await MarketData._openOrdersOnOrderBooks(
      traderAddr,
      orderBookContracts,
      multicall,
      this.symbolToPerpStaticInfo,
      overrides
    );
    return symbols.map((_symbol, i) => ({ orders: orders[i], orderIds: digests[i] }));
  }

  /**
   * Information about the position open by a given trader in a given perpetual contract, or
   * for all perpetuals in a pool
   * @param {string} traderAddr Address of the trader for which we get the position risk.
   * @param {string} symbol Symbol of the form ETH-USD-MATIC,
   * or pool symbol ("MATIC") to get all positions in a given pool,
   * or no symbol to get all positions in all pools.
   * @example
   * import { MarketData, PerpetualDataHandler } from '@d8x/perpetuals-sdk';
   * async function main() {
   *   console.log(MarketData);
   *   // setup
   *   const config = PerpetualDataHandler.readSDKConfig("zkevmTestnet");
   *   let mktData = new MarketData(config);
   *   await mktData.createProxyInstance();
   *   // Get position risk info
   *   let posRisk = await mktData.positionRisk("0xAb5801a7D398351b8bE11C439e05C5B3259aeC9B",
   *       "ETH-USD-MATIC");
   *   console.log(posRisk);
   * }
   * main();
   *
   * @returns {Array<MarginAccount>} Array of position risks of trader.
   */
  public async positionRisk(
    traderAddr: string,
    symbol?: string,
    overrides?: CallOverrides & { rpcURL?: string }
  ): Promise<MarginAccount[]> {
    if (this.proxyContract == null) {
      throw Error("no proxy contract initialized. Use createProxyInstance().");
    }
    let resArray: Array<MarginAccount> = [];
    let symbols: Array<string>;
    if (symbol) {
      symbols = symbol.split("-").length == 1 ? this.getPerpetualSymbolsInPool(symbol) : [symbol];
    } else {
      symbols = this.poolStaticInfos.reduce(
        (syms, pool) => syms.concat(this.getPerpetualSymbolsInPool(pool.poolMarginSymbol)),
        new Array<string>()
      );
    }
    let rpcURL: string | undefined;
    if (overrides) {
      ({ rpcURL, ...overrides } = overrides);
    }
    const provider = new StaticJsonRpcProvider(rpcURL ?? this.nodeURL);

    if (symbols.length < 1) {
      throw new Error(`No perpetuals found for symbol ${symbol}`);
    } else if (symbols.length < 2) {
      let res = await this._positionRiskForTraderInPerpetual(traderAddr, symbols[0], provider, overrides);
      resArray.push(res!);
    } else {
      resArray = await this._positionRiskForTraderInPerpetuals(traderAddr, symbols, provider, overrides);
    }
    return resArray;
  }

  /**
   * Information about the position open by a given trader in a given perpetual contract.
   * @param {string} traderAddr Address of the trader for which we get the position risk.
   * @param {string} symbol perpetual symbol of the form ETH-USD-MATIC
   * @returns MarginAccount struct for the trader
   * @ignore
   */
  protected async _positionRiskForTraderInPerpetual(
    traderAddr: string,
    symbol: string,
    provider: Provider,
    overrides?: CallOverrides
  ): Promise<MarginAccount> {
    let obj = await this.priceFeedGetter.fetchPricesForPerpetual(symbol);
    let mgnAcct = await PerpetualDataHandler.getMarginAccount(
      traderAddr,
      symbol,
      this.symbolToPerpStaticInfo,
      IPerpetualManager__factory.connect(this.proxyAddr, provider),
      [obj.idxPrices[0], obj.idxPrices[1]],
      overrides
    );
    return mgnAcct;
  }

  /**
   * Information about the position open by a given trader in a given perpetual contract.
   * @param {string} traderAddr Address of the trader for which we get the position risk.
   * @param {string} symbol perpetual symbol of the form ETH-USD-MATIC
   * @returns MarginAccount struct for the trader
   * @ignore
   */
  protected async _positionRiskForTraderInPerpetuals(
    traderAddr: string,
    symbols: string[],
    provider: Provider,
    overrides?: CallOverrides
  ): Promise<MarginAccount[]> {
    const MAX_SYMBOLS_PER_CALL = 10;
    const S2S3 = new Array<[number, number]>();
    for (let i = 0; i < symbols.length; i++) {
      let obj = await this.priceFeedGetter.fetchPricesForPerpetual(symbols[i]);
      S2S3.push([obj.idxPrices[0], obj.idxPrices[1]]);
    }
    let mgnAcct: MarginAccount[] = [];
    let callSymbols = symbols.slice(0, MAX_SYMBOLS_PER_CALL);
    let pxS2S3 = S2S3.slice(0, MAX_SYMBOLS_PER_CALL);
    while (callSymbols.length > 0) {
      let acc = await PerpetualDataHandler.getMarginAccounts(
        Array(callSymbols.length).fill(traderAddr),
        callSymbols,
        this.symbolToPerpStaticInfo,
        Multicall3__factory.connect(MULTICALL_ADDRESS, provider),
        IPerpetualManager__factory.connect(this.proxyAddr, provider),
        pxS2S3,
        overrides
      );
      mgnAcct = mgnAcct.concat(acc);
      callSymbols = symbols.slice(mgnAcct.length, mgnAcct.length + MAX_SYMBOLS_PER_CALL);
      pxS2S3 = S2S3.slice(mgnAcct.length, mgnAcct.length + MAX_SYMBOLS_PER_CALL);
    }
    return mgnAcct;
  }

  /**
   * Estimates what the position risk will be if a given order is executed.
   * @param traderAddr Address of trader
   * @param order Order to be submitted
   * @param account Position risk before trade. Defaults to current position if not given.
   * @param indexPriceInfo Index prices and market status (open/closed). Defaults to current market status if not given.
   * @returns Position risk after trade, including order cost and maximal trade sizes for position
   * @example
   * import { MarketData, PerpetualDataHandler } from '@d8x/perpetuals-sdk';
   * async function main() {
   *   console.log(MarketData);
   *   // setup
   *   const config = PerpetualDataHandler.readSDKConfig("zkevmTestnet");
   *   const mktData = new MarketData(config);
   *   await mktData.createProxyInstance();
   *   const order: Order = {
   *        symbol: "MATIC-USD-MATIC",
   *        side: "BUY",
   *        type: "MARKET",
   *        quantity: 100,
   *        leverage: 2,
   *        executionTimestamp: Date.now()/1000,
   *    };
   *   // Get position risk conditional on this order being executed
   *   const posRisk = await mktData.positionRiskOnTrade("0xAb5801a7D398351b8bE11C439e05C5B3259aeC9B", order);
   *   console.log(posRisk);
   * }
   * main();
   */
  public async positionRiskOnTrade(
    traderAddr: string,
    order: Order,
    account?: MarginAccount,
    indexPriceInfo?: [number, number, boolean, boolean],
    overrides?: CallOverrides & { tradingFeeTbps?: number }
  ): Promise<{ newPositionRisk: MarginAccount; orderCost: number; maxLongTrade: number; maxShortTrade: number }> {
    if (this.proxyContract == null || this.multicall == null) {
      throw Error("no proxy contract initialized. Use createProxyInstance().");
    }

    // fetch prices
    if (indexPriceInfo == undefined) {
      let obj = await this.priceFeedGetter.fetchPricesForPerpetual(order.symbol);
      indexPriceInfo = [obj.idxPrices[0], obj.idxPrices[1], obj.mktClosed[0], obj.mktClosed[1]];
    }

    // override total fee
    let tradingFeeTbps: number | undefined;
    if (overrides) {
      ({ tradingFeeTbps, ...overrides } = overrides);
    }

    // signed trade amount
    let tradeAmountBC = Math.abs(order.quantity) * (order.side == BUY_SIDE ? 1 : -1);

    // create all calls
    const poolId = PerpetualDataHandler._getPoolIdFromSymbol(order.symbol, this.poolStaticInfos);
    const perpId = PerpetualDataHandler.symbolToPerpetualId(order.symbol, this.symbolToPerpStaticInfo);
    const fS2S3 = [indexPriceInfo[0], indexPriceInfo[1]].map((x) => floatToABK64x64(x)) as [BigNumber, BigNumber];
    const proxyCalls: Multicall3.Call3Struct[] = [
      // 0: traderState
      {
        target: this.proxyContract.address,
        allowFailure: true,
        callData: this.proxyContract.interface.encodeFunctionData("getTraderState", [perpId, traderAddr, fS2S3]),
      },
      // 1: ammState
      {
        target: this.proxyContract.address,
        allowFailure: true,
        callData: this.proxyContract.interface.encodeFunctionData("getAMMState", [perpId, fS2S3]),
      },
      // 2: exchangeFee
      {
        target: this.proxyContract.address,
        allowFailure: false,
        callData: this.proxyContract.interface.encodeFunctionData("queryExchangeFee", [
          poolId,
          traderAddr,
          order.brokerAddr ?? ZERO_ADDRESS,
        ]),
      },
      // 3: perpetual price
      {
        target: this.proxyContract.address,
        allowFailure: true,
        callData: this.proxyContract.interface.encodeFunctionData("queryPerpetualPrice", [
          perpId,
          floatToABK64x64(tradeAmountBC),
          fS2S3,
        ]),
      },
      // 4: max long pos
      {
        target: this.proxyContract.address,
        allowFailure: false,
        callData: this.proxyContract.interface.encodeFunctionData("getMaxSignedOpenTradeSizeForPos", [
          perpId,
          BigNumber.from(0),
          true,
        ]),
      },
      // 5: max short pos
      {
        target: this.proxyContract.address,
        allowFailure: false,
        callData: this.proxyContract.interface.encodeFunctionData("getMaxSignedOpenTradeSizeForPos", [
          perpId,
          BigNumber.from(0),
          false,
        ]),
      },
    ];

    // multicall
    const encodedResults = await this.multicall.callStatic.aggregate3(proxyCalls, (overrides || {}) as CallOverrides);

    // positionRisk to apply this trade on: if not given, defaults to the current trader's position
    if (!account) {
      let traderState: BigNumber[];
      if (encodedResults[0].success) {
        traderState = this.proxyContract.interface.decodeFunctionResult(
          "getTraderState",
          encodedResults[0].returnData
        )[0];
      } else {
        traderState = await this.proxyContract.getTraderState(perpId, traderAddr, fS2S3);
      }
      account = MarketData.buildMarginAccountFromState(order.symbol, traderState, this.symbolToPerpStaticInfo, [
        indexPriceInfo[0],
        indexPriceInfo[1],
      ]);
    }

    // perpetualState, for prices
    let ammState: BigNumber[];
    if (encodedResults[1].success) {
      ammState = this.proxyContract.interface.decodeFunctionResult("getAMMState", encodedResults[1].returnData)[0];
    } else {
      ammState = await this.proxyContract.getAMMState(perpId, fS2S3);
    }
    const perpetualState = PerpetualDataHandler._parseAMMState(
      order.symbol,
      ammState,
      indexPriceInfo,
      this.symbolToPerpStaticInfo
    );
    let [S2, S3, Sm] = [perpetualState.indexPrice, perpetualState.collToQuoteIndexPrice, perpetualState.markPrice];

    // exchange fee based on this trader's address (volume, token holding, etc) and his broker address (if any)
    const exchangeFeeTbps = this.proxyContract.interface.decodeFunctionResult(
      "queryExchangeFee",
      encodedResults[2].returnData
    )[0] as number;

    // amm price for this trade amount
    let ammPrice: number;
    {
      let fPrice: BigNumber;
      if (encodedResults[3].success) {
        fPrice = this.proxyContract.interface.decodeFunctionResult(
          "queryPerpetualPrice",
          encodedResults[3].returnData
        )[0];
      } else {
        fPrice = await this.proxyContract.queryPerpetualPrice(perpId, floatToABK64x64(tradeAmountBC), fS2S3);
      }
      ammPrice = ABK64x64ToFloat(fPrice);
    }
    // price for this order = amm price if no limit given, else conservatively adjusted
    let tradePrice: number;
    if (order.limitPrice == undefined) {
      tradePrice = ammPrice;
    } else {
      if (order.type == ORDER_TYPE_MARKET) {
        if (order.side == BUY_SIDE) {
          // limit price > amm price --> likely not binding, use avg, less conservative
          // limit price < amm price --> likely fails due to slippage, use limit price to get actual max cost
          tradePrice = 0.5 * (order.limitPrice + Math.min(order.limitPrice, ammPrice));
        } else {
          tradePrice = 0.5 * (order.limitPrice + Math.max(order.limitPrice, ammPrice));
        }
      } else {
        // limit orders either get executed now (at ammPrice) or later (at limit price)
        if (
          (order.side == BUY_SIDE && order.limitPrice > ammPrice) ||
          (order.side == SELL_SIDE && order.limitPrice < ammPrice)
        ) {
          // can be executed now at ammPrice
          tradePrice = ammPrice;
        } else {
          // will execute in the future at limitPrice -> assume prices converge proportionally
          const slippage = ammPrice / S2;
          Sm = (Sm / S2) * (order.limitPrice / slippage);
          S2 = order.limitPrice / slippage;
          tradePrice = order.limitPrice;
          if (this.getPerpetualStaticInfo(order.symbol).collateralCurrencyType == COLLATERAL_CURRENCY_BASE) {
            S3 = S2;
          }
        }
      }
    }
    // max buy
    const fMaxLong = this.proxyContract.interface.decodeFunctionResult(
      "getMaxSignedOpenTradeSizeForPos",
      encodedResults[4].returnData
    )[0] as BigNumber;
    const maxLongTrade =
      account.side == BUY_SIDE
        ? Math.max(0, ABK64x64ToFloat(fMaxLong) - account.positionNotionalBaseCCY)
        : ABK64x64ToFloat(fMaxLong) + account.positionNotionalBaseCCY;
    // max sell
    const fMaxShort = this.proxyContract.interface.decodeFunctionResult(
      "getMaxSignedOpenTradeSizeForPos",
      encodedResults[5].returnData
    )[0] as BigNumber;
    const maxShortTrade =
      account.side == SELL_SIDE
        ? Math.max(0, ABK64x64ToFloat(fMaxShort.abs()) - Math.abs(account.positionNotionalBaseCCY))
        : ABK64x64ToFloat(fMaxShort.abs()) + Math.abs(account.positionNotionalBaseCCY);

    // Current state:
    let lotSizeBC = MarketData._getLotSize(order.symbol, this.symbolToPerpStaticInfo);
    // Too small, no change to account
    if (Math.abs(order.quantity) < lotSizeBC) {
      return { newPositionRisk: account, orderCost: 0, maxLongTrade: maxLongTrade, maxShortTrade: maxShortTrade };
    }
    // cash in margin account: upon trading, unpaid funding will be realized
    let currentMarginCashCC = account.collateralCC;
    // signed position, still correct if side is closed (==0)
    let currentPositionBC = (account.side == BUY_SIDE ? 1 : -1) * account.positionNotionalBaseCCY;
    // signed locked-in value
    let currentLockedInQC = account.entryPrice * currentPositionBC;

    // New trader state:
    // signed position
    let newPositionBC = currentPositionBC + tradeAmountBC;
    if (Math.abs(newPositionBC) < 10 * lotSizeBC) {
      // fully closed
      tradeAmountBC = -currentPositionBC;
      newPositionBC = 0;
    }
    let newSide = newPositionBC > 0 ? BUY_SIDE : newPositionBC < 0 ? SELL_SIDE : CLOSED_SIDE;

    if (tradingFeeTbps === undefined) {
      // use usual input if not overriden
      tradingFeeTbps = exchangeFeeTbps + (order.brokerFeeTbps ?? 0);
    }
    let tradingFeeCC = (Math.abs(tradeAmountBC) * tradingFeeTbps * 1e-5 * S2) / S3;
    let referralFeeCC = this.symbolToPerpStaticInfo.get(account.symbol)!.referralRebate;
    // Trade type:
    let isClose = newPositionBC == 0 || newPositionBC * tradeAmountBC < 0;
    let isOpen = newPositionBC != 0 && (currentPositionBC == 0 || tradeAmountBC * currentPositionBC > 0); // regular open, no flip
    let isFlip = Math.abs(newPositionBC) > Math.abs(currentPositionBC) && !isOpen; // flip position sign, not fully closed
    let keepPositionLvgOnClose = (order.keepPositionLvg ?? false) && !isOpen;

    // Contract: _doMarginCollateralActions
    // No collateral actions if
    // 1) leverage is not set or
    // 2) fully closed after trade or
    // 3) is a partial closing, it doesn't flip, and keep lvg flag is not set
    let traderDepositCC: number;
    let targetLvg: number;
    if (order.leverage == undefined || newPositionBC == 0 || (!isOpen && !isFlip && !keepPositionLvgOnClose)) {
      traderDepositCC = 0;
      targetLvg = 0;
    } else {
      // 1) opening and flipping trades need to specify a leverage: default to max if not given
      // 2) for others it's ignored, set target to 0
      let initialMarginRate = this.symbolToPerpStaticInfo.get(account.symbol)!.initialMarginRate;
      targetLvg = isFlip || isOpen ? order.leverage ?? 1 / initialMarginRate : 0;
      let [b0, pos0] = isOpen ? [0, 0] : [account.collateralCC, currentPositionBC];
      traderDepositCC = getDepositAmountForLvgTrade(pos0, b0, tradeAmountBC, targetLvg, tradePrice, S3, Sm);
      // fees are paid from wallet in this case
      traderDepositCC += tradingFeeCC + referralFeeCC;
    }

    // Contract: _executeTrade
    let deltaCashCC = (-tradeAmountBC * (tradePrice - S2)) / S3;
    let deltaLockedQC = tradeAmountBC * S2;
    if (isClose) {
      let pnl = account.entryPrice * tradeAmountBC - deltaLockedQC;
      deltaLockedQC += pnl;
      deltaCashCC += pnl / S3;
    }
    // funding and fees
    deltaCashCC = deltaCashCC + account.unrealizedFundingCollateralCCY - tradingFeeCC - referralFeeCC;

    // New cash, locked-in, entry price & leverage after trade
    let newLockedInValueQC = currentLockedInQC + deltaLockedQC;
    let newMarginCashCC = currentMarginCashCC + deltaCashCC + traderDepositCC;
    let newEntryPrice = newPositionBC == 0 ? 0 : Math.abs(newLockedInValueQC / newPositionBC);
    let newMarginBalanceCC = newMarginCashCC + (newPositionBC * Sm - newLockedInValueQC) / S3;
    let newLeverage =
      newPositionBC == 0
        ? 0
        : newMarginBalanceCC <= 0
        ? Infinity
        : (Math.abs(newPositionBC) * Sm) / S3 / newMarginBalanceCC;

    // Liquidation params
    let [S2Liq, S3Liq, tau] = MarketData._getLiquidationParams(
      account.symbol,
      newLockedInValueQC,
      newPositionBC,
      newMarginCashCC,
      Sm,
      S3,
      this.symbolToPerpStaticInfo
    );

    // New position risk
    let newPositionRisk: MarginAccount = {
      symbol: account.symbol,
      positionNotionalBaseCCY: Math.abs(newPositionBC),
      side: newSide,
      entryPrice: newEntryPrice,
      leverage: newLeverage,
      markPrice: Sm,
      unrealizedPnlQuoteCCY: newPositionBC * Sm - newLockedInValueQC,
      unrealizedFundingCollateralCCY: 0,
      collateralCC: newMarginCashCC,
      collToQuoteConversion: S3,
      liquidationPrice: [S2Liq, S3Liq],
      liquidationLvg: 1 / tau,
    };
    return {
      newPositionRisk: newPositionRisk,
      orderCost: traderDepositCC,
      maxLongTrade: maxLongTrade,
      maxShortTrade: maxShortTrade,
    };
  }

  /**
   * Estimates what the position risk will be if given amount of collateral is added/removed from the account.
   * @param {number} deltaCollateral Amount of collateral to add or remove (signed)
   * @param {MarginAccount} account Position risk before collateral is added or removed
   * @returns {MarginAccount} Position risk after collateral has been added/removed
   * @example
   * import { MarketData, PerpetualDataHandler } from '@d8x/perpetuals-sdk';
   * async function main() {
   *   console.log(MarketData);
   *   // setup
   *   const config = PerpetualDataHandler.readSDKConfig("zkevmTestnet");
   *   const mktData = new MarketData(config);
   *   await mktData.createProxyInstance();
   *   // Get position risk conditional on removing 3.14 MATIC
   *   const traderAddr = "0xAb5801a7D398351b8bE11C439e05C5B3259aeC9B";
   *   const curPos = await mktData.positionRisk("traderAddr", "BTC-USD-MATIC");
   *   const posRisk = await mktData.positionRiskOnCollateralAction(-3.14, curPos);
   *   console.log(posRisk);
   * }
   * main();
   */
  public async positionRiskOnCollateralAction(
    deltaCollateral: number,
    account: MarginAccount,
    indexPriceInfo?: [number, number, boolean, boolean],
    overrides?: CallOverrides
  ): Promise<MarginAccount> {
    if (this.proxyContract == null) {
      throw Error("no proxy contract initialized. Use createProxyInstance().");
    }
    if (deltaCollateral + account.collateralCC + account.unrealizedFundingCollateralCCY < 0) {
      throw Error("not enough margin to remove");
    }
    if (indexPriceInfo == undefined) {
      let obj = await this.priceFeedGetter.fetchPricesForPerpetual(account.symbol);
      indexPriceInfo = [obj.idxPrices[0], obj.idxPrices[1], obj.mktClosed[0], obj.mktClosed[1]];
    }
    let perpetualState = await this.getPerpetualState(account.symbol, indexPriceInfo, overrides);
    let [S2, S3, Sm] = [perpetualState.indexPrice, perpetualState.collToQuoteIndexPrice, perpetualState.markPrice];

    // no position: just increase collateral and kill liquidation vars
    if (account.positionNotionalBaseCCY == 0) {
      return {
        symbol: account.symbol,
        positionNotionalBaseCCY: account.positionNotionalBaseCCY,
        side: account.side,
        entryPrice: account.entryPrice,
        leverage: account.leverage,
        markPrice: Sm,
        unrealizedPnlQuoteCCY: account.unrealizedPnlQuoteCCY,
        unrealizedFundingCollateralCCY: account.unrealizedFundingCollateralCCY,
        collateralCC: account.collateralCC + deltaCollateral,
        collToQuoteConversion: S3,
        liquidationPrice: [0, undefined],
        liquidationLvg: Infinity,
      };
    }

    let positionBC = account.positionNotionalBaseCCY * (account.side == BUY_SIDE ? 1 : -1);
    let lockedInQC = account.entryPrice * positionBC;
    let newMarginCashCC = account.collateralCC + deltaCollateral;
    let newMarginBalanceCC =
      newMarginCashCC + account.unrealizedFundingCollateralCCY + (positionBC * Sm - lockedInQC) / S3;
    if (newMarginBalanceCC <= 0) {
      return {
        symbol: account.symbol,
        positionNotionalBaseCCY: account.positionNotionalBaseCCY,
        side: account.side,
        entryPrice: account.entryPrice,
        leverage: Infinity,
        markPrice: Sm,
        unrealizedPnlQuoteCCY: account.unrealizedPnlQuoteCCY,
        unrealizedFundingCollateralCCY: account.unrealizedFundingCollateralCCY,
        collateralCC: newMarginCashCC,
        collToQuoteConversion: S3,
        liquidationPrice: [S2, S3],
        liquidationLvg: 0,
      };
    }
    let newLeverage = (Math.abs(positionBC) * Sm) / S3 / newMarginBalanceCC;

    // Liquidation params
    let [S2Liq, S3Liq, tau] = MarketData._getLiquidationParams(
      account.symbol,
      lockedInQC,
      positionBC,
      newMarginCashCC,
      Sm,
      S3,
      this.symbolToPerpStaticInfo
    );

    // New position risk
    let newPositionRisk: MarginAccount = {
      symbol: account.symbol,
      positionNotionalBaseCCY: account.positionNotionalBaseCCY,
      side: account.side,
      entryPrice: account.entryPrice,
      leverage: newLeverage,
      markPrice: Sm,
      unrealizedPnlQuoteCCY: account.unrealizedPnlQuoteCCY,
      unrealizedFundingCollateralCCY: account.unrealizedFundingCollateralCCY,
      collateralCC: newMarginCashCC,
      collToQuoteConversion: S3,
      liquidationPrice: [S2Liq, S3Liq],
      liquidationLvg: 1 / tau,
    };
    return newPositionRisk;
  }

  /**
   * Calculates liquidation prices for a given position
   * @param symbol Perpetual symbol
   * @param lockedInQC Locked in value
   * @param signedPositionBC Signed position size
   * @param marginCashCC Cash in margin account
   * @param markPrice Mark price
   * @param collToQuoteConversion Collateral index price
   * @param symbolToPerpStaticInfo Symbol-to-perp static info mapping
   * @returns [Base index price, Collateral index price, Maintenance margin rate]
   * @ignore
   */
  protected static _getLiquidationParams(
    symbol: string,
    lockedInQC: number,
    signedPositionBC: number,
    marginCashCC: number,
    markPrice: number,
    collToQuoteConversion: number,
    symbolToPerpStaticInfo: Map<string, PerpetualStaticInfo>
  ): [number, number | undefined, number] {
    let S2Liq: number, S3Liq: number | undefined;
    let tau = symbolToPerpStaticInfo.get(symbol)!.maintenanceMarginRate;
    let ccyType = symbolToPerpStaticInfo.get(symbol)!.collateralCurrencyType;
    if (ccyType == CollaterlCCY.BASE) {
      S2Liq = calculateLiquidationPriceCollateralBase(lockedInQC, signedPositionBC, marginCashCC, tau);
      S3Liq = S2Liq;
    } else if (ccyType == CollaterlCCY.QUANTO) {
      S3Liq = collToQuoteConversion;
      S2Liq = calculateLiquidationPriceCollateralQuanto(
        lockedInQC,
        signedPositionBC,
        marginCashCC,
        tau,
        collToQuoteConversion,
        markPrice
      );
    } else {
      S2Liq = calculateLiquidationPriceCollateralQuote(lockedInQC, signedPositionBC, marginCashCC, tau);
    }
    // floor at 0
    S2Liq = S2Liq < 0 ? 0 : S2Liq;
    S3Liq = S3Liq && S3Liq < 0 ? 0 : S3Liq;
    return [S2Liq, S3Liq, tau];
  }

  /**
   * Gets the wallet balance in the collateral currency corresponding to a given perpetual symbol.
   * @param address Address to check
   * @param symbol Symbol of the form ETH-USD-MATIC.
   * @returns Perpetual's collateral token balance of the given address.
   * @example
   * import { MarketData, PerpetualDataHandler } from '@d8x/perpetuals-sdk';
   * async function main() {
   *   console.log(MarketData);
   *   // setup (authentication required, PK is an environment variable with a private key)
   *   const config = PerpetualDataHandler.readSDKConfig("zkevmTestnet");
   *   let md = new MarketData(config);
   *   await md.createProxyInstance();
   *   // get MATIC balance of address
   *   let marginTokenBalance = await md.getWalletBalance(myaddress, "BTC-USD-MATIC");
   *   console.log(marginTokenBalance);
   * }
   * main();
   */
  public async getWalletBalance(address: string, symbol: string, overrides?: CallOverrides): Promise<number> {
    let poolIdx = this.getPoolStaticInfoIndexFromSymbol(symbol);
    let marginTokenAddr = this.poolStaticInfos[poolIdx].poolMarginTokenAddr;
    let token = ERC20__factory.connect(marginTokenAddr, this.provider!);
    let walletBalance = await token.balanceOf(address, overrides || {});
    let decimals = await token.decimals(overrides || {});
    return Number(formatUnits(walletBalance, decimals));
  }

  /**
   * Get the address' balance of the pool share token
   * @param {string} address address of the liquidity provider
   * @param {string | number} symbolOrId Symbol of the form ETH-USD-MATIC, or MATIC (collateral only), or Pool-Id
   * @returns {number} Pool share token balance of the given address (e.g. dMATIC balance)
   * @example
   * import { MarketData, PerpetualDataHandler } from '@d8x/perpetuals-sdk';
   * async function main() {
   *   console.log(MarketData);
   *   // setup (authentication required, PK is an environment variable with a private key)
   *   const config = PerpetualDataHandler.readSDKConfig("zkevmTestnet");
   *   let md = new MarketData(config);
   *   await md.createProxyInstance();
   *   // get dMATIC balance of address
   *   let shareTokenBalance = await md.getPoolShareTokenBalance(myaddress, "MATIC");
   *   console.log(shareTokenBalance);
   * }
   * main();
   */
  public async getPoolShareTokenBalance(
    address: string,
    symbolOrId: string | number,
    overrides?: CallOverrides
  ): Promise<number> {
    let poolId = this._poolSymbolOrIdToPoolId(symbolOrId);
    return this._getPoolShareTokenBalanceFromId(address, poolId, overrides);
  }

  /**
   * Query the pool share token holdings of address
   * @param address address of token holder
   * @param poolId pool id
   * @returns pool share token balance of address
   * @ignore
   */
  private async _getPoolShareTokenBalanceFromId(
    address: string,
    poolId: number,
    overrides?: CallOverrides
  ): Promise<number> {
    let shareTokenAddr = this.poolStaticInfos[poolId - 1].shareTokenAddr;
    let shareToken = ERC20__factory.connect(shareTokenAddr, this.provider!);
    let d18ShareTokenBalanceOfAddr = await shareToken.balanceOf(address, overrides || {});
    return dec18ToFloat(d18ShareTokenBalanceOfAddr);
  }

  /**
   * Value of pool token in collateral currency
   * @param {string | number} symbolOrId symbol of the form ETH-USD-MATIC, MATIC (collateral), or poolId
   * @returns {number} current pool share token price in collateral currency
   * @example
   * import { MarketData, PerpetualDataHandler } from '@d8x/perpetuals-sdk';
   * async function main() {
   *   console.log(MarketData);
   *   // setup (authentication required, PK is an environment variable with a private key)
   *   const config = PerpetualDataHandler.readSDKConfig("zkevmTestnet");
   *   let md = new MarketData(config);
   *   await md.createProxyInstance();
   *   // get price of 1 dMATIC in MATIC
   *   let shareTokenPrice = await md.getShareTokenPrice(myaddress, "MATIC");
   *   console.log(shareTokenPrice);
   * }
   * main();
   */
  public async getShareTokenPrice(symbolOrId: string | number, overrides?: CallOverrides): Promise<number> {
    let poolId = this._poolSymbolOrIdToPoolId(symbolOrId);
    const priceDec18 = await this.proxyContract!.getShareTokenPriceD18(poolId, overrides || {});
    const price = dec18ToFloat(priceDec18);
    return price;
  }

  /**
   * Value of the pool share tokens for this liquidity provider
   * in poolSymbol-currency (e.g. MATIC, USDC).
   * @param {string} address address of liquidity provider
   * @param {string | number} symbolOrId symbol of the form ETH-USD-MATIC, MATIC (collateral), or poolId
   * @returns the value (in collateral tokens) of the pool share, #share tokens, shareTokenAddress
   * @example
   * import { MarketData, PerpetualDataHandler } from '@d8x/perpetuals-sdk';
   * async function main() {
   *   console.log(MarketData);
   *   // setup (authentication required, PK is an environment variable with a private key)
   *   const config = PerpetualDataHandler.readSDKConfig("zkevmTestnet");
   *   let md = new MarketData(config);
   *   await md.createProxyInstance();
   *   // get value of pool share token
   *   let shareToken = await md.getParticipationValue(myaddress, "MATIC");
   *   console.log(shareToken);
   * }
   * main();
   */
  public async getParticipationValue(
    address: string,
    symbolOrId: string | number,
    overrides?: CallOverrides
  ): Promise<{ value: number; shareTokenBalance: number; poolShareToken: string }> {
    let poolId = this._poolSymbolOrIdToPoolId(symbolOrId);
    const shareTokens = await this._getPoolShareTokenBalanceFromId(address, poolId, overrides);
    const priceDec18 = await this.proxyContract!.getShareTokenPriceD18(poolId, overrides || {});
    const price = dec18ToFloat(priceDec18);
    const value = price * shareTokens;
    const shareTokenAddr = this.poolStaticInfos[poolId - 1].shareTokenAddr;
    return {
      value: value,
      shareTokenBalance: shareTokens,
      poolShareToken: shareTokenAddr,
    };
  }

  /**
   * Get pool id from symbol
   * @param poolSymbolOrId Pool symbol or pool Id
   * @returns Pool Id
   * @ignore
   */
  private _poolSymbolOrIdToPoolId(poolSymbolOrId: string | number): number {
    if (this.proxyContract == null || this.poolStaticInfos.length == 0) {
      throw Error("no proxy contract or wallet or data initialized. Use createProxyInstance().");
    }
    let poolId: number;
    if (isNaN(Number(poolSymbolOrId))) {
      poolId = PerpetualDataHandler._getPoolIdFromSymbol(poolSymbolOrId as string, this.poolStaticInfos);
    } else {
      poolId = Number(poolSymbolOrId);
    }
    return poolId;
  }

  /**
   * Gets the maximal order sizes to open positions (increase size), both long and short,
   * considering the existing position, state of the perpetual
   * Accounts for user's wallet balance.
   * @param {string} traderAddr Address of trader
   * @param {symbol} symbol Symbol of the form ETH-USD-MATIC
   * @returns Maximal trade sizes
   * @example
   * import { MarketData, PerpetualDataHandler } from '@d8x/perpetuals-sdk';
   * async function main() {
   *   console.log(MarketData);
   *   // setup (authentication required, PK is an environment variable with a private key)
   *   const config = PerpetualDataHandler.readSDKConfig("zkevmTestnet");
   *   let md = new MarketData(config);
   *   await md.createProxyInstance();
   *   // max order sizes
   *   let shareToken = await md.maxOrderSizeForTrader(myaddress, "BTC-USD-MATIC");
   *   console.log(shareToken); // {buy: 314, sell: 415}
   * }
   * main();
   */
  public async maxOrderSizeForTrader(
    traderAddr: string,
    symbol: string,
    overrides?: CallOverrides
  ): Promise<{ buy: number; sell: number }> {
    if (!this.proxyContract || !this.multicall) {
      throw new Error("proxy contract not initialized");
    }
    const perpId = PerpetualDataHandler.symbolToPerpetualId(symbol, this.symbolToPerpStaticInfo);
    const poolId = this.getPoolIdFromSymbol(symbol);
    const poolInfo = this.poolStaticInfos[this.getPoolStaticInfoIndexFromSymbol(symbol)];
    const perpInfo = this.getPerpetualStaticInfo(symbol);
    const IERC20 = new Interface(ERC20_ABI) as ERC20Interface;

    const indexPriceInfo: [number, number, boolean, boolean] = await this.priceFeedGetter
      .fetchPricesForPerpetual(symbol)
      .then((obj) => [obj.idxPrices[0], obj.idxPrices[1], obj.mktClosed[0], obj.mktClosed[1]]);
    const fS2S3 = [indexPriceInfo[0], indexPriceInfo[1]].map((x) => floatToABK64x64(x)) as [BigNumber, BigNumber];

    const proxyCalls: Multicall3.Call3Struct[] = [
      // 0: traderState
      {
        target: this.proxyContract.address,
        allowFailure: false,
        callData: this.proxyContract.interface.encodeFunctionData("getTraderState", [perpId, traderAddr, fS2S3]),
      },
      // 1: max long
      {
        target: this.proxyContract.address,
        allowFailure: false,
        callData: this.proxyContract.interface.encodeFunctionData("getMaxSignedOpenTradeSizeForPos", [
          perpId,
          BigNumber.from(0),
          true,
        ]),
      },
      // 2: max short
      {
        target: this.proxyContract.address,
        allowFailure: false,
        callData: this.proxyContract.interface.encodeFunctionData("getMaxSignedOpenTradeSizeForPos", [
          perpId,
          BigNumber.from(0),
          false,
        ]),
      },
      // 3: wallet balance
      {
        target: poolInfo.poolMarginTokenAddr,
        allowFailure: false,
        callData: IERC20.encodeFunctionData("balanceOf", [traderAddr]),
      },
      // 4: exchange fee
      {
        target: this.proxyContract.address,
        allowFailure: false,
        callData: this.proxyContract.interface.encodeFunctionData("queryExchangeFee", [
          poolId,
          traderAddr,
          ZERO_ADDRESS,
        ]),
      },
    ];
    // multicall
    const encodedResults = await this.multicall.callStatic.aggregate3(proxyCalls, overrides || {});

    // position risk
    const traderState = this.proxyContract.interface.decodeFunctionResult(
      "getTraderState",
      encodedResults[0].returnData
    )[0];
    const account = MarketData.buildMarginAccountFromState(symbol, traderState, this.symbolToPerpStaticInfo, [
      indexPriceInfo[0],
      indexPriceInfo[1],
    ]);

    // Max based on perp:
    // max buy
    const maxLongPosPerp = ABK64x64ToFloat(
      this.proxyContract.interface.decodeFunctionResult(
        "getMaxSignedOpenTradeSizeForPos",
        encodedResults[1].returnData
      )[0] as BigNumber
    );
    // max short
    const maxShortPosPerp = ABK64x64ToFloat(
      this.proxyContract.interface.decodeFunctionResult(
        "getMaxSignedOpenTradeSizeForPos",
        encodedResults[2].returnData
      )[0] as BigNumber
    );

    // fee rate
    const feeRate =
      1e-5 *
      (this.proxyContract.interface.decodeFunctionResult(
        "queryExchangeFee",
        encodedResults[4].returnData
      )[0] as number);

    // Max based on margin requirements:
    const walletBalance = decNToFloat(
      IERC20.decodeFunctionResult("balanceOf", encodedResults[3].returnData)[0],
      poolInfo.poolMarginTokenDecimals!
    );
    const curPos = (account.side == BUY_SIDE ? 1 : -1) * account.positionNotionalBaseCCY;

    const maxLongPosAccount = getMaxSignedPositionSize(
      account.collateralCC + walletBalance + account.unrealizedFundingCollateralCCY,
      curPos,
      account.entryPrice * curPos,
      1,
      account.markPrice,
      perpInfo.initialMarginRate,
      feeRate,
      account.markPrice,
      indexPriceInfo[0],
      account.collToQuoteConversion
    );
    const maxShortPosAccount = getMaxSignedPositionSize(
      account.collateralCC + walletBalance + account.unrealizedFundingCollateralCCY,
      curPos,
      account.entryPrice * curPos,
      -1,
      account.markPrice,
      perpInfo.initialMarginRate,
      feeRate,
      account.markPrice,
      indexPriceInfo[0],
      account.collToQuoteConversion
    );

    // max long/short all accounted for
    const maxLong = Math.min(Math.abs(maxLongPosPerp), Math.abs(maxLongPosAccount));
    const maxShort = Math.min(Math.abs(maxShortPosPerp), Math.abs(maxShortPosAccount));

    // max long order
    const maxLongTrade =
      account.side == BUY_SIDE
        ? Math.max(0, maxLong - account.positionNotionalBaseCCY)
        : maxLong + account.positionNotionalBaseCCY;
    // max short order
    const maxShortTrade =
      account.side == SELL_SIDE
        ? Math.max(0, maxShort - account.positionNotionalBaseCCY)
        : maxShort + account.positionNotionalBaseCCY;

    return { buy: maxLongTrade, sell: maxShortTrade };
  }

  /**
   * Perpetual-wide maximal signed position size in perpetual.
   * @param side BUY_SIDE or SELL_SIDE
   * @param {string} symbol of the form ETH-USD-MATIC.
   * @returns {number} signed maximal position size in base currency
   * @example
   * import { MarketData, PerpetualDataHandler } from '@d8x/perpetuals-sdk';
   * async function main() {
   *   console.log(MarketData);
   *   // setup
   *   const config = PerpetualDataHandler.readSDKConfig("zkevmTestnet");
   *   let mktData = new MarketData(config);
   *   await mktData.createProxyInstance();
   *   // get oracle price
   *   let maxLongPos = await mktData.maxSignedPosition(BUY_SIDE, "BTC-USD-MATIC");
   *   console.log(maxLongPos);
   * }
   * main();
   */
  public async maxSignedPosition(side: string, symbol: string, overrides?: CallOverrides): Promise<number> {
    let perpId = this.getPerpIdFromSymbol(symbol);
    let isBuy = side == BUY_SIDE;
    let maxSignedPos = await this.proxyContract!.getMaxSignedOpenTradeSizeForPos(
      perpId,
      BigNumber.from(0),
      isBuy,
      overrides || {}
    );
    return ABK64x64ToFloat(maxSignedPos);
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
   *   const config = PerpetualDataHandler.readSDKConfig("zkevmTestnet");
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
  public async getOraclePrice(base: string, quote: string, overrides?: CallOverrides): Promise<number | undefined> {
    if (!this.proxyContract) {
      throw Error("no proxy contract initialized. Use createProxyInstance().");
    }
    let px = await this.proxyContract.getOraclePrice([toBytes4(base), toBytes4(quote)], overrides || {});
    return px == undefined ? undefined : ABK64x64ToFloat(px);
  }

  /**
   * Get the status of an order given a symbol and order Id
   * @param symbol Symbol of the form ETH-USD-MATIC
   * @param orderId Order Id
   * @param overrides
   * @returns Order status (cancelled = 0, executed = 1, open = 2,  unkown = 3)
   * @example
   * import { MarketData, PerpetualDataHandler } from '@d8x/perpetuals-sdk';
   * async function main() {
   *   console.log(MarketData);
   *   // setup
   *   const config = PerpetualDataHandler.readSDKConfig("zkevmTestnet");
   *   let mktData = new MarketData(config);
   *   await mktData.createProxyInstance();
   *   // get order stauts
   *   let status = await mktData.getOrderStatus("ETH-USD-MATIC", "0xmyOrderId");
   *   console.log(status);
   * }
   * main();
   *
   */
  public async getOrderStatus(symbol: string, orderId: string, overrides?: CallOverrides): Promise<OrderStatus> {
    if (!this.proxyContract) {
      throw Error("no proxy contract initialized. Use createProxyInstance().");
    }
    const orderBookContract = this.getOrderBookContract(symbol);
    const status = (await orderBookContract.getOrderStatus(orderId, overrides || {})) as OrderStatus;
    return status;
  }

  /**
   * Get the status of an array of orders given a symbol and their Ids
   * @param symbol Symbol of the form ETH-USD-MATIC
   * @param orderId Array of order Ids
   * @returns Array of order status
   * @example
   * import { MarketData, PerpetualDataHandler } from '@d8x/perpetuals-sdk';
   * async function main() {
   *   console.log(MarketData);
   *   // setup
   *   const config = PerpetualDataHandler.readSDKConfig("zkevmTestnet");
   *   let mktData = new MarketData(config);
   *   await mktData.createProxyInstance();
   *   // get order stauts
   *   let status = await mktData.getOrdersStatus("ETH-USD-MATIC", ["0xmyOrderId1", "0xmyOrderId2"]);
   *   console.log(status);
   * }
   * main();
   *
   */
  public async getOrdersStatus(symbol: string, orderId: string[], overrides?: CallOverrides): Promise<OrderStatus[]> {
    if (!this.proxyContract || !this.multicall) {
      throw Error("no proxy contract initialized. Use createProxyInstance().");
    }
    const orderBookContract = this.getOrderBookContract(symbol);

    const statusCalls: Multicall3.Call3Struct[] = orderId.map((id) => ({
      target: orderBookContract.address,
      allowFailure: false,
      callData: orderBookContract.interface.encodeFunctionData("getOrderStatus", [id]),
    }));
    // multicall
    const encodedResults = await this.multicall.callStatic.aggregate3(statusCalls, overrides || {});
    // order status
    return encodedResults.map(
      (encodedResult) =>
        orderBookContract.interface.decodeFunctionResult("getOrderStatus", encodedResult.returnData)[0] as OrderStatus
    );
  }

  /**
   * Get the current mark price
   * @param symbol symbol of the form ETH-USD-MATIC
   * @example
   * import { MarketData, PerpetualDataHandler } from '@d8x/perpetuals-sdk';
   * async function main() {
   *   console.log(MarketData);
   *   // setup
   *   const config = PerpetualDataHandler.readSDKConfig("zkevmTestnet");
   *   let mktData = new MarketData(config);
   *   await mktData.createProxyInstance();
   *   // get mark price
   *   let price = await mktData.getMarkPrice("ETH-USD-MATIC");
   *   console.log(price);
   * }
   * main();
   *
   * @returns {number} mark price
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
   *   const config = PerpetualDataHandler.readSDKConfig("zkevmTestnet");
   *   let mktData = new MarketData(config);
   *   await mktData.createProxyInstance();
   *   // get perpetual price
   *   let price = await mktData.getPerpetualPrice("ETH-USD-MATIC", 1);
   *   console.log(price);
   * }
   * main();
   *
   * @returns {number} price
   */
  public async getPerpetualPrice(
    symbol: string,
    quantity: number,
    indexPrices?: [number, number],
    overrides?: CallOverrides
  ): Promise<number> {
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
      indexPrices,
      overrides
    );
  }

  /**
   * Query recent perpetual state from blockchain
   * @param {string} symbol symbol of the form ETH-USD-MATIC
   * @returns {PerpetualState} PerpetualState copy
   */
  public async getPerpetualState(
    symbol: string,
    indexPriceInfo?: [number, number, boolean, boolean],
    overrides?: CallOverrides
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
      indexPriceInfo,
      overrides
    );
    return state;
  }

  /**
   * Query recent pool state from blockchain, not including perpetual states
   * @param {string} poolSymbol symbol of the form USDC
   * @returns {PoolState} PoolState copy
   */
  public async getPoolState(poolSymbol: string, overrides?: CallOverrides): Promise<PoolState> {
    if (this.proxyContract == null) {
      throw new Error("no proxy contract initialized. Use createProxyInstance().");
    }
    const poolId = this._poolSymbolOrIdToPoolId(poolSymbol);
    const pool = await this.proxyContract.getLiquidityPool(poolId, overrides || {});
    let state: PoolState = {
      isRunning: pool.isRunning,
      poolSymbol: poolSymbol,
      marginTokenAddr: pool.marginTokenAddress,
      poolShareTokenAddr: pool.shareTokenAddress,
      defaultFundCashCC: ABK64x64ToFloat(pool.fDefaultFundCashCC),
      pnlParticipantCashCC: ABK64x64ToFloat(pool.fPnLparticipantsCashCC),
      totalTargetAMMFundSizeCC: ABK64x64ToFloat(pool.fTargetAMMFundSize),
      brokerCollateralLotSize: ABK64x64ToFloat(pool.fBrokerCollateralLotSize),
      perpetuals: [],
    };
    return state;
  }

  /**
   * Query perpetual static info.
   * This information is queried once at createProxyInstance-time, and remains static after that.
   * @param {string} symbol Perpetual symbol
   *
   * @returns {PerpetualStaticInfo} Perpetual static info copy.
   */
  public getPerpetualStaticInfo(symbol: string): PerpetualStaticInfo {
    let perpInfo = this.symbolToPerpStaticInfo.get(symbol);
    if (perpInfo == undefined) {
      throw new Error(`Perpetual with symbol ${symbol} not found. Check symbol or use createProxyInstance().`);
    }
    // return new copy, not a reference
    let res: PerpetualStaticInfo = {
      id: perpInfo.id,
      poolId: perpInfo.poolId,
      limitOrderBookAddr: perpInfo.limitOrderBookAddr,
      initialMarginRate: perpInfo.initialMarginRate,
      maintenanceMarginRate: perpInfo.maintenanceMarginRate,
      collateralCurrencyType: perpInfo.collateralCurrencyType,
      S2Symbol: perpInfo.S2Symbol,
      S3Symbol: perpInfo.S3Symbol,
      lotSizeBC: perpInfo.lotSizeBC,
      referralRebate: perpInfo.referralRebate,
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
   *   const config = PerpetualDataHandler.readSDKConfig("zkevmTestnet");
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
  protected static async openOrdersOnOrderBook(
    traderAddr: string,
    orderBookContract: LimitOrderBook,
    symbolToPerpStaticInfo: Map<string, PerpetualStaticInfo>,
    overrides?: CallOverrides
  ): Promise<Order[]> {
    //eliminate empty orders and map to user friendly orders
    let userFriendlyOrders: Order[] = new Array<Order>();
    let haveMoreOrders = true;
    let from = 0;
    const bulkSize = 15;
    while (haveMoreOrders) {
      let orders: IClientOrder.ClientOrderStructOutput[] = await orderBookContract.getOrders(
        traderAddr,
        from,
        bulkSize,
        overrides || {}
      );
      let k = 0;
      while (k < orders.length && orders[k].traderAddr !== ZERO_ADDRESS) {
        userFriendlyOrders.push(PerpetualDataHandler.fromClientOrder(orders[k], symbolToPerpStaticInfo));
        k++;
      }
      haveMoreOrders = orders[orders.length - 1].traderAddr !== ZERO_ADDRESS;
      from = from + bulkSize;
    }
    return userFriendlyOrders;
  }

  /**
   * Query smart contract to get user orders and convert to user friendly order format.
   * @param {string} traderAddr Address of trader.
   * @param {ethers.Contract} orderBookContract Instance of order book.
   * @returns {Order[]} Array of user friendly order struct.
   * @ignore
   */
  protected static async _openOrdersOnOrderBooks(
    traderAddr: string,
    orderBookContracts: LimitOrderBook[],
    multicall: Multicall3,
    symbolToPerpStaticInfo: Map<string, PerpetualStaticInfo>,
    overrides?: CallOverrides
  ): Promise<{ orders: Order[][]; digests: string[][] }> {
    // eliminate empty orders and map to user friendly orders
    const numOBs = orderBookContracts.length;

    let userFriendlyOrders = new Array(numOBs).fill(0).map(() => new Array<Order>());
    let orderDigests = new Array(numOBs).fill(0).map(() => new Array<string>());

    let haveMoreOrders = new Array(numOBs).fill(true);
    let from = new Array(numOBs).fill(0);
    const bulkSize = 10;

    while (haveMoreOrders.some((x) => x)) {
      // filter by books with some orders left
      const contracts = orderBookContracts.filter((_c, i) => haveMoreOrders[i]);
      // prepare calls
      const ordersCalls: Multicall3.Call3Struct[] = contracts.map((c, i) => ({
        target: c.address,
        allowFailure: true,
        callData: c.interface.encodeFunctionData("getOrders", [traderAddr, from[i], bulkSize]),
      }));
      const digestsCalls: Multicall3.Call3Struct[] = contracts.map((c, i) => ({
        target: c.address,
        allowFailure: true,
        callData: c.interface.encodeFunctionData("limitDigestsOfTrader", [traderAddr, from[i], bulkSize]),
      }));
      // call
      const encodedResults = await multicall.callStatic.aggregate3(ordersCalls.concat(digestsCalls), overrides || {});
      const encodedOrders = encodedResults.slice(0, ordersCalls.length);
      const encodedDigests = encodedResults.slice(ordersCalls.length);
      // parse
      const allOrders: IClientOrder.ClientOrderStructOutput[][] = encodedOrders
        .slice(0, ordersCalls.length)
        .map(({ success, returnData }, i) => {
          if (!success) throw new Error(`Failed to get orders for order book ${contracts[i].address}`);
          return contracts[i].interface.decodeFunctionResult("getOrders", returnData)[0];
        });
      const allDigests: string[][] = encodedDigests.map(({ success, returnData }, i) => {
        if (!success) throw new Error(`Failed to get orders for order book ${contracts[i].address}`);
        return contracts[i].interface.decodeFunctionResult("limitDigestsOfTrader", returnData)[0];
      });
      // arrange
      for (let j = 0; j < contracts.length; j++) {
        let orders = allOrders[j].filter((o) => o.traderAddr != ZERO_ADDRESS);
        let digests = allDigests[j].filter((d) => d != ZERO_ORDER_ID);

        let i = orderBookContracts.findIndex((c) => c.address == contracts[j].address);
        let k = 0;
        while (k < orders.length && orders[k].traderAddr != ZERO_ADDRESS) {
          userFriendlyOrders[i].push(PerpetualDataHandler.fromClientOrder(orders[k], symbolToPerpStaticInfo));
          orderDigests[i].push(digests[k]);
          k++;
        }
        haveMoreOrders[i] = orders.length > 0 && orders[orders.length - 1].traderAddr != ZERO_ADDRESS;
        from[i] = from[i] + bulkSize;
      }
    }
    return { orders: userFriendlyOrders, digests: orderDigests };
  }

  /**
   *
   * @param {string} traderAddr Address of the trader
   * @param {LimitOrderBook} orderBookContract Instance of order book contract
   * @returns Array of order-id's
   * @ignore
   */
  public static async orderIdsOfTrader(
    traderAddr: string,
    orderBookContract: LimitOrderBook,
    overrides?: CallOverrides
  ): Promise<string[]> {
    let digestsRaw: string[] = await orderBookContract.limitDigestsOfTrader(traderAddr, 0, 15, overrides || {});
    let k: number = 0;
    let digests: string[] = [];
    while (k < digestsRaw.length && BigNumber.from(digestsRaw[k]).gt(0)) {
      digests.push(digestsRaw[k]);
      k++;
    }
    return digests;
  }

  /**
   * Query the available margin conditional on the given (or current) index prices
   * Result is in collateral currency
   * @param {string} traderAddr address of the trader
   * @param {string} symbol perpetual symbol of the form BTC-USD-MATIC
   * @param indexPrices optional index prices, will otherwise fetch from REST API
   * @returns available margin in collateral currency
   * @example
   * import { MarketData, PerpetualDataHandler } from '@d8x/perpetuals-sdk';
   * async function main() {
   *   console.log(MarketData);
   *   // setup
   *   const config = PerpetualDataHandler.readSDKConfig("zkevmTestnet");
   *   let mktData = new MarketData(config);
   *   await mktData.createProxyInstance();
   *   // get available margin
   *   let mgn = await mktData.getAvailableMargin("0xmyAddress", "ETH-USD-MATIC");
   *   console.log(mgn);
   * }
   * main();
   */
  public async getAvailableMargin(
    traderAddr: string,
    symbol: string,
    indexPrices?: [number, number],
    overrides?: CallOverrides
  ): Promise<number> {
    if (!this.proxyContract) {
      throw Error("no proxy contract initialized. Use createProxyInstance().");
    }

    if (indexPrices == undefined) {
      // fetch from API
      let obj = await this.priceFeedGetter.fetchPricesForPerpetual(symbol);
      indexPrices = [obj.idxPrices[0], obj.idxPrices[1]];
    }
    let perpID = PerpetualDataHandler.symbolToPerpetualId(symbol, this.symbolToPerpStaticInfo);
    let traderState = await this.proxyContract.getTraderState(
      perpID,
      traderAddr,
      indexPrices.map((x) => floatToABK64x64(x == undefined || Number.isNaN(x) ? 0 : x)) as [BigNumber, BigNumber],
      overrides || {}
    );
    const idx_availableMargin = 1;
    let mgn = ABK64x64ToFloat(traderState[idx_availableMargin]);
    return mgn;
  }

  /**
   * Calculate a type of exchange loyality score based on trader volume
   * @param {string} traderAddr address of the trader
   * @returns {number} a loyality score (4 worst, 1 best)
   * @example
   * import { MarketData, PerpetualDataHandler } from '@d8x/perpetuals-sdk';
   * async function main() {
   *   console.log(MarketData);
   *   // setup
   *   const config = PerpetualDataHandler.readSDKConfig("zkevmTestnet");
   *   let mktData = new MarketData(config);
   *   await mktData.createProxyInstance();
   *   // get scpre
   *   let s = await mktData.getTraderLoyalityScore("0xmyAddress");
   *   console.log(s);
   * }
   * main();
   */
  public async getTraderLoyalityScore(traderAddr: string, overrides?: CallOverrides): Promise<number> {
    if (this.proxyContract == null) {
      throw Error("no proxy contract or wallet initialized. Use createProxyInstance().");
    }
    // loop over all pools and query volumes
    let traderProm: Array<Promise<BigNumber>> = [];
    for (let k = 0; k < this.poolStaticInfos.length; k++) {
      let trdrVol = this.proxyContract.getCurrentTraderVolume(
        this.poolStaticInfos[k].poolId,
        traderAddr,
        overrides || {}
      );
      traderProm.push(trdrVol);
    }
    // sum
    let totalBrokerVolume = 0;
    let totalTraderVolume = 0;
    let trdrVol = await Promise.all(traderProm);
    for (let k = 0; k < this.poolStaticInfos.length; k++) {
      totalTraderVolume += ABK64x64ToFloat(trdrVol[k]);
    }
    const volumeCap = 500_000;
    let score = totalBrokerVolume == 0 ? totalTraderVolume / volumeCap : totalBrokerVolume;
    // 5 different equally spaced categories: (4 is best, 1 worst)
    let rank4 = 1 + Math.floor(Math.min(score, 1 - 1e-15) * 4);
    // desired ranking starts at 4 (worst) and ends at 1 (best)
    return 5 - rank4;
  }

  /**
   * Get all off-chain prices
   * @param _symbolToPerpStaticInfo mapping: PerpetualStaticInfo for each perpetual
   * @param _priceFeedGetter priceFeed class from which we can get offchain price data
   * @returns mapping of symbol-pair (e.g. BTC-USD) to price/isMarketClosed
   * @ignore
   */
  private static async _getAllIndexPrices(
    _symbolToPerpStaticInfo: Map<string, PerpetualStaticInfo>,
    _priceFeedGetter: PriceFeeds
  ): Promise<Map<string, [number, boolean]>> {
    // get all prices from off-chain price-sources
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
    return idxPriceMap;
  }

  /**
   * Get market open/closed status
   * @param {string} symbol Perpetual symbol of the form ETH-USD-MATIC
   * @returns {boolean} True if the market is closed
   * @example
   * import { MarketData, PerpetualDataHandler } from '@d8x/perpetuals-sdk';
   * async function main() {
   *   console.log(MarketData);
   *   // setup
   *   const config = PerpetualDataHandler.readSDKConfig("zkevmTestnet");
   *   let mktData = new MarketData(config);
   *   await mktData.createProxyInstance();
   *   // is market closed?
   *   let s = await mktData.isMarketClosed("ETH-USD-MATIC");
   *   console.log(s);
   * }
   * main();
   */
  public async isMarketClosed(symbol: string): Promise<boolean> {
    if (this.proxyContract == null) {
      throw Error("no proxy contract initialized. Use createProxyInstance().");
    }
    return await MarketData._isMarketClosed(symbol, this.symbolToPerpStaticInfo, this.priceFeedGetter);
  }

  /**
   * Market status based on off-chain info
   * @param symbol Perp symbol
   * @param _symbolToPerpStaticInfo Static info mapping
   * @param _priceFeedGetter Price getter instance
   * @ignore
   */
  private static async _isMarketClosed(
    symbol: string,
    _symbolToPerpStaticInfo: Map<string, PerpetualStaticInfo>,
    _priceFeedGetter: PriceFeeds
  ): Promise<boolean> {
    const sInfo: PerpetualStaticInfo | undefined = _symbolToPerpStaticInfo.get(symbol);
    let priceSymbols: string[] = [];
    if (sInfo?.S2Symbol != undefined && sInfo.S2Symbol != "") {
      priceSymbols.push(sInfo.S2Symbol);
    }
    if (sInfo?.S3Symbol != undefined && sInfo.S3Symbol != "") {
      priceSymbols.push(sInfo.S3Symbol);
    }
    if (priceSymbols.length == 0) {
      throw new Error("symbol not found");
    }
    const priceInfos = await _priceFeedGetter.fetchPrices(priceSymbols);
    return [...priceInfos.values()].some((p) => p[1]);
  }

  /**
   * Collect all mid-prices
   * @param _proxyContract contract instance
   * @param _nestedPerpetualIDs contains all perpetual ids for each pool
   * @param _symbolToPerpStaticInfo maps symbol to static info
   * @param _perpetualIdToSymbol maps perpetual id to symbol of the form BTC-USD-MATIC
   * @param _idxPriceMap symbol to price/market closed
   * @returns perpetual symbol to mid-prices mapping
   * @ignore
   */
  private static async _queryMidPrices(
    _proxyContract: IPerpetualManager,
    _multicall: Multicall3,
    _nestedPerpetualIDs: Array<Array<number>>,
    _symbolToPerpStaticInfo: Map<string, PerpetualStaticInfo>,
    _perpetualIdToSymbol: Map<number, string>,
    _idxPriceMap: Map<string, [number, boolean]>,
    overrides?: CallOverrides
  ): Promise<Map<string, number>> {
    // what is the maximal number of queries at once?
    const chunkSize = 10;
    let perpetualIDChunks: Array<Array<number>> = PerpetualDataHandler.nestedIDsToChunks(
      chunkSize,
      _nestedPerpetualIDs
    );
    // prepare calls
    const proxyCalls: Multicall3.Call3Struct[] = [];
    let midPriceMap = new Map<string, number>();
    for (let k = 0; k < perpetualIDChunks.length; k++) {
      let indexPrices: BigNumber[] = [];
      // collect/order all index prices
      for (let j = 0; j < perpetualIDChunks[k].length; j++) {
        let id = perpetualIDChunks[k][j];
        let symbol3s = _perpetualIdToSymbol.get(id);
        let info = _symbolToPerpStaticInfo.get(symbol3s!);
        let S2 = floatToABK64x64(_idxPriceMap.get(info!.S2Symbol)![0]);
        let S3 = BigNumber.from(0);
        if (info!.S3Symbol != "") {
          S3 = floatToABK64x64(_idxPriceMap.get(info!.S3Symbol)![0]);
        }
        indexPrices.push(S2);
        indexPrices.push(S3);
      }
      proxyCalls.push({
        target: _proxyContract.address,
        allowFailure: false,
        callData: _proxyContract.interface.encodeFunctionData("queryMidPrices", [perpetualIDChunks[k], indexPrices]),
      });
    }
    // multicall
    const encodedResults = await _multicall.callStatic.aggregate3(proxyCalls, overrides || {});
    // apply results
    for (let k = 0; k < perpetualIDChunks.length; k++) {
      let fMidPrice = _proxyContract.interface.decodeFunctionResult(
        "queryMidPrices",
        encodedResults[k].returnData
      )[0] as BigNumber[];
      for (let j = 0; j < fMidPrice.length; j++) {
        let id = perpetualIDChunks[k][j];
        let symbol3s = _perpetualIdToSymbol.get(id);
        midPriceMap.set(symbol3s!, ABK64x64ToFloat(fMidPrice[j]));
      }
    }
    return midPriceMap;
  }

  /**
   * Query the on-chain state of all pools and perpeetuals
   * @param _proxyContract Proxy contract
   * @param _multicall Multicall contract
   * @param _poolStaticInfos Static info array
   * @param _symbolList Symbol to on-chain symbol mapping
   * @param _nestedPerpetualIDs All perpetual Ids
   * @ignore
   */
  private static async _queryPoolAndPerpetualStates(
    _proxyContract: IPerpetualManager,
    _multicall: Multicall3,
    _poolStaticInfos: PoolStaticInfo[],
    _symbolList: Map<string, string>,
    _nestedPerpetualIDs: Array<Array<number>>,
    overrides?: CallOverrides
  ): Promise<{ pools: Array<PoolState>; perpetuals: Array<PerpetualState> }> {
    const chunkSize = 5;
    const numPools = _nestedPerpetualIDs.length;
    let iFrom = 1;
    let poolStates: Array<PoolState> = [];
    let perpStates: Array<PerpetualState> = [];
    while (iFrom <= numPools) {
      const proxyCalls: Multicall3.Call3Struct[] = [
        // getLiquidityPools
        {
          target: _proxyContract.address,
          allowFailure: false,
          callData: _proxyContract.interface.encodeFunctionData("getLiquidityPools", [iFrom, iFrom + chunkSize - 1]), // from-to includes "to"
        },
        // getPerpetuals
        {
          target: _proxyContract.address,
          allowFailure: false,
          callData: _proxyContract.interface.encodeFunctionData("getPerpetuals", [
            _nestedPerpetualIDs.slice(iFrom - 1, iFrom + chunkSize - 1).flat(), // from-to does not include "to"
          ]),
        },
      ];
      // multicall
      const encodedResults = await _multicall.callStatic.aggregate3(proxyCalls, overrides || {});
      const pools = _proxyContract.interface.decodeFunctionResult(
        "getLiquidityPools",
        encodedResults[0].returnData
      )[0] as PerpStorage.LiquidityPoolDataStructOutput[];
      const perps = _proxyContract.interface.decodeFunctionResult(
        "getPerpetuals",
        encodedResults[1].returnData
      )[0] as PerpStorage.PerpetualDataStructOutput[];

      poolStates = poolStates.concat(MarketData._poolDataToPoolState(pools, _poolStaticInfos));
      perpStates = perpStates.concat(MarketData._perpetualDataToPerpetualState(perps, _symbolList));
      iFrom = iFrom + chunkSize + 1;
    }
    return { pools: poolStates, perpetuals: perpStates };
  }

  /**
   * Parse liquidity pool state obtained on-chain
   * @param _liquidityPools
   * @param _poolStaticInfos
   * @ignore
   */
  protected static _poolDataToPoolState(
    _liquidityPools: PerpStorage.LiquidityPoolDataStructOutput[],
    _poolStaticInfos: PoolStaticInfo[]
  ): PoolState[] {
    const poolStates = _liquidityPools.map(
      (pool, k) =>
        ({
          isRunning: pool.isRunning,
          poolSymbol: _poolStaticInfos[k].poolMarginSymbol,
          marginTokenAddr: pool.marginTokenAddress,
          poolShareTokenAddr: pool.shareTokenAddress,
          defaultFundCashCC: ABK64x64ToFloat(pool.fDefaultFundCashCC),
          pnlParticipantCashCC: ABK64x64ToFloat(pool.fPnLparticipantsCashCC),
          totalTargetAMMFundSizeCC: ABK64x64ToFloat(pool.fTargetAMMFundSize),
          brokerCollateralLotSize: ABK64x64ToFloat(pool.fBrokerCollateralLotSize),
          perpetuals: [],
        } as PoolState)
    );
    return poolStates;
  }

  /**
   * Parse perpetual states obtained on-chain
   * @param _perpetuals
   * @param _symbolList
   * @ignore
   */
  protected static _perpetualDataToPerpetualState(
    _perpetuals: PerpStorage.PerpetualDataStructOutput[],
    _symbolList: Map<string, string>
  ): PerpetualState[] {
    const perpStates = _perpetuals.map((perp) => ({
      id: perp.id,
      state: PERP_STATE_STR[perp.state],
      baseCurrency: contractSymbolToSymbol(perp.S2BaseCCY, _symbolList)!,
      quoteCurrency: contractSymbolToSymbol(perp.S2QuoteCCY, _symbolList)!,
      indexPrice: 0, //fill later
      collToQuoteIndexPrice: 0, //fill later
      markPrice: ABK64x64ToFloat(perp.currentMarkPremiumRate.fPrice), // fill later: indexS2 * (1 + markPremiumRate),
      midPrice: 0, // fill later
      currentFundingRateBps: 1e4 * ABK64x64ToFloat(perp.fCurrentFundingRate),
      openInterestBC: ABK64x64ToFloat(perp.fOpenInterest),
      isMarketClosed: false, //fill later
    }));
    return perpStates;
  }

  /**
   * Fetch on-chain exchange info
   * @param _proxyContract
   * @param _multicall
   * @param _poolStaticInfos
   * @param _symbolToPerpStaticInfo
   * @param _perpetualIdToSymbol
   * @param _nestedPerpetualIDs
   * @param _symbolList
   * @param _priceFeedGetter
   * @param _oracleFactoryAddr
   * @param overrides
   * @ignore
   */
  public static async _exchangeInfo(
    _proxyContract: IPerpetualManager,
    _multicall: Multicall3,
    _poolStaticInfos: Array<PoolStaticInfo>,
    _symbolToPerpStaticInfo: Map<string, PerpetualStaticInfo>,
    _perpetualIdToSymbol: Map<number, string>,
    _nestedPerpetualIDs: Array<Array<number>>,
    _symbolList: Map<string, string>,
    _priceFeedGetter: PriceFeeds,
    _oracleFactoryAddr: string,
    overrides?: CallOverrides
  ): Promise<ExchangeInfo> {
    // get the factory address (shared among all pools)
    let info: ExchangeInfo = { pools: [], oracleFactoryAddr: _oracleFactoryAddr, proxyAddr: _proxyContract.address };

    // get all prices from off-chain price-sources: no RPC calls
    let idxPriceMap = await MarketData._getAllIndexPrices(_symbolToPerpStaticInfo, _priceFeedGetter);
    // query mid-prices from on-chain conditional on the off-chain prices
    let midPriceMap: Map<string, number> = await MarketData._queryMidPrices(
      _proxyContract,
      _multicall,
      _nestedPerpetualIDs,
      _symbolToPerpStaticInfo,
      _perpetualIdToSymbol,
      idxPriceMap,
      overrides
    );
    const { pools: poolStateInfos, perpetuals: perpStateInfos } = await MarketData._queryPoolAndPerpetualStates(
      _proxyContract,
      _multicall,
      _poolStaticInfos,
      _symbolList,
      _nestedPerpetualIDs,
      overrides
    );
    // put together all info
    for (const perp of perpStateInfos) {
      let symbol3s = _perpetualIdToSymbol.get(perp.id);
      let info = _symbolToPerpStaticInfo.get(symbol3s!);
      const idxPriceS2Pair = idxPriceMap.get(info!.S2Symbol);
      let idxPriceS3Pair: [number, boolean] = [0, false];
      perp.isMarketClosed = idxPriceS2Pair![1];
      if (info!.S3Symbol != "") {
        idxPriceS3Pair = idxPriceMap.get(info!.S3Symbol)!;
        perp.isMarketClosed = perp.isMarketClosed || idxPriceS3Pair![1];
      }
      perp.indexPrice = idxPriceS2Pair![0];
      perp.markPrice = idxPriceS2Pair![0] * (1 + perp.markPrice); // currently filled with mark premium rate
      let indexS3 = 1;
      if (info!.collateralCurrencyType == COLLATERAL_CURRENCY_BASE) {
        indexS3 = idxPriceS2Pair![0];
      } else if (info!.collateralCurrencyType == COLLATERAL_CURRENCY_QUANTO) {
        indexS3 = idxPriceS3Pair[0];
      }
      perp.collToQuoteIndexPrice = indexS3;
      perp.midPrice = midPriceMap.get(symbol3s!)!;
      // which pool?
      const poolId = info!.poolId;
      poolStateInfos[poolId - 1].perpetuals.push(perp);
    }
    info.pools = poolStateInfos;
    return info;
  }

  /**
   * Get the latest on-chain price of a perpetual base index in USD.
   * @param {string} symbol Symbol of the form ETH-USDC-MATIC.
   * If a pool symbol is used, it returns an array of all the USD prices of the indices in the pool.
   * If no argument is provided, it returns all prices of all the indices in the pools of the exchange.
   * @return {Map<string, number>} Price of the base index in USD, e.g. for ETH-USDC-MATIC, it returns the value of ETH-USD.
   * @example
   * import { MarketData, PerpetualDataHandler } from '@d8x/perpetuals-sdk';
   * async function main() {
   *   console.log(MarketData);
   *   // setup
   *   const config = PerpetualDataHandler.readSDKConfig("zkevmTestnet");
   *   let mktData = new MarketData(config);
   *   await mktData.createProxyInstance();
   *   // is market closed?
   *   let px = await mktData.getPriceInUSD("ETH-USDC-USDC");
   *   console.log(px); // {'ETH-USD' -> 1800}
   * }
   * main();
   *
   */
  public async getPriceInUSD(symbol?: string): Promise<Map<string, number>> {
    if (!this.proxyContract || !this.multicall) {
      throw new Error("Proxy contract not initialized.");
    }
    let symbols: string[];
    if (symbol) {
      symbols = symbol.split("-").length == 1 ? this.getPerpetualSymbolsInPool(symbol) : [symbol];
    } else {
      symbols = this.poolStaticInfos.reduce(
        (syms, pool) => syms.concat(this.getPerpetualSymbolsInPool(pool.poolMarginSymbol)),
        new Array<string>()
      );
    }
    if (symbols.length < 1 || symbols.some((s) => s == undefined)) {
      throw new Error(`No perpetuals found for symbol ${symbol}`);
    }
    const res: Map<string, number> = new Map();
    const feedPrices = await this.priceFeedGetter.fetchAllFeedPrices();
    let shouldReturn = true;

    for (const symbol of symbols) {
      const base = symbol.split("-")[0];
      const s = `${base}-USD`;
      if (feedPrices.has(s)) {
        let px = feedPrices.get(s)![0];
        res.set(s, px);
      } else if (feedPrices.has(`USD-${base}`)) {
        let px = 1 / feedPrices.get(`USD-${base}`)![0];
        res.set(s, px);
      } else {
        shouldReturn = false;
      }
    }
    if (shouldReturn) {
      return res;
    }
    // some prices are missing - get them from on chain
    const proxyCalls: Multicall3.Call3Struct[] = symbols.map((s) => ({
      target: this.proxyAddr,
      allowFailure: false,
      callData: this.proxyContract!.interface.encodeFunctionData("getLastPerpetualBaseToUSDConversion", [
        this.getPerpIdFromSymbol(s),
      ]),
    }));
    const encodedResults = await this.multicall!.callStatic.aggregate3(proxyCalls);
    const prices = encodedResults.map(
      (result) =>
        this.proxyContract!.interface.decodeFunctionResult(
          "getLastPerpetualBaseToUSDConversion",
          result.returnData
        )[0] as BigNumber
    );

    prices.forEach((px, i) => {
      const s = `${symbols[i].split("-")[0]}-USD`;
      if (!res.has(s)) {
        res.set(s, ABK64x64ToFloat(px));
      }
    });
    return res;
  }
}
