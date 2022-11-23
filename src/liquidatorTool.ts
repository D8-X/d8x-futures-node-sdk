import WriteAccessHandler from "./writeAccessHandler";
import { NodeSDKConfig } from "./nodeSDKTypes";
import { ABK64x64ToFloat } from "./d8XMath";

/**
 * Methods to liquidate traders.
 */
export default class LiquidatorTool extends WriteAccessHandler {
  /**
   * Constructs a LiquidatorTool instance for a given configuration and private key.
   * @param {NodeSDKConfig} config Configuration object.
   * @param {string} privateKey Private key of account that liquidates.
   */
  public constructor(config: NodeSDKConfig, privateKey: string) {
    super(config, privateKey);
  }

  /**
   *
   * @param {string} symbol Symbol of the form ETH-USD-MATIC.
   * @param {string} traderAddr Address of the trader to be liquidated.
   * @param {string=} liquidatorAddr Address to be credited if the liquidation succeeds.
   * Defaults to the wallet used to execute the liquidation.
   * @returns {number} Liquidated amount.
   */
  public async liquidateTrader(symbol: string, traderAddr: string, liquidatorAddr: string = "") {
    // this operation spends gas, so signer is required
    if (this.proxyContract == null || this.signer == null) {
      throw Error("no proxy contract or wallet initialized. Use createProxyInstance().");
    }
    // liquidator is signer unless specified otherwise
    if (liquidatorAddr == "") {
      liquidatorAddr = this.traderAddr;
    }
    let perpID = LiquidatorTool.symbolToPerpetualId(symbol, this.symbolToPerpStaticInfo);
    return await this._liquidateByAMM(perpID, liquidatorAddr, traderAddr, this.gasLimit);
  }

  /**
   *
   * @param perpetualId Perpetual id.
   * @param liquidatorAddr Address to be credited for the liquidation.
   * @param traderAddr Address of the trader to be liquidated.
   * @param gasLimit Gas limit.
   * @ignore
   */
  public async _liquidateByAMM(perpetualId: number, liquidatorAddr: string, traderAddr: string, gasLimit: number) {
    let fAmount = await this.proxyContract!.liquidateByAMM(perpetualId, liquidatorAddr, traderAddr, {
      gasLimit: gasLimit,
    });
    return ABK64x64ToFloat(fAmount);
  }

  /*
  TODO
  */
}
