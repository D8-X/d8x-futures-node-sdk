import { ethers } from "ethers";
import WriteAccessHandler from "./writeAccessHandler";
import { NodeSDKConfig, ERC20_ABI } from "./nodeSDKTypes";
import PerpetualDataHandler from "./perpetualDataHandler";
import { floatToABK64x64, dec18ToFloat, ABK64x64ToFloat } from "./d8XMath";
/**
 * LiquidityProviderTool
 * Methods to provide liquidity
 */
export default class LiquidityProviderTool extends WriteAccessHandler {
  /**
   * Constructor
   * @param config configuration
   * @param privateKey private key of account that trades
   */
  public constructor(config: NodeSDKConfig, privateKey: string) {
    super(config, privateKey);
  }

  /**
   * Returns the value of the share tokens for this liquidity provider
   * in poolSymbol-currency (e.g. MATIC, USDC)
   * @param poolSymbolName pool symbol name (e.g. MATIC)
   */
  public async getParticipationValue(poolSymbolName: string): Promise<number> {
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
    let shareTokenBalanceOfAddr = dec18ToFloat(dShareTokenBalanceOfAddr);
    if (shareTokenBalanceOfAddr == 0) {
      return 0;
    }
    let pool = await this.proxyContract.getLiquidityPool(poolId);
    let fPnLParticipantFundCash = pool.fPnLparticipantsCashCC;
    let pnlParticipantFundCash = ABK64x64ToFloat(fPnLParticipantFundCash);

    let dTotalSupply = await shareToken.totalSupply();

    let totalSupply = dec18ToFloat(dTotalSupply);
    let valueCC = (shareTokenBalanceOfAddr / totalSupply) * pnlParticipantFundCash;
    return valueCC;
  }

  /**
   *  Add liquidity to the PnL participant fund. The address gets pool shares in return.
   * @param poolname  name of pool symbol (e.g. MATIC)
   * @param amountCC  amount in pool-collateral currency
   * @return transaction hash
   */
  public async addLiquidity(poolSymbolName: string, amountCC: number): Promise<string> {
    if (this.proxyContract == null || this.signer == null) {
      throw Error("no proxy contract or wallet initialized. Use createProxyInstance().");
    }
    let poolId = PerpetualDataHandler._getPoolIdFromSymbol(poolSymbolName, this.poolStaticInfos);
    let tx = await this.proxyContract.addLiquidity(poolId, floatToABK64x64(amountCC), {
      gasLimit: this.gasLimit,
    });
    return tx.hash;
  }

  /**
   * Remove liquidity from the pool
   * @param poolSymbolName name of pool symbol (e.g. MATIC)
   * @param amountPoolShares amount in pool-tokens, removes everything if > available amount
   * @return transaction hash
   */
  public async removeLiquidity(poolSymbolName: string, amountPoolShares: number): Promise<string> {
    if (this.proxyContract == null || this.signer == null) {
      throw Error("no proxy contract or wallet initialized. Use createProxyInstance().");
    }
    let poolId = PerpetualDataHandler._getPoolIdFromSymbol(poolSymbolName, this.poolStaticInfos);
    let tx = await this.proxyContract.addLiquidity(poolId, floatToABK64x64(amountPoolShares), {
      gasLimit: this.gasLimit,
    });
    return tx.hash;
  }

  /*
  TODO:
  - add liquidity
    addLiquidity(uint8 _poolId, int128 _fTokenAmount)
  - remove liquidity
    function removeLiquidity(uint8 _poolId, int128 _fShareAmount) external override nonReentrant 
  */
}
