import { Signer } from "@ethersproject/abstract-signer";
import { BigNumber } from "@ethersproject/bignumber";
import { Contract, ContractTransaction } from "@ethersproject/contracts";
import { Provider, StaticJsonRpcProvider } from "@ethersproject/providers";
import { parseEther } from "@ethersproject/units";
import { Wallet } from "@ethersproject/wallet";
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
  protected privateKey: string | undefined;
  protected traderAddr: string = "";
  protected signer: Signer | null = null;
  protected gasLimit: number = 15_000_000;
  /**
   * Constructor
   * @param {NodeSDKConfig} config configuration
   * @param {string} privateKey private key of account that trades
   */
  public constructor(config: NodeSDKConfig, privateKey?: string, signer?: Signer) {
    super(config);
    if (privateKey) {
      this.privateKey = privateKey;
    } else if (signer) {
      this.signer = signer;
    } else {
      throw new Error("No private key nor signer provided.");
    }
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
  public async createProxyInstance(provider?: Provider) {
    if (provider == undefined) {
      this.provider = new StaticJsonRpcProvider(this.nodeURL);
    } else {
      this.provider = provider;
    }
    if (!this.signer) {
      const wallet = new Wallet(this.privateKey!);
      this.signer = wallet.connect(this.provider);
    }
    await this.initContractsAndData(this.signer);
    this.traderAddr = await this.signer.getAddress();
  }

  /**
   * Set allowance for ar margin token (e.g., MATIC, ETH, USDC)
   * @param symbol token in 'long-form' such as MATIC, symbol also fine (ETH-USD-MATIC)
   * @param amount optional, amount to approve if not 'infinity'
   * @returns ContractTransaction
   */
  public async setAllowance(symbol: string, amount: number | undefined = undefined): Promise<ContractTransaction> {
    //extract margin-currency name
    let symbolarr = symbol.split("-");
    symbol = symbol.length == 3 ? symbolarr[2] : symbolarr[0];
    //note: symbol is in long format
    let marginTokenAddr = this.symbolToTokenAddrMap.get(symbol);
    if (marginTokenAddr == undefined || this.signer == null) {
      throw Error("No margin token or signer defined, call createProxyInstance");
    }
    let amountDec18: BigNumber;
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
    signer: Signer,
    amount: BigNumber
  ): Promise<ContractTransaction> {
    const marginToken: Contract = new Contract(tokenAddr, ERC20_ABI, signer);
    return await marginToken.approve(proxyAddr, amount);
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
  public async swapForMockToken(symbol: string, amountToPay: string): Promise<ContractTransaction> {
    if (this.signer == null) {
      throw Error("no wallet initialized. Use createProxyInstance().");
    }
    let tokenAddress = this.getMarginTokenFromSymbol(symbol);
    if (tokenAddress == undefined) {
      throw Error("symbols not found");
    }
    let tokenToSwap = new Map<string, string>(Object.entries(require("./config/mockSwap.json")));
    let swapAddress = tokenToSwap.get(tokenAddress);
    if (swapAddress == undefined) {
      throw Error("No swap contract found for symbol.");
    }
    let contract = new Contract(swapAddress, MOCK_TOKEN_SWAP_ABI, this.signer);
    return await contract.swapToMockToken({
      value: parseEther(amountToPay),
    });
  }
}
