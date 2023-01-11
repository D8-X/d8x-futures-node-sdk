import { ethers } from "ethers";
import { dec18ToFloat, floatToDec18 } from "./d8XMath";
import { ERC20_ABI, NodeSDKConfig } from "./nodeSDKTypes";
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
   *   // load configuration for testnet
   *   const config = PerpetualDataHandler.readSDKConfig("testnet");
   *   // LiquidityProviderTool (authentication required, PK is an environment variable with a private key)
   *   const pk: string = <string>process.env.PK;
   *   let lqudtProviderTool = new LiquidityProviderTool(config, pk);
   *   // Create a proxy instance to access the blockchain
   *   await lqudtProviderTool.createProxyInstance();
   * }
   * main();
   *
   * @param privateKey private key of account that trades
   */
  public constructor(config: NodeSDKConfig, privateKey: string) {
    super(config, privateKey);
  }

  /**
   * Value of the pool share tokens for this liquidity provider
   * in poolSymbol-currency (e.g. MATIC, USDC).
   * @param {string} poolSymbolName Pool symbol name (e.g. MATIC).
   * @example
   * import { LiquidityProviderTool, PerpetualDataHandler } from '@d8x/perpetuals-sdk';
   * async function main() {
   *   console.log(LiquidityProviderTool);
   *   // setup (authentication required, PK is an environment variable with a private key)
   *   const config = PerpetualDataHandler.readSDKConfig("testnet");
   *   const pk: string = <string>process.env.PK;
   *   let lqudtProviderTool = new LiquidityProviderTool(config, pk);
   *   await lqudtProviderTool.createProxyInstance();
   *   // get value of pool share token
   *   let shareToken = await lqudtProviderTool.getParticipationValue("MATIC");
   *   console.log(shareToken);
   * }
   * main();
   *
   * @return Value in poolSymbol-currency (e.g. MATIC, USDC), balance of pool share tokens, and share token symbol.
   */
  public async getParticipationValue(
    poolSymbolName: string
  ): Promise<{ value: number; shareTokenBalance: number; poolShareToken: string }> {
    if (
      this.proxyContract == null ||
      this.signer == null ||
      this.poolStaticInfos.length == 0 ||
      this.provider == null
    ) {
      throw Error("no proxy contract or wallet or data initialized. Use createProxyInstance().");
    }
    let poolId = PerpetualDataHandler._getPoolIdFromSymbol(poolSymbolName, this.poolStaticInfos);

    let shareTokenAddr = this.poolStaticInfos[poolId - 1].shareTokenAddr;
    let shareToken = new ethers.Contract(shareTokenAddr, ERC20_ABI, this.signer);
    let dShareTokenBalanceOfAddr = await shareToken.balanceOf(this.traderAddr);

    let valueCCDec18 = await this.proxyContract.getTokenAmountToReturn(poolId, dShareTokenBalanceOfAddr);

    let shareTokenBalanceOfAddr = dec18ToFloat(dShareTokenBalanceOfAddr);

    return {
      value: dec18ToFloat(valueCCDec18),
      shareTokenBalance: shareTokenBalanceOfAddr,
      poolShareToken: shareTokenAddr,
    };
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
   *   const config = PerpetualDataHandler.readSDKConfig("testnet");
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
  public async addLiquidity(poolSymbolName: string, amountCC: number): Promise<ethers.ContractTransaction> {
    if (this.proxyContract == null || this.signer == null) {
      throw Error("no proxy contract or wallet initialized. Use createProxyInstance().");
    }
    let poolId = PerpetualDataHandler._getPoolIdFromSymbol(poolSymbolName, this.poolStaticInfos);
    let tx = await this.proxyContract.addLiquidity(poolId, floatToDec18(amountCC), {
      gasLimit: this.gasLimit,
    });
    return tx;
  }

  /**
   * Remove liquidity from the pool. The address loses pool shares in return.
   * @param {string} poolSymbolName Name of pool symbol (e.g. MATIC).
   * @param {string} amountPoolShares Amount in pool-shares, removes everything if > available amount.
   * @example
   * import { LiquidityProviderTool, PerpetualDataHandler } from '@d8x/perpetuals-sdk';
   * async function main() {
   *   console.log(LiquidityProviderTool);
   *   // setup (authentication required, PK is an environment variable with a private key)
   *   const config = PerpetualDataHandler.readSDKConfig("testnet");
   *   const pk: string = <string>process.env.PK;
   *   let lqudtProviderTool = new LiquidityProviderTool(config, pk);
   *   await lqudtProviderTool.createProxyInstance();
   *   // remove liquidity
   *   let respRemoveLiquidity = await lqudtProviderTool.removeLiquidity("MATIC", 0.1);
   *   console.log(respRemoveLiquidity);
   * }
   * main();
   *
   * @return Transaction object.
   */
  public async removeLiquidity(
    poolSymbolName: string,
    amountPoolShares: number
  ): Promise<ethers.providers.TransactionResponse> {
    if (this.proxyContract == null || this.signer == null) {
      throw Error("no proxy contract or wallet initialized. Use createProxyInstance().");
    }
    let poolId = PerpetualDataHandler._getPoolIdFromSymbol(poolSymbolName, this.poolStaticInfos);
    let tx = await this.proxyContract.removeLiquidity(poolId, floatToDec18(amountPoolShares), {
      gasLimit: this.gasLimit,
    });
    return tx;
  }

  /*
  TODO:
  - add liquidity
    addLiquidity(uint8 _poolId, int128 _fTokenAmount)
  - remove liquidity
    function removeLiquidity(uint8 _poolId, int128 _fShareAmount) external override nonReentrant 
  */
}
