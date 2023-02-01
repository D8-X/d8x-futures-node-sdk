import { BigNumber, utils } from "ethers";
import { ABK64x64ToFloat, mul64x64, div64x64 } from "./d8XMath";
import {
  PerpetualState,
  ONE_64x64,
  ExchangeInfo,
  Order,
  SmartContractOrder,
  MarginAccount,
  OrderStruct,
  TradeEvent,
} from "./nodeSDKTypes";
import { emitWarning } from "process";
import MarketData from "./marketData";

/**
 * This class handles events and stores relevant variables
 * as member variables. The events change the state of the member variables:
 *  mktData : MarketData relevant market data with current state (e.g. index price)
 *  ordersInPerpetual: Map<number, OrderStruct> all open orders for the given trader
 *  positionInPerpetual: Map<number, MarginAccount> all open positions for the given trader
 *
 *  TODO:
 *    - update functions for midprice & index & collateral prices without event
 *    - testing
 *
 * Get data:
 *  - getPerpetualData(perp id (string) or symbol) : PerpetualState. This is a reference!
 *  - getExchangeInfo() : ExchangeInfo. This is a reference!
 *  - getCurrentPositionRisk(perp id (string) or symbol) : MarginAccount. This is a reference!
 *  - getOrdersInPerpetualMap : Map<number, OrderStruct>. This is a reference!
 *  - getpositionInPerpetualMap : Map<number, MarginAccount>. This is a reference!
 *
 * Construct with a trader address and a marketData object
 * Initialize to gather all the relevant data.
 * Send event variables to event handler "on<EventName>" - this updates members
 * - [x] onUpdateMarkPrice              : emitted on proxy; updates markprice and index price data
 * - [x] onUpdateUpdateFundingRate      : emitted on proxy; sets funding rate
 * - [x] onExecutionFailed              : emitted on order book; removes an open order
 * - [x] onPerpetualLimitOrderCancelled : emitted on order book; removes an open order
 * - [x] onPerpetualLimitOrderCreated   : emitted on order book; adds an open order to the data
 * - [x] async onUpdateMarginAccount    : emitted on proxy; updates position data and open interest
 * - [x] onTrade                        : emitted on proxy; returns TradeEvent to be displayed
 */
export default class PerpetualEventHandler {
  // market data class
  private mktData: MarketData;
  // trader for which the data is tracked
  private traderAddr: string;

  // perpetual id to trader data
  private ordersInPerpetual: Map<number, OrderStruct>;
  private positionInPerpetual: Map<number, MarginAccount>;

  // perpetual id to pool index in exchange info
  private poolIndexForPerpetual: Map<number, number>;

  // keep current state of the system in exchangeInfo
  // data is updated when calling "onEvent"-functions
  private exchangeInfo: ExchangeInfo | undefined;

  constructor(mktData: MarketData, traderAddr: string) {
    this.mktData = mktData;
    this.traderAddr = traderAddr;
    this.ordersInPerpetual = new Map<number, OrderStruct>();
    this.positionInPerpetual = new Map<number, MarginAccount>();
    this.poolIndexForPerpetual = new Map<number, number>();
  }

  /**
   * Call this async function to initialize the
   * market data
   */
  public async initialize() {
    this.exchangeInfo = await this.mktData.exchangeInfo();
    // loop through all pools and perpetuals and get
    // open positions and open orders
    for (let k = 0; k < this.exchangeInfo.pools.length; k++) {
      let poolState = this.exchangeInfo.pools[k];
      let poolSymbol = poolState.poolSymbol;
      for (let j = 0; j < poolState.perpetuals.length; j++) {
        let perpState: PerpetualState = poolState.perpetuals[j];
        let perpSymbol = perpState.baseCurrency + "-" + perpState.quoteCurrency + "-" + poolSymbol;
        let orders = await this.mktData.openOrders(this.traderAddr, perpSymbol);
        let perpId = perpState.id;
        this.ordersInPerpetual.set(perpId, orders);
        let position = await this.mktData.positionRisk(this.traderAddr, perpSymbol);
        this.positionInPerpetual.set(perpId, position);
        this.poolIndexForPerpetual.set(perpId, k);
      }
    }
  }

  /**
   * Get the current exchange info
   * @returns exchange info
   */
  public getExchangeInfo(): ExchangeInfo | undefined {
    return this.exchangeInfo;
  }

  /**
   * getOrdersInPerpetualMap
   * @returns this.ordersInPerpetual
   */
  public getOrdersInPerpetualMap(): Map<number, OrderStruct> {
    return this.ordersInPerpetual;
  }

  /**
   * getpositionInPerpetualMap
   * @returns this.positionInPerpetual
   */
  public getpositionInPerpetualMap(): Map<number, MarginAccount> {
    return this.positionInPerpetual;
  }

  /**
   * Get the data for a perpetual with a given index
   * @param perpetualIdOrSymbol perpetual idx as string or symbol for which we want the data
   * @returns perpetual data for this idx
   */
  public getPerpetualData(perpetualIdOrSymbol: string): PerpetualState | undefined {
    let perpId = Number(perpetualIdOrSymbol);
    if (isNaN(perpId)) {
      perpId = this.mktData.getPerpIdFromSymbol(perpetualIdOrSymbol);
    }
    //uint24 perpetualId = uint24(_iPoolId) * 100_000 + iPerpetualIndex;
    let poolIdx = this.poolIndexForPerpetual.get(perpId)!; //Math.floor(perpId / 100_000);
    let perpetuals = this.exchangeInfo?.pools[poolIdx].perpetuals;
    if (perpetuals == undefined) {
      emitWarning(`exchangeInfo not found, initialize perpetualEventHandler`);
      return undefined;
    }
    // find perpetual
    let k;
    for (k = 0; k < perpetuals?.length && perpetuals[k].id != perpId; k++);
    if (perpetuals[k].id != perpId) {
      emitWarning(`getPerpetualData: perpetual id ${perpId} not found`);
      return undefined;
    }
    return perpetuals[k];
  }

  /**
   * Get the trader's current position risk (margin account data)
   * @param perpetualIdOrSymbol perpetual id as string ('100003') or symbol ('BTC-USD-MATIC')
   * @returns undefined if no position or margin account (='position risk')
   */
  public getCurrentPositionRisk(perpetualIdOrSymbol: string): MarginAccount | undefined {
    let perpId = Number(perpetualIdOrSymbol);
    if (isNaN(perpId)) {
      perpId = this.mktData.getPerpIdFromSymbol(perpetualIdOrSymbol);
    }
    return this.positionInPerpetual.get(perpId);
  }

  /**
   * Update the following prices:
   *  - index price
   *  - collateral price
   *  - mid-price
   * @param perpetualIdOrSymbol perpetual id as string ('100003') or symbol ('BTC-USD-MATIC')
   */
  public async updatePrices(perpetualIdOrSymbol: string) {
    let perpId = Number(perpetualIdOrSymbol);
    let symbol = perpetualIdOrSymbol;
    if (!isNaN(perpId)) {
      let sym = this.mktData.getSymbolFromPerpId(perpId);
      if (sym == undefined) {
        throw new Error(`Symbol not found for perpetual ${perpId}`);
      }
      symbol = sym;
    }
    let perpState: PerpetualState = await this.mktData.getPerpetualState(symbol);
    let perp = this.getPerpetualData(symbol);
    if (perp == undefined) {
      throw new Error(`Perpetual not found: ${symbol}`);
    }
    perp.state = perpState.state;
    perp.indexPrice = perpState.indexPrice;
    perp.collToQuoteIndexPrice = perpState.collToQuoteIndexPrice;
    perp.markPrice = perpState.markPrice;
    perp.midPrice = perpState.midPrice;
    perp.currentFundingRateBps = perpState.currentFundingRateBps;
    perp.openInterestBC = perpState.openInterestBC;
    perp.maxPositionBC = perpState.maxPositionBC;
    perp.indexPrice = perpState.indexPrice;
    perp.collToQuoteIndexPrice = perpState.collToQuoteIndexPrice;
  }

  /**
   * Handle the event UpdateMarkPrice and update relevant
   * data
   * @param perpetualId perpetual Id
   * @param fMarkPricePremium premium rate in ABDK format
   * @param fSpotIndexPrice spot index price in ABDK format
   * @returns void
   */
  public onUpdateMarkPrice(
    perpetualId: number,
    fMidPricePremium: BigNumber,
    fMarkPricePremium: BigNumber,
    fSpotIndexPrice: BigNumber
  ): void {
    let [newMidPrice, newMarkPrice, newIndexPrice] = PerpetualEventHandler.ConvertUpdateMarkPrice(
      fMidPricePremium,
      fMarkPricePremium,
      fSpotIndexPrice
    );
    let perpetual = this.getPerpetualData(perpetualId.toString());
    if (perpetual == undefined) {
      return;
    }
    perpetual.midPrice = newMidPrice;
    perpetual.markPrice = newMarkPrice;
    perpetual.indexPrice = newIndexPrice;
  }

  /**
   * Handle the event UpdateFundingRate and update relevant
   * data
   * UpdateFundingRate(uint24 indexed perpetualId, int128 fFundingRate)
   * @param fFundingRate funding rate in ABDK format
   */
  public onUpdateUpdateFundingRate(perpetualId: number, fFundingRate: BigNumber): void {
    let newRate = ABK64x64ToFloat(fFundingRate);
    let perpetual = this.getPerpetualData(perpetualId.toString());
    if (perpetual == undefined) {
      return;
    }
    perpetual.currentFundingRateBps = newRate * 1e4;
  }

  /**
   * event ExecutionFailed(
        uint24 indexed perpetualId,
        address indexed trader,
        bytes32 digest,
        string reason
    );
   * @param perpetualId id of the perpetual
   * @param trader address of the trader
   * @param digest digest of the order/cancel order
   * @param reason reason why the execution failed
   */
  public onExecutionFailed(perpetualId: number, trader: string, digest: string, reason: string) {
    if (trader != this.traderAddr) {
      emitWarning(`onExecutionFailed: trader ${trader} not relevant`);
      return;
    }
    // remove order from open orders
    let orderStructs:
      | {
          orders: Order[];
          orderIds: string[];
        }
      | undefined = this.ordersInPerpetual.get(perpetualId);
    if (orderStructs == undefined) {
      emitWarning(`onExecutionFailed: no order found for perpetual ${perpetualId}`);
      return;
    }
    if (reason == "cancel delay required") {
      // canceling failed. We don't remove the order
      return;
    }
    PerpetualEventHandler.deleteOrder(orderStructs, digest);
  }

  /**
   * Event emitted by perpetual proxy
   * event PerpetualLimitOrderCancelled(bytes32 indexed orderHash);
   * @param orderId string order id/digest
   */
  public onPerpetualLimitOrderCancelled(orderId: string) {
    // remove order from open orders
    let perpId: number | undefined = PerpetualEventHandler.findOrderForId(orderId, this.ordersInPerpetual);
    if (perpId == undefined) {
      emitWarning(`onPerpetualLimitOrderCancelled: no order found with id ${orderId}`);
      return;
    }
    let orderStruct: OrderStruct | undefined = this.ordersInPerpetual.get(perpId);
    PerpetualEventHandler.deleteOrder(orderStruct!, orderId);
  }

  /**
   * event PerpetualLimitOrderCreated(
   *    uint24 indexed perpetualId,
   *    address indexed trader,
   *    address referrerAddr,
   *    address brokerAddr,
   *    Order order,
   *    bytes32 digest
   *)
   * @param perpetualId id of the perpetual
   * @param trader address of the trader
   * @param referrerAddr address of the referrer
   * @param brokerAddr address of the broker
   * @param Order order struct
   * @param digest order id
   */
  public onPerpetualLimitOrderCreated(
    perpetualId: number,
    trader: string,
    referrerAddr: string,
    brokerAddr: string,
    Order: SmartContractOrder,
    digest: string
  ): void {
    if (trader != this.traderAddr) {
      emitWarning(`onPerpetualLimitOrderCreated: trader ${trader} not relevant`);
      return;
    }
    let order: Order = this.mktData.smartContractOrderToOrder(Order);
    let orderStruct: OrderStruct | undefined = this.ordersInPerpetual.get(perpetualId);
    if (orderStruct == undefined) {
      // no order for this perpetual so far
      this.ordersInPerpetual.set(perpetualId, { orders: [order], orderIds: [digest] });
    } else {
      orderStruct.orderIds.push(digest);
      orderStruct.orders.push(order);
    }
  }

  /**
   * This function is async -> queries the margin account
   * @param perpetualId id of the perpetual
   * @param trader trader address
   * @param positionId position id
   * @param fPositionBC position size in base currency
   * @param fCashCC margin collateral in margin account
   * @param fLockedInValueQC pos*average opening price
   * @param fFundingPaymentCC funding payment made
   * @param fOpenInterestBC open interest
   */
  public async onUpdateMarginAccount(
    perpetualId: number,
    trader: string,
    positionId: string,
    fPositionBC: BigNumber,
    fCashCC: BigNumber,
    fLockedInValueQC: BigNumber,
    fFundingPaymentCC: BigNumber,
    fOpenInterestBC: BigNumber
  ): Promise<void> {
    let perpetual = this.getPerpetualData(perpetualId.toString());
    if (perpetual == undefined) {
      emitWarning(`onUpdateMarginAccount: perpetual ${perpetualId} not found`);
      return;
    }
    perpetual.openInterestBC = ABK64x64ToFloat(fOpenInterestBC);
    if (trader != this.traderAddr) {
      return;
    }
    let perpetualIdStr = perpetualId.toString();
    let margin = await this.mktData.positionRisk(this.traderAddr, perpetualIdStr);
    this.positionInPerpetual.set(perpetualId, margin);
  }

  /**
   *
   * @param perpetualId perpetual id
   * @param trader trader address
   * @param positionId position id
   * @param order order struct
   * @param orderDigest order id
   * @param newPositionSizeBC new pos size in base currency ABDK
   * @param price price in ABDK format
   * @returns trade event data in regular number format
   */
  public onTrade(
    perpetualId: number,
    trader: string,
    positionId: string,
    order: SmartContractOrder,
    orderDigest: string,
    newPositionSizeBC: BigNumber,
    price: BigNumber
  ): TradeEvent {
    // remove order digest from open orders
    let orderStructs = this.ordersInPerpetual.get(perpetualId);
    if (orderStructs == undefined) {
      emitWarning(`onTrade: executed order not found ${orderDigest}`);
    } else {
      PerpetualEventHandler.deleteOrder(orderStructs, orderDigest);
    }
    // return transformed trade info
    return {
      perpetualId: perpetualId,
      positionId: positionId,
      orderId: orderDigest,
      newPositionSizeBC: ABK64x64ToFloat(newPositionSizeBC),
      executionPrice: ABK64x64ToFloat(newPositionSizeBC),
    };
  }

  /**
   * static function to find the number of the  OrderStruct with given orderId
   * @param orderId id/digest of order
   * @param orderMap mapping for perpetualId->OrderStruct
   * @returns id of perpetual that contains order with id = orderId or undefined
   */
  private static findOrderForId(orderId: string, orderMap: Map<number, OrderStruct>): number | undefined {
    /*orderMapMap<number, {
      orders: Order[];
      orderIds: string[];*/
    for (const perpId of orderMap.keys()) {
      let orderStructs = orderMap.get(perpId);
      if (orderStructs?.orderIds.includes(orderId)) {
        return perpId;
      }
    }
    return undefined;
  }

  /**
   * Delete the order with given id from the class member data
   * @param orderStructs array of order struct as stored for the trader and a given perpetual
   * @param orderId digest/order id
   * @returns void
   */
  private static deleteOrder(orderStructs: OrderStruct, orderId: string): void {
    // find order
    let k;
    for (k = 0; k < orderStructs.orderIds.length && orderStructs.orderIds[k] != orderId; k++);
    if (orderStructs.orderIds[k] != orderId) {
      emitWarning(`deleteOrder: no order found with digest ${orderId}`);
      return;
    }
    // delete element k on reference of orders
    orderStructs.orders[k] = orderStructs.orders[orderStructs.orders.length - 1];
    orderStructs.orders.pop();
    orderStructs.orderIds[k] = orderStructs.orderIds[orderStructs.orderIds.length - 1];
    orderStructs.orderIds.pop();
  }

  /**
   * UpdateMarkPrice(
   *  uint24 indexed perpetualId,
   *  int128 fMarkPricePremium,
   *  int128 fSpotIndexPrice
   * )
   * @param fMarkPricePremium premium rate in ABDK format
   * @param fSpotIndexPrice spot index price in ABDK format
   * @returns mark price and spot index in float
   */
  private static ConvertUpdateMarkPrice(
    fMidPricePremium: BigNumber,
    fMarkPricePremium: BigNumber,
    fSpotIndexPrice: BigNumber
  ): [number, number, number] {
    let fMarkPrice = mul64x64(fSpotIndexPrice, ONE_64x64.add(fMarkPricePremium));
    let fMidPrice = mul64x64(fSpotIndexPrice, ONE_64x64.add(fMidPricePremium));
    let midPrice = ABK64x64ToFloat(fMidPrice);
    let markPrice = ABK64x64ToFloat(fMarkPrice);
    let indexPrice = ABK64x64ToFloat(fSpotIndexPrice);
    return [midPrice, markPrice, indexPrice];
  }
}
