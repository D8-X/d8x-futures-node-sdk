import { Signer } from "@ethersproject/abstract-signer";
import type { ContractTransaction, Overrides } from "@ethersproject/contracts";
import { floatToDec18, floatToDecN } from "./d8XMath";
import type { NodeSDKConfig } from "./nodeSDKTypes";
import PerpetualDataHandler from "./perpetualDataHandler";
import WriteAccessHandler from "./writeAccessHandler";
/**
 * Functions to provide liquidity. This class requires a private key and executes
 * smart-contract interactions that require gas-payments.
 * @extends WriteAccessHandler
 */
export default class LiquidityProviderTool extends WriteAccessHandler {
  /**
   * Constructor
   * @param {NodeSDKConfig} config Configuration object, see PerpetualDataHandler.
   * readSDKConfig.
   * @example
   * import { LiquidityProviderTool, PerpetualDataHandler } from '@d8x/perpetuals-sdk';
   * async function main() {
   *   console.log(LiquidityProviderTool);
   *   // load configuration for Polygon zkEVM (testnet)
   *   const config = PerpetualDataHandler.readSDKConfig("cardona");
   *   // LiquidityProviderTool (authentication required, PK is an environment variable with a private key)
   *   const pk: string = <string>process.env.PK;
   *   let lqudtProviderTool = new LiquidityProviderTool(config, pk);
   *   // Create a proxy instance to access the blockchain
   *   await lqudtProviderTool.createProxyInstance();
   * }
   * main();
   *
   * @param {string | Signer} signer Private key or ethers Signer of the account
   */
  public constructor(config: NodeSDKConfig, signer: string | Signer) {
    super(config, signer);
  }

  /**
   *  Add liquidity to the PnL participant fund. The address gets pool shares in return.
   * @param {string} poolSymbolName  Name of pool symbol (e.g. MATIC)
   * @param {number} amountCC  Amount in pool-collateral currency
   * @example
   * import { LiquidityProviderTool, PerpetualDataHandler } from '@d8x/perpetuals-sdk';
   * async function main() {
   *   console.log(LiquidityProviderTool);
   *   // setup (authentication required, PK is an environment variable with a private key)
   *   const config = PerpetualDataHandler.readSDKConfig("cardona");
   *   const pk: string = <string>process.env.PK;
   *   let lqudtProviderTool = new LiquidityProviderTool(config, pk);
   *   await lqudtProviderTool.createProxyInstance();
   *   // add liquidity
   *   await lqudtProviderTool.setAllowance("MATIC");
   *   let respAddLiquidity = await lqudtProviderTool.addLiquidity("MATIC", 0.1);
   *   console.log(respAddLiquidity);
   * }
   * main();
   *
   * @return Transaction object
   */
  public async addLiquidity(
    poolSymbolName: string,
    amountCC: number,
    overrides?: Overrides
  ): Promise<ContractTransaction> {
    if (this.proxyContract == null || this.signer == null) {
      throw Error("no proxy contract or wallet initialized. Use createProxyInstance().");
    }
    let poolId = PerpetualDataHandler._getPoolIdFromSymbol(poolSymbolName, this.poolStaticInfos);
    let decimals = this.getMarginTokenDecimalsFromSymbol(poolSymbolName);
    let tx = await this.proxyContract.addLiquidity(
      poolId,
      floatToDecN(amountCC, decimals!),
      overrides || { gasLimit: this.gasLimit }
    );
    return tx;
  }

  /**
   * Initiates a liquidity withdrawal from the pool
   * It triggers a time-delayed unlocking of the given number of pool shares.
   * The amount of pool shares to be unlocked is fixed by this call, but not their value in pool currency.
   * @param {string} poolSymbolName Name of pool symbol (e.g. MATIC).
   * @param {string} amountPoolShares Amount in pool-shares, removes everything if > available amount.
   * @example
   * import { LiquidityProviderTool, PerpetualDataHandler } from '@d8x/perpetuals-sdk';
   * async function main() {
   *   console.log(LiquidityProviderTool);
   *   // setup (authentication required, PK is an environment variable with a private key)
   *   const config = PerpetualDataHandler.readSDKConfig("cardona");
   *   const pk: string = <string>process.env.PK;
   *   let lqudtProviderTool = new LiquidityProviderTool(config, pk);
   *   await lqudtProviderTool.createProxyInstance();
   *   // initiate withdrawal
   *   let respRemoveLiquidity = await lqudtProviderTool.initiateLiquidityWithdrawal("MATIC", 0.1);
   *   console.log(respRemoveLiquidity);
   * }
   * main();
   *
   * @return Transaction object.
   */
  public async initiateLiquidityWithdrawal(
    poolSymbolName: string,
    amountPoolShares: number,
    overrides?: Overrides
  ): Promise<ContractTransaction> {
    if (this.proxyContract == null || this.signer == null) {
      throw Error("no proxy contract or wallet initialized. Use createProxyInstance().");
    }
    let poolId = PerpetualDataHandler._getPoolIdFromSymbol(poolSymbolName, this.poolStaticInfos);
    let tx = await this.proxyContract.withdrawLiquidity(
      poolId,
      floatToDec18(amountPoolShares),
      overrides || { gasLimit: this.gasLimit }
    );
    return tx;
  }

  /**
   * Withdraws as much liquidity as there is available after a call to initiateLiquidityWithdrawal.
   * The address loses pool shares in return.
   * @param poolSymbolName
   * @example
   * import { LiquidityProviderTool, PerpetualDataHandler } from '@d8x/perpetuals-sdk';
   * async function main() {
   *   console.log(LiquidityProviderTool);
   *   // setup (authentication required, PK is an environment variable with a private key)
   *   const config = PerpetualDataHandler.readSDKConfig("cardona");
   *   const pk: string = <string>process.env.PK;
   *   let lqudtProviderTool = new LiquidityProviderTool(config, pk);
   *   await lqudtProviderTool.createProxyInstance();
   *   // remove liquidity
   *   let respRemoveLiquidity = await lqudtProviderTool.executeLiquidityWithdrawal("MATIC", 0.1);
   *   console.log(respRemoveLiquidity);
   * }
   * main();
   *
   * @returns Transaction object.
   */
  public async executeLiquidityWithdrawal(poolSymbolName: string, overrides?: Overrides): Promise<ContractTransaction> {
    if (this.proxyContract == null || this.signer == null) {
      throw Error("no proxy contract or wallet initialized. Use createProxyInstance().");
    }
    let poolId = PerpetualDataHandler._getPoolIdFromSymbol(poolSymbolName, this.poolStaticInfos);
    let tx = await this.proxyContract.executeLiquidityWithdrawal(
      poolId,
      this.traderAddr,
      overrides || { gasLimit: this.gasLimit }
    );
    return tx;
  }
}
