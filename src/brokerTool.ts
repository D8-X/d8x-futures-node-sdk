import WriteAccessHandler from "./writeAccessHandler";
import { NodeSDKConfig, Order, ORDER_MAX_DURATION_SEC, SmartContractOrder, ZERO_ADDRESS } from "./nodeSDKTypes";
import PerpetualDataHandler from "./perpetualDataHandler";
import { ABK64x64ToFloat } from "./d8XMath";
import { text } from "stream/consumers";
import { BigNumber, ethers } from "ethers";
import AccountTrade from "./accountTrade";
/**
 * Functions for brokers to determine fees, deposit lots, and sign-up traders.
 */
export default class BrokerTool extends WriteAccessHandler {
  /**
   * Constructor
   * @param {NodeSDKConfig} config Configuration object.
   * @param {string} privateKey Private key of a broker.
   */
  public constructor(config: NodeSDKConfig, privateKey: string) {
    super(config, privateKey);
  }

  /**
   * Broker lot size for a given pool.
   * @param {String} symbol Symbol of the form ETH-USD-MATIC or just MATIC.
   * @returns {number} Broker lot size in collateral currency, e.g. in MATIC for symbol ETH-USD-MATIC or MATIC.
   */
  public async getLotSize(symbol: string): Promise<number> {
    if (this.proxyContract == null) {
      throw Error("no proxy contract initialized. Use createProxyInstance().");
    }
    let poolId = PerpetualDataHandler._getPoolIdFromSymbol(symbol, this.poolStaticInfos);
    let pool = await this.proxyContract.getLiquidityPool(poolId);
    let lot = ABK64x64ToFloat(pool.fBrokerCollateralLotSize);
    return lot;
  }

  /**
   * Designation of this broker.
   * @param {string} symbol Symbol of the form ETH-USD-MATIC or just MATIC.
   * @returns {number} Number of lots purchased by this broker.
   */
  public async getBrokerDesignation(symbol: string): Promise<number> {
    if (this.proxyContract == null || this.signer == null) {
      throw Error("no proxy contract or wallet initialized. Use createProxyInstance().");
    }
    let poolId = PerpetualDataHandler._getPoolIdFromSymbol(symbol, this.poolStaticInfos);
    let designation = await this.proxyContract.getBrokerDesignation(poolId, this.traderAddr);
    return designation;
  }

  /**
   * Determine the exchange fee based on lots purchased by this broker.
   * @param {string} symbol Symbol of the form ETH-USD-MATIC or just MATIC
   * @param {number} lots Optional, designation to use if different from this broker's.
   * @returns {number} Fee based solely on this broker's designation, in decimals (i.e. 0.1% is 0.001).
   */
  public async getFeeForBrokerDesignation(symbol: string, lots?: number): Promise<number> {
    if (this.proxyContract == null || this.signer == null) {
      throw Error("no proxy contract or wallet initialized. Use createProxyInstance().");
    }
    // check if designation should be taken from the caller or as a parameter
    let brokerDesignation: number;
    if (typeof lots == "undefined") {
      brokerDesignation = await this.getBrokerDesignation(symbol);
    } else {
      brokerDesignation = lots;
    }
    let feeTbps = await this.proxyContract.getFeeForBrokerDesignation(brokerDesignation);
    return feeTbps / 100_000;
  }

  /**
   * Deposit to a given pool.
   * @param {string} symbol Symbol of the form ETH-USD-MATIC or just MATIC.
   * @param {number} lots Number of lots to deposit into this pool.
   * @returns Transaction object.
   */
  public async brokerDepositToDefaultFund(symbol: string, lots: number): Promise<ethers.providers.TransactionResponse> {
    if (this.proxyContract == null || this.signer == null) {
      throw Error("no proxy contract or wallet initialized. Use createProxyInstance().");
    }
    let poolId = PerpetualDataHandler._getPoolIdFromSymbol(symbol, this.poolStaticInfos);
    let tx = await this.proxyContract.brokerDepositToDefaultFund(poolId, lots, { gasLimit: this.gasLimit });
    return tx;
  }

  /**
   * Determine the exchange fee based on volume traded under this broker.
   * @param {string} symbol Symbol of the form ETH-USD-MATIC or just MATIC.
   * @returns {number} Fee based solely on this broker's traded volume in the corresponding pool, in decimals (i.e. 0.1% is 0.001).
   */
  public async getFeeForBrokerVolume(symbol: string): Promise<number | undefined> {
    if (this.proxyContract == null || this.signer == null) {
      throw Error("no proxy contract or wallet initialized. Use createProxyInstance().");
    }
    let poolId = PerpetualDataHandler._getPoolIdFromSymbol(symbol, this.poolStaticInfos);
    let feeTbps = await this.proxyContract.getFeeForBrokerVolume(poolId, this.traderAddr);
    return feeTbps / 100_000;
  }

  /**
   * Determine exchange fee based on an order.
   * @param {Order} order Order for which to determine the exchange fee, not necessarily signed by this broker.
   * @param {string} traderAddr Address of the trader for whom to determine the fee.
   * @returns {number} Fee in decimals (i.e. 0.1% is 0.001).
   */
  public async determineExchangeFee(order: Order, traderAddr: string): Promise<number> {
    if (this.proxyContract == null || this.signer == null) {
      throw Error("no proxy contract or wallet initialized. Use createProxyInstance().");
    }
    let scOrder = AccountTrade.toSmartContractOrder(order, traderAddr, this.symbolToPerpStaticInfo);
    let feeTbps = await this.proxyContract.determineExchangeFee(scOrder);
    return feeTbps / 100_000;
  }

  /**
   * Fee that a trader would get if trading with this broker.
   * @param {string} symbol Symbol of the form ETH-USD-MATC or just MATIC.
   * @param {string} traderAddr Address of the trader.
   * @returns {number} Exchange fee, in decimals (i.e. 0.1% is 0.001).
   */
  public async queryExchangeFee(symbol: string, traderAddr: string): Promise<number> {
    if (this.proxyContract == null || this.signer == null) {
      throw Error("no proxy contract or wallet initialized. Use createProxyInstance().");
    }
    let poolId = PerpetualDataHandler._getPoolIdFromSymbol(symbol, this.poolStaticInfos);
    let feeTbps = await this.proxyContract.queryExchangeFee(poolId, traderAddr, this.traderAddr);
    return feeTbps / 100_000;
  }

  /**
   * Adds this broker's signature to an order so it can be submitted by an approved trader.
   * @param {Order} order Order to sign.
   * @param {string} traderAddr Address of trader submitting the order.
   * @param {number} feeDecimals Fee that this broker is approving for the trader.
   * @param {number} deadline Deadline for the order to be executed.
   * @returns {Order} An order signed by this broker, which can be submitted directly with AccountTrade.order.
   */
  public async signOrder(order: Order, traderAddr: string, brokerFee: number, deadline: number): Promise<Order> {
    order.brokerAddr = this.traderAddr;
    order.brokerFeeTbps = brokerFee * 100_000;
    order.deadline = deadline;
    order.brokerSignature = await this.createSignatureForTrader(traderAddr, order.symbol, brokerFee, deadline);
    return order;
  }

  /**
   * Creates a signature that a trader can use to place orders with this broker.
   * @param {string} traderAddr Address of the trader signing up with this broker.
   * @param {string} symbol Perpetual that this trader will be trading, of the form ETH-USD-MATIC.
   * @param {number} brokerFee Broker fee for this trader, in decimals (i.e. 0.1% is 0.001).
   * @param {number} deadline Deadline for the order to be executed.
   * @returns Broker signature approving this trader's fee, symbol, and deadline.
   */
  public async createSignatureForTrader(
    traderAddr: string,
    symbol: string,
    brokerFee: number,
    deadline: number
  ): Promise<string> {
    if (this.proxyContract == null || this.signer == null) {
      throw Error("no proxy contract or wallet initialized. Use createProxyInstance().");
    }
    let perpetualId = PerpetualDataHandler.symbolToPerpetualId(symbol, this.symbolToPerpStaticInfo);
    let iDeadline = BigNumber.from(deadline);
    let brokerFeeTbps = 100_000 * brokerFee;
    return await this._signOrder(
      perpetualId,
      brokerFeeTbps,
      traderAddr,
      iDeadline,
      this.signer,
      this.chainId,
      this.proxyAddr
    );
  }

  public async _signOrder(
    iPerpetualId: number,
    brokerFeeTbps: number,
    traderAddr: string,
    iDeadline: BigNumber,
    signer: ethers.Wallet,
    chainId: number,
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
    //
    const TRADE_BROKER_TYPEHASH = ethers.utils.keccak256(
      Buffer.from("Order(uint24 iPerpetualId,uint16 brokerFeeTbps,address traderAddr,uint256 iDeadline)")
    );
    let structHash = ethers.utils.keccak256(
      abiCoder.encode(
        ["bytes32", "uint24", "uint16", "address", "uint256"],
        [TRADE_BROKER_TYPEHASH, iPerpetualId, brokerFeeTbps, traderAddr, iDeadline]
      )
    );

    let digest = ethers.utils.keccak256(abiCoder.encode(["bytes32", "bytes32"], [domainSeparator, structHash]));
    let digestBuffer = Buffer.from(digest.substring(2, digest.length), "hex");
    return await signer.signMessage(digestBuffer);
  }
}
