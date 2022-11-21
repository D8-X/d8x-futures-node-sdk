import WriteAccessHandler from "./writeAccessHandler";
import { NodeSDKConfig, Order, ORDER_MAX_DURATION_SEC, ZERO_ADDRESS } from "./nodeSDKTypes";
import PerpetualDataHandler from "./perpetualDataHandler";
import { ABK64x64ToFloat } from "./d8XMath";
import { text } from "stream/consumers";
import { ethers } from "ethers";
import AccountTrade from "./accountTrade";
/**
 * BrokerTool
 * Signature method for brokers
 */
export default class BrokerTool extends WriteAccessHandler {
  /**
   * Constructor
   * @param config configuration
   * @param privateKey private key of account that trades
   */
  public constructor(config: NodeSDKConfig, privateKey: string) {
    super(config, privateKey);
  }

  /**
   *
   * @param symbol symbol of the form "ETH-USD-MATIC" or just "MATIC"
   * @returns broker lot size in collateral currency, e.g. in MATIC for symbol ETH-USD-MATIC or MATIC
   */
  public async getLotSize(symbol: string): Promise<number | undefined> {
    if (this.proxyContract == null) {
      throw Error("no proxy contract initialized. Use createProxyInstance().");
    }
    let poolId = PerpetualDataHandler._getPoolIdFromSymbol(symbol, this.poolStaticInfos);
    let pool = await this.proxyContract.getLiquidityPool(poolId);
    let lot = pool?.fBrokerCollateralLotSize;
    if (lot != undefined) {
      lot = ABK64x64ToFloat(pool.fBrokerCollateralLotSize);
    }
    return lot;
  }

  public async brokerDepositToDefaultFund(symbol: string, lots: number): Promise<ethers.providers.TransactionResponse> {
    if (this.proxyContract == null || this.signer == null) {
      throw Error("no proxy contract or wallet initialized. Use createProxyInstance().");
    }
    let poolId = PerpetualDataHandler._getPoolIdFromSymbol(symbol, this.poolStaticInfos);
    let tx = await this.proxyContract.brokerDepositToDefaultFund(poolId, lots, { gasLimit: this.gasLimit });
    return tx;
  }

  public async getFeeForBrokerVolume(symbol: string): Promise<number | undefined> {
    if (this.proxyContract == null) {
      throw Error("no proxy contract initialized.");
    }
    let poolId = PerpetualDataHandler._getPoolIdFromSymbol(symbol, this.poolStaticInfos);
    let feeTbps = await this.proxyContract.getFeeForBrokerVolume(poolId, this.traderAddr);
    return feeTbps / 100_000;
  }

  /**
   *
   * @param symbol symbol of the form "ETH-USD-MATIC" or just "MATIC"
   * @returns number of lots deposited by broker
   */
  public async getBrokerDesignation(symbol: string): Promise<number> {
    if (this.proxyContract == null) {
      throw Error("no proxy contract initialized.");
    }
    let poolId = PerpetualDataHandler._getPoolIdFromSymbol(symbol, this.poolStaticInfos);
    let designation = await this.proxyContract.getBrokerDesignation(poolId, this.traderAddr);
    return designation;
  }

  /**
   * @param symbol symbol of the form "ETH-USD-MATIC" or just "MATIC"
   * @param lots number of lots for which to get the fee. Defaults to this broker's current deposit if not specified
   * @returns fee in decimals based on given number of lots
   */
  public async getFeeForBrokerDesignation(symbol: string, newLots: number = 0): Promise<number | undefined> {
    if (this.proxyContract == null) {
      throw Error("no proxy contract initialized.");
    }
    if (newLots < 0) {
      throw Error("new lots must be a positive number.");
    }
    let lots = await this.getBrokerDesignation(symbol);
    lots += newLots;
    let feeTbps = await this.proxyContract.getFeeForBrokerDesignation(lots);
    return feeTbps / 100_000;
  }

  /**
   * @param order order for which to determine the trading fee
   * @param traderAddr address of the trader for whom to determine the fee, defaults to lowest tier
   * @returns fee in decimals (1% is 0.01)
   */
  public async determineExchangeFee(order: Order, traderAddr: string = ZERO_ADDRESS): Promise<number | undefined> {
    if (this.proxyContract == null) {
      throw Error("no proxy contract initialized.");
    }
    // broker does not need to enter address in the order if he's signed in
    if (order.brokerAddr == undefined) {
      if (this.signer == null) {
        throw Error("no wallet initialized.");
      }
      order.brokerAddr = this.traderAddr;
    }
    let scOrder = AccountTrade.toSmartContractOrder(order, traderAddr, this.symbolToPerpStaticInfo);
    let feeTbps = await this.proxyContract.determineExchangeFee(scOrder);
    return feeTbps / 100_000;
  }

  // public async sign(traderAddr: string, deadline: number, fee: number): Promise<string> {
  //   /**
  //    * structHash = keccak256(
  //           abi.encode(
  //               TRADE_BROKER_TYPEHASH,
  //               _order.iPerpetualId,
  //               _order.brokerFeeTbps,
  //               _order.traderAddr,
  //               _order.iDeadline
  //           )
  //       );
  //       return structHash;
  //    */
  //   const NAME = "Perpetual Trade Manager";
  //   const DOMAIN_TYPEHASH = ethers.utils.keccak256(
  //     Buffer.from("EIP712Domain(string name,uint256 chainId,address verifyingContract)")
  //   );
  //   let abiCoder = ethers.utils.defaultAbiCoder;
  //   let domainSeparator = ethers.utils.keccak256(
  //     abiCoder.encode(
  //       ["bytes32", "bytes32", "uint256", "address"],
  //       [DOMAIN_TYPEHASH, ethers.utils.keccak256(Buffer.from(NAME)), chainId, proxyAddress]
  //     )
  //   );
  //   let digest = ethers.utils.keccak256(
  //     abiCoder.encode(["bytes32", "bytes32", "bool"], [domainSeparator, structHash, isNewOrder])
  //   );
  //   let digestBuffer = Buffer.from(digest.substring(2, digest.length), "hex");
  //   return await signer.signMessage(digestBuffer);
  // }

  /*
  TODO:
  - get lot size DONE
  - purchase n lots:
      brokerDepositToDefaultFund(symbol, amountLots) DONE
  - fees:
      getFeeForBrokerVolume DONE
      determineExchangeFee(order) DONE
      getBrokerDesignation DONE
      getFeeForBrokerDesignation DONE
  - get fee for trader and broker
  - sign {trader address, deadline, broker fee}
  */
}
