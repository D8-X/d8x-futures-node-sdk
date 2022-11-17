import WriteAccessHandler from "./writeAccessHandler";
import { NodeSDKConfig } from "./nodeSDKTypes";
//import { PerpetualDataHandler } from "./perpetualDataHandler";
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
   *
   * @param poolname
   * @param amountCC
   */
  public addLiquidity(poolname: string, amountCC: number): string | undefined {
    if (this.proxyContract == null || this.signer == null) {
      throw Error("no proxy contract or wallet initialized. Use createProxyInstance().");
    }
    return "";
    //let cleanSymbol = PerpetualDataHandler.symbolToBytes4Symbol(symbol);
    //let orderBookAddr = this.symbolToPerpStaticInfo.get(cleanSymbol)?.limitOrderBookAddr;
  }

  /*
  TODO:
  - add liquidity
    addLiquidity(uint8 _poolId, int128 _fTokenAmount)
  - remove liquidity
    function removeLiquidity(uint8 _poolId, int128 _fShareAmount) external override nonReentrant 
  */
}
