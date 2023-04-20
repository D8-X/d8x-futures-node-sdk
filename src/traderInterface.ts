import { Contract } from "@ethersproject/contracts";
import { ABK64x64ToFloat } from "./d8XMath";
import MarketData from "./marketData";
import { ClientOrder, NodeSDKConfig, Order, SmartContractOrder, ZERO_ORDER_ID } from "./nodeSDKTypes";
import PerpetualDataHandler from "./perpetualDataHandler";
import TraderDigests from "./traderDigests";
/**
 * Interface that can be used by front-end that wraps all private functions
 * so that signatures can be handled in frontend via wallet
 * @extends MarketData
 */
export default class TraderInterface extends MarketData {
  public digestTool: TraderDigests;

  // accTrade.order(order)
  // cancelOrder(symbol: string, orderId: string)
  // accTrade.setAllowance
  // accTrade.getOrderIds("MATIC-USD-MATIC")

  /**
   * Constructor
   * @param {NodeSDKConfig} config Configuration object, see
   * PerpetualDataHandler.readSDKConfig.
   */
  constructor(config: NodeSDKConfig) {
    super(config);
    this.digestTool = new TraderDigests();
  }

  /**
   * Get the fee that is charged to the trader for a given broker (can be ZERO-address),
   * without broker fee
   * @param poolSymbolName pool currency (e.g. MATIC)
   * @param traderAddr address of trader
   * @param brokerAddr address of broker
   * @returns fee (in decimals) that is charged by exchange (without broker)
   */
  public async queryExchangeFee(poolSymbolName: string, traderAddr: string, brokerAddr: string): Promise<number> {
    if (this.proxyContract == null) {
      throw Error("no proxy contract or wallet initialized. Use createProxyInstance().");
    }
    let poolId = PerpetualDataHandler._getPoolIdFromSymbol(poolSymbolName, this.poolStaticInfos);
    let feeTbps = await this.proxyContract.queryExchangeFee(poolId, traderAddr, brokerAddr);
    return feeTbps / 100_000;
  }

  /**
   *
   * @param poolSymbolName pool symbol, e.g. MATIC
   * @param traderAddr address of the trader
   * @returns volume in USD
   */
  public async getCurrentTraderVolume(poolSymbolName: string, traderAddr: string): Promise<number> {
    if (this.proxyContract == null) {
      throw Error("no proxy contract or wallet initialized. Use createProxyInstance().");
    }
    let poolId = PerpetualDataHandler._getPoolIdFromSymbol(poolSymbolName, this.poolStaticInfos);
    let volume = await this.proxyContract.getCurrentTraderVolume(poolId, traderAddr);
    return ABK64x64ToFloat(volume);
  }

  /**
   * Get digest to cancel an order. Digest needs to be signed and submitted via
   * orderBookContract.cancelOrder(orderId, signature);
   * @param symbol
   * @param orderId
   * @returns tuple of digest which the trader needs to sign and address of order book contract
   */
  public async cancelOrderDigest(symbol: string, orderId: string): Promise<{ digest: string; OBContractAddr: string }> {
    if (this.proxyContract == null) {
      throw Error("no proxy contract initialized. Use createProxyInstance().");
    }
    let orderBookContract = this.getOrderBookContract(symbol);
    let scOrder: SmartContractOrder = await orderBookContract.orderOfDigest(orderId);
    let digest = await this.digestTool.createDigest(scOrder, this.chainId, false, this.proxyAddr);
    return { digest: digest, OBContractAddr: orderBookContract.address };
  }

  /**
   * Get the order book address for a perpetual
   * @param symbol symbol (e.g. MATIC-USD-MATIC)
   * @returns order book address for the perpetual
   */
  public getOrderBookAddress(symbol: string): string {
    let orderBookContract: Contract = this.getOrderBookContract(symbol);
    return orderBookContract.address;
  }

  /**
   * createSmartContractOrder from user-friendly order
   * @param order order struct
   * @param traderAddr address of trader
   * @returns Smart contract type order struct
   */
  public createSmartContractOrder(order: Order, traderAddr: string): SmartContractOrder {
    let scOrder = TraderInterface.toSmartContractOrder(order, traderAddr, this.symbolToPerpStaticInfo);
    return scOrder;
  }

  /**
   * Create smart contract order and digest that the trader signs.
   * await orderBookContract.postOrder(scOrder, signature, { gasLimit: gasLimit });
   * Order must contain broker fee and broker address if there is supposed to be a broker.
   * @param scOrder smart contract order struct (get from order via createSCOrder)
   * @returns digest that the trader has to sign
   */
  public async orderDigest(scOrder: SmartContractOrder): Promise<string> {
    if (this.proxyContract == null) {
      throw Error("no proxy contract or wallet initialized. Use createProxyInstance().");
    }
    let digest = await this.digestTool.createDigest(scOrder, this.chainId, true, this.proxyContract.address);
    return digest;
  }

  /**
   * Get the ABI of a method in the proxy contract
   * @param method Name of the method
   * @returns ABI as a single string
   */
  public getProxyABI(method: string): string {
    if (this.proxyContract == null) {
      throw Error("no proxy contract or wallet initialized. Use createProxyInstance().");
    }
    return PerpetualDataHandler._getABIFromContract(this.proxyContract, method);
  }

  /**
   * Get the ABI of a method in the Limit Order Book contract corresponding to a given symbol.
   * @param symbol Symbol of the form MATIC-USD-MATIC
   * @param method Name of the method
   * @returns ABI as a single string
   */
  public getOrderBookABI(symbol: string, method: string): string {
    if (this.proxyContract == null) {
      throw Error("no proxy contract or wallet initialized. Use createProxyInstance().");
    }
    let orderBookContract: Contract = this.getOrderBookContract(symbol);
    return PerpetualDataHandler._getABIFromContract(orderBookContract, method);
  }

  public static chainOrders(orders: SmartContractOrder[], ids: string[]): ClientOrder[] {
    // add dependency
    let obOrders: ClientOrder[] = new Array<ClientOrder>(orders.length);
    if (orders.length == 1 || orders.length > 3) {
      // nothing to add
      obOrders = orders.map((o) => PerpetualDataHandler.fromSmartContratOrderToClientOrder(o));
    } else if (orders.length == 2) {
      // first order is parent, second a child
      obOrders[0] = PerpetualDataHandler.fromSmartContratOrderToClientOrder(orders[0], [ids[1], ZERO_ORDER_ID]);
      obOrders[1] = PerpetualDataHandler.fromSmartContratOrderToClientOrder(orders[1], [ZERO_ORDER_ID, ids[0]]);
    } else {
      // first order is parent, other two its children
      obOrders[0] = PerpetualDataHandler.fromSmartContratOrderToClientOrder(orders[0], [ids[1], ids[2]]);
      obOrders[1] = PerpetualDataHandler.fromSmartContratOrderToClientOrder(orders[1], [ZERO_ORDER_ID, ids[0]]);
      obOrders[2] = PerpetualDataHandler.fromSmartContratOrderToClientOrder(orders[2], [ZERO_ORDER_ID, ids[0]]);
    }
    return obOrders;
  }
}
