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
} from "./nodeSDKTypes";
import { BigNumber, BytesLike, ethers } from "ethers";
import { floatToABK64x64, ABK64x64ToFloat } from "./d8XMath";
import { fromBytes4HexString, toBytes4 } from "./utils";
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

  public async createProxyInstance() {
    this.provider = new ethers.providers.JsonRpcProvider(this.nodeURL);
    await this.initContractsAndData(this.provider);
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
    return await MarketData._exchangeInfo(this.proxyContract);
  }

  /**
   * All open orders for a trader-address and a symbol.
   * @param {string} traderAddr Address of the trader for which we get the open orders.
   * @param {string} symbol Symbol of the form ETH-USD-MATIC.
   * @example
   * // Setup
   * const config = PerpetualDataHandler.readSDKConfig("testnet");
   * let mktData = new MarketData(config);
   * await mktData.createProxyInstance();
   * // Get all open orders for a trader/symbol
   * let opOrder = await mktData.openOrders("0xAb5801a7D398351b8bE11C439e05C5B3259aeC9B",
   *     "ETH-USD-MATIC");
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
   * Information about the positions open by a given trader in a given perpetual contract.
   * @param {string} traderAddr Address of the trader for which we get the position risk.
   * @param {string} symbol Symbol of the form ETH-USD-MATIC.
   * @example
   * // Setup
   * const config = PerpetualDataHandler.readSDKConfig("testnet");
   * let mktData = new MarketData(config);
   * await mktData.createProxyInstance();
   * // Get position risk info
   * let posRisk = await mktData.positionRisk("0xAb5801a7D398351b8bE11C439e05C5B3259aeC9B",
   *     "ETH-USD-MATIC");
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

  public static async _exchangeInfo(_proxyContract: ethers.Contract): Promise<ExchangeInfo> {
    let nestedPerpetualIDs = await PerpetualDataHandler.getNestedPerpetualIds(_proxyContract);
    let factory = await _proxyContract.getOracleFactory();
    let info: ExchangeInfo = { pools: [], oracleFactoryAddr: factory };
    const numPools = nestedPerpetualIDs.length;
    for (var j = 0; j < numPools; j++) {
      let perpetualIDs = nestedPerpetualIDs[j];
      let pool = await _proxyContract.getLiquidityPool(j + 1);
      let PoolState: PoolState = {
        isRunning: pool.isRunning,
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
          baseCurrency: fromBytes4HexString(perp.S2BaseCCY),
          quoteCurrency: fromBytes4HexString(perp.S2QuoteCCY),
          indexPrice: indexS2,
          collToQuoteIndexPrice: indexS3,
          markPrice: indexS2 * (1 + markPremiumRate),
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
