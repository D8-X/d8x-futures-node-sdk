import WriteAccessHandler from "./writeAccessHandler";
import { NodeSDKConfig } from "./nodeSDKTypes";
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

  /*
  TODO:
  - get lot size
  - purchase n lots:
      brokerDepositToDefaultFund(poolId, amountLots)
  - fees:
      getFeeForBrokerVolume
      determineExchangeFee
      getBrokerDesignation
      getFeeForBrokerDesignation
  - get fee for trader and broker
  - sign {trader address, deadline, broker fee}
  */
}
