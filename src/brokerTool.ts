import WriteAccessHandler from "./writeAccessHandler";
import { NodeSDKConfig, Order, PerpetualStaticInfo } from "./nodeSDKTypes";
import PerpetualDataHandler from "./perpetualDataHandler";
import { ABK64x64ToFloat } from "./d8XMath";
import { BigNumber, ethers } from "ethers";
import AccountTrade from "./accountTrade";
/**
 * Functions for brokers to determine fees, deposit lots, and sign-up traders.
 * This class requires a private key and executes smart-contract interactions that
 * require gas-payments.
 * @extends WriteAccessHandler
 */
export default class BrokerTool extends WriteAccessHandler {
  /**
   * Constructor
   * @param {NodeSDKConfig} config Configuration object, see PerpetualDataHandler.
   * readSDKConfig.
   * @param {string} privateKey Private key of a broker.
   * @example
   * import { BrokerTool, PerpetualDataHandler } from '@d8x/perpetuals-sdk';
   * async function main() {
   *   console.log(BrokerTool);
   *   // load configuration for testnet
   *   const config = PerpetualDataHandler.readSDKConfig("testnet");
   *   // BrokerTool (authentication required, PK is an environment variable with a private key)
   *   const pk: string = <string>process.env.PK;
   *   let brokTool = new BrokerTool(config, pk);
   *   // Create a proxy instance to access the blockchain
   *   await brokTool.createProxyInstance();
   * }
   * main();
   *
   */
  public constructor(config: NodeSDKConfig, privateKey: string) {
    super(config, privateKey);
  }

  // Fee getters

  /**
   * Determine the exchange fee based on lots, traded volume, and D8X balance of this broker.
   * This is the final exchange fee that this broker can offer to traders that trade through him.
   * @param {string} poolSymbolName Pool symbol name (e.g. MATIC, USDC, etc).
   * @example
   * import { BrokerTool, PerpetualDataHandler } from '@d8x/perpetuals-sdk';
   * async function main() {
   *   console.log(BrokerTool);
   *   // setup (authentication required, PK is an environment variable with a private key)
   *   const config = PerpetualDataHandler.readSDKConfig("testnet");
   *   const pk: string = <string>process.env.PK;
   *   let brokTool = new BrokerTool(config, pk);
   *   await brokTool.createProxyInstance();
   *   // get broker induced fee
   *   let brokFee = await brokTool.getBrokerInducedFee("MATIC");
   *   console.log(brokFee);
   * }
   * main();
   *
   * @returns {number} Exchange fee for this broker, in decimals (i.e. 0.1% is 0.001)
   */
  public async getBrokerInducedFee(poolSymbolName: string): Promise<number | undefined> {
    if (this.proxyContract == null || this.signer == null) {
      throw Error("no proxy contract or wallet initialized. Use createProxyInstance().");
    }
    let poolId = PerpetualDataHandler._getPoolIdFromSymbol(poolSymbolName, this.poolStaticInfos);
    let feeTbps = await this.proxyContract.getBrokerInducedFee(poolId, this.traderAddr);
    let fee = feeTbps / 100_000;
    if (fee == 0.65535) {
      return undefined;
    }
    return fee;
  }

  /**
   * Determine the exchange fee based on lots purchased by this broker.
   * The final exchange fee that this broker can offer to traders that trade through him is equal to
   * maximum(brokerTool.getFeeForBrokerDesignation(poolSymbolName),  brokerTool.getFeeForBrokerVolume(poolSymbolName), brokerTool.getFeeForBrokerStake())
   * @param {string} poolSymbolName Pool symbol name (e.g. MATIC, USDC, etc).
   * @param {number=} lots Optional, designation to use if different from this broker's.
   * @example
   * import { BrokerTool, PerpetualDataHandler } from '@d8x/perpetuals-sdk';
   * async function main() {
   *   console.log(BrokerTool);
   *   // setup (authentication required, PK is an environment variable with a private key)
   *   const config = PerpetualDataHandler.readSDKConfig("testnet");
   *   const pk: string = <string>process.env.PK;
   *   let brokTool = new BrokerTool(config, pk);
   *   await brokTool.createProxyInstance();
   *   // get broker fee induced by lots
   *   let brokFeeLots = await brokTool.getFeeForBrokerDesignation("MATIC");
   *   console.log(brokFeeLots);
   * }
   * main();
   *
   * @returns {number} Fee based solely on this broker's designation, in decimals (i.e. 0.1% is 0.001).
   */
  public async getFeeForBrokerDesignation(poolSymbolName: string, lots?: number): Promise<number> {
    if (this.proxyContract == null || this.signer == null) {
      throw Error("no proxy contract or wallet initialized. Use createProxyInstance().");
    }
    // check if designation should be taken from the caller or as a parameter
    let brokerDesignation: number;
    if (typeof lots == "undefined") {
      brokerDesignation = await this.getBrokerDesignation(poolSymbolName);
      brokerDesignation = brokerDesignation > 0 ? brokerDesignation : 0;
    } else {
      brokerDesignation = lots;
    }
    let feeTbps = await this.proxyContract.getFeeForBrokerDesignation(brokerDesignation);
    return feeTbps / 100_000;
  }

  /**
   * Determine the exchange fee based on volume traded under this broker.
   * The final exchange fee that this broker can offer to traders that trade through him is equal to
   * maximum(brokerTool.getFeeForBrokerDesignation(poolSymbolName),  brokerTool.getFeeForBrokerVolume(poolSymbolName), brokerTool.getFeeForBrokerStake())
   * @param {string} poolSymbolName Pool symbol name (e.g. MATIC, USDC, etc).
   * @example
   * import { BrokerTool, PerpetualDataHandler } from '@d8x/perpetuals-sdk';
   * async function main() {
   *   console.log(BrokerTool);
   *   // setup (authentication required, PK is an environment variable with a private key)
   *   const config = PerpetualDataHandler.readSDKConfig("testnet");
   *   const pk: string = <string>process.env.PK;
   *   let brokTool = new BrokerTool(config, pk);
   *   await brokTool.createProxyInstance();
   *   // get broker fee induced by volume
   *   let brokFeeVol = await brokTool.getFeeForBrokerVolume("MATIC");
   *   console.log(brokFeeVol);
   * }
   * main();
   *
   * @returns {number} Fee based solely on a broker's traded volume in the corresponding pool, in decimals (i.e. 0.1% is 0.001).
   */
  public async getFeeForBrokerVolume(poolSymbolName: string): Promise<number> {
    if (this.proxyContract == null || this.signer == null) {
      throw Error("no proxy contract or wallet initialized. Use createProxyInstance().");
    }
    let poolId = PerpetualDataHandler._getPoolIdFromSymbol(poolSymbolName, this.poolStaticInfos);
    let feeTbps = await this.proxyContract.getFeeForBrokerVolume(poolId, this.traderAddr);
    return feeTbps / 100_000;
  }

  /**
   * Determine the exchange fee based on the current D8X balance in a broker's wallet.
   * The final exchange fee that this broker can offer to traders that trade through him is equal to
   * maximum(brokerTool.getFeeForBrokerDesignation(symbol, lots),  brokerTool.getFeeForBrokerVolume(symbol), brokerTool.getFeeForBrokerStake)
   * @param {string=} brokerAddr Address of the broker in question, if different from the one calling this function.
   * @example
   * import { BrokerTool, PerpetualDataHandler } from '@d8x/perpetuals-sdk';
   * async function main() {
   *   console.log(BrokerTool);
   *   // setup (authentication required, PK is an environment variable with a private key)
   *   const config = PerpetualDataHandler.readSDKConfig("testnet");
   *   const pk: string = <string>process.env.PK;
   *   let brokTool = new BrokerTool(config, pk);
   *   await brokTool.createProxyInstance();
   *   // get broker fee induced by staked d8x
   *   let brokFeeStake = await brokTool.getFeeForBrokerStake("0xAb5801a7D398351b8bE11C439e05C5B3259aeC9B");
   *   console.log(brokFeeStake);
   * }
   * main();
   *
   * @returns {number} Fee based solely on a broker's D8X balance, in decimals (i.e. 0.1% is 0.001).
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
   * This fee is equal or lower than the broker induced fee, provided the order is properly signed.
   * @param {Order} order Order structure. As a minimum the structure needs to
   * specify symbol, side, type and quantity.
   * @param {string} traderAddr Address of the trader for whom to determine the fee.
   * @example
   * import { BrokerTool, PerpetualDataHandler, Order } from '@d8x/perpetuals-sdk';
   * async function main() {
   *   console.log(BrokerTool);
   *   // setup (authentication required, PK is an environment variable with a private key)
   *   const config = PerpetualDataHandler.readSDKConfig("testnet");
   *   const pk: string = <string>process.env.PK;
   *   let brokTool = new BrokerTool(config, pk);
   *   await brokTool.createProxyInstance();
   *   // get exchange fee based on an order and trader
   *   let order: Order = {
   *       symbol: "MATIC-USD-MATIC",
   *       side: "BUY",
   *       type: "MARKET",
   *       quantity: 100,
   *       timestamp: Date.now()
   *   };
   *    let exchFee = await brokTool.determineExchangeFee(order,
   *        "0xAb5801a7D398351b8bE11C439e05C5B3259aeC9B");
   *   console.log(exchFee);
   * }
   * main();
   *
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

  // Volume

  /**
   * Exponentially weighted EMA of the total trading volume of all trades performed under this broker.
   * The weights are chosen so that in average this coincides with the 30 day volume.
   * @param {string} poolSymbolName Pool symbol name (e.g. MATIC, USDC, etc).
   * @example
   * import { BrokerTool, PerpetualDataHandler } from '@d8x/perpetuals-sdk';
   * async function main() {
   *   console.log(BrokerTool);
   *   // setup (authentication required, PK is an environment variable with a private key)
   *   const config = PerpetualDataHandler.readSDKConfig("testnet");
   *   const pk: string = <string>process.env.PK;
   *   let brokTool = new BrokerTool(config, pk);
   *   await brokTool.createProxyInstance();
   *   // get 30 day volume for broker
   *   let brokVolume = await brokTool.getCurrentBrokerVolume("MATIC");
   *   console.log(brokVolume);
   * }
   * main();
   *
   * @returns {number} Current trading volume for this broker, in USD.
   */
  public async getCurrentBrokerVolume(poolSymbolName: string): Promise<number> {
    if (this.proxyContract == null || this.signer == null) {
      throw Error("no proxy contract or wallet initialized. Use createProxyInstance().");
    }
    let poolId = PerpetualDataHandler._getPoolIdFromSymbol(poolSymbolName, this.poolStaticInfos);
    let volume = await this.proxyContract.getCurrentBrokerVolume(poolId, this.traderAddr);
    return ABK64x64ToFloat(volume);
  }

  // Lots

  /**
   * Total amount of collateral currency a broker has to deposit into the default fund to purchase one lot.
   * This is equivalent to the price of a lot expressed in a given pool's currency (e.g. MATIC, USDC, etc).
   * @param {string} poolSymbolName Pool symbol name (e.g. MATIC, USDC, etc).
   * @example
   * import { BrokerTool, PerpetualDataHandler } from '@d8x/perpetuals-sdk';
   * async function main() {
   *   console.log(BrokerTool);
   *   // setup (authentication required, PK is an environment variable with a private key)
   *   const config = PerpetualDataHandler.readSDKConfig("testnet");
   *   const pk: string = <string>process.env.PK;
   *   let brokTool = new BrokerTool(config, pk);
   *   await brokTool.createProxyInstance();
   *   // get lot price
   *   let brokLotSize = await brokTool.getLotSize("MATIC");
   *   console.log(brokLotSize);
   * }
   * main();
   *
   * @returns {number} Broker lot size in a given pool's currency, e.g. in MATIC for poolSymbolName MATIC.
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
   * @example
   * import { BrokerTool, PerpetualDataHandler } from '@d8x/perpetuals-sdk';
   * async function main() {
   *   console.log(BrokerTool);
   *   // setup (authentication required, PK is an environment variable with a private key)
   *   const config = PerpetualDataHandler.readSDKConfig("testnet");
   *   const pk: string = <string>process.env.PK;
   *   let brokTool = new BrokerTool(config, pk);
   *   await brokTool.createProxyInstance();
   *   // get broker designation
   *   let brokDesignation = await brokTool.getBrokerDesignation("MATIC");
   *   console.log(brokDesignation);
   * }
   * main();
   *
   * @returns {number} Number of lots purchased by this broker.
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
   * @param {number} lots Number of lots to deposit into this pool.
   * @example
   * import { BrokerTool, PerpetualDataHandler } from '@d8x/perpetuals-sdk';
   * async function main() {
   *   console.log(BrokerTool);
   *   // setup (authentication required, PK is an environment variable with a private key)
   *   const config = PerpetualDataHandler.readSDKConfig("testnet");
   *   const pk: string = <string>process.env.PK;
   *   let brokTool = new BrokerTool(config, pk);
   *   await brokTool.createProxyInstance();
   *   // deposit to default fund
   *   await brokTool.setAllowance("MATIC");
   *   let respDeposit = await brokTool.brokerDepositToDefaultFund("MATIC",1);
   *   console.log(respDeposit);
   * }
   * main();
   *
   * @returns {ethers.ContractTransaction} ContractTransaction object.
   */
  public async brokerDepositToDefaultFund(poolSymbolName: string, lots: number): Promise<ethers.ContractTransaction> {
    if (this.proxyContract == null || this.signer == null) {
      throw Error("no proxy contract or wallet initialized. Use createProxyInstance().");
    }
    let poolId = PerpetualDataHandler._getPoolIdFromSymbol(poolSymbolName, this.poolStaticInfos);
    let tx = await this.proxyContract.brokerDepositToDefaultFund(poolId, lots, { gasLimit: this.gasLimit });
    return tx;
  }

  // Signatures

  /**
   * Adds this broker's signature to an order. An order signed by a broker is considered
   * to be routed through this broker and benefits from the broker's fee conditions.
   * @param {Order} order Order to sign.
   * @param {string} traderAddr Address of trader submitting the order.
   * @param {number} feeDecimals Fee that this broker imposes on this order.
   * The fee is sent to the broker's wallet. Fee should be specified in decimals, e.g., 0.0001 equals 1bps.
   * @param {number} deadline Deadline for the order to be executed. Specify deadline as a unix timestamp
   * @example
   * import { BrokerTool, PerpetualDataHandler } from '@d8x/perpetuals-sdk';
   * async function main() {
   *   console.log(BrokerTool);
   *   // setup (authentication required, PK is an environment variable with a private key)
   *   const config = PerpetualDataHandler.readSDKConfig("testnet");
   *   const pk: string = <string>process.env.PK;
   *   let brokTool = new BrokerTool(config, pk);
   *   await brokTool.createProxyInstance();
   *   // sign order
   *   let order = {symbol: "ETH-USD-MATIC",
   *       side: "BUY",
   *       type: "MARKET",
   *       quantity: 1,
   *       timestamp: Date.now()
   *    };
   *    let signedOrder = await brokTool.signOrder(order, "0xAb5801a7D398351b8bE11C439e05C5B3259aeC9B",
   *        0.0001, 1669723339);
   *   console.log(signedOrder);
   * }
   * main();
   *
   * @returns {Order} An order signed by this broker, which can be submitted directly with AccountTrade.order.
   */
  public async signOrder(order: Order, traderAddr: string, brokerFee: number, deadline: number): Promise<Order> {
    if (this.proxyContract == null || this.signer == null) {
      throw Error("no proxy contract or wallet initialized. Use createProxyInstance().");
    }
    order.brokerAddr = this.traderAddr;
    order.brokerFeeTbps = brokerFee * 100_000;
    order.deadline = Math.round(deadline);
    order.brokerSignature = await BrokerTool._signOrder(
      order.symbol,
      order.brokerFeeTbps,
      traderAddr,
      BigNumber.from(Math.round(deadline)),
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
   * @returns {string} Broker signature approving this trader's fee, symbol, and deadline.
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

  private static async _signOrder(
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

  // Transfer ownership

  /**
   * Transfer ownership of a broker's status to a new wallet. This function transfers the values related to
   * (i) trading volume and (ii) deposited lots to newAddress. The broker needs in addition to manually transfer
   * his D8X holdings to newAddress. Until this transfer is completed, the broker will not have his current designation reflected at newAddress.
   * @param {string} poolSymbolName Pool symbol name (e.g. MATIC, USDC, etc).
   * @param {string} newAddress The address this broker wants to use from now on.
   * @example
   * import { BrokerTool, PerpetualDataHandler } from '@d8x/perpetuals-sdk';
   * async function main() {
   *   console.log(BrokerTool);
   *   // setup (authentication required, PK is an environment variable with a private key)
   *   const config = PerpetualDataHandler.readSDKConfig("testnet");
   *   const pk: string = <string>process.env.PK;
   *   let brokTool = new BrokerTool(config, pk);
   *   await brokTool.createProxyInstance();
   *   // transfer ownership
   *   let respTransferOwnership = await brokTool.transferOwnership("MATIC", "0xAb5801a7D398351b8bE11C439e05C5B3259aeC9B");
   *   console.log(respTransferOwnership);
   * }
   * main();
   *
   * @returns {ethers.providers.TransactionResponse} ethers transaction object
   */
  public async transferOwnership(
    poolSymbolName: string,
    newAddress: string
  ): Promise<ethers.providers.TransactionResponse> {
    if (this.proxyContract == null) {
      throw Error("no proxy contract or wallet initialized. Use createProxyInstance().");
    }
    let poolId = PerpetualDataHandler._getPoolIdFromSymbol(poolSymbolName, this.poolStaticInfos);
    let tx = await this.proxyContract.transferBrokerOwnership(poolId, newAddress, { gasLimit: this.gasLimit });
    return tx;
  }
}
