import WriteAccessHandler from "./writeAccessHandler";
import { NodeSDKConfig } from "./nodeSDKTypes";
import { ABK64x64ToFloat } from "./d8XMath";

/**
 * Methods to liquidate traders.
 */
export default class LiquidatorTool extends WriteAccessHandler {
  /**
   * Constructs a LiquidatorTool instance for a given configuration and private key.
   * @param {NodeSDKConfig} config Configuration object, see PerpetualDataHandler.
   * readSDKConfig. For example: const config = PerpetualDataHandler.readSDKConfig("testnet")
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
   * Check if the collateral of a trader is above the maintenance margin ("maintenance margin safe"). 
   * If not, the position can be liquidated.
   * @param {string} symbol Symbol of the form ETH-USD-MATIC.
   * @param {string} traderAddr Address of the trader whose position you want to assess.
   * @returns {boolean} True if the trader is maintenance margin safe in the perpetual.
   * False means that the trader's position can be liquidated. 
   */
  public async isMaintenanceMarginSafe(symbol: string, traderAddr: string): Promise<boolean> {
    if (this.proxyContract == null) {
      throw Error("no proxy contract initialized. Use createProxyInstance().");
    }
    let perpID = LiquidatorTool.symbolToPerpetualId(symbol, this.symbolToPerpStaticInfo);
    return await this.proxyContract.isTraderMaintenanceMarginSafe(perpID, traderAddr);
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

  /**
   * Total number of active accounts for this symbol, i.e. accounts with positions that are currently open.
   * @param {string} symbol Symbol of the form ETH-USD-MATIC.
   * @returns {number} Number of active accounts.
   */
  public async countActivePerpAccounts(symbol: string): Promise<number> {
    if (this.proxyContract == null) {
      throw Error("no proxy contract initialized. Use createProxyInstance().");
    }
    let perpID = LiquidatorTool.symbolToPerpetualId(symbol, this.symbolToPerpStaticInfo);
    return await this.proxyContract.countActivePerpAccounts(perpID);
  }

  /**
   * Get addresses of active accounts by chunks.
   * @param {string} symbol Symbol of the form ETH-USD-MATIC.
   * @param {number} from From which account we start counting (0-indexed).
   * @param {number} to Until which account we count, non inclusive.
   * @returns {string[]} Array of addresses at locations 'from', 'from'+1 ,..., 'to'-1.
   */
  public async getActiveAccountsByChunks(symbol: string, from: number, to: number): Promise<string[]> {
    if (this.proxyContract == null) {
      throw Error("no proxy contract initialized. Use createProxyInstance().");
    }
    let perpID = LiquidatorTool.symbolToPerpetualId(symbol, this.symbolToPerpStaticInfo);
    return await this.proxyContract.getActivePerpAccountsByChunks(perpID, from, to);
  }

  /**
   * Addresses for all the active accounts in this perpetual symbol.
   * @param {string} symbol Symbol of the form ETH-USD-MATIC.
   * @returns {string[]} Array of addresses.
   */
  public async getAllActiveAccounts(symbol: string): Promise<string[]> {
    // checks are done inside the intermediate functions
    let totalAccounts = await this.countActivePerpAccounts(symbol);
    return await this.getActiveAccountsByChunks(symbol, 0, totalAccounts);
  }
}
