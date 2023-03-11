import { ethers } from "ethers";
import { ABK64x64ToFloat, floatToABK64x64 } from "./d8XMath";
import MarketData from "./marketData";
import {
  MOCK_TOKEN_SWAP_ABI,
  NodeSDKConfig,
  Order,
  OrderResponse,
  PerpetualStaticInfo,
  SmartContractOrder,
  ZERO_ADDRESS,
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
   *   // load configuration for testnet
   *   const config = PerpetualDataHandler.readSDKConfig("testnet");
   *   // AccountTrade (authentication required, PK is an environment variable with a private key)
   *   const pk: string = <string>process.env.PK;
   *   let accTrade = new AccountTrade(config, pk);
   *   // Create a proxy instance to access the blockchain
   *   await accTrade.createProxyInstance();
   * }
   * main();
   *
   * @param {string} privateKey Private key of account that trades.
   */
  public constructor(config: NodeSDKConfig, privateKey: string) {
    super(config, privateKey);
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
   *    const config = PerpetualDataHandler.readSDKConfig("testnet");
   *    const pk: string = <string>process.env.PK;
   *    let accTrade = new AccountTrade(config, pk);
   *    await accTrade.createProxyInstance();
   *    // cancel order
   *    let cancelTransaction = accTrade.cancelOrder("MATIC-USD-MATIC",
   *        "0x4639061a58dcf34f4c9c703f49f1cb00d6a4fba490d62c0eb4a4fb06e1c76c19")
   *    console.log(cancelTransaction);
   *  }
   *  main();
   * @returns {ContractTransaction} Contract Transaction (containing events).
   */
  public async cancelOrder(symbol: string, orderId: string): Promise<ethers.ContractTransaction> {
    if (this.proxyContract == null || this.signer == null) {
      throw Error("no proxy contract or wallet initialized. Use createProxyInstance().");
    }
    let orderBookContract: ethers.Contract | null = null;
    orderBookContract = this.getOrderBookContract(symbol);

    return await this._cancelOrder(symbol, orderId, orderBookContract);
  }

  /*
    TODO: -deposit (margin into account)
          -withdraw margin withdraw(uint24 _iPerpetualId, int128 _fAmount)

  */

  /**
   * Submits an order to the exchange.
   * @param {Order} order Order structure. As a minimum the structure needs to
   * specify symbol, side, type and quantity.
   * @example
   * import { AccountTrade, PerpetualDataHandler, Order } from '@d8x/perpetuals-sdk';
   * async function main() {
   *    console.log(AccountTrade);
   *    // setup (authentication required, PK is an environment variable with a private key)
   *    const config = PerpetualDataHandler.readSDKConfig("testnet");
   *    const pk: string = <string>process.env.PK;
   *    let accTrade = new AccountTrade(config, pk);
   *    await accTrade.createProxyInstance();
   *    // set allowance
   *    await accTrade.setAllowance("MATIC");
   *    // set an order
   *    let order: Order = {
   *        symbol: "MATIC-USD-MATIC",
   *        side: "BUY",
   *        type: "MARKET",
   *        quantity: 100,
   *        leverage: 2,
   *        timestamp: Date.now()/1000,
   *    };
   *    let orderTransaction = await accTrade.order(order);
   *    console.log(orderTransaction);
   *  }
   *  main();
   *
   * @example
   * import { AccountTrade, PerpetualDataHandler, Order } from '@d8x/perpetuals-sdk';
   * async function main() {
   *    console.log(AccountTrade);
   *    // setup (authentication required, PK is an environment variable with a private key)
   *    const config = PerpetualDataHandler.readSDKConfig("testnet");
   *    const pk: string = <string>process.env.PK;
   *    let accTrade = new AccountTrade(config, pk);
   *    await accTrade.createProxyInstance();
   *    // set allowance
   *    await accTrade.setAllowance("MATIC");
   *    // set an order
   *   let order: Order = {
   *       symbol: "MATIC-USD-MATIC",
   *       side: "BUY",
   *       type: "LIMIT",
   *       limitPrice: 1,
   *       quantity: 5,
   *       leverage: 2,
   *       timestamp: Date.now() / 1000,
   *       deadline: Date.now() / 1000 + 8*60*60, // order expires 8 hours from now
   *    };
   *    let orderTransaction = await accTrade.order(order);
   *    console.log(orderTransaction);
   *  }
   *  main();
   *
   * @returns {ContractTransaction} Contract Transaction (containing events).
   */
  public async order(order: Order): Promise<OrderResponse> {
    if (this.proxyContract == null || this.signer == null) {
      throw Error("no proxy contract or wallet initialized. Use createProxyInstance().");
    }
    let minSize = PerpetualDataHandler._getMinimalPositionSize(order.symbol, this.symbolToPerpStaticInfo);
    if (Math.abs(order.quantity) < minSize) {
      throw Error("order size too small");
    }
    let orderBookContract: ethers.Contract = this.getOrderBookContract(order.symbol);
    let res: OrderResponse = await this._order(
      order,
      this.traderAddr,
      this.symbolToPerpStaticInfo,
      this.proxyContract,
      orderBookContract,
      this.chainId,
      this.signer,
      this.gasLimit
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
   *   const config = PerpetualDataHandler.readSDKConfig("testnet");
   *   const pk: string = <string>process.env.PK;
   *   let accTrade = new AccountTrade(config, pk);
   *   await accTrade.createProxyInstance();
   *   // query exchange fee
   *   let fees = await accTrade.queryExchangeFee("MATIC");
   *   console.log(fees);
   * }
   * main();
   *
   * @returns Exchange fee, in decimals (i.e. 0.1% is 0.001).
   */
  public async queryExchangeFee(poolSymbolName: string, brokerAddr?: string): Promise<number> {
    if (this.proxyContract == null) {
      throw Error("no proxy contract or wallet initialized. Use createProxyInstance().");
    }
    if (typeof brokerAddr == "undefined") {
      brokerAddr = ZERO_ADDRESS;
    }
    let poolId = PerpetualDataHandler._getPoolIdFromSymbol(poolSymbolName, this.poolStaticInfos);
    let feeTbps = await this.proxyContract.queryExchangeFee(poolId, this.traderAddr, brokerAddr);
    return feeTbps / 100_000;
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
   *   const config = PerpetualDataHandler.readSDKConfig("testnet");
   *   const pk: string = <string>process.env.PK;
   *   let accTrade = new AccountTrade(config, pk);
   *   await accTrade.createProxyInstance();
   *   // query 30 day volume
   *   let vol = await accTrade.getCurrentTraderVolume("MATIC");
   *   console.log(vol);
   * }
   * main();
   *
   * @returns {number} Current trading volume for this trader, in USD.
   */
  public async getCurrentTraderVolume(poolSymbolName: string): Promise<number> {
    if (this.proxyContract == null || this.signer == null) {
      throw Error("no proxy contract or wallet initialized. Use createProxyInstance().");
    }
    let poolId = WriteAccessHandler._getPoolIdFromSymbol(poolSymbolName, this.poolStaticInfos);
    let volume = await this.proxyContract.getCurrentTraderVolume(poolId, this.traderAddr);
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
   *   const config = PerpetualDataHandler.readSDKConfig("testnet");
   *   const pk: string = <string>process.env.PK;
   *   let accTrade = new AccountTrade(config, pk);
   *   await accTrade.createProxyInstance();
   *   // get order IDs
   *   let orderIds = await accTrade.getOrderIds("MATIC-USD-MATIC");
   *   console.log(orderIds);
   * }
   * main();
   *
   * @returns {string[]} Array of Ids for all the orders currently open by this trader.
   */
  public async getOrderIds(symbol: string): Promise<string[]> {
    if (this.proxyContract == null || this.signer == null) {
      throw Error("no proxy contract or wallet initialized. Use createProxyInstance().");
    }
    let orderBookContract = this.getOrderBookContract(symbol);
    return await MarketData.orderIdsOfTrader(this.traderAddr, orderBookContract);
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
    proxyContract: ethers.Contract,
    orderBookContract: ethers.Contract,
    chainId: number,
    signer: ethers.Wallet,
    gasLimit: number
  ): Promise<OrderResponse> {
    let scOrder = AccountTrade.toSmartContractOrder(order, traderAddr, symbolToPerpetualMap);
    // if we are here, we have a clean order
    // decide whether to send order to Limit Order Book or AMM based on order type
    let tx: ethers.ContractTransaction;
    // all orders are sent to the order-book
    let [signature, digest] = await this._createSignature(scOrder, chainId, true, signer, proxyContract.address);
    tx = await orderBookContract.postOrder(scOrder, signature, { gasLimit: gasLimit });
    let id = await this.digestTool.createOrderId(digest);
    return { tx: tx, orderId: id };
  }

  protected async _cancelOrder(
    symbol: string,
    orderId: string,
    orderBookContract: ethers.Contract | null
  ): Promise<ethers.ContractTransaction> {
    if (orderBookContract == null || this.signer == null) {
      throw Error(`Order Book contract for symbol ${symbol} or signer not defined`);
    }
    let scOrder: SmartContractOrder = await orderBookContract.orderOfDigest(orderId);
    let [signature, digest] = await this._createSignature(scOrder, this.chainId, false, this.signer, this.proxyAddr);
    return await orderBookContract.cancelOrder(orderId, signature);
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
    chainId: number,
    isNewOrder: boolean,
    signer: ethers.Wallet,
    proxyAddress: string
  ): Promise<string[]> {
    let digest = await this.digestTool.createDigest(order, chainId, isNewOrder, proxyAddress);
    let digestBuffer = Buffer.from(digest.substring(2, digest.length), "hex");
    let signature = await signer.signMessage(digestBuffer);
    return [signature, digest];
  }

  /**
   *
   * @param {string} symbol Symbol of the form ETH-USD-MATIC.
   * @param {number} amount How much collateral to add, in units of collateral currency, e.g. MATIC
   */
  public async addCollateral(symbol: string, amount: number): Promise<ethers.ContractTransaction> {
    if (this.proxyContract == null || this.signer == null) {
      throw Error("no proxy contract or wallet initialized. Use createProxyInstance().");
    }
    let perpId = this.getPerpIdFromSymbol(symbol);
    let fAmountCC = floatToABK64x64(amount);
    return await this.proxyContract.deposit(perpId, fAmountCC);
  }

  /**
   *
   * @param {string} symbol Symbol of the form ETH-USD-MATIC.
   * @param {number} amount How much collateral to remove, in units of collateral currency, e.g. MATIC
   */
  public async removeCollateral(symbol: string, amount: number): Promise<ethers.ContractTransaction> {
    if (this.proxyContract == null || this.signer == null) {
      throw Error("no proxy contract or wallet initialized. Use createProxyInstance().");
    }
    let perpId = this.getPerpIdFromSymbol(symbol);
    let fAmountCC = floatToABK64x64(amount);
    return await this.proxyContract.withdraw(perpId, fAmountCC);
  }

  public async swapForMockToken(symbol: string, amountToPay: string) {
    if (this.signer == null) {
      throw Error("no wallet initialized. Use createProxyInstance().");
    }
    let tokenAddress = this.getMarginTokenFromSymbol(symbol);
    if (tokenAddress == undefined) {
      throw Error("symbols not found");
    }
    let tokenToSwap = new Map<string, string>(Object.entries(require("../config/mockSwap.json")));
    let swapAddress = tokenToSwap.get(tokenAddress);
    if (swapAddress == undefined) {
      throw Error("No swap contract found for symbol.");
    }
    let contract = new ethers.Contract(swapAddress, MOCK_TOKEN_SWAP_ABI, this.signer.provider);
    return await contract.swapToMockToken({
      value: ethers.utils.parseEther(amountToPay),
    });
  }
}
