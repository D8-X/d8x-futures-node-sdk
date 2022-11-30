import WriteAccessHandler from "./writeAccessHandler";
import { BUY_SIDE, NodeSDKConfig, Order, SELL_SIDE, ZERO_ADDRESS, ZERO_ORDER_ID } from "./nodeSDKTypes";
import { BigNumber, ethers } from "ethers";

/**
 * Functions to execute existing conditional orders from the limit order book. This class
 * requires a private key and executes smart-contract interactions that require
 * gas-payments.
 * @extends WriteAccessHandler
 */
export default class OrderReferrerTool extends WriteAccessHandler {
  /**
   * Constructor.
   * @param {NodeSDKConfig} config Configuration object, see PerpetualDataHandler.readSDKConfig.
   * @example
   * import { OrderReferrerTool, PerpetualDataHandler } from '@d8x/perpetuals-sdk';
   * async function main() {
   *   console.log(OrderReferrerTool);
   *   // load configuration for testnet
   *   const config = PerpetualDataHandler.readSDKConfig("testnet");
   *   // OrderReferrerTool (authentication required, PK is an environment variable with a private key)
   *   const pk: string = <string>process.env.PK;
   *   let orderTool = new OrderReferrerTool(config, pk);
   *   // Create a proxy instance to access the blockchain
   *   await orderTool.createProxyInstance();
   * }
   * main();
   *
   * @param {string} privateKey Private key of the wallet that executes the conditional orders.
   */
  public constructor(config: NodeSDKConfig, privateKey: string) {
    super(config, privateKey);
  }

  /**
   * Executes an order by symbol and ID. This action interacts with the blockchain and incurs gas costs.
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
   * @example
   * import { OrderReferrerTool, PerpetualDataHandler } from '@d8x/perpetuals-sdk';
   * async function main() {
   *   console.log(OrderReferrerTool);
   *   // Setup (authentication required, PK is an environment variable with a private key)
   *   const config = PerpetualDataHandler.readSDKConfig("testnet");
   *   const pk: string = <string>process.env.PK;
   *   let orderTool = new OrderReferrerTool(config, pk);
   *   await orderTool.createProxyInstance();
   *   // get all open orders
   *   let openOrders = await orderTool.getAllOpenOrders("ETH-USD-MATIC");
   *   console.log(openOrders);
   * }
   * main();
   *
   * @returns Array with all open orders and their IDs.
   */
  public async getAllOpenOrders(symbol: string): Promise<[Order[], string[]]> {
    let totalOrders = await this.numberOfOpenOrders(symbol);
    return await this.pollLimitOrders(symbol, totalOrders);
  }

  /**
   * Total number of limit orders for this symbol, excluding those that have been cancelled/removed.
   * @param {string} symbol Symbol of the form ETH-USD-MATIC.
   * @example
   * import { OrderReferrerTool, PerpetualDataHandler } from '@d8x/perpetuals-sdk';
   * async function main() {
   *   console.log(OrderReferrerTool);
   *   // Setup (authentication required, PK is an environment variable with a private key)
   *   const config = PerpetualDataHandler.readSDKConfig("testnet");
   *   const pk: string = <string>process.env.PK;
   *   let orderTool = new OrderReferrerTool(config, pk);
   *   await orderTool.createProxyInstance();
   *   // get all open orders
   *   let numberOfOrders = await orderTool.numberOfOpenOrders("ETH-USD-MATIC");
   *   console.log(numberOfOrders);
   * }
   * main();
   *
   * @returns {number} Number of open orders.
   */
  public async numberOfOpenOrders(symbol: string): Promise<number> {
    if (this.proxyContract == null) {
      throw Error("no proxy contract initialized. Use createProxyInstance().");
    }
    const orderBookSC = this.getOrderBookContract(symbol);
    let numOrders = await orderBookSC.numberOfOrderBookDigests();
    return Number(numOrders);
  }

  /**
   * Get order from the digest (=id)
   * @param symbol symbol of order book, e.g. ETH-USD-MATIC
   * @param digest digest of the order (=order ID)
   * @returns order or undefined
   */
  public async getOrderById(symbol: string, id: string): Promise<Order | undefined> {
    let ob = await this.getOrderBookContract(symbol);
    let smartContractOrder = await ob.orderOfDigest(id);
    if (smartContractOrder.traderAddr == ZERO_ADDRESS) {
      return undefined;
    }
    let order = OrderReferrerTool.fromSmartContractOrder(smartContractOrder, this.symbolToPerpStaticInfo);
    return order;
  }

  /**
   * Get a list of active conditional orders in the order book.
   * This a read-only action and does not incur in gas costs.
   * @param {string} symbol Symbol of the form ETH-USD-MATIC.
   * @param {number} numElements Maximum number of orders to poll.
   * @param {string=} startAfter Optional order ID from where to start polling. Defaults to the first order.
   * @example
   * import { OrderReferrerTool, PerpetualDataHandler } from '@d8x/perpetuals-sdk';
   * async function main() {
   *   console.log(OrderReferrerTool);
   *   // Setup (authentication required, PK is an environment variable with a private key)
   *   const config = PerpetualDataHandler.readSDKConfig("testnet");
   *   const pk: string = <string>process.env.PK;
   *   let orderTool = new OrderReferrerTool(config, pk);
   *   await orderTool.createProxyInstance();
   *   // get all open orders
   *   let activeOrders = await orderTool.pollLimitOrders("ETH-USD-MATIC", 2);
   *   console.log(activeOrders);
   * }
   * main();
   *
   * @returns Array of orders and corresponding order IDs
   */
  public async pollLimitOrders(symbol: string, numElements: number, startAfter?: string): Promise<[Order[], string[]]> {
    if (this.proxyContract == null) {
      throw Error("no proxy contract initialized. Use createProxyInstance().");
    }
    const orderBookSC = this.getOrderBookContract(symbol);
    if (typeof startAfter == "undefined") {
      startAfter = ZERO_ORDER_ID;
      let idx = await orderBookSC.lastOrderHash();
      let idxPrev = await orderBookSC.prevOrderHash(idx);
      let isFirst = idxPrev == ZERO_ORDER_ID;
      while (!isFirst) {
        idx = idxPrev;
        idxPrev = await orderBookSC.prevOrderHash(idxPrev);
        isFirst = idxPrev == ZERO_ORDER_ID;
      }
      startAfter = idx;
    }
    let [orders, orderIds] = await orderBookSC.pollLimitOrders(startAfter, BigNumber.from(numElements));
    let userFriendlyOrders: Order[] = new Array<Order>();
    let orderIdsOut = [];
    let k = 0;
    while (k < orders.length && orders[k].traderAddr != ZERO_ADDRESS) {
      userFriendlyOrders.push(WriteAccessHandler.fromSmartContractOrder(orders[k], this.symbolToPerpStaticInfo));
      orderIdsOut.push(orderIds[k]);
      k++;
    }
    return [userFriendlyOrders, orderIdsOut];
  }

  /**
   * Check if a conditional order can be executed
   * @param order order structure
   * @example
   * import { OrderReferrerTool, PerpetualDataHandler } from '@d8x/perpetuals-sdk';
   * async function main() {
   *   console.log(OrderReferrerTool);
   *   // setup (authentication required, PK is an environment variable with a private key)
   *   const config = PerpetualDataHandler.readSDKConfig("testnet");
   *   const pk: string = <string>process.env.PK;
   *   let orderTool = new OrderReferrerTool(config, pk);
   *   await orderTool.createProxyInstance();
   *   // check if tradeable
   *   let openOrders = await orderTool.getAllOpenOrders("MATIC-USD-MATIC");    
   *   let check = await orderTool.isTradeable(openOrders[0][0]);
   *   console.log(check);
   * }
   * main();
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
