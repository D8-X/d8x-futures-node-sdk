import { BigNumber, ethers } from "ethers";
import {
  BUY_SIDE,
  NodeSDKConfig,
  Order,
  PerpetualStaticInfo,
  SELL_SIDE,
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
export default class OrderReferrerTool extends WriteAccessHandler {
  static BLOCK_DELAY = 2;
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
   * @example
   * import { OrderReferrerTool, PerpetualDataHandler, Order } from "@d8x/perpetuals-sdk";
   * async function main() {
   *   console.log(OrderReferrerTool);
   *   // Setup (authentication required, PK is an environment variable with a private key)
   *   const config = PerpetualDataHandler.readSDKConfig("testnet");
   *   const pk: string = <string>process.env.PK;
   *   const symbol = "ETH-USD-MATIC";
   *   let orderTool = new OrderReferrerTool(config, pk);
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
    referrerAddr?: string,
    nonce?: number
  ): Promise<ethers.ContractTransaction> {
    if (this.proxyContract == null || this.signer == null) {
      throw Error("no proxy contract or wallet initialized. Use createProxyInstance().");
    }
    const orderBookSC = this.getOrderBookContract(symbol);
    if (typeof referrerAddr == "undefined") {
      referrerAddr = this.traderAddr;
    }
    const options = { gasLimit: this.gasLimit, nonce: nonce };
    return await orderBookSC.executeOrder(orderId, referrerAddr, options);
  }

  /**
   * All the orders in the order book for a given symbol that are currently open.
   * @param {string} symbol Symbol of the form ETH-USD-MATIC.
   * @example
   * import { OrderReferrerTool, PerpetualDataHandler } from '@d8x/perpetuals-sdk';
   * async function main() {
   *   console.log(OrderReferrerTool);
   *   // setup (authentication required, PK is an environment variable with a private key)
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
   *   // setup (authentication required, PK is an environment variable with a private key)
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
   * @example
   * import { OrderReferrerTool, PerpetualDataHandler } from '@d8x/perpetuals-sdk';
   * async function main() {
   *   console.log(OrderReferrerTool);
   *   // setup (authentication required, PK is an environment variable with a private key)
   *   const config = PerpetualDataHandler.readSDKConfig("testnet");
   *   const pk: string = <string>process.env.PK;
   *   let orderTool = new OrderReferrerTool(config, pk);
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
   *   // setup (authentication required, PK is an environment variable with a private key)
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
    let orderPrice = await PerpetualDataHandler._queryPerpetualPrice(
      order.symbol,
      order.quantity,
      this.symbolToPerpStaticInfo,
      this.proxyContract
    );
    let markPrice = await PerpetualDataHandler._queryPerpetualMarkPrice(
      order.symbol,
      this.symbolToPerpStaticInfo,
      this.proxyContract
    );
    let block = await this.provider!.getBlockNumber();
    return OrderReferrerTool._isTradeable(order, orderPrice, markPrice, block, this.symbolToPerpStaticInfo);
  }

  public async isTradeableBatch(orders: Order[]): Promise<boolean[]> {
    if (orders.length == 0) {
      return [];
    }
    if (this.proxyContract == null) {
      throw Error("no proxy contract initialized. Use createProxyInstance().");
    }
    if (orders.filter((o) => o.symbol == orders[0].symbol).length < orders.length) {
      throw Error("all orders in a batch must have the same symbol");
    }
    let orderPrice = await Promise.all(
      orders.map((o) =>
        PerpetualDataHandler._queryPerpetualPrice(
          o.symbol,
          o.quantity,
          this.symbolToPerpStaticInfo,
          this.proxyContract!
        )
      )
    );
    let markPrice = await PerpetualDataHandler._queryPerpetualMarkPrice(
      orders[0].symbol,
      this.symbolToPerpStaticInfo,
      this.proxyContract
    );
    let block = await this.provider!.getBlockNumber();
    return orders.map((o, idx) =>
      OrderReferrerTool._isTradeable(o, orderPrice[idx], markPrice, block, this.symbolToPerpStaticInfo)
    );
  }

  public static _isTradeable(
    order: Order,
    orderPrice: number,
    markPrice: number,
    block: number,
    symbolToPerpInfoMap: Map<string, PerpetualStaticInfo>
  ): boolean {
    // check expiration date
    if (order.deadline != undefined && order.deadline < Date.now() / 1000) {
      return false;
    }

    if (order.submittedBlock == undefined || order.submittedBlock + this.BLOCK_DELAY > block) {
      return false;
    }

    // check order size
    if (order.quantity < PerpetualDataHandler._getLotSize(order.symbol, symbolToPerpInfoMap)) {
      return false;
    }
    // check limit price, which may be undefined if it's an unrestricted market order
    if (order.limitPrice == undefined) {
      order.limitPrice = order.side == BUY_SIDE ? Infinity : 0;
    }

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
    if (
      (order.side == BUY_SIDE && markPrice < order.stopPrice) ||
      (order.side == SELL_SIDE && markPrice > order.stopPrice)
    ) {
      return false;
    }
    // all checks passed -> order is tradeable
    return true;
  }

  public async getTransactionCount(blockTag?: ethers.providers.BlockTag): Promise<number> {
    if (this.signer == null) {
      throw Error("no wallet initialized. Use createProxyInstance().");
    }
    return await this.signer.getTransactionCount(blockTag);
  }
}
