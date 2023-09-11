import { Signer } from "@ethersproject/abstract-signer";
import { BigNumber } from "@ethersproject/bignumber";
import { HashZero } from "@ethersproject/constants";
import type { CallOverrides, ContractTransaction, PayableOverrides } from "@ethersproject/contracts";
import type { BlockTag } from "@ethersproject/providers";
import { ethers } from "ethers";
import { BUY_SIDE, OrderStatus, SELL_SIDE, ZERO_ADDRESS, ZERO_ORDER_ID } from "./constants";
import { IPyth__factory, Multicall3 } from "./contracts";
import { ABK64x64ToFloat, floatToABK64x64 } from "./d8XMath";
import {
  type NodeSDKConfig,
  type Order,
  type PerpetualStaticInfo,
  type PriceFeedSubmission,
  type SmartContractOrder,
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
        // value: submission.timestamps.length * this.PRICE_UPDATE_FEE_GWEI,s
        gasLimit: overrides?.gasLimit ?? this.gasLimit,
        ...overrides,
      } as PayableOverrides;
    }

    const pyth = IPyth__factory.connect(this.pythAddr!, this.signer);

    // update first
    const priceIds = this.symbolToPerpStaticInfo.get(symbol)!.priceIds;
    try {
      await pyth.updatePriceFeedsIfNecessary(submission.priceFeedVaas, priceIds, submission.timestamps, {
        value: this.PRICE_UPDATE_FEE_GWEI * submission.timestamps.length,
        gasLimit: overrides?.gasLimit ?? this.gasLimit,
      });
    } catch (e) {
      console.log(e);
    }

    const txData = await orderBookSC.interface.encodeFunctionData("executeOrders", [[orderId], executorAddr, [], []]);

    let unsignedTx = {
      to: orderBookSC.address,
      from: this.traderAddr,
      nonce: overrides.nonce, // populated by provider if undefined
      data: txData,
      value: overrides.value,
      gasLimit: overrides.gasLimit, // always defined at this point
      gasPrice: overrides.gasPrice, // populated by the provider if not specified
      chainId: this.chainId,
    };
    return await this.signer.sendTransaction(unsignedTx);
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
        // value: overrides?.value ?? submission.timestamps.length * this.PRICE_UPDATE_FEE_GWEI,
        gasLimit: overrides?.gasLimit ?? this.gasLimit,
        ...overrides,
      } as PayableOverrides;
    }

    const pyth = IPyth__factory.connect(this.pythAddr!, this.signer);

    // update first
    const priceIds = this.symbolToPerpStaticInfo.get(symbol)!.priceIds;
    try {
      await pyth.updatePriceFeedsIfNecessary(submission.priceFeedVaas, priceIds, submission.timestamps, {
        value: this.PRICE_UPDATE_FEE_GWEI * submission.timestamps.length,
        gasLimit: overrides?.gasLimit ?? this.gasLimit,
      });
    } catch (e) {
      console.log(e);
    }

    const txData = orderBookSC.interface.encodeFunctionData("executeOrders", [orderIds, executorAddr, [], []]);

    // const gasInfo = await fetch("https://gasstation-testnet.polygon.technology/zkevm")
    //   .then((res) => res.json())
    //   .then((info) => info as GasInfo);

    // const gasPrice = typeof gasInfo.standard == "number" ? gasInfo.standard : (gasInfo.standard as GasPriceV2).maxfee;

    let unsignedTx = {
      to: orderBookSC.address,
      from: this.traderAddr,
      nonce: overrides.nonce ?? (await this.signer.getTransactionCount()),
      data: txData,
      value: overrides.value,
      gasLimit: overrides.gasLimit,
      // gas price is populated by the provider if not specified
      gasPrice: overrides.gasPrice,
      // gasPrice: overrides.gasPrice ?? parseUnits(gasPrice.toString(), "gwei"),
      chainId: this.chainId,
    };
    return await this.signer.sendTransaction(unsignedTx);
    // return await orderBookSC.executeOrders(
    //   orderIds,
    //   executorAddr,
    //   submission?.priceFeedVaas,
    //   submission?.timestamps,
    //   overrides
    // );
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
    let numOrders = await orderBookSC.orderCount(overrides || {});
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
    orderId: string,
    blockTimestamp?: number,
    indexPrices?: [number, number],
    overrides?: CallOverrides
  ): Promise<boolean> {
    if (this.proxyContract == null || this.multicall == null) {
      throw Error("no proxy contract initialized. Use createProxyInstance().");
    }
    if (indexPrices == undefined) {
      let obj = await this.priceFeedGetter.fetchPricesForPerpetual(order.symbol);
      indexPrices = [obj.idxPrices[0], obj.idxPrices[1]];
    }

    const fS2S3 = indexPrices.map((x) => floatToABK64x64(x == undefined || Number.isNaN(x) ? 0 : x)) as [
      BigNumber,
      BigNumber
    ];
    const perpId = this.getPerpIdFromSymbol(order.symbol);
    const fAmount = floatToABK64x64(order.quantity * (order.side == BUY_SIDE ? 1 : -1));
    const orderBook = this.getOrderBookContract(order.symbol);

    const proxyCalls: Multicall3.Call3Struct[] = [
      // 0: trade amount price
      {
        target: this.proxyContract.address,
        allowFailure: false,
        callData: this.proxyContract.interface.encodeFunctionData("queryPerpetualPrice", [perpId, fAmount, fS2S3]),
      },
      // 1: amm state to get the mark price
      {
        target: this.proxyContract.address,
        allowFailure: false,
        callData: this.proxyContract.interface.encodeFunctionData("getAMMState", [perpId, fS2S3]),
      },
      // 2: order status to see if it's still open
      {
        target: orderBook.address,
        allowFailure: true,
        callData: orderBook.interface.encodeFunctionData("getOrderStatus", [orderId]),
      },
      // 3: block timestamp
      {
        target: this.multicall.address,
        allowFailure: false,
        callData: this.multicall.interface.encodeFunctionData("getCurrentBlockTimestamp"),
      },
    ];

    const hasParent =
      order.parentChildOrderIds != undefined &&
      order.parentChildOrderIds[0] == HashZero &&
      order.parentChildOrderIds[1] != HashZero;

    if (hasParent) {
      // 4: order has a parent, one more call needed:
      proxyCalls.push({
        target: orderBook.address,
        allowFailure: true,
        callData: orderBook.interface.encodeFunctionData("getOrderStatus", [order.parentChildOrderIds![1]]),
      });
    }

    // multicall
    const encodedResults = await this.multicall.callStatic.aggregate3(proxyCalls, overrides || {});

    // order status
    let iOrderStatus: number;
    if (encodedResults[2].success) {
      iOrderStatus = orderBook.interface.decodeFunctionResult("getOrderStatus", encodedResults[2].returnData)[0];
    } else {
      iOrderStatus = await orderBook.getOrderStatus(orderId);
    }
    if (iOrderStatus != OrderStatus.OPEN) {
      // no need to continue - order is no longer open
      return false;
    }

    // parent status
    if (hasParent) {
      let iParentOrderStatus: number;
      if (encodedResults[4].success) {
        iParentOrderStatus = orderBook.interface.decodeFunctionResult(
          "getOrderStatus",
          encodedResults[4].returnData
        )[0];
      } else {
        iParentOrderStatus = await orderBook.getOrderStatus(order.parentChildOrderIds![1]);
      }
      if (iParentOrderStatus != OrderStatus.EXECUTED && iParentOrderStatus != OrderStatus.CANCELED) {
        // no need to continue - parent order is still pending
        return false;
      }
    }
    // price
    const orderPrice = ABK64x64ToFloat(
      this.proxyContract.interface.decodeFunctionResult(
        "queryPerpetualPrice",
        encodedResults[0].returnData
      )[0] as BigNumber
    );
    // mark price
    const ammState = this.proxyContract.interface.decodeFunctionResult(
      "getAMMState",
      encodedResults[1].returnData
    )[0] as BigNumber[];
    const markPrice = indexPrices[0] * (1 + ABK64x64ToFloat(ammState[8]));

    // block timestamp
    const ts = (
      this.multicall.interface.decodeFunctionResult(
        "getCurrentBlockTimestamp",
        encodedResults[3].returnData
      )[0] as BigNumber
    ).toNumber();
    blockTimestamp = Math.max(ts + 1, blockTimestamp ?? 0);
    return this._isTradeable(order, orderPrice, markPrice, blockTimestamp, this.symbolToPerpStaticInfo);
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
    orderIds: string[],
    blockTimestamp?: number,
    indexPrices?: [number, number, boolean, boolean],
    overrides?: CallOverrides
  ): Promise<boolean[]> {
    if (orders.length == 0) {
      return [];
    }
    if (this.proxyContract == null || this.multicall == null) {
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

    const fS2S3 = [indexPrices[0], indexPrices[1]].map(floatToABK64x64) as [BigNumber, BigNumber];
    const perpId = this.getPerpIdFromSymbol(orders[0].symbol);
    const fAmounts = orders.map((order) => floatToABK64x64(order.quantity * (order.side == BUY_SIDE ? 1 : -1)));
    const orderBook = this.getOrderBookContract(orders[0].symbol);

    // mark price and timestamp
    let proxyCalls: Multicall3.Call3Struct[] = [
      // 0: amm state to get the mark price
      {
        target: this.proxyContract.address,
        allowFailure: false,
        callData: this.proxyContract.interface.encodeFunctionData("getAMMState", [perpId, fS2S3]),
      },
      // 1: block timestamp
      {
        target: this.multicall.address,
        allowFailure: false,
        callData: this.multicall.interface.encodeFunctionData("getCurrentBlockTimestamp"),
      },
    ];

    // status calls
    const statusCalls: Multicall3.Call3Struct[] = orderIds.map((orderId) => ({
      target: orderBook.address,
      allowFailure: false,
      callData: orderBook.interface.encodeFunctionData("getOrderStatus", [orderId]),
    }));
    proxyCalls = proxyCalls.concat(statusCalls);

    // price calls
    const priceCalls: Multicall3.Call3Struct[] = fAmounts.map((fAmount) => ({
      target: this.proxyContract!.address,
      allowFailure: false,
      callData: this.proxyContract!.interface.encodeFunctionData("queryPerpetualPrice", [perpId, fAmount, fS2S3]),
    }));
    proxyCalls = proxyCalls.concat(priceCalls);

    // possibly also get parent orders' status
    const parentStatusCalls: Multicall3.Call3Struct[] = orders
      .filter(
        (order) =>
          order.parentChildOrderIds != undefined &&
          order.parentChildOrderIds[0] == HashZero &&
          order.parentChildOrderIds[1] != HashZero
      )
      .map((order) => {
        return {
          target: orderBook.address,
          allowFailure: false,
          callData: orderBook.interface.encodeFunctionData("getOrderStatus", [order.parentChildOrderIds![1]]),
        };
      });
    proxyCalls = proxyCalls.concat(parentStatusCalls);

    // --- multicall ---
    const encodedResults = await this.multicall.callStatic.aggregate3(proxyCalls, overrides || {});

    // mark price
    const ammState = this.proxyContract.interface.decodeFunctionResult(
      "getAMMState",
      encodedResults[0].returnData
    )[0] as BigNumber[];
    const markPrice = indexPrices[0] * (1 + ABK64x64ToFloat(ammState[8]));

    // block timestamp
    const ts = (
      this.multicall.interface.decodeFunctionResult(
        "getCurrentBlockTimestamp",
        encodedResults[1].returnData
      )[0] as BigNumber
    ).toNumber();
    blockTimestamp = Math.max(ts + 1, blockTimestamp ?? 0);

    // order status
    const isOrderOpen = encodedResults.slice(2, 2 + orders.length).map((encodedResult) => {
      const iOrderStatus = orderBook.interface.decodeFunctionResult("getOrderStatus", encodedResult.returnData)[0];
      return iOrderStatus == OrderStatus.OPEN;
    });

    // order prices
    const orderPrices = encodedResults.slice(2 + orders.length, 2 + 2 * orders.length).map((encodedResult) => {
      const orderPrice = ABK64x64ToFloat(
        this.proxyContract!.interface.decodeFunctionResult(
          "queryPerpetualPrice",
          encodedResult.returnData
        )[0] as BigNumber
      );
      return orderPrice;
    });

    // check parent status
    let idxInResults = 2 + 2 * orders.length;
    let isParentReady: boolean[] = new Array<boolean>(orders.length).fill(true);
    for (let i = 0; i < orders.length; i++) {
      const order = orders[i];
      const hasParent =
        order.parentChildOrderIds != undefined &&
        order.parentChildOrderIds[0] == HashZero &&
        order.parentChildOrderIds[1] != HashZero;
      if (hasParent) {
        const iParentStatus = orderBook.interface.decodeFunctionResult(
          "getOrderStatus",
          encodedResults[idxInResults].returnData
        )[0];
        isParentReady[i] = iParentStatus == OrderStatus.EXECUTED || iParentStatus == OrderStatus.CANCELED;
        idxInResults += 1;
      }
    }

    // sync checks
    return orders.map((o, idx) => {
      if (!isOrderOpen[idx] || !isParentReady[idx]) {
        return false;
      }
      return this._isTradeable(o, orderPrices[idx], markPrice, blockTimestamp!, this.symbolToPerpStaticInfo);
    });
  }

  /**
   * Can the order be executed?
   * @param order order struct
   * @param tradePrice "preview" price of this order
   * @param markPrice current mark price
   * @param atBlockTimestamp block timestamp when execution would take place
   * @param symbolToPerpInfoMap metadata
   * @returns true if trading conditions met, false otherwise
   */
  protected _isTradeable(
    order: Order,
    tradePrice: number,
    markPrice: number,
    atBlockTimestamp: number,
    symbolToPerpInfoMap: Map<string, PerpetualStaticInfo>
  ): boolean {
    // check expiration date
    if (order.deadline != undefined && order.deadline < Date.now() / 1000) {
      console.log("order expired");
      return false;
    }
    // check execution timestamp
    if (atBlockTimestamp < order.executionTimestamp) {
      console.log(`execution deferred by ${order.executionTimestamp - atBlockTimestamp} more seconds`);
      return false;
    }
    if (order.submittedTimestamp != undefined && atBlockTimestamp < order.submittedTimestamp) {
      // next block should be in ~2 seconds, so + 2
      console.log(`on hold for ${order.submittedTimestamp - atBlockTimestamp} more seconds`);
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
