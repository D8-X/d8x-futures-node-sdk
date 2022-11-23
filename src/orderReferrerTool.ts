import WriteAccessHandler from "./writeAccessHandler";
import { NodeSDKConfig } from "./nodeSDKTypes";
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
   * Executes an order by symbol and ID.
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
  ): Promise<ethers.providers.TransactionResponse> {
    const orderBookSC = this.getOrderBookContract(symbol);
    if (typeof referrerAddr == "undefined") {
      referrerAddr = this.traderAddr;
    }
    return await orderBookSC.executeLimitOrderByDigest(orderId, referrerAddr);
  }

  /**
   * TODO: executeLimitOrderByDigest
   */
}
