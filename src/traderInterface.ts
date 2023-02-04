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
  public constructor(config: NodeSDKConfig) {
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
   * Create smart contract order and digest that the trader signs.
   * await orderBookContract.postOrder(scOrder, signature, { gasLimit: gasLimit });
   * Order must contain broker fee and broker address if there is supposed to be a broker.
   * @param order order struct
   * @param traderAddr address of the trader
   * @returns tuple of digest that the trader has to sign, order book address, and smart contract order
   */
  public async orderDigest(
    order: Order,
    traderAddr: string
  ): Promise<{ digest: string; OBAddr: string; SCOrder: SmartContractOrder }> {
    if (this.proxyContract == null) {
      throw Error("no proxy contract or wallet initialized. Use createProxyInstance().");
    }
    let minSize = PerpetualDataHandler._getMinimalPositionSize(order.symbol, this.symbolToPerpStaticInfo);
    if (Math.abs(order.quantity) < minSize) {
      throw Error("order size too small");
    }
    let orderBookContract: ethers.Contract = this.getOrderBookContract(order.symbol);
    let scOrder = TraderInterface.toSmartContractOrder(order, traderAddr, this.symbolToPerpStaticInfo);
    let digest = await this.digestTool.createDigest(scOrder, this.chainId, true, this.proxyContract.address);
    return { digest: digest, OBAddr: orderBookContract.address, SCOrder: scOrder };
  }
}
