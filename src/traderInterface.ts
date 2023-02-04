import { ethers } from "ethers";
import MarketData from "./marketData";
import PerpetualDataHandler from "./perpetualDataHandler";
import { NodeSDKConfig, SmartContractOrder, Order } from "./nodeSDKTypes";
import TraderDigests from "./traderDigests";

/**
 * Interface that can be used by front-end that wraps all private functions
 * so that signatures can be handled in frontend via wallet
 * @extends MarketData
 */
export default class TraderInterface extends MarketData {
  protected chainId: number = 0;
  protected digestTool: TraderDigests;

  // accTrade.order(order)
  // cancelOrder(symbol: string, orderId: string)
  // accTrade.setAllowance
  // accTrade.queryExchangeFee("MATIC")
  // accTrade.getCurrentTraderVolume("MATIC")
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
   * Initialize the marketData-Class with this function
   * to create instance of D8X perpetual contract and gather information
   * about perpetual currencies
   * @param provider optional provider
   */
  public async createProxyInstance(provider?: ethers.providers.JsonRpcProvider) {
    await super.createProxyInstance(provider);
    this.chainId = (await this.provider!.getNetwork()).chainId;
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
    let orderBookContract: ethers.Contract = this.getOrderBookContract(symbol);
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
}
