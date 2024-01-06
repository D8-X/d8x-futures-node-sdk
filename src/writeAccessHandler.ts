import { Signer } from "@ethersproject/abstract-signer";
import { BigNumber } from "@ethersproject/bignumber";
import type { CallOverrides, ContractTransaction, Overrides, PayableOverrides } from "@ethersproject/contracts";
import { Provider, StaticJsonRpcProvider } from "@ethersproject/providers";
import { parseEther } from "@ethersproject/units";
import { Wallet } from "@ethersproject/wallet";
import { MAX_UINT_256, MOCK_TOKEN_SWAP_ABI, MULTICALL_ADDRESS } from "./constants";
import { ERC20__factory, IPerpetualManager__factory, MockTokenSwap__factory, Multicall3__factory } from "./contracts";
import { floatToDecN } from "./d8XMath";
import MarketData from "./marketData";
import { type NodeSDKConfig } from "./nodeSDKTypes";
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
   * @param {string | Signer} signer Private key or ethers Signer of the account
   */
  public constructor(config: NodeSDKConfig, signer: string | Signer) {
    super(config);
    if (typeof signer == "string") {
      this.privateKey = signer;
    } else {
      this.signer = signer;
    }
    if (config.gasLimit != undefined) {
      this.gasLimit = config.gasLimit;
    }
  }

  public async createProxyInstance(provider?: Provider, overrides?: CallOverrides): Promise<void>;

  public async createProxyInstance(marketData: MarketData): Promise<void>;

  /**
   * Initialize the writeAccessHandler-Class with this function
   * to create instance of D8X perpetual contract and gather information
   * about perpetual currencies
   * @param provider optional provider
   */
  public async createProxyInstance(providerOrMarketData?: Provider | MarketData, overrides?: CallOverrides) {
    if (providerOrMarketData == undefined || Provider.isProvider(providerOrMarketData)) {
      this.provider = providerOrMarketData ?? new StaticJsonRpcProvider(this.nodeURL);
      if (!this.signer) {
        const wallet = new Wallet(this.privateKey!);
        this.signer = wallet.connect(this.provider);
      }
      await this.initContractsAndData(this.signer, overrides);
    } else {
      const mktData = providerOrMarketData;
      this.nodeURL = mktData.config.nodeURL;
      this.provider = new StaticJsonRpcProvider(mktData.config.nodeURL);
      this.proxyContract = IPerpetualManager__factory.connect(mktData.getProxyAddress(), this.provider);
      this.multicall = Multicall3__factory.connect(MULTICALL_ADDRESS, this.provider);
      ({
        nestedPerpetualIDs: this.nestedPerpetualIDs,
        poolStaticInfos: this.poolStaticInfos,
        symbolToTokenAddrMap: this.symbolToTokenAddrMap,
        symbolToPerpStaticInfo: this.symbolToPerpStaticInfo,
        perpetualIdToSymbol: this.perpetualIdToSymbol,
      } = mktData.getAllMappings());
      this.priceFeedGetter.setTriangulations(mktData.getTriangulations());
      this.signerOrProvider = this.provider;
    }
    if (!this.signer) {
      const wallet = new Wallet(this.privateKey!);
      this.signer = wallet.connect(this.provider);
    }
    this.traderAddr = await this.signer.getAddress();
  }

  /**
   * Set allowance for ar margin token (e.g., MATIC, ETH, USDC)
   * @param symbol token in 'long-form' such as MATIC, symbol also fine (ETH-USD-MATIC)
   * @param amount optional, amount to approve if not 'infinity'
   * @returns ContractTransaction
   */
  public async setAllowance(symbol: string, amount?: number, overrides?: Overrides): Promise<ContractTransaction> {
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
      amountDec18 = floatToDecN(amount, this.getMarginTokenDecimalsFromSymbol(symbol)!);
    }
    return WriteAccessHandler._setAllowance(marginTokenAddr, this.proxyAddr, this.signer, amountDec18, overrides);
  }

  protected static async _setAllowance(
    tokenAddr: string,
    proxyAddr: string,
    signer: Signer,
    amount: BigNumber,
    overrides?: Overrides
  ): Promise<ContractTransaction> {
    const marginToken = ERC20__factory.connect(tokenAddr, signer);
    return await marginToken.approve(proxyAddr, amount, overrides || {});
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
  public async swapForMockToken(
    symbol: string,
    amountToPay: string,
    overrides?: PayableOverrides
  ): Promise<ContractTransaction> {
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
    let contract = MockTokenSwap__factory.connect(swapAddress, this.signer);
    if (overrides && overrides.value !== undefined) {
      throw Error("Pass value to send in function call, not overrides.");
    }
    return await contract.swapToMockToken({
      value: parseEther(amountToPay),
      ...overrides,
    } as PayableOverrides);
  }
}
