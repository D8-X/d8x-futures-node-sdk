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
    console.log("poolId:", poolId);
    let pool = await this.proxyContract.getLiquidityPool(poolId);
    console.log("pool:", pool);
    let lot = pool?.fBrokerCollateralLotSize;
    console.log("lot:", lot);
    if (lot != undefined) {
      lot = ABK64x64ToFloat(pool.fBrokerCollateralLotSize);
      console.log("lot float:", lot);
    }
    return lot;
  }

  public async brokerDepositToDefaultFund(symbol: string, numberOfLots: number): Promise<string | undefined> {
    if (this.proxyContract == null || this.signer == null) {
      throw Error("no proxy contract or wallet initialized. Use createProxyInstance().");
    }
    let poolId = PerpetualDataHandler._getPoolIdFromSymbol(symbol, this.poolStaticInfos);
    let tx = await this.proxyContract.brokerDepositToDefaultFund(poolId, numberOfLots, { gasLimit: this.gasLimit });
    return tx.hash;
  }

  public async getFeeForBrokerVolume(): Promise<number | undefined> {
    // TODO
    return 0;
  }

  /**
   * @param order order for which to determine the trading fee
   * @returns fee in decimals (1% is 0.01)
   */
  public async determineExchangeFee(order: Order): Promise<number | undefined> {
    if (this.proxyContract == null) {
      throw Error("no proxy contract initialized.");
    }
    // broker does not need to enter address in the order, he's signed in
    if (order.brokerAddr == undefined && this.traderAddr != "") {
      order.brokerAddr = this.traderAddr;
    }
    // should account for trader address? optional argument?
    console.log("order:", order);
    let scOrder = AccountTrade.toSmartContractOrder(order, ZERO_ADDRESS, this.symbolToPerpStaticInfo);
    console.log("sc order:", scOrder);
    let feeTbps = await this.proxyContract.determineExchangeFee(scOrder);
    console.log("feeTbps:", feeTbps);
    return feeTbps / 100_000;
  }

  /**
   *
   * @param symbol symbol of the form "ETH-USD-MATIC" or just "MATIC"
   * @returns number of lots deposited by broker
   */
  public async getBrokerDesignation(symbol): Promise<number | undefined> {
    if (this.proxyContract == null) {
      throw Error("no proxy contract initialized.");
    }
    let poolId = PerpetualDataHandler._getPoolIdFromSymbol(symbol, this.poolStaticInfos);
    let designation = await this.proxyContract.getBrokerDesignation(poolId, this.traderAddr);
    return designation;
  }

  /**
   * @param symbol symbol of the form "ETH-USD-MATIC" or just "MATIC"
   * @param lots number of lots for which to get the fee. Defaults to this broker's deposit if not specified
   * @returns fee in decimals based on given number of lots
   */
  public async getFeeForBrokerDesignation(
    symbol: string,
    lots: number | undefined = undefined
  ): Promise<number | undefined> {
    if (this.proxyContract == null) {
      throw Error("no proxy contract initialized.");
    }
    if (lots == undefined) {
      lots = await this.getBrokerDesignation(symbol);
    }
    let fee = await this.proxyContract.getFeeForBrokerDesignation(lots);
    return fee / 100_000;
  }

  /*
  TODO:
  - get lot size DONE
  - purchase n lots:
      brokerDepositToDefaultFund(symbol, amountLots) DONE
  - fees:
      getFeeForBrokerVolume 
      determineExchangeFee(order) DONE
      getBrokerDesignation DONE
      getFeeForBrokerDesignation DONE
  - get fee for trader and broker
  - sign {trader address, deadline, broker fee}
  */
}
