import WriteAccessHandler from "./writeAccessHandler";
import { BUY_SIDE, NodeSDKConfig, Order, SELL_SIDE, ZERO_ADDRESS, ZERO_ORDER_ID } from "./nodeSDKTypes";
import { ethers } from "ethers";

/**
 * Methods to execute existing orders from the limit order book.
 */
export default class OrderReferrerTool extends WriteAccessHandler {
  /**
   * Constructor.
   * @param {NodeSDKConfig} config Configuration object.
   * @param {string} privateKey Private key of the wallet that executes the conditional orders.
   */
  public constructor(config: NodeSDKConfig, privateKey: string) {
    super(config, privateKey);
  }

  /**
   * Executes an order by symbol and ID. This action interacts with the blockchain and incurs in gas costs.
   * @param {string} symbol Symbol of the form ETH-USD-MATIC.
   * @param {string} orderId ID of the order to be executed.
   * @param {string=} referrerAddr Address of the wallet to be credited for executing the order,
   * if different from the one submitting this transaction.
   * @returns Transaction object.
   */
  public async executeOrder(
    symbol: string,
    orderId: string,
    referrerAddr?: string
  ): Promise<ethers.ContractTransaction> {
    if (this.proxyContract == null || this.signer == null) {
      throw Error("no proxy contract or wallet initialized. Use createProxyInstance().");
    }
    const orderBookSC = this.getOrderBookContract(symbol);
    if (typeof referrerAddr == "undefined") {
      referrerAddr = this.traderAddr;
    }
    return await orderBookSC.executeLimitOrderByDigest(orderId, referrerAddr);
  }

  /**
   * All the orders in the order book for a given symbol that are currently open.
   * @param {string} symbol Symbol of the form ETH-USD-MATIC.
   * @returns Array with all open orders and their IDs.
   */
  public async getAllOpenOrders(symbol: string): Promise<[Order[], string[]]> {
    let totalOrders = await this.numberOfOpenOrders(symbol);
    return await this.pollLimitOrders(symbol, totalOrders);
  }

  /**
   * Total number of limit orders for this symbol, excluding those that have been cancelled/removed.
   * @param {string} symbol Symbol of the form ETH-USD-MATIC.
   * @returns {number} Number of open orders.
   */
  public async numberOfOpenOrders(symbol: string): Promise<number> {
    if (this.proxyContract == null) {
      throw Error("no proxy contract initialized. Use createProxyInstance().");
    }
    const orderBookSC = this.getOrderBookContract(symbol);
    return await orderBookSC.numberOfOrderBookDigests();
  }

  /**
   * Get a list of active conditional orders in the order book.
   * This a read-only action and does not incur in gas costs.
   * @param {string} symbol Symbol of the form ETH-USD-MATIC.
   * @param {number} numElements Maximum number of orders to poll.
   * @param {string=} startAfter Optional order ID from where to start polling. Defaults to the first order.
   * @returns Array of orders and corresponding order IDs
   */
  public async pollLimitOrders(symbol: string, numElements: number, startAfter?: string): Promise<[Order[], string[]]> {
    if (this.proxyContract == null) {
      throw Error("no proxy contract initialized. Use createProxyInstance().");
    }
    if (typeof startAfter == "undefined") {
      startAfter = ZERO_ORDER_ID;
    }
    const orderBookSC = this.getOrderBookContract(symbol);
    let [orders, orderIds] = await orderBookSC.pollLimitOrders(startAfter, numElements);
    let userFriendlyOrders: Order[] = new Array<Order>();
    let k = 0;
    while (k < orders.length && orders[k].traderAddr != ZERO_ADDRESS) {
      userFriendlyOrders.push(WriteAccessHandler.fromSmartContractOrder(orders[k], this.symbolToPerpStaticInfo));
      k++;
    }
    return [userFriendlyOrders, orderIds];
  }

  /**
   * Check if a conditional order can be executed
   * @param order order structure
   * @returns true if order can be executed for the current state of the perpetuals
   */
  public async isTradeable(order: Order): Promise<boolean> {
    if (this.proxyContract == null) {
      throw Error("no proxy contract initialized. Use createProxyInstance().");
    }
    if (order.limitPrice == undefined) {
      throw Error("order does not have a limit price");
    }
    // check expiration date
    if (order.deadline != undefined && order.deadline < Date.now() / 1000) {
      return false;
    }
    // check limit price
    let orderPrice = await WriteAccessHandler._queryPerpetualPrice(
      order.symbol,
      order.quantity,
      this.symbolToPerpStaticInfo,
      this.proxyContract
    );
    if (
      (order.side == BUY_SIDE && orderPrice > order.limitPrice) ||
      (order.side == SELL_SIDE && orderPrice < order.limitPrice)
    ) {
      return false;
    }
    // do we need to check trigger/stop?
    if (order.stopPrice == undefined) {
      // nothing to check, order is tradeable
      return true;
    }
    // we need the mark price to check
    let markPrice = await WriteAccessHandler._queryPerpetualMarkPrice(
      order.symbol,
      this.symbolToPerpStaticInfo,
      this.proxyContract
    );
    if (
      (order.side == BUY_SIDE && markPrice < order.stopPrice) ||
      (order.side == SELL_SIDE && markPrice > order.stopPrice)
    ) {
      return false;
    }
    // all checks passed -> order is tradeable
    return true;
  }

  /**
   * TODO:
   * - [x] executeLimitOrderByDigest
   * - [x] pollLimitOrders
   * - [x] isTradeable
   * - [ ] get all limit orders
   * - [ ] tests
   */
}
