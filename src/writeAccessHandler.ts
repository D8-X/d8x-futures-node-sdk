import { BigNumber, ethers } from "ethers";
import { floatToDec18 } from "./d8XMath";
import { ERC20_ABI, MAX_UINT_256, MOCK_TOKEN_SWAP_ABI, NodeSDKConfig } from "./nodeSDKTypes";
import PerpetualDataHandler from "./perpetualDataHandler";

/**
 * This is a parent class for the classes that require
 * write access to the contracts.
 * This class requires a private key and executes smart-contract interaction that
 * require gas-payments.
 * @extends PerpetualDataHandler
 */
export default class WriteAccessHandler extends PerpetualDataHandler {
  protected privateKey: string;
  protected traderAddr: string = "";
  protected signer: ethers.Wallet | null = null;
  protected gasLimit: number = 15_000_000;
  protected chainId: number = 0;
  /**
   * Constructor
   * @param {NodeSDKConfig} config configuration
   * @param {string} privateKey private key of account that trades
   */
  public constructor(config: NodeSDKConfig, privateKey: string) {
    super(config);
    this.privateKey = privateKey;
    if (config.gasLimit != undefined) {
      this.gasLimit = config.gasLimit;
    }
  }

  /**
   * Initialize the writeAccessHandler-Class with this function
   * to create instance of D8X perpetual contract and gather information
   * about perpetual currencies
   * @param provider optional provider
   */
  public async createProxyInstance(provider?: ethers.providers.JsonRpcProvider) {
    if (provider == undefined) {
      this.provider = new ethers.providers.JsonRpcBatchProvider(this.nodeURL);
    } else {
      this.provider = provider;
    }
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
   * @returns ContractTransaction
   */
  public async setAllowance(
    symbol: string,
    amount: number | undefined = undefined
  ): Promise<ethers.ContractTransaction> {
    //extract margin-currency name
    let symbolarr = symbol.split("-");
    symbol = symbol.length == 3 ? symbolarr[2] : symbolarr[0];
    //note: symbol is in long format
    let marginTokenAddr = this.symbolToTokenAddrMap.get(symbol);
    if (marginTokenAddr == undefined || this.signer == null) {
      throw Error("No margin token or signer defined, call createProxyInstance");
    }
    let amountDec18;
    if (amount == undefined) {
      amountDec18 = MAX_UINT_256;
    } else {
      amountDec18 = floatToDec18(amount);
    }
    return WriteAccessHandler._setAllowance(marginTokenAddr, this.proxyAddr, this.signer, amountDec18);
  }

  protected static async _setAllowance(
    tokenAddr: string,
    proxyAddr: string,
    signer: ethers.Wallet,
    amount: BigNumber
  ): Promise<ethers.ContractTransaction> {
    const marginToken: ethers.Contract = new ethers.Contract(tokenAddr, ERC20_ABI, signer);
    let tx = await marginToken.approve(proxyAddr, amount);
    return tx;
  }

  /**
   * Address corresponding to the private key used to instantiate this class.
   * @returns {string} Address of this wallet.
   */
  public getAddress(): string {
    return this.traderAddr;
  }

  /**
   * Converts a given amount of chain native currency (test MATIC)
   * into a mock token used for trading on testnet, with a rate of 1:100_000
   * @param symbol Pool margin token e.g. MATIC
   * @param amountToPay Amount in chain currency, e.g. "0.1" for 0.1 MATIC
   * @returns Transaction object
   */
  public async swapForMockToken(symbol: string, amountToPay: string): Promise<ethers.ContractTransaction> {
    if (this.signer == null) {
      throw Error("no wallet initialized. Use createProxyInstance().");
    }
    let tokenAddress = this.getMarginTokenFromSymbol(symbol);
    if (tokenAddress == undefined) {
      throw Error("symbols not found");
    }
    let tokenToSwap = new Map<string, string>(Object.entries(require("../config/mockSwap.json")));
    let swapAddress = tokenToSwap.get(tokenAddress);
    if (swapAddress == undefined) {
      throw Error("No swap contract found for symbol.");
    }
    let contract = new ethers.Contract(swapAddress, MOCK_TOKEN_SWAP_ABI, this.signer);
    return await contract.swapToMockToken({
      value: ethers.utils.parseEther(amountToPay),
    });
  }
}
