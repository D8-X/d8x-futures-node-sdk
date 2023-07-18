import { defaultAbiCoder } from "@ethersproject/abi";
import { Signer } from "@ethersproject/abstract-signer";
import { CallOverrides, ContractTransaction, Overrides } from "@ethersproject/contracts";
import { keccak256 } from "@ethersproject/keccak256";
import { ABK64x64ToFloat } from "./d8XMath";
import { NodeSDKConfig, Order, PerpetualStaticInfo, SmartContractOrder } from "./nodeSDKTypes";
import PerpetualDataHandler from "./perpetualDataHandler";
import WriteAccessHandler from "./writeAccessHandler";

import { Buffer } from "buffer";
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
   * @param {Signer} signer Signer (ignored if a private key is provided)
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
  public constructor(config: NodeSDKConfig, signer: string | Signer) {
    super(config, signer);
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
  public async getBrokerInducedFee(poolSymbolName: string, overrides?: CallOverrides): Promise<number | undefined> {
    if (this.proxyContract == null || this.signer == null) {
      throw Error("no proxy contract or wallet initialized. Use createProxyInstance().");
    }
    let poolId = PerpetualDataHandler._getPoolIdFromSymbol(poolSymbolName, this.poolStaticInfos);
    let feeTbps = await this.proxyContract.getBrokerInducedFee(poolId, this.traderAddr, overrides || {});
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
  public async getFeeForBrokerDesignation(
    poolSymbolName: string,
    lots?: number,
    overrides?: CallOverrides
  ): Promise<number> {
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
    let feeTbps = await this.proxyContract.getFeeForBrokerDesignation(brokerDesignation, overrides || {});
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
  public async getFeeForBrokerVolume(poolSymbolName: string, overrides?: CallOverrides): Promise<number> {
    if (this.proxyContract == null || this.signer == null) {
      throw Error("no proxy contract or wallet initialized. Use createProxyInstance().");
    }
    let poolId = PerpetualDataHandler._getPoolIdFromSymbol(poolSymbolName, this.poolStaticInfos);
    let feeTbps = await this.proxyContract.getFeeForBrokerVolume(poolId, this.traderAddr, overrides || {});
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
  public async getFeeForBrokerStake(brokerAddr?: string, overrides?: CallOverrides): Promise<number> {
    if (this.proxyContract == null || this.signer == null) {
      throw Error("no proxy contract or wallet initialized. Use createProxyInstance().");
    }
    if (typeof brokerAddr == "undefined") {
      brokerAddr = this.traderAddr;
    }
    let feeTbps = await this.proxyContract.getFeeForBrokerStake(brokerAddr, overrides || {});
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
   *       executionTimestamp: Date.now()/1000
   *   };
   *    let exchFee = await brokTool.determineExchangeFee(order,
   *        "0xAb5801a7D398351b8bE11C439e05C5B3259aeC9B");
   *   console.log(exchFee);
   * }
   * main();
   *
   * @returns {number} Fee in decimals (i.e. 0.1% is 0.001).
   */
  public async determineExchangeFee(order: Order, traderAddr: string, overrides?: CallOverrides): Promise<number> {
    if (this.proxyContract == null || this.signer == null) {
      throw Error("no proxy contract or wallet initialized. Use createProxyInstance().");
    }
    let scOrder = AccountTrade.toSmartContractOrder(order, traderAddr, this.symbolToPerpStaticInfo);
    let feeTbps = await this.proxyContract.determineExchangeFee(scOrder, overrides || {});
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
  public async getCurrentBrokerVolume(poolSymbolName: string, overrides?: CallOverrides): Promise<number> {
    if (this.proxyContract == null || this.signer == null) {
      throw Error("no proxy contract or wallet initialized. Use createProxyInstance().");
    }
    let poolId = PerpetualDataHandler._getPoolIdFromSymbol(poolSymbolName, this.poolStaticInfos);
    let volume = await this.proxyContract.getCurrentBrokerVolume(poolId, this.traderAddr, overrides || {});
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
  public async getLotSize(poolSymbolName: string, overrides?: CallOverrides): Promise<number> {
    if (this.proxyContract == null) {
      throw Error("no proxy contract initialized. Use createProxyInstance().");
    }
    let poolId = PerpetualDataHandler._getPoolIdFromSymbol(poolSymbolName, this.poolStaticInfos);
    let pool = await this.proxyContract.getLiquidityPool(poolId, overrides || {});
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
  public async getBrokerDesignation(poolSymbolName: string, overrides?: CallOverrides): Promise<number> {
    if (this.proxyContract == null || this.signer == null) {
      throw Error("no proxy contract or wallet initialized. Use createProxyInstance().");
    }
    let poolId = PerpetualDataHandler._getPoolIdFromSymbol(poolSymbolName, this.poolStaticInfos);
    let designation = await this.proxyContract.getBrokerDesignation(poolId, this.traderAddr, overrides || {});
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
   *   // deposit to perpetuals
   *   await brokTool.setAllowance("MATIC");
   *   let respDeposit = await brokTool.depositBrokerLots("MATIC",1);
   *   console.log(respDeposit);
   * }
   * main();
   *
   * @returns {ContractTransaction} ContractTransaction object.
   */
  public async depositBrokerLots(
    poolSymbolName: string,
    lots: number,
    overrides?: Overrides
  ): Promise<ContractTransaction> {
    if (this.proxyContract == null || this.signer == null) {
      throw Error("no proxy contract or wallet initialized. Use createProxyInstance().");
    }
    let poolId = PerpetualDataHandler._getPoolIdFromSymbol(poolSymbolName, this.poolStaticInfos);
    let tx = await this.proxyContract.depositBrokerLots(poolId, lots, overrides || {});
    return tx;
  }

  // Signatures

  /**
   * Adds this broker's signature to an order. An order signed by a broker is considered
   * to be routed through this broker and benefits from the broker's fee conditions.
   * @param {Order} order Order to sign. It must contain valid broker fee, broker address, and order deadline.
   * @param {string} traderAddr Address of trader submitting the order.
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
   *       executionTimestamp: Date.now()/1000
   *    };
   *    let signedOrder = await brokTool.signOrder(order, "0xAb5801a7D398351b8bE11C439e05C5B3259aeC9B",
   *        0.0001, 1669723339);
   *   console.log(signedOrder);
   *   // execute order
   *   let orderTransaction = await accTrade.order(signedOrder);
   *   console.log(orderTransaction.hash);
   * }
   * main();
   *
   * @returns {Order} An order signed by this broker, which can be submitted directly with AccountTrade.order.
   */
  public async signOrder(order: Order, traderAddr: string): Promise<Order> {
    if (this.proxyContract == null || this.signer == null) {
      throw Error("no proxy contract or wallet initialized. Use createProxyInstance().");
    }
    order.brokerAddr = this.traderAddr;
    if (order.deadline == undefined) {
      throw Error("brokerTool::signOrder: deadline not defined");
    }
    order.brokerSignature = await BrokerTool._signOrder(
      order.symbol,
      order.brokerFeeTbps!,
      traderAddr,
      order.deadline,
      this.signer,
      this.chainId,
      this.proxyAddr,
      this.symbolToPerpStaticInfo
    );
    return order;
  }

  public async signSCOrder(scOrder: SmartContractOrder): Promise<string> {
    return await BrokerTool._signOrderFromRawData(
      scOrder.iPerpetualId,
      scOrder.brokerFeeTbps,
      scOrder.traderAddr,
      scOrder.iDeadline,
      this.signer!,
      this.chainId,
      this.proxyAddr
    );
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
    let brokerFeeTbps = 100_000 * brokerFee;
    return await BrokerTool._signOrder(
      symbol,
      brokerFeeTbps,
      traderAddr,
      deadline,
      this.signer,
      this.chainId,
      this.proxyAddr,
      this.symbolToPerpStaticInfo
    );
  }

  private static async _signOrderFromRawData(
    iPerpetualId: number,
    brokerFeeTbps: number,
    traderAddr: string,
    iDeadline: number,
    signer: Signer,
    chainId: number,
    proxyAddress: string
  ) {
    const NAME = "Perpetual Trade Manager";
    const DOMAIN_TYPEHASH = keccak256(
      Buffer.from("EIP712Domain(string name,uint256 chainId,address verifyingContract)")
    );
    let abiCoder = defaultAbiCoder;
    let domainSeparator = keccak256(
      abiCoder.encode(
        ["bytes32", "bytes32", "uint256", "address"],
        [DOMAIN_TYPEHASH, keccak256(Buffer.from(NAME)), chainId, proxyAddress]
      )
    );
    //
    const TRADE_BROKER_TYPEHASH = keccak256(
      Buffer.from("Order(uint24 iPerpetualId,uint16 brokerFeeTbps,address traderAddr,uint32 iDeadline)")
    );

    let structHash = keccak256(
      abiCoder.encode(
        ["bytes32", "uint24", "uint16", "address", "uint32"],
        [TRADE_BROKER_TYPEHASH, iPerpetualId, brokerFeeTbps, traderAddr, iDeadline]
      )
    );

    let digest = keccak256(abiCoder.encode(["bytes32", "bytes32"], [domainSeparator, structHash]));
    let digestBuffer = Buffer.from(digest.substring(2, digest.length), "hex");
    return await signer.signMessage(digestBuffer);
  }

  private static async _signOrder(
    symbol: string,
    brokerFeeTbps: number,
    traderAddr: string,
    iDeadline: number,
    signer: Signer,
    chainId: number,
    proxyAddress: string,
    symbolToPerpStaticInfo: Map<string, PerpetualStaticInfo>
  ): Promise<string> {
    let iPerpetualId = PerpetualDataHandler.symbolToPerpetualId(symbol, symbolToPerpStaticInfo);
    return await BrokerTool._signOrderFromRawData(
      iPerpetualId,
      brokerFeeTbps,
      traderAddr,
      iDeadline,
      signer,
      chainId,
      proxyAddress
    );
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
   * @returns {ContractTransaction} ethers transaction object
   */
  public async transferOwnership(
    poolSymbolName: string,
    newAddress: string,
    overrides?: Overrides
  ): Promise<ContractTransaction> {
    if (this.proxyContract == null) {
      throw Error("no proxy contract or wallet initialized. Use createProxyInstance().");
    }
    let poolId = PerpetualDataHandler._getPoolIdFromSymbol(poolSymbolName, this.poolStaticInfos);
    let tx = await this.proxyContract.transferBrokerOwnership(poolId, newAddress, overrides || {});
    return tx;
  }
}
