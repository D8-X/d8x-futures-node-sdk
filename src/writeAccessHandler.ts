import { BigNumber, BigNumberish, ethers, Wallet } from "ethers";
import PerpetualDataHandler from "./perpetualDataHandler";
import { NodeSDKConfig, MAX_UINT_256, ERC20_ABI } from "./nodeSDKTypes";
import { to4Chars } from "./utils";

/**
 * This is a parent class for the classes that require
 * write access to the contracts.
 * This class requires a private key and executes smart-contract interaction that
 * require gas-payments.
 */
export default class WriteAccessHandler extends PerpetualDataHandler {
  protected privateKey: string;
  protected traderAddr: string = "";
  protected signer: ethers.Wallet | null = null;
  protected gasLimit: number = 5_000_000;
  protected chainId: number = 0;
  /**
   * Constructor
   * @param config configuration
   * @param privateKey private key of account that trades
   */
  public constructor(config: NodeSDKConfig, privateKey: string) {
    super(config);
    this.privateKey = privateKey;
    if (config.gasLimit != undefined) {
      this.gasLimit = config.gasLimit;
    }
  }

  /**
   * Initialize the AccountTrade-Class with this function
   * to create instance of D8X perpetual contract and gather information
   * about perpetual currencies
   */
  public async createProxyInstance() {
    this.provider = new ethers.providers.JsonRpcProvider(this.nodeURL);
    const wallet = new ethers.Wallet(this.privateKey);
    this.signer = wallet.connect(this.provider);
    await this.initContractsAndData(this.signer);
    this.traderAddr = wallet.address;
    this.chainId = (await this.provider.getNetwork()).chainId;
  }

  /**
   * Set allowance for ar margin token (e.g., MATIC, ETH, USDC)
   * @param symbol token in 'long-form' such as MATIC, symbol also fine (ETH-USD-MATIC)
   * @param amount optional, amount to approve if not 'infinity'
   * @returns transaction hash
   */
  public async setAllowance(symbol: string, amount: BigNumber = MAX_UINT_256): Promise<string> {
    //extract margin-currency name
    let symbolarr = symbol.split("-");
    symbol = symbol.length == 3 ? symbolarr[2] : symbolarr[0];
    //transform into bytes4 currencies (without the space): "BTC", "USD", "MATC"
    symbol = to4Chars(symbol);
    symbol = symbol.replace(/\0/g, "");
    let marginTokenAddr = this.symbolToTokenAddrMap.get(symbol);
    if (marginTokenAddr == undefined || this.signer == null) {
      throw Error("No margin token or signer defined, call createProxyInstance");
    }
    return WriteAccessHandler._setAllowance(marginTokenAddr, this.proxyAddr, this.signer, amount);
  }

  protected static async _setAllowance(
    tokenAddr: string,
    proxyAddr: string,
    signer: ethers.Wallet,
    amount: BigNumber
  ): Promise<string> {
    const marginToken: ethers.Contract = new ethers.Contract(tokenAddr, ERC20_ABI, signer);
    let tx = await marginToken.approve(proxyAddr, amount);
    await tx.wait();
    return tx.hash;
  }
}
