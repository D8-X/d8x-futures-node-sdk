import { Buffer } from "buffer";
import { BigNumberish, Contract, ContractTransaction, ContractTransactionResponse, Overrides, Signer } from "ethers";
import { ZERO_ADDRESS } from "./constants";
import { IPerpetualManager, LimitOrderBook } from "./contracts";
import { PayableOverrides } from "./contracts/common";
import { ABK64x64ToFloat, floatToABK64x64 } from "./d8XMath";
import MarketData from "./marketData";
import type {
  NodeSDKConfig,
  Order,
  OrderResponse,
  PerpetualStaticInfo,
  PriceFeedSubmission,
  SmartContractOrder,
} from "./nodeSDKTypes";
import PerpetualDataHandler from "./perpetualDataHandler";
import TraderDigests from "./traderDigests";
import WriteAccessHandler from "./writeAccessHandler";

/**
 * Functions to create, submit and cancel orders on the exchange.
 * This class requires a private key and executes smart-contract interactions that
 * require gas-payments.
 * @extends WriteAccessHandler
 */
export default class AccountTrade extends WriteAccessHandler {
  protected digestTool: TraderDigests;

  /**
   * Constructor
   * @param {NodeSDKConfig} config Configuration object, see PerpetualDataHandler.
   * readSDKConfig.
   * @example
   * import { AccountTrade, PerpetualDataHandler } from '@d8x/perpetuals-sdk';
   * async function main() {
   *   console.log(AccountTrade);
   *   // load configuration for Polygon zkEVM Tesnet
   *   const config = PerpetualDataHandler.readSDKConfig("cardona");
   *   // AccountTrade (authentication required, PK is an environment variable with a private key)
   *   const pk: string = <string>process.env.PK;
   *   let accTrade = new AccountTrade(config, pk);
   *   // Create a proxy instance to access the blockchain
   *   await accTrade.createProxyInstance();
   * }
   * main();
   *
   * @param {string | Signer} signer Private key or ethers Signer of the account
   */
  public constructor(config: NodeSDKConfig, signer: string | Signer) {
    super(config, signer);
    this.digestTool = new TraderDigests();
  }

  /**
   * Cancels an existing order on the exchange.
   * @param {string} symbol Symbol of the form ETH-USD-MATIC.
   * @param {string} orderId ID of the order to be cancelled.
   * @example
   * import { AccountTrade, PerpetualDataHandler, Order } from '@d8x/perpetuals-sdk';
   * async function main() {
   *    console.log(AccountTrade);
   *    // setup (authentication required, PK is an environment variable with a private key)
   *    const config = PerpetualDataHandler.readSDKConfig("arbitrumSepolia");
   *    const pk: string = <string>process.env.PK;
   *    let accTrade = new AccountTrade(config, pk);
   *    await accTrade.createProxyInstance();
   *    // cancel order
   *    let cancelTransaction = accTrade.cancelOrder(
   *      "BTC-USDC-USDC",
   *      "0xf8c74cf0a1c849ed9d53b1ac2226c154c5e020428f5249c5c4f3f6ae8468ee53",
   *    )
   *    console.log(cancelTransaction);
   *  }
   *  main();
   * @returns {ContractTransaction} Contract Transaction (containing events).
   */
  public async cancelOrder(
    symbol: string,
    orderId: string,
    submission?: PriceFeedSubmission,
    overrides?: Overrides
  ): Promise<ContractTransactionResponse> {
    if (this.proxyContract == null || this.signer == null) {
      throw Error("no proxy contract or wallet initialized. Use createProxyInstance().");
    }
    if (submission == undefined) {
      submission = await this.fetchLatestFeedPriceInfo(symbol);
    }
    const orderBookContract = this.getOrderBookContract(symbol);

    return await this._cancelOrder(symbol, orderId, orderBookContract, submission, overrides);
  }

  /**
   * Submits an order to the exchange.
   * @param {Order} order Order structure. As a minimum the structure needs to
   * specify symbol, side, type and quantity.
   * @example
   * import { AccountTrade, PerpetualDataHandler, Order } from '@d8x/perpetuals-sdk';
   * async function main() {
   *    console.log(AccountTrade);
   *    // setup (authentication required, PK is an environment variable with a private key)
   *    const config = PerpetualDataHandler.readSDKConfig("arbitrumSepolia");
   *    const pk: string = <string>process.env.PK;
   *    const accTrade = new AccountTrade(config, pk);
   *    await accTrade.createProxyInstance();
   *    // set allowance
   *    await accTrade.setAllowance("USDC");
   *    // set an order
   *    const order: Order = {
   *        symbol: "BTC-USDC-USDC",
   *        side: "BUY",
   *        type: "MARKET",
   *        quantity: 0.02,
   *        leverage: 2,
   *        executionTimestamp: Date.now()/1000,
   *    };
   *    const orderTransaction = await accTrade.order(order);
   *    console.log(orderTransaction);
   *  }
   *  main();
   *
   * @returns {ContractTransaction} Contract Transaction (containing events).
   */
  public async order(order: Order, parentChildIds?: [string, string], overrides?: Overrides): Promise<OrderResponse> {
    if (this.proxyContract == null || this.signer == null) {
      throw Error("no proxy contract or wallet initialized. Use createProxyInstance().");
    }
    let minSize = PerpetualDataHandler._getMinimalPositionSize(order.symbol, this.symbolToPerpStaticInfo);
    if (Math.abs(order.quantity) < minSize) {
      throw Error(`order size too small: minSize: ${minSize}, order quantity: ${order.quantity}`);
    }
    let orderBookContract = this.getOrderBookContract(order.symbol);
    let res: OrderResponse = await this._order(
      order,
      this.traderAddr,
      this.symbolToPerpStaticInfo,
      this.proxyContract,
      orderBookContract,
      this.chainId,
      this.signer,
      parentChildIds,
      overrides
    );
    return res;
  }

  /**
   * Fee charged by the exchange for trading any perpetual on a given pool.
   * It accounts for the current trader's fee tier (based on the trader's D8X balance and trading volume).
   * If trading with a broker, it also accounts for the selected broker's fee tier.
   * Note that this result only includes exchange fees, additional broker fees are not included.
   * @param {string} poolSymbolName Pool symbol name (e.g. MATIC, USDC, etc).
   * @param {string=} brokerAddr Optional address of a broker this trader may use to trade under.
   * @example
   * import { AccountTrade, PerpetualDataHandler } from '@d8x/perpetuals-sdk';
   * async function main() {
   *   console.log(AccountTrade);
   *   // setup (authentication required, PK is an environment variable with a private key)
   *   const config = PerpetualDataHandler.readSDKConfig("arbitrumSepolia");
   *   const pk: string = <string>process.env.PK;
   *   let accTrade = new AccountTrade(config, pk);
   *   await accTrade.createProxyInstance();
   *   // query exchange fee
   *   let fees = await accTrade.queryExchangeFee("USDC");
   *   console.log(fees);
   * }
   * main();
   *
   * @returns Exchange fee, in decimals (i.e. 0.1% is 0.001).
   */
  public async queryExchangeFee(poolSymbolName: string, brokerAddr?: string, overrides?: Overrides): Promise<number> {
    if (this.proxyContract == null) {
      throw Error("no proxy contract or wallet initialized. Use createProxyInstance().");
    }
    if (typeof brokerAddr == "undefined") {
      brokerAddr = ZERO_ADDRESS;
    }
    let poolId = PerpetualDataHandler._getPoolIdFromSymbol(poolSymbolName, this.poolStaticInfos);
    let feeTbps = await this.proxyContract.queryExchangeFee(poolId, this.traderAddr, brokerAddr, overrides || {});
    return Number(feeTbps) / 100_000;
  }

  /**
   * Exponentially weighted EMA of the total USD trading volume of all trades performed by this trader.
   * The weights are chosen so that in average this coincides with the 30 day volume.
   * @param {string} poolSymbolName Pool symbol name (e.g. MATIC, USDC, etc).
   * @example
   * import { AccountTrade, PerpetualDataHandler } from '@d8x/perpetuals-sdk';
   * async function main() {
   *   console.log(AccountTrade);
   *   // setup (authentication required, PK is an environment variable with a private key)
   *   const config = PerpetualDataHandler.readSDKConfig("xlayer");
   *   const pk: string = <string>process.env.PK;
   *   let accTrade = new AccountTrade(config, pk);
   *   await accTrade.createProxyInstance();
   *   // query 30 day volume
   *   let vol = await accTrade.getCurrentTraderVolume("WOKB");
   *   console.log(vol);
   * }
   * main();
   *
   * @returns {number} Current trading volume for this trader, in USD.
   */
  public async getCurrentTraderVolume(poolSymbolName: string, overrides?: Overrides): Promise<number> {
    if (this.proxyContract == null || this.signer == null) {
      throw Error("no proxy contract or wallet initialized. Use createProxyInstance().");
    }
    let poolId = WriteAccessHandler._getPoolIdFromSymbol(poolSymbolName, this.poolStaticInfos);
    let volume = await this.proxyContract.getCurrentTraderVolume(poolId, this.traderAddr, overrides || {});
    return ABK64x64ToFloat(volume);
  }

  /**
   *
   * @param symbol Symbol of the form ETH-USD-MATIC.
   * @example
   * import { AccountTrade, PerpetualDataHandler } from '@d8x/perpetuals-sdk';
   * async function main() {
   *   console.log(AccountTrade);
   *   // setup (authentication required, PK is an environment variable with a private key)
   *   const config = PerpetualDataHandler.readSDKConfig("xlayer");
   *   const pk: string = <string>process.env.PK;
   *   let accTrade = new AccountTrade(config, pk);
   *   await accTrade.createProxyInstance();
   *   // get order IDs
   *   let orderIds = await accTrade.getOrderIds("WOKB-USD-WOKB");
   *   console.log(orderIds);
   * }
   * main();
   *
   * @returns {string[]} Array of Ids for all the orders currently open by this trader.
   */
  public async getOrderIds(symbol: string, overrides?: Overrides): Promise<string[]> {
    if (this.proxyContract == null || this.signer == null) {
      throw Error("no proxy contract or wallet initialized. Use createProxyInstance().");
    }
    let orderBookContract = this.getOrderBookContract(symbol);
    return await MarketData.orderIdsOfTrader(this.traderAddr, orderBookContract, overrides);
  }

  /**
   * Static order function
   * @param order order type (not SmartContractOrder but Order)
   * @param traderAddr trader address
   * @param symbolToPerpetualMap maps the symbol (MATIC-USD-MATIC)-type format to the perpetual id
   * @param proxyContract contract instance of D8X perpetuals
   * @param orderBookContract order book contract or null
   * @param chainId chain Id of network
   * @param signer instance of ethers wallet that can write
   * @param gasLimit gas limit to be used for the trade
   * @returns [transaction hash, order id]
   * @ignore
   */
  public async _order(
    order: Order,
    traderAddr: string,
    symbolToPerpetualMap: Map<string, PerpetualStaticInfo>,
    proxyContract: IPerpetualManager,
    orderBookContract: LimitOrderBook,
    chainId: BigNumberish,
    signer: Signer,
    parentChildIds?: [string, string],
    overrides?: Overrides
  ): Promise<OrderResponse> {
    let scOrder = AccountTrade.toSmartContractOrder(order, traderAddr, symbolToPerpetualMap);
    let clientOrder = AccountTrade.fromSmartContratOrderToClientOrder(scOrder, parentChildIds);
    // if we are here, we have a clean order

    let [signature, digest] = await this._createSignature(scOrder, chainId, true, signer, this.proxyAddr);

    if (!overrides) {
      overrides = { gasLimit: this.gasLimit };
    }
    // all orders are sent to the order-book
    const tx = await orderBookContract.connect(signer).postOrders([clientOrder], [signature], overrides);

    // const txData = orderBookContract.interface.encodeFunctionData("postOrders", [[clientOrder], [signature]]);
    // let unsignedTx = {
    //   to: orderBookContract.target,
    //   from: this.traderAddr,
    //   nonce: overrides?.nonce,
    //   data: txData,
    //   gasLimit: overrides?.gasLimit ?? this.gasLimit,
    //   // gas price is populated by the provider if not specified
    //   gasPrice: overrides?.gasPrice,
    //   // gasPrice: overrides.gasPrice ?? parseUnits(gasPrice.toString(), "gwei"),
    //   chainId: chainId,
    // };
    // let tx = await signer.sendTransaction(unsignedTx);

    let id = this.digestTool.createOrderId(digest);
    return { tx: tx, orderId: id };
  }

  protected async _cancelOrder(
    symbol: string,
    orderId: string,
    orderBookContract: LimitOrderBook,
    submission?: PriceFeedSubmission,
    overrides?: PayableOverrides
  ): Promise<ContractTransactionResponse> {
    if (orderBookContract == null || this.signer == null) {
      throw Error(`Order Book contract for symbol ${symbol} or signer not defined`);
    }

    let scOrder = await orderBookContract.orderOfDigest(orderId);
    let [signature] = await this._createSignature(scOrder, this.chainId, false, this.signer, this.proxyAddr);
    if (submission == undefined) {
      submission = await this.fetchLatestFeedPriceInfo(symbol);
    }
    // value is minimal necessary by default, but can be overriden
    if (!overrides || overrides.value == undefined) {
      overrides = {
        value: submission.timestamps.length * this.PRICE_UPDATE_FEE_GWEI,
        gasLimit: overrides?.gasLimit ?? this.gasLimit,
        ...overrides,
      } as PayableOverrides;
    }

    return await orderBookContract.cancelOrder(
      orderId,
      signature,
      submission.priceFeedVaas,
      submission.timestamps,
      overrides
    );
  }

  /**
   * Creates a signature
   * @param order         smart-contract-type order
   * @param chainId       chainId of network
   * @param isNewOrder    true unless we cancel
   * @param signer        ethereum-type wallet
   * @param proxyAddress  address of the contract
   * @returns signature as string
   * @ignore
   */
  private async _createSignature(
    order: SmartContractOrder,
    chainId: BigNumberish,
    isNewOrder: boolean,
    signer: Signer,
    proxyAddress: string
  ): Promise<string[]> {
    let digest = this.digestTool.createDigest(order, chainId, isNewOrder, proxyAddress);
    let digestBuffer = Buffer.from(digest.substring(2, digest.length), "hex");
    let signature = await signer.signMessage(digestBuffer);
    return [signature, digest];
  }

  /**
   *
   * @param {string} symbol Symbol of the form ETH-USD-MATIC.
   * @param {number} amount How much collateral to add, in units of collateral currency, e.g. MATIC
   * @example
   * import { AccountTrade, PerpetualDataHandler } from '@d8x/perpetuals-sdk';
   *
   * async function main() {
   *   // setup (authentication required, PK is an environment variable with a private key)
   *   const config = PerpetualDataHandler.readSDKConfig("arbitrumSepolia");
   *   const pk: string = <string>process.env.PK;
   *   let accTrade = new AccountTrade(config, pk);
   *   await accTrade.createProxyInstance();
   *   // add collateral to margin account
   *   const tx = await accTrade.addCollateral("BTC-USDC-USDC", 2);
   *   console.log(orderIds);
   * }
   *
   * main();
   */
  public async addCollateral(
    symbol: string,
    amount: number,
    submission?: PriceFeedSubmission,
    overrides?: PayableOverrides
  ): Promise<ContractTransactionResponse> {
    if (this.proxyContract == null || this.signer == null) {
      throw Error("no proxy contract or wallet initialized. Use createProxyInstance().");
    }
    let perpId = this.getPerpIdFromSymbol(symbol);
    let fAmountCC = floatToABK64x64(amount);
    if (submission == undefined) {
      submission = await this.fetchLatestFeedPriceInfo(symbol);
    }
    if (!overrides || overrides.value == undefined) {
      overrides = {
        value: submission.timestamps.length * this.PRICE_UPDATE_FEE_GWEI,
        gasLimit: overrides?.gasLimit ?? this.gasLimit,
        ...overrides,
      } as PayableOverrides;
    }
    return await this.proxyContract.deposit(
      perpId,
      this.traderAddr,
      fAmountCC,
      submission.priceFeedVaas,
      submission.timestamps,
      overrides || { gasLimit: this.gasLimit }
    );
  }

  /**
   *
   * @param {string} symbol Symbol of the form ETH-USD-MATIC.
   * @param {number} amount How much collateral to remove, in units of collateral currency, e.g. MATIC
   * @example
   * import { AccountTrade, PerpetualDataHandler } from '@d8x/perpetuals-sdk';
   *
   * async function main() {
   *   // setup (authentication required, PK is an environment variable with a private key)
   *   const config = PerpetualDataHandler.readSDKConfig("arbitrumSepolia");
   *   const pk: string = <string>process.env.PK;
   *   let accTrade = new AccountTrade(config, pk);
   *   await accTrade.createProxyInstance();
   *   // remove collateral from margin account
   *   const tx = await accTrade.removeCollateral("BTC-USDC-USDC", 2);
   *   console.log(orderIds);
   * }
   *
   * main();
   */
  public async removeCollateral(
    symbol: string,
    amount: number,
    submission?: PriceFeedSubmission,
    overrides?: PayableOverrides
  ): Promise<ContractTransactionResponse> {
    if (this.proxyContract == null || this.signer == null) {
      throw Error("no proxy contract or wallet initialized. Use createProxyInstance().");
    }
    let perpId = this.getPerpIdFromSymbol(symbol);
    let fAmountCC = floatToABK64x64(amount);
    if (submission == undefined) {
      submission = await this.fetchLatestFeedPriceInfo(symbol);
    }
    if (!overrides || overrides.value == undefined) {
      overrides = {
        value: submission.timestamps.length * this.PRICE_UPDATE_FEE_GWEI,
        gasLimit: overrides?.gasLimit ?? this.gasLimit,
        ...overrides,
      } as PayableOverrides;
    }
    return await this.proxyContract.withdraw(
      perpId,
      this.traderAddr,
      fAmountCC,
      submission.priceFeedVaas,
      submission.timestamps,
      overrides || { gasLimit: this.gasLimit }
    );
  }
}
