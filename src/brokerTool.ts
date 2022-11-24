import WriteAccessHandler from "./writeAccessHandler";
import { NodeSDKConfig, Order, PerpetualStaticInfo } from "./nodeSDKTypes";
import PerpetualDataHandler from "./perpetualDataHandler";
import { ABK64x64ToFloat } from "./d8XMath";
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
   * Total amount of collateral currency a broker has to deposit into the default fund to purchase one lot.
   * This is equivalent to the price of a lot expressed in a given pool's currency (e.g. MATIC, USDC, etc).
   * @param {string} poolSymbolName Pool symbol name (e.g. MATIC, USDC, etc).
   * @returns Broker lot size in a given pool's currency, e.g. in MATIC for poolSymbolName MATIC.
   */
  public async getLotSize(poolSymbolName: string): Promise<number> {
    if (this.proxyContract == null) {
      throw Error("no proxy contract initialized. Use createProxyInstance().");
    }
    let poolId = PerpetualDataHandler._getPoolIdFromSymbol(poolSymbolName, this.poolStaticInfos);
    let pool = await this.proxyContract.getLiquidityPool(poolId);
    let lot = ABK64x64ToFloat(pool.fBrokerCollateralLotSize);
    return lot;
  }

  /**
   * Provides information on how many lots a broker purchased for a given pool.
   * This is relevant to determine the broker's fee tier.
   * @param {string} poolSymbolName Pool symbol name (e.g. MATIC, USDC, etc).
   * @returns Number of lots purchased by this broker.
   */
  public async getBrokerDesignation(poolSymbolName: string): Promise<number> {
    if (this.proxyContract == null || this.signer == null) {
      throw Error("no proxy contract or wallet initialized. Use createProxyInstance().");
    }
    let poolId = PerpetualDataHandler._getPoolIdFromSymbol(poolSymbolName, this.poolStaticInfos);
    let designation = await this.proxyContract.getBrokerDesignation(poolId, this.traderAddr);
    return designation;
  }

  /**
   * Deposit lots to the default fund of a given pool.
   * @param {string} poolSymbolName Pool symbol name (e.g. MATIC, USDC, etc).
   * @param lots Number of lots to deposit into this pool.
   * @returns Transaction object.
   */
  public async brokerDepositToDefaultFund(
    poolSymbolName: string,
    lots: number
  ): Promise<ethers.providers.TransactionResponse> {
    if (this.proxyContract == null || this.signer == null) {
      throw Error("no proxy contract or wallet initialized. Use createProxyInstance().");
    }
    let poolId = PerpetualDataHandler._getPoolIdFromSymbol(poolSymbolName, this.poolStaticInfos);
    let tx = await this.proxyContract.brokerDepositToDefaultFund(poolId, lots, { gasLimit: this.gasLimit });
    return tx;
  }

  /**
   * Determine the exchange fee based on lots purchased by this broker.
   * The final exchange fee paid by the broker is equal to
   * maximum(brokerTool.getFeeForBrokerDesignation(poolSymbolName),  brokerTool.getFeeForBrokerVolume(poolSymbolName), brokerTool.getFeeForBrokerStake())
   * @param {string} poolSymbolName Pool symbol name (e.g. MATIC, USDC, etc).
   * @param {number} lots Optional, designation to use if different from this broker's.
   * @returns Fee based solely on this broker's designation, in decimals (i.e. 0.1% is 0.001).
   */
  public async getFeeForBrokerDesignation(poolSymbolName: string, lots?: number): Promise<number> {
    if (this.proxyContract == null || this.signer == null) {
      throw Error("no proxy contract or wallet initialized. Use createProxyInstance().");
    }
    // check if designation should be taken from the caller or as a parameter
    let brokerDesignation: number;
    if (typeof lots == "undefined") {
      brokerDesignation = await this.getBrokerDesignation(poolSymbolName);
    } else {
      brokerDesignation = lots;
    }
    let feeTbps = await this.proxyContract.getFeeForBrokerDesignation(brokerDesignation);
    return feeTbps / 100_000;
  }

  /**
   * Determine the exchange fee based on volume traded under this broker.
   * The final exchange fee paid by the broker is equal to
   * maximum(brokerTool.getFeeForBrokerDesignation(poolSymbolName),  brokerTool.getFeeForBrokerVolume(poolSymbolName), brokerTool.getFeeForBrokerStake())
   * @param {string} poolSymbolName Pool symbol name (e.g. MATIC, USDC, etc).
   * @returns Fee based solely on a broker's traded volume in the corresponding pool, in decimals (i.e. 0.1% is 0.001).
   */
  public async getFeeForBrokerVolume(poolSymbolName: string): Promise<number | undefined> {
    if (this.proxyContract == null || this.signer == null) {
      throw Error("no proxy contract or wallet initialized. Use createProxyInstance().");
    }
    let poolId = PerpetualDataHandler._getPoolIdFromSymbol(poolSymbolName, this.poolStaticInfos);
    let feeTbps = await this.proxyContract.getFeeForBrokerVolume(poolId, this.traderAddr);
    return feeTbps / 100_000;
  }

  /**
   * Determine the exchange fee based on the current D8X balance in a broker's wallet.
   * The final exchange fee paid by the broker is equal to
   * maximum(brokerTool.getFeeForBrokerDesignation(symbol, lots),  brokerTool.getFeeForBrokerVolume(symbol), brokerTool.getFeeForBrokerStake)
   * @param {string=} brokerAddr Address of the broker in question, if different from the one calling this function.
   * @returns Fee based solely on a broker's D8X balance, in decimals (i.e. 0.1% is 0.001).
   */
  public async getFeeForBrokerStake(brokerAddr?: string): Promise<number> {
    if (this.proxyContract == null || this.signer == null) {
      throw Error("no proxy contract or wallet initialized. Use createProxyInstance().");
    }
    if (typeof brokerAddr == "undefined") {
      brokerAddr = this.traderAddr;
    }
    let feeTbps = await this.proxyContract.getFeeForBrokerStake(brokerAddr);
    return feeTbps / 100_000;
  }

  /**
   * Determine exchange fee based on an order and a trader.
   * This is the fee charged by the exchange only, excluding the broker fee,
   * and it takes into account whether the order given here has been signed by a broker or not.
   * Use this, for instance, to verify that the fee to be charged for a given order is as expected,
   * before and after signing it with brokerTool.signOrder.
   * @param {Order} order Order for which to determine the exchange fee. Not necessarily signed by this broker.
   * @param {string} traderAddr Address of the trader for whom to determine the fee.
   * @returns Fee in decimals (i.e. 0.1% is 0.001).
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
   * Adds this broker's signature to an order so that it can be submitted by an approved trader.
   * @param {Order} order Order to sign.
   * @param {string} traderAddr Address of trader submitting the order.
   * @param {number} feeDecimals Fee that this broker is approving for the trader.
   * @param {number} deadline Deadline for the order to be executed.
   * @returns An order signed by this broker, which can be submitted directly with AccountTrade.order.
   */
  public async signOrder(order: Order, traderAddr: string, brokerFee: number, deadline: number): Promise<Order> {
    if (this.proxyContract == null || this.signer == null) {
      throw Error("no proxy contract or wallet initialized. Use createProxyInstance().");
    }
    order.brokerAddr = this.traderAddr;
    order.brokerFeeTbps = brokerFee * 100_000;
    order.deadline = deadline;
    order.brokerSignature = await BrokerTool._signOrder(
      order.symbol,
      order.brokerFeeTbps,
      traderAddr,
      BigNumber.from(deadline),
      this.signer,
      this.chainId,
      this.proxyAddr,
      this.symbolToPerpStaticInfo
    );
    return order;
  }

  /**
   * Creates a signature that a trader can use to place orders with this broker.
   * This signature can be used to pass on to a trader who wishes to trade via this SDK or directly on the blockchain.
   * @param {string} traderAddr Address of the trader signing up with this broker.
   * @param {string} symbol Perpetual that this trader will be trading, of the form ETH-USD-MATIC.
   * @param {number} brokerFee Broker fee for this trader, in decimals (i.e. 0.1% is 0.001).
   * @param {number} deadline Deadline for the order to be executed.
   * @returns Broker signature approving this trader's fee, symbol, and deadline.
   * @ignore
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
    let iDeadline = BigNumber.from(deadline);
    let brokerFeeTbps = 100_000 * brokerFee;
    return await BrokerTool._signOrder(
      symbol,
      brokerFeeTbps,
      traderAddr,
      iDeadline,
      this.signer,
      this.chainId,
      this.proxyAddr,
      this.symbolToPerpStaticInfo
    );
  }

  public static async _signOrder(
    symbol: string,
    brokerFeeTbps: number,
    traderAddr: string,
    iDeadline: BigNumber,
    signer: ethers.Wallet,
    chainId: number,
    proxyAddress: string,
    symbolToPerpStaticInfo: Map<string, PerpetualStaticInfo>
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
    let iPerpetualId = PerpetualDataHandler.symbolToPerpetualId(symbol, symbolToPerpStaticInfo);
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

  /**
   * Transfer ownership of a broker's status to a new wallet.
   * @param newAddress The address this broker wants to use from now on.
   */
  public async transferOwnership(newAddress: string) {
    // TODO
    return true;
  }
}
