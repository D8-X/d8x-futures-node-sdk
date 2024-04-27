import { Signer } from "@ethersproject/abstract-signer";
import type { CallOverrides, ContractTransaction, Overrides } from "@ethersproject/contracts";
import { ZERO_ORDER_ID } from "./constants";
import { ABK64x64ToFloat, floatToDec18, floatToDecN } from "./d8XMath";
import MarketData from "./marketData";
import type { ClientOrder, NodeSDKConfig, Order, SmartContractOrder } from "./nodeSDKTypes";
import PerpetualDataHandler from "./perpetualDataHandler";
import TraderDigests from "./traderDigests";
/**
 * Interface that can be used by front-end that wraps all private functions
 * so that signatures can be handled in frontend via wallet
 * @extends MarketData
 */
export default class TraderInterface extends MarketData {
  public digestTool: TraderDigests;
  protected gasLimit: number = 1_000_000;

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
   * @example
   * import { TraderInterface, PerpetualDataHandler } from '@d8x/perpetuals-sdk';
   * async function main() {
   *   console.log(TraderInterface);
   *   const config = PerpetualDataHandler.readSDKConfig("cardona");
   *   let traderAPI = new TraderInterface(config);
   *   await traderAPI.createProxyInstance();
   *   // query exchange fee
   *   let fees = await traderAPI.queryExchangeFee("MATIC");
   *   console.log(fees);
   * }
   * main();
   *
   */
  public async queryExchangeFee(
    poolSymbolName: string,
    traderAddr: string,
    brokerAddr: string,
    overrides?: CallOverrides
  ): Promise<number> {
    if (this.proxyContract == null) {
      throw Error("no proxy contract or wallet initialized. Use createProxyInstance().");
    }
    let poolId = PerpetualDataHandler._getPoolIdFromSymbol(poolSymbolName, this.poolStaticInfos);
    let feeTbps = await this.proxyContract.queryExchangeFee(poolId, traderAddr, brokerAddr, overrides || {});
    return feeTbps / 100_000;
  }

  /**
   *
   * @param poolSymbolName pool symbol, e.g. MATIC
   * @param traderAddr address of the trader
   * @returns volume in USD
   * @example
   * import { TraderInterface, PerpetualDataHandler } from '@d8x/perpetuals-sdk';
   * async function main() {
   *   console.log(TraderInterface);
   *   const config = PerpetualDataHandler.readSDKConfig("cardona");
   *   let traderAPI = new TraderInterface(config);
   *   await traderAPI.createProxyInstance();
   *   // query volume
   *   let vol = await traderAPI.getCurrentTraderVolume("MATIC", "0xmyAddress");
   *   console.log(vol);
   * }
   * main();
   *
   */
  public async getCurrentTraderVolume(
    poolSymbolName: string,
    traderAddr: string,
    overrides?: CallOverrides
  ): Promise<number> {
    if (this.proxyContract == null) {
      throw Error("no proxy contract or wallet initialized. Use createProxyInstance().");
    }
    let poolId = PerpetualDataHandler._getPoolIdFromSymbol(poolSymbolName, this.poolStaticInfos);
    let volume = await this.proxyContract.getCurrentTraderVolume(poolId, traderAddr, overrides || {});
    return ABK64x64ToFloat(volume);
  }

  /**
   * Get digest to cancel an order. Digest needs to be signed and submitted via
   * orderBookContract.cancelOrder(orderId, signature);
   * @param symbol
   * @param orderId
   * @returns tuple of digest which the trader needs to sign and address of order book contract
   * @example
   * import { TraderInterface, PerpetualDataHandler } from '@d8x/perpetuals-sdk';
   * async function main() {
   *   console.log(TraderInterface);
   *   const config = PerpetualDataHandler.readSDKConfig("cardona");
   *   let traderAPI = new TraderInterface(config);
   *   await traderAPI.createProxyInstance();
   *   // get digest
   *   let d = await traderAPI.cancelOrderDigest("BTC-USD-MATIC", "0xmyAddress");
   *   console.log(d);
   * }
   * main();
   */
  public async cancelOrderDigest(
    symbol: string,
    orderId: string,
    overrides?: CallOverrides
  ): Promise<{ digest: string; OBContractAddr: string }> {
    if (this.proxyContract == null) {
      throw Error("no proxy contract initialized. Use createProxyInstance().");
    }
    let orderBookContract = this.getOrderBookContract(symbol);
    let scOrder: SmartContractOrder = await orderBookContract.orderOfDigest(orderId, overrides || {});
    let digest = this.digestTool.createDigest(scOrder, this.chainId, false, this.proxyAddr);
    return { digest: digest, OBContractAddr: orderBookContract.address };
  }

  /**
   * Get the order book address for a perpetual
   * @param symbol symbol (e.g. MATIC-USD-MATIC)
   * @returns order book address for the perpetual
   * @example
   * import { TraderInterface, PerpetualDataHandler } from '@d8x/perpetuals-sdk';
   * async function main() {
   *   console.log(TraderInterface);
   *   const config = PerpetualDataHandler.readSDKConfig("cardona");
   *   let traderAPI = new TraderInterface(config);
   *   await traderAPI.createProxyInstance();
   *   // get order book address
   *   let ob = traderAPI.getOrderBookAddress("BTC-USD-MATIC");
   *   console.log(ob);
   * }
   * main();
   */
  public getOrderBookAddress(symbol: string): string {
    let orderBookContract = this.getOrderBookContract(symbol);
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
  public orderDigest(scOrder: SmartContractOrder): string {
    if (this.proxyContract == null) {
      throw Error("no proxy contract or wallet initialized. Use createProxyInstance().");
    }
    let digest = this.digestTool.createDigest(scOrder, this.chainId, true, this.proxyContract.address);
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
    let orderBookContract = this.getOrderBookContract(symbol);
    return PerpetualDataHandler._getABIFromContract(orderBookContract, method);
  }

  /**
   * Takes up to three orders and designates the first one as "parent" of the others.
   * E.g. the first order opens a position, and the other two are take-profit and/or stop-loss orders.
   * @param orders 1, 2 or 3 smart contract orders
   * @param ids order ids
   * @returns client orders with dependency info filled in
   */
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

  /**
   *  Add liquidity to the PnL participant fund via signer. The address gets pool shares in return.
   * @param {Signer} signer Signer that will deposit liquidity
   * @param {string} poolSymbolName  Name of pool symbol (e.g. MATIC)
   * @param {number} amountCC  Amount in pool-collateral currency
   * @return Transaction object
   * @example
   * import { TraderInterface, PerpetualDataHandler } from '@d8x/perpetuals-sdk';
   * async function main() {
   *   console.log(TraderInterface);
   *   const config = PerpetualDataHandler.readSDKConfig("cardona");
   *   const signer = // ethers Signer, e.g. from Metamask
   *   let traderAPI = new TraderInterface(config);
   *   await traderAPI.createProxyInstance();
   *   // add liquidity
   *   let respAddLiquidity = await traderAPI.addLiquidity(signer, "MATIC", 0.1);
   *   console.log(respAddLiquidity);
   * }
   * main();
   *
   */
  public async addLiquidity(
    signer: Signer,
    poolSymbolName: string,
    amountCC: number,
    overrides?: Overrides
  ): Promise<ContractTransaction> {
    if (this.proxyContract == null) {
      throw Error("no proxy contract or wallet initialized. Use createProxyInstance().");
    }
    let poolId = PerpetualDataHandler._getPoolIdFromSymbol(poolSymbolName, this.poolStaticInfos);
    let decimals = this.getMarginTokenDecimalsFromSymbol(poolSymbolName);
    let tx = await this.proxyContract
      .connect(signer)
      .addLiquidity(poolId, floatToDecN(amountCC, decimals!), overrides || { gasLimit: this.gasLimit });
    return tx;
  }

  /**
   * Initiates a liquidity withdrawal from the pool
   * It triggers a time-delayed unlocking of the given number of pool shares.
   * The amount of pool shares to be unlocked is fixed by this call, but not their value in pool currency.
   * @param {Signer} signer Signer that will initiate liquidity withdrawal
   * @param {string} poolSymbolName Name of pool symbol (e.g. MATIC).
   * @param {string} amountPoolShares Amount in pool-shares, removes everything if > available amount.
   *
   * @return Transaction object.
   * @example
   * import { TraderInterface, PerpetualDataHandler } from '@d8x/perpetuals-sdk';
   * async function main() {
   *   console.log(TraderInterface);
   *   const config = PerpetualDataHandler.readSDKConfig("cardona");
   *   const signer = // ethers Signer, e.g. from Metamask
   *   let traderAPI = new TraderInterface(config);
   *   await traderAPI.createProxyInstance();
   *   // submit txn
   *   let tx = await traderAPI.initiateLiquidityWithdrawal(signer, "MATIC", 10.2);
   *   console.log(tx);
   * }
   * main();
   *
   */
  public async initiateLiquidityWithdrawal(
    signer: Signer,
    poolSymbolName: string,
    amountPoolShares: number,
    overrides?: Overrides
  ): Promise<ContractTransaction> {
    if (this.proxyContract == null) {
      throw Error("no proxy contract or wallet initialized. Use createProxyInstance().");
    }
    let poolId = PerpetualDataHandler._getPoolIdFromSymbol(poolSymbolName, this.poolStaticInfos);
    let tx = await this.proxyContract
      .connect(signer)
      .withdrawLiquidity(poolId, floatToDec18(amountPoolShares), overrides || { gasLimit: this.gasLimit });
    return tx;
  }

  /**
   * Withdraws as much liquidity as there is available after a call to initiateLiquidityWithdrawal.
   * The address loses pool shares in return.
   * @param {Signer} signer Signer that will execute the liquidity withdrawal
   * @param poolSymbolName
   *
   * @returns Transaction object.
   * @example
   * import { TraderInterface, PerpetualDataHandler } from '@d8x/perpetuals-sdk';
   * async function main() {
   *   console.log(TraderInterface);
   *   const config = PerpetualDataHandler.readSDKConfig("cardona");
   *   const signer = // ethers Signer, e.g. from Metamask
   *   let traderAPI = new TraderInterface(config);
   *   await traderAPI.createProxyInstance();
   *   // submit txn
   *   let tx = await traderAPI.executeLiquidityWithdrawal(signer, "MATIC");
   *   console.log(tx);
   * }
   * main();
   *
   */
  public async executeLiquidityWithdrawal(
    signer: Signer,
    poolSymbolName: string,
    overrides?: Overrides
  ): Promise<ContractTransaction> {
    if (this.proxyContract == null) {
      throw Error("no proxy contract or wallet initialized. Use createProxyInstance().");
    }
    let poolId = PerpetualDataHandler._getPoolIdFromSymbol(poolSymbolName, this.poolStaticInfos);
    let tx = await this.proxyContract
      .connect(signer)
      .executeLiquidityWithdrawal(poolId, await signer.getAddress(), overrides || { gasLimit: this.gasLimit });
    return tx;
  }
}
