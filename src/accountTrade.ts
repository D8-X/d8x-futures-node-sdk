import { ethers } from "ethers";
import { ABK64x64ToFloat } from "./d8XMath";
import MarketData from "./marketData";
import {
  NodeSDKConfig,
  Order,
  SmartContractOrder,
  ZERO_ADDRESS,
  ORDER_TYPE_MARKET,
  PerpetualStaticInfo,
} from "./nodeSDKTypes";
import WriteAccessHandler from "./writeAccessHandler";

/**
 * Functions to create, submit and cancel orders on the exchange.
 * This class requires a private key and executes smart-contract interactions that
 * require gas-payments.
 */
export default class AccountTrade extends WriteAccessHandler {
  /**
   * Constructor
   * @param {NodeSDKConfig} config Configuration object, see PerpetualDataHandler.
   * readSDKConfig.
   * @example
   * const config = PerpetualDataHandler.readSDKConfig("testnet")
   *
   * @param {string} privateKey Private key of account that trades.
   */
  public constructor(config: NodeSDKConfig, privateKey: string) {
    super(config, privateKey);
  }

  /**
   * Cancels an existing order on the exchange.
   * @param {string} symbol Symbol of the form ETH-USD-MATIC.
   * @param {string} orderId ID of the order to be cancelled.
   */
  public async cancelOrder(symbol: string, orderId: string): Promise<string | undefined> {
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
   * let order: Order = {
   *       symbol: "MATIC-USD-MATIC",
   *       side: "BUY",
   *       type: "MARKET",
   *       quantity: 1,
   * }
   *
   * @returns {ContractTransaction} Contract Transaction (containing events).
   */
  public async order(order: Order): Promise<ethers.ContractTransaction> {
    if (this.proxyContract == null || this.signer == null) {
      throw Error("no proxy contract or wallet initialized. Use createProxyInstance().");
    }
    let orderBookContract: ethers.Contract | null = null;
    if (order.type != ORDER_TYPE_MARKET) {
      orderBookContract = this.getOrderBookContract(order.symbol);
    }
    return await this._order(
      order,
      this.traderAddr,
      this.symbolToPerpStaticInfo,
      this.proxyContract,
      orderBookContract,
      this.chainId,
      this.signer,
      this.gasLimit
    );
  }

  /**
   * Fee charged by the exchange for trading any perpetual on a given pool.
   * It accounts for the current trader's fee tier (based on the trader's D8X balance and trading volume).
   * If trading with a broker, it also accounts for the selected broker's fee tier.
   * Note that this result only includes exchange fees, additional broker fees are not included.
   * @param {string} poolSymbolName Pool symbol name (e.g. MATIC, USDC, etc).
   * @param {string=} brokerAddr Optional address of a broker this trader may use to trade under.
   * @returns Exchange fee, in decimals (i.e. 0.1% is 0.001).
   */
  public async queryExchangeFee(poolSymbolName: string, brokerAddr?: string): Promise<number> {
    if (this.proxyContract == null || this.signer == null) {
      throw Error("no proxy contract or wallet initialized. Use createProxyInstance().");
    }
    if (typeof brokerAddr == "undefined") {
      brokerAddr = ZERO_ADDRESS;
    }
    let poolId = WriteAccessHandler._getPoolIdFromSymbol(poolSymbolName, this.poolStaticInfos);
    let feeTbps = await this.proxyContract.queryExchangeFee(poolId, this.traderAddr, brokerAddr);
    return feeTbps / 100_000;
  }

  /**
   * Exponentially weighted EMA of the total trading volume of all trades performed by this trader.
   * The weights are chosen so that in average this coincides with the 30 day volume.
   * @param {string} poolSymbolName Pool symbol name (e.g. MATIC, USDC, etc).
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
   * @returns transaction hash
   * @ignore
   */
  public async _order(
    order: Order,
    traderAddr: string,
    symbolToPerpetualMap: Map<string, PerpetualStaticInfo>,
    proxyContract: ethers.Contract,
    orderBookContract: ethers.Contract | null,
    chainId: number,
    signer: ethers.Wallet,
    gasLimit: number
  ): Promise<ethers.ContractTransaction> {
    let scOrder = AccountTrade.toSmartContractOrder(order, traderAddr, symbolToPerpetualMap);
    // if we are here, we have a clean order
    // decide whether to send order to Limit Order Book or AMM based on order type
    let tx: ethers.ContractTransaction;
    if (order.type == ORDER_TYPE_MARKET) {
      // send market order
      tx = await proxyContract.trade(scOrder, { gasLimit: gasLimit });
    } else {
      // conditional order so the order is sent to the order-book
      if (orderBookContract == null) {
        throw Error("Order book contract not provided.");
      }
      let signature = await this._createSignature(scOrder, chainId, true, signer, proxyContract.address);
      tx = await orderBookContract.createLimitOrder(scOrder, signature, { gasLimit: gasLimit });
    }
    return tx;
  }

  protected async _cancelOrder(
    symbol: string,
    orderId: string,
    orderBookContract: ethers.Contract | null
  ): Promise<string | undefined> {
    if (orderBookContract == null || this.signer == null) {
      throw Error(`Order Book contract for symbol ${symbol} or signer not defined`);
    }
    let scOrder: SmartContractOrder = await orderBookContract.orderOfDigest(orderId);
    let signature = await this._createSignature(scOrder, this.chainId, false, this.signer, this.proxyAddr);
    return await orderBookContract.cancelLimitOrder(orderId, signature);
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
  ): Promise<string> {
    const NAME = "Perpetual Trade Manager";
    const DOMAIN_TYPEHASH = ethers.utils.keccak256(
      Buffer.from("EIP712Domain(string name,uint256 chainId,address verifyingContract)")
    );
    let abiCoder = ethers.utils.defaultAbiCoder;
    let domainSeparator = ethers.utils.keccak256(
      abiCoder.encode(
        ["bytes32", "bytes32", "uint256", "address"],
        [DOMAIN_TYPEHASH, ethers.utils.keccak256(Buffer.from(NAME)), chainId, proxyAddress]
      )
    );
    const TRADE_ORDER_TYPEHASH = ethers.utils.keccak256(
      Buffer.from(
        "Order(uint24 iPerpetualId,uint16 brokerFeeTbps,address traderAddr,address brokerAddr,int128 fAmount,int128 fLimitPrice,int128 fTriggerPrice,uint256 iDeadline,uint32 flags,int128 fLeverage,uint256 createdTimestamp)"
      )
    );
    let structHash = ethers.utils.keccak256(
      abiCoder.encode(
        [
          "bytes32",
          "uint24",
          "uint16",
          "address",
          "address",
          "int128",
          "int128",
          "int128",
          "uint256",
          "uint32",
          "int128",
          "uint256",
        ],
        [
          TRADE_ORDER_TYPEHASH,
          order.iPerpetualId,
          order.brokerFeeTbps,
          order.traderAddr,
          order.brokerAddr,
          order.fAmount,
          order.fLimitPrice,
          order.fTriggerPrice,
          order.iDeadline,
          order.flags,
          order.fLeverage,
          order.createdTimestamp,
        ]
      )
    );
    let digest = ethers.utils.keccak256(
      abiCoder.encode(["bytes32", "bytes32", "bool"], [domainSeparator, structHash, isNewOrder])
    );
    let digestBuffer = Buffer.from(digest.substring(2, digest.length), "hex");
    return await signer.signMessage(digestBuffer);
  }
}
