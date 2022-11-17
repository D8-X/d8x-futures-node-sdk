import WriteAccessHandler from "./writeAccessHandler";
import { NodeSDKConfig } from "./nodeSDKTypes";
import PerpetualDataHandler from "./perpetualDataHandler";
import { floatToABK64x64 } from "./d8XMath";
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

  // move to market data:
  public getParticipationValue(poolname: string) {
    /*
    let token = await getTokenInstance(SHARE_TOKEN_ADDR, ERC20_ABI, NODE_URL, pk);
    let pool = await manager.getLiquidityPool(1);
    let fPnLParticipantFundCash = await pool.fPnLparticipantsCashCC;
    let pnlParticipantFundCash = ABK64x64ToFloat(fPnLParticipantFundCash);
    console.log("PnL Fund size = ", pnlParticipantFundCash);
    let dTotalSupply = await token.totalSupply();
    let dShareTokenBalanceOfAddr = await token.balanceOf(address);
    let totalSupply = dec18ToFloat(dTotalSupply);
    let shareTokenBalanceOfAddr = dec18ToFloat(dShareTokenBalanceOfAddr);
    console.log("Share Token Total Supply = ", totalSupply);
    console.log("Share Token Balance of Addr = ", shareTokenBalanceOfAddr);
    console.log("Value Balance of Addr (BTCs) = ", shareTokenBalanceOfAddr/totalSupply * pnlParticipantFundCash);
    */
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
