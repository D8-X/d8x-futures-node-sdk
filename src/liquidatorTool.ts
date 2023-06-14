import { CallOverrides, ContractTransaction, PayableOverrides } from "@ethersproject/contracts";
import { Signer } from "@ethersproject/abstract-signer";
import { BigNumber } from "@ethersproject/bignumber";
import { ABK64x64ToFloat, floatToABK64x64 } from "./d8XMath";
import { NodeSDKConfig, PriceFeedSubmission } from "./nodeSDKTypes";
import WriteAccessHandler from "./writeAccessHandler";

/**
 * Functions to liquidate traders. This class requires a private key
 * and executes smart-contract interactions that require gas-payments.
 * @extends WriteAccessHandler
 */
export default class LiquidatorTool extends WriteAccessHandler {
  /**
   * Constructs a LiquidatorTool instance for a given configuration and private key.
   * @param {NodeSDKConfig} config Configuration object, see PerpetualDataHandler.
   * readSDKConfig.
   * @example
   * import { LiquidatorTool, PerpetualDataHandler } from '@d8x/perpetuals-sdk';
   * async function main() {
   *   console.log(LiquidatorTool);
   *   // load configuration for testnet
   *   const config = PerpetualDataHandler.readSDKConfig("testnet");
   *   // LiquidatorTool (authentication required, PK is an environment variable with a private key)
   *   const pk: string = <string>process.env.PK;
   *   let lqudtrTool = new LiquidatorTool(config, pk);
   *   // Create a proxy instance to access the blockchain
   *   await lqudtrTool.createProxyInstance();
   * }
   * main();
   *
   * @param {string | Signer} signer Private key or ethers Signer of the account
   */
  public constructor(config: NodeSDKConfig, signer: string | Signer) {
    super(config, signer);
  }

  /**
   * Liquidate a trader.
   * @param {string} symbol Symbol of the form ETH-USD-MATIC.
   * @param {string} traderAddr Address of the trader to be liquidated.
   * @param {string=} liquidatorAddr Address to be credited if the liquidation succeeds.
   * @param {PriceFeedSubmission} priceFeedData optional. VAA and timestamps for oracle. If not provided will query from REST API.
   * Defaults to the wallet used to execute the liquidation.
   * @example
   * import { LiquidatorTool, PerpetualDataHandler } from '@d8x/perpetuals-sdk';
   * async function main() {
   *   console.log(LiquidatorTool);
   *   // Setup (authentication required, PK is an environment variable with a private key)
   *   const config = PerpetualDataHandler.readSDKConfig("testnet");
   *   const pk: string = <string>process.env.PK;
   *   let lqudtrTool = new LiquidatorTool(config, pk);
   *   await lqudtrTool.createProxyInstance();
   *   // liquidate trader
   *   let liqAmount = await lqudtrTool.liquidateTrader("ETH-USD-MATIC",
   *       "0xAb5801a7D398351b8bE11C439e05C5B3259aeC9B");
   *   console.log(liqAmount);
   * }
   * main();
   *
   * @returns Transaction object.
   */
  public async liquidateTrader(
    symbol: string,
    traderAddr: string,
    liquidatorAddr: string = "",
    priceFeedData?: PriceFeedSubmission,
    overrides?: PayableOverrides
  ): Promise<ContractTransaction> {
    // this operation spends gas, so signer is required
    if (this.proxyContract == null || this.signer == null) {
      throw Error("no proxy contract or wallet initialized. Use createProxyInstance().");
    }
    // liquidator is signer unless specified otherwise
    if (liquidatorAddr == "") {
      liquidatorAddr = this.traderAddr;
    }
    let perpID = LiquidatorTool.symbolToPerpetualId(symbol, this.symbolToPerpStaticInfo);
    if (priceFeedData == undefined) {
      priceFeedData = await this.fetchLatestFeedPriceInfo(symbol);
    }
    if (!overrides || overrides.value == undefined) {
      overrides = {
        value: priceFeedData.timestamps.length * this.PRICE_UPDATE_FEE_GWEI,
        ...overrides,
      } as PayableOverrides;
    }
    return await this._liquidateByAMM(perpID, liquidatorAddr, traderAddr, priceFeedData, overrides);
  }

  /**
   * Check if the collateral of a trader is above the maintenance margin ("maintenance margin safe").
   * If not, the position can be liquidated.
   * @param {string} symbol Symbol of the form ETH-USD-MATIC.
   * @param {string} traderAddr Address of the trader whose position you want to assess.
   * @param {number[]} indexPrices optional, index price S2/S3 for which we test
   * @example
   * import { LiquidatorTool, PerpetualDataHandler } from '@d8x/perpetuals-sdk';
   * async function main() {
   *   console.log(LiquidatorTool);
   *   // Setup (authentication required, PK is an environment variable with a private key)
   *   const config = PerpetualDataHandler.readSDKConfig("testnet");
   *   const pk: string = <string>process.env.PK;
   *   let lqudtrTool = new LiquidatorTool(config, pk);
   *   await lqudtrTool.createProxyInstance();
   *   // check if trader can be liquidated
   *   let safe = await lqudtrTool.isMaintenanceMarginSafe("ETH-USD-MATIC",
   *       "0xAb5801a7D398351b8bE11C439e05C5B3259aeC9B");
   *   console.log(safe);
   * }
   * main();
   *
   * @returns {boolean} True if the trader is maintenance margin safe in the perpetual.
   * False means that the trader's position can be liquidated.
   */
  public async isMaintenanceMarginSafe(
    symbol: string,
    traderAddr: string,
    indexPrices?: [number, number],
    overrides?: CallOverrides
  ): Promise<boolean> {
    if (this.proxyContract == null) {
      throw Error("no proxy contract initialized. Use createProxyInstance().");
    }
    const idx_notional = 4;
    let perpID = LiquidatorTool.symbolToPerpetualId(symbol, this.symbolToPerpStaticInfo);
    if (indexPrices == undefined) {
      // fetch from API
      let obj = await this.priceFeedGetter.fetchPricesForPerpetual(symbol);
      indexPrices = [obj.idxPrices[0], obj.idxPrices[1]];
    }
    let traderState = await this.proxyContract.getTraderState(
      perpID,
      traderAddr,
      indexPrices.map((x) => floatToABK64x64(x)) as [BigNumber, BigNumber],
      overrides || {}
    );
    if (traderState[idx_notional].eq(0)) {
      // trader does not have open position
      return true;
    }
    // calculate margin from traderstate
    const idx_maintenanceMgnRate = 10;
    const idx_marginAccountPositionBC = 4;
    const idx_collateralToQuoteConversion = 9;
    const idx_marginBalance = 0;
    const maintMgnRate = ABK64x64ToFloat(traderState[idx_maintenanceMgnRate]);
    const pos = ABK64x64ToFloat(traderState[idx_marginAccountPositionBC]);
    const marginbalance = ABK64x64ToFloat(traderState[idx_marginBalance]);
    const coll2quote = ABK64x64ToFloat(traderState[idx_collateralToQuoteConversion]);
    const base2collateral = indexPrices[0] / coll2quote;
    const threshold = Math.abs(pos * base2collateral * maintMgnRate);
    return marginbalance >= threshold;
  }

  /**
   *
   * @param perpetualId Perpetual id.
   * @param liquidatorAddr Address to be credited for the liquidation.
   * @param traderAddr Address of the trader to be liquidated.
   * @param priceFeedData contains VAA and timestamps required
   * @param options E.g., Gas limit, fee.
   * @ignore
   */
  public async _liquidateByAMM(
    perpetualId: number,
    liquidatorAddr: string,
    traderAddr: string,
    priceFeedData: PriceFeedSubmission,
    overrides?: PayableOverrides
  ) {
    return await this.proxyContract!.liquidateByAMM(
      perpetualId,
      liquidatorAddr,
      traderAddr,
      priceFeedData.priceFeedVaas,
      priceFeedData.timestamps,
      overrides
    );
  }

  /**
   * Total number of active accounts for this symbol, i.e. accounts with positions that are currently open.
   * @param {string} symbol Symbol of the form ETH-USD-MATIC.
   * @example
   * import { LiquidatorTool, PerpetualDataHandler } from '@d8x/perpetuals-sdk';
   * async function main() {
   *   console.log(LiquidatorTool);
   *   // Setup (authentication required, PK is an environment variable with a private key)
   *   const config = PerpetualDataHandler.readSDKConfig("testnet");
   *   const pk: string = <string>process.env.PK;
   *   let lqudtrTool = new LiquidatorTool(config, pk);
   *   await lqudtrTool.createProxyInstance();
   *   // get number of active accounts
   *   let accounts = await lqudtrTool.countActivePerpAccounts("ETH-USD-MATIC");
   *   console.log(accounts);
   * }
   * main();
   *
   * @returns {number} Number of active accounts.
   */
  public async countActivePerpAccounts(symbol: string, overrides?: CallOverrides): Promise<number> {
    if (this.proxyContract == null) {
      throw Error("no proxy contract initialized. Use createProxyInstance().");
    }
    let perpID = LiquidatorTool.symbolToPerpetualId(symbol, this.symbolToPerpStaticInfo);
    let numAccounts = await this.proxyContract.countActivePerpAccounts(perpID, overrides || {});
    return Number(numAccounts);
  }

  /**
   * Get addresses of active accounts by chunks.
   * @param {string} symbol Symbol of the form ETH-USD-MATIC.
   * @param {number} from From which account we start counting (0-indexed).
   * @param {number} to Until which account we count, non inclusive.
   * @example
   * import { LiquidatorTool, PerpetualDataHandler } from '@d8x/perpetuals-sdk';
   * async function main() {
   *   console.log(LiquidatorTool);
   *   // Setup (authentication required, PK is an environment variable with a private key)
   *   const config = PerpetualDataHandler.readSDKConfig("testnet");
   *   const pk: string = <string>process.env.PK;
   *   let lqudtrTool = new LiquidatorTool(config, pk);
   *   await lqudtrTool.createProxyInstance();
   *   // get all active accounts in chunks
   *   let accounts = await lqudtrTool.getActiveAccountsByChunks("ETH-USD-MATIC", 0, 4);
   *   console.log(accounts);
   * }
   * main();
   *
   * @returns {string[]} Array of addresses at locations 'from', 'from'+1 ,..., 'to'-1.
   */
  public async getActiveAccountsByChunks(
    symbol: string,
    from: number,
    to: number,
    overrides?: CallOverrides
  ): Promise<string[]> {
    if (this.proxyContract == null) {
      throw Error("no proxy contract initialized. Use createProxyInstance().");
    }
    let perpID = LiquidatorTool.symbolToPerpetualId(symbol, this.symbolToPerpStaticInfo);
    return await this.proxyContract.getActivePerpAccountsByChunks(perpID, from, to, overrides || {});
  }

  /**
   * Addresses for all the active accounts in this perpetual symbol.
   * @param {string} symbol Symbol of the form ETH-USD-MATIC.
   * @example
   * import { LiquidatorTool, PerpetualDataHandler } from '@d8x/perpetuals-sdk';
   * async function main() {
   *   console.log(LiquidatorTool);
   *   // Setup (authentication required, PK is an environment variable with a private key)
   *   const config = PerpetualDataHandler.readSDKConfig("testnet");
   *   const pk: string = <string>process.env.PK;
   *   let lqudtrTool = new LiquidatorTool(config, pk);
   *   await lqudtrTool.createProxyInstance();
   *   // get all active accounts
   *   let accounts = await lqudtrTool.getAllActiveAccounts("ETH-USD-MATIC");
   *   console.log(accounts);
   * }
   * main();
   *
   * @returns {string[]} Array of addresses.
   */
  public async getAllActiveAccounts(symbol: string, overrides?: CallOverrides): Promise<string[]> {
    // checks are done inside the intermediate functions
    let totalAccounts = await this.countActivePerpAccounts(symbol);
    return await this.getActiveAccountsByChunks(symbol, 0, totalAccounts, overrides);
  }
}
