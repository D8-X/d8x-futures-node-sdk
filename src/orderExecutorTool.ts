import { BigNumber } from "@ethersproject/bignumber";
import { HashZero } from "@ethersproject/constants";
import { CallOverrides, ContractTransaction, PayableOverrides } from "@ethersproject/contracts";
import { BlockTag } from "@ethersproject/providers";
import { Signer } from "@ethersproject/abstract-signer";
import {
  BUY_SIDE,
  ClientOrder,
  NodeSDKConfig,
  Order,
  PerpetualStaticInfo,
  PriceFeedSubmission,
  SELL_SIDE,
  SmartContractOrder,
  ZERO_ADDRESS,
  ZERO_ORDER_ID,
} from "./nodeSDKTypes";
import PerpetualDataHandler from "./perpetualDataHandler";
import WriteAccessHandler from "./writeAccessHandler";

/**
 * Functions to execute existing conditional orders from the limit order book. This class
 * requires a private key and executes smart-contract interactions that require
 * gas-payments.
 * @extends WriteAccessHandler
 */
export default class OrderExecutorTool extends WriteAccessHandler {
  static TRADE_DELAY = 4;
  /**
   * Constructor.
   * @param {NodeSDKConfig} config Configuration object, see PerpetualDataHandler.readSDKConfig.
   * @example
   * import { OrderExecutorTool, PerpetualDataHandler } from '@d8x/perpetuals-sdk';
   * async function main() {
   *   console.log(OrderExecutorTool);
   *   // load configuration for testnet
   *   const config = PerpetualDataHandler.readSDKConfig("testnet");
   *   // OrderExecutorTool (authentication required, PK is an environment variable with a private key)
   *   const pk: string = <string>process.env.PK;
   *   let orderTool = new OrderExecutorTool(config, pk);
   *   // Create a proxy instance to access the blockchain
   *   await orderTool.createProxyInstance();
   * }
   * main();
   *
   * @param {string | Signer} signer Private key or ethers Signer of the account
   */
  public constructor(config: NodeSDKConfig, signer: string | Signer) {
    super(config, signer);
    // override parent's gas limit with a lower number
    this.gasLimit = 4_000_000;
  }

  /**
   * Executes an order by symbol and ID. This action interacts with the blockchain and incurs gas costs.
   * @param {string} symbol Symbol of the form ETH-USD-MATIC.
   * @param {string} orderId ID of the order to be executed.
   * @param {string=} executorAddr optional address of the wallet to be credited for executing the order, if different from the one submitting this transaction.
   * @param {number=} nonce optional nonce
   * @param {PriceFeedSubmission=} submission optional signed prices obtained via PriceFeeds::fetchLatestFeedPriceInfoForPerpetual
   * @example
   * import { OrderExecutorTool, PerpetualDataHandler, Order } from "@d8x/perpetuals-sdk";
   * async function main() {
   *   console.log(OrderExecutorTool);
   *   // Setup (authentication required, PK is an environment variable with a private key)
   *   const config = PerpetualDataHandler.readSDKConfig("testnet");
   *   const pk: string = <string>process.env.PK;
   *   const symbol = "ETH-USD-MATIC";
   *   let orderTool = new OrderExecutorTool(config, pk);
   *   await orderTool.createProxyInstance();
   *   // get some open orders
   *   const maxOrdersToGet = 5;
   *   let [orders, ids]: [Order[], string[]] = await orderTool.pollLimitOrders(symbol, maxOrdersToGet);
   *   console.log(`Got ${ids.length} orders`);
   *   for (let k = 0; k < ids.length; k++) {
   *     // check whether order meets conditions
   *     let doExecute = await orderTool.isTradeable(orders[k]);
   *     if (doExecute) {
   *       // execute
   *       let tx = await orderTool.executeOrder(symbol, ids[k]);
   *       console.log(`Sent order id ${ids[k]} for execution, tx hash = ${tx.hash}`);
   *     }
   *   }
   * }
   * main();
   * @returns Transaction object.
   */
  public async executeOrder(
    symbol: string,
    orderId: string,
    executorAddr?: string,
    submission?: PriceFeedSubmission,
    overrides?: PayableOverrides
  ): Promise<ContractTransaction> {
    if (this.proxyContract == null || this.signer == null) {
      throw Error("no proxy contract or wallet initialized. Use createProxyInstance().");
    }
    const orderBookSC = this.getOrderBookContract(symbol);
    if (typeof executorAddr == "undefined") {
      executorAddr = this.traderAddr;
    }
    if (submission == undefined) {
      submission = await this.priceFeedGetter.fetchLatestFeedPriceInfoForPerpetual(symbol);
    }
    if (!overrides || overrides.value == undefined) {
      overrides = {
        value: submission.timestamps.length * this.PRICE_UPDATE_FEE_GWEI,
        gasLimit: overrides?.gasLimit ?? this.gasLimit,
        ...overrides,
      } as PayableOverrides;
    }
    return await orderBookSC.executeOrder(
      orderId,
      executorAddr,
      submission.priceFeedVaas,
      submission.timestamps,
      overrides
    );
  }

  public async executeOrders(
    symbol: string,
    orderIds: string[],
    executorAddr?: string,
    submission?: PriceFeedSubmission,
    overrides?: PayableOverrides
  ): Promise<ContractTransaction> {
    if (this.proxyContract == null || this.signer == null) {
      throw Error("no proxy contract or wallet initialized. Use createProxyInstance().");
    }
    const orderBookSC = this.getOrderBookContract(symbol);
    if (typeof executorAddr == "undefined") {
      executorAddr = this.traderAddr;
    }
    if (submission == undefined) {
      submission = await this.priceFeedGetter.fetchLatestFeedPriceInfoForPerpetual(symbol);
    }
    if (!overrides || overrides.value == undefined) {
      overrides = {
        value: submission.timestamps.length * this.PRICE_UPDATE_FEE_GWEI,
        gasLimit: overrides?.gasLimit ?? this.gasLimit,
        ...overrides,
      } as PayableOverrides;
    }
    return await orderBookSC.executeOrders(
      orderIds,
      executorAddr,
      submission?.priceFeedVaas,
      submission?.timestamps,
      overrides
    );
  }

  /**
   * All the orders in the order book for a given symbol that are currently open.
   * @param {string} symbol Symbol of the form ETH-USD-MATIC.
   * @example
   * import { OrderExecutorTool, PerpetualDataHandler } from '@d8x/perpetuals-sdk';
   * async function main() {
   *   console.log(OrderExecutorTool);
   *   // setup (authentication required, PK is an environment variable with a private key)
   *   const config = PerpetualDataHandler.readSDKConfig("testnet");
   *   const pk: string = <string>process.env.PK;
   *   let orderTool = new OrderExecutorTool(config, pk);
   *   await orderTool.createProxyInstance();
   *   // get all open orders
   *   let openOrders = await orderTool.getAllOpenOrders("ETH-USD-MATIC");
   *   console.log(openOrders);
   * }
   * main();
   *
   * @returns Array with all open orders and their IDs.
   */
  public async getAllOpenOrders(symbol: string, overrides?: CallOverrides): Promise<[Order[], string[]]> {
    let totalOrders = await this.numberOfOpenOrders(symbol, overrides);
    return await this.pollLimitOrders(symbol, totalOrders, ZERO_ORDER_ID, overrides);
  }

  /**
   * Total number of limit orders for this symbol, excluding those that have been cancelled/removed.
   * @param {string} symbol Symbol of the form ETH-USD-MATIC.
   * @example
   * import { OrderExecutorTool, PerpetualDataHandler } from '@d8x/perpetuals-sdk';
   * async function main() {
   *   console.log(OrderExecutorTool);
   *   // setup (authentication required, PK is an environment variable with a private key)
   *   const config = PerpetualDataHandler.readSDKConfig("testnet");
   *   const pk: string = <string>process.env.PK;
   *   let orderTool = new OrderExecutorTool(config, pk);
   *   await orderTool.createProxyInstance();
   *   // get all open orders
   *   let numberOfOrders = await orderTool.numberOfOpenOrders("ETH-USD-MATIC");
   *   console.log(numberOfOrders);
   * }
   * main();
   *
   * @returns {number} Number of open orders.
   */
  public async numberOfOpenOrders(symbol: string, overrides?: CallOverrides): Promise<number> {
    if (this.proxyContract == null) {
      throw Error("no proxy contract initialized. Use createProxyInstance().");
    }
    const orderBookSC = this.getOrderBookContract(symbol);
    let numOrders = await orderBookSC.numberOfOrderBookDigests(overrides || {});
    return Number(numOrders);
  }

  /**
   * Get order from the digest (=id)
   * @param symbol symbol of order book, e.g. ETH-USD-MATIC
   * @param digest digest of the order (=order ID)
   * @example
   * import { OrderExecutorTool, PerpetualDataHandler } from '@d8x/perpetuals-sdk';
   * async function main() {
   *   console.log(OrderExecutorTool);
   *   // setup (authentication required, PK is an environment variable with a private key)
   *   const config = PerpetualDataHandler.readSDKConfig("testnet");
   *   const pk: string = <string>process.env.PK;
   *   let orderTool = new OrderExecutorTool(config, pk);
   *   await orderTool.createProxyInstance();
   *   // get order by ID
   *   let myorder = await orderTool.getOrderById("MATIC-USD-MATIC",
   *       "0x0091a1d878491479afd09448966c1403e9d8753122e25260d3b2b9688d946eae");
   *   console.log(myorder);
   * }
   * main();
   *
   * @returns order or undefined
   */
  public async getOrderById(symbol: string, id: string, overrides?: CallOverrides): Promise<Order | undefined> {
    let ob = await this.getOrderBookContract(symbol);
    let smartContractOrder: SmartContractOrder = await ob.orderOfDigest(id, overrides || {});
    if (smartContractOrder.traderAddr == ZERO_ADDRESS) {
      return undefined;
    }
    let order = OrderExecutorTool.fromSmartContractOrder(smartContractOrder, this.symbolToPerpStaticInfo);
    return order;
  }

  /**
   * Get a list of active conditional orders in the order book.
   * This a read-only action and does not incur in gas costs.
   * @param {string} symbol Symbol of the form ETH-USD-MATIC.
   * @param {number} numElements Maximum number of orders to poll.
   * @param {string=} startAfter Optional order ID from where to start polling. Defaults to the first order.
   * @example
   * import { OrderExecutorTool, PerpetualDataHandler } from '@d8x/perpetuals-sdk';
   * async function main() {
   *   console.log(OrderExecutorTool);
   *   // setup (authentication required, PK is an environment variable with a private key)
   *   const config = PerpetualDataHandler.readSDKConfig("testnet");
   *   const pk: string = <string>process.env.PK;
   *   let orderTool = new OrderExecutorTool(config, pk);
   *   await orderTool.createProxyInstance();
   *   // get all open orders
   *   let activeOrders = await orderTool.pollLimitOrders("ETH-USD-MATIC", 2);
   *   console.log(activeOrders);
   * }
   * main();
   *
   * @returns Array of orders and corresponding order IDs
   */
  public async pollLimitOrders(
    symbol: string,
    numElements: number,
    startAfter?: string,
    overrides?: CallOverrides
  ): Promise<[Order[], string[]]> {
    if (this.proxyContract == null) {
      throw Error("no proxy contract initialized. Use createProxyInstance().");
    }
    const orderBookSC = this.getOrderBookContract(symbol);
    if (typeof startAfter == "undefined") {
      startAfter = ZERO_ORDER_ID;
    }
    let [orders, orderIds] = await orderBookSC.pollLimitOrders(
      startAfter,
      BigNumber.from(numElements),
      overrides || {}
    );
    let userFriendlyOrders: Order[] = new Array<Order>();
    let orderIdsOut = [];
    let k = 0;
    while (k < numElements && k < orders.length && orders[k].traderAddr != ZERO_ADDRESS) {
      userFriendlyOrders.push(WriteAccessHandler.fromClientOrder(orders[k], this.symbolToPerpStaticInfo));
      orderIdsOut.push(orderIds[k]);
      k++;
    }
    return [userFriendlyOrders, orderIdsOut];
  }

  /**
   * Check if a conditional order can be executed
   * @param order order structure
   * @param indexPrices pair of index prices S2 and S3. S3 set to zero if not required. If undefined
   * the function will fetch the latest prices from the REST API
   * @example
   * import { OrderExecutorTool, PerpetualDataHandler } from '@d8x/perpetuals-sdk';
   * async function main() {
   *   console.log(OrderExecutorTool);
   *   // setup (authentication required, PK is an environment variable with a private key)
   *   const config = PerpetualDataHandler.readSDKConfig("testnet");
   *   const pk: string = <string>process.env.PK;
   *   let orderTool = new OrderExecutorTool(config, pk);
   *   await orderTool.createProxyInstance();
   *   // check if tradeable
   *   let openOrders = await orderTool.getAllOpenOrders("MATIC-USD-MATIC");
   *   let check = await orderTool.isTradeable(openOrders[0][0]);
   *   console.log(check);
   * }
   * main();
   * @returns true if order can be executed for the current state of the perpetuals
   */
  public async isTradeable(
    order: Order,
    blockTimestamp?: number,
    indexPrices?: [number, number],
    overrides?: CallOverrides
  ): Promise<boolean> {
    if (this.proxyContract == null) {
      throw Error("no proxy contract initialized. Use createProxyInstance().");
    }
    if (indexPrices == undefined) {
      let obj = await this.priceFeedGetter.fetchPricesForPerpetual(order.symbol);
      indexPrices = [obj.idxPrices[0], obj.idxPrices[1]];
    }
    let orderPrice = await PerpetualDataHandler._queryPerpetualPrice(
      order.symbol,
      order.quantity,
      this.symbolToPerpStaticInfo,
      this.proxyContract,
      indexPrices,
      overrides
    );
    let markPrice = await PerpetualDataHandler._queryPerpetualMarkPrice(
      order.symbol,
      this.symbolToPerpStaticInfo,
      this.proxyContract,
      indexPrices,
      overrides
    );
    if (blockTimestamp == undefined) {
      const currentBlock = await this.provider!.getBlockNumber();
      blockTimestamp = (await this.provider!.getBlock(currentBlock)).timestamp;
    }
    return await this._isTradeable(
      order,
      orderPrice,
      markPrice,
      blockTimestamp,
      this.symbolToPerpStaticInfo,
      overrides
    );
  }

  /**
   * Check for a batch of orders on the same perpetual whether they can be traded
   * @param orders orders belonging to 1 perpetual
   * @param indexPrice S2,S3-index prices for the given perpetual. Will fetch prices from REST API
   * if not defined.
   * @returns array of tradeable boolean
   */
  public async isTradeableBatch(
    orders: Order[],
    blockTimestamp?: number,
    indexPrices?: [number, number, boolean, boolean],
    overrides?: CallOverrides
  ): Promise<boolean[]> {
    if (orders.length == 0) {
      return [];
    }
    if (this.proxyContract == null) {
      throw Error("no proxy contract initialized. Use createProxyInstance().");
    }
    if (orders.filter((o) => o.symbol == orders[0].symbol).length < orders.length) {
      throw Error("all orders in a batch must have the same symbol");
    }
    if (indexPrices == undefined) {
      let obj = await this.priceFeedGetter.fetchPricesForPerpetual(orders[0].symbol);
      indexPrices = [obj.idxPrices[0], obj.idxPrices[1], obj.mktClosed[0], obj.mktClosed[1]];
    }
    if (indexPrices[2] || indexPrices[3]) {
      // market closed
      return orders.map(() => false);
    }

    let orderPrice = await Promise.all(
      orders.map((o) =>
        PerpetualDataHandler._queryPerpetualPrice(
          o.symbol,
          o.quantity,
          this.symbolToPerpStaticInfo,
          this.proxyContract!,
          [indexPrices![0], indexPrices![1]],
          overrides
        )
      )
    );
    let markPrice = await PerpetualDataHandler._queryPerpetualMarkPrice(
      orders[0].symbol,
      this.symbolToPerpStaticInfo,
      this.proxyContract,
      [indexPrices![0], indexPrices![1]],
      overrides
    );
    if (blockTimestamp == undefined) {
      const currentBlock = await this.provider!.getBlockNumber();
      blockTimestamp = (await this.provider!.getBlock(currentBlock)).timestamp;
    }
    return await Promise.all(
      orders.map((o, idx) =>
        this._isTradeable(o, orderPrice[idx], markPrice, blockTimestamp!, this.symbolToPerpStaticInfo, overrides)
      )
    );
  }

  /**
   * Can the order be executed?
   * @param order order struct
   * @param tradePrice "preview" price of this order
   * @param markPrice current mark price
   * @param blockTimestamp last observed block timestamp (hence already in past)
   * @param symbolToPerpInfoMap metadata
   * @returns true if trading conditions met, false otherwise
   */
  protected async _isTradeable(
    order: Order,
    tradePrice: number,
    markPrice: number,
    blockTimestamp: number,
    symbolToPerpInfoMap: Map<string, PerpetualStaticInfo>,
    overrides?: CallOverrides
  ): Promise<boolean> {
    // check expiration date
    if (order.deadline != undefined && order.deadline < Date.now() / 1000) {
      console.log("order expired");
      return false;
    }
    const nextBlockTimestamp = blockTimestamp + 2;
    // TODO: replace 2 by a chain-dependent constant - 1 for zkEVM
    if (nextBlockTimestamp < order.executionTimestamp) {
      console.log(`execution deferred to ${order.executionTimestamp - nextBlockTimestamp} more seconds`);
      return false;
    }
    if (
      order.submittedTimestamp != undefined &&
      nextBlockTimestamp < order.submittedTimestamp + OrderExecutorTool.TRADE_DELAY
    ) {
      // next block should be in ~2 seconds, so + 2
      console.log(
        `on hold for ${OrderExecutorTool.TRADE_DELAY + order.submittedTimestamp - nextBlockTimestamp} more seconds`
      );
      return false;
    }

    // check order size
    const lotSize = PerpetualDataHandler._getLotSize(order.symbol, symbolToPerpInfoMap);
    if (order.quantity < lotSize) {
      // console.log(`order size too small: ${order.quantity} < ${lotSize}`);
      return false;
    }
    // check limit price: fromSmartContractOrder will set it to undefined when not tradeable
    if (order.limitPrice == undefined) {
      // console.log("limit price undefined");
      return false;
    }
    let limitPrice = order.limitPrice!;
    if ((order.side == BUY_SIDE && tradePrice > limitPrice) || (order.side == SELL_SIDE && tradePrice < limitPrice)) {
      // console.log(`limit price not met: ${limitPrice} ${order.side} @ ${tradePrice}`);
      return false;
    }
    // check stop price
    if (
      order.stopPrice != undefined &&
      ((order.side == BUY_SIDE && markPrice < order.stopPrice) ||
        (order.side == SELL_SIDE && markPrice > order.stopPrice))
    ) {
      // console.log("stop price not met");
      return false;
    }
    //check dependency
    if (
      order.parentChildOrderIds != undefined &&
      order.parentChildOrderIds[0] == HashZero &&
      order.parentChildOrderIds[1] != HashZero
    ) {
      // order has a parent
      const orderBookContract = this.getOrderBookContract(order.symbol);
      const parentStatus = await orderBookContract.getOrderStatus(order.parentChildOrderIds[1], overrides || {});
      if (parentStatus == 2 || parentStatus == 3) {
        // console.log("parent not executed/cancelled");
        // parent is open or unknown
        return false;
      }
      return true;
    }

    // all checks passed -> order is tradeable
    return true;
  }

  /**
   * Wrapper of static method to use after mappings have been loaded into memory.
   * @param scOrder Perpetual order as received in the proxy events.
   * @returns A user-friendly order struct.
   */
  public smartContractOrderToOrder(scOrder: SmartContractOrder): Order {
    return PerpetualDataHandler.fromSmartContractOrder(scOrder, this.symbolToPerpStaticInfo);
  }

  public async getTransactionCount(blockTag?: BlockTag): Promise<number> {
    if (this.signer == null) {
      throw Error("no wallet initialized. Use createProxyInstance().");
    }
    return await this.signer.getTransactionCount(blockTag);
  }
}
