import { BigNumber, BigNumberish, ethers, Wallet } from "ethers";
import {
  BUY_SIDE,
  NodeSDKConfig,
  Order,
  SmartContractOrder,
  SELL_SIDE,
  ZERO_ADDRESS,
  MAX_64x64,
  MAX_UINT_256,
  ORDER_MAX_DURATION_SEC,
  ORDER_TYPE_LIMIT,
  ORDER_TYPE_MARKET,
  ORDER_TYPE_STOP_MARKET,
  ORDER_TYPE_STOP_LIMIT,
  MASK_CLOSE_ONLY,
  MASK_LIMIT_ORDER,
  MASK_MARKET_ORDER,
  MASK_STOP_ORDER,
  MASK_KEEP_POS_LEVERAGE,
  COLLATERAL_CURRENCY_BASE,
  COLLATERAL_CURRENCY_QUOTE,
  ERC20_ABI,
  PerpetualStaticInfo,
} from "./nodeSDKTypes";
import { floatToABK64x64, ABK64x64ToFloat, dec18ToFloat } from "./d8XMath";
import { combineFlags, to4Chars } from "./utils";
import PerpetualDataHandler from "./perpetualDataHandler";
//import { abi, rawEncode } from "ethereumjs-abi";

/**
 * Account and Trade
 * This class requires a private key and executes smart-contract interaction that
 * require gas-payments.
 */
export default class AccountTrade extends PerpetualDataHandler {
  private privateKey: string;
  private traderAddr: string = "";
  protected signer: ethers.Wallet | null = null;
  private gasLimit: number = 5_000_000;
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
    return AccountTrade._setAllowance(marginTokenAddr, this.proxyAddr, this.signer, amount);
  }

  public static async _setAllowance(
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

  public async cancelOrder(symbol: string, orderId: string): Promise<string | undefined> {
    if (this.proxyContract == null || this.signer == null) {
      throw Error("no proxy contract or wallet initialized. Use createProxyInstance().");
    }
    let orderBookContract: ethers.Contract | null = null;
    orderBookContract = this.getOrderBookContract(symbol);

    return await this._cancelOrder(symbol, orderId, orderBookContract);
  }

  /**
   * Order/Trade
   * @param order order struct
   * @returns transaction hash
   */
  public async order(order: Order): Promise<string | undefined> {
    if (this.proxyContract == null || this.signer == null) {
      throw Error("no proxy contract or wallet initialized. Use createProxyInstance().");
    }
    let orderBookContract: ethers.Contract | null = null;
    if (order.type != ORDER_TYPE_MARKET) {
      orderBookContract = this.getOrderBookContract(order.symbol);
    }
    return await this._order(
      order,
      this.traderAddr,
      this.symbolToPerpStaticInfo,
      this.proxyContract,
      orderBookContract,
      this.chainId,
      this.signer,
      this.gasLimit
    );
  }

  /**
   * Static order function
   * @param order order type (not SmartContractOrder but Order)
   * @param traderAddr trader address
   * @param symbolToPerpetualMap maps the symbol (MATIC-USD-MATIC)-type format to the perpetual id
   * @param proxyContract contract instance of D8X perpetuals
   * @param orderBookContract order book contract or null
   * @param chainId chain Id of network
   * @param signer instance of ethers wallet that can write
   * @param gasLimit gas limit to be used for the trade
   * @returns transaction hash
   */
  public async _order(
    order: Order,
    traderAddr: string,
    symbolToPerpetualMap: Map<string, PerpetualStaticInfo>,
    proxyContract: ethers.Contract,
    orderBookContract: ethers.Contract | null,
    chainId: number,
    signer: ethers.Wallet,
    gasLimit: number
  ): Promise<string | undefined> {
    let scOrder = AccountTrade.toSmartContractOrder(order, traderAddr, symbolToPerpetualMap);
    // if we are here, we have a clean order
    // decide whether to send order to Limit Order Book or AMM based on order type
    let tx: ethers.Transaction;
    if (order.type == ORDER_TYPE_MARKET) {
      // send market order
      tx = await proxyContract.trade(scOrder, { gasLimit: gasLimit });
    } else {
      // conditional order so the order is sent to the order-book
      if (orderBookContract == null) {
        throw Error("Order book contract not provided.");
      }
      let signature = await this._createSignature(scOrder, chainId, true, signer, proxyContract.address);
      tx = await orderBookContract.createLimitOrder(scOrder, signature, { gasLimit: gasLimit });
    }
    return tx.hash;
  }

  protected async _cancelOrder(
    symbol: string,
    orderId: string,
    orderBookContract: ethers.Contract | null
  ): Promise<string | undefined> {
    if (orderBookContract == null || this.signer == null) {
      throw Error(`Order Book contract for symbol ${symbol} or signer not defined`);
    }
    let scOrder: SmartContractOrder = await orderBookContract.orderOfDigest(orderId);
    let signature = await this._createSignature(scOrder, this.chainId, false, this.signer, this.proxyAddr);
    return await orderBookContract.cancelLimitOrder(orderId, signature);
  }

  /**
   * Creates a signature
   * @param order         smart-contract-type order
   * @param chainId       chainId of network
   * @param isNewOrder    true unless we cancel
   * @param signer        ethereum-type wallet
   * @param proxyAddress  address of the contract
   * @returns signature as string
   */
  private async _createSignature(
    order: SmartContractOrder,
    chainId: number,
    isNewOrder: boolean,
    signer: ethers.Wallet,
    proxyAddress: string
  ): Promise<String> {
    const NAME = "Perpetual Trade Manager";
    const DOMAIN_TYPEHASH = ethers.utils.keccak256(
      Buffer.from("EIP712Domain(string name,uint256 chainId,address verifyingContract)")
    );
    let abiCoder = ethers.utils.defaultAbiCoder;
    let domainSeparator = ethers.utils.keccak256(
      abiCoder.encode(
        ["bytes32", "bytes32", "uint256", "address"],
        [DOMAIN_TYPEHASH, ethers.utils.keccak256(Buffer.from(NAME)), chainId, proxyAddress]
      )
    );
    const TRADE_ORDER_TYPEHASH = ethers.utils.keccak256(
      Buffer.from(
        "Order(uint24 iPerpetualId,uint16 brokerFeeTbps,address traderAddr,address brokerAddr,int128 fAmount,int128 fLimitPrice,int128 fTriggerPrice,uint256 iDeadline,uint32 flags,int128 fLeverage,uint256 createdTimestamp)"
      )
    );
    let structHash = ethers.utils.keccak256(
      abiCoder.encode(
        [
          "bytes32",
          "uint24",
          "uint16",
          "address",
          "address",
          "int128",
          "int128",
          "int128",
          "uint256",
          "uint32",
          "int128",
          "uint256",
        ],
        [
          TRADE_ORDER_TYPEHASH,
          order.iPerpetualId,
          order.brokerFeeTbps,
          order.traderAddr,
          order.brokerAddr,
          order.fAmount,
          order.fLimitPrice,
          order.fTriggerPrice,
          order.iDeadline,
          order.flags,
          order.fLeverage,
          order.createdTimestamp,
        ]
      )
    );
    let digest = ethers.utils.keccak256(
      abiCoder.encode(["bytes32", "bytes32", "bool"], [domainSeparator, structHash, isNewOrder])
    );
    let digestBuffer = Buffer.from(digest.substring(2, digest.length), "hex");
    return await signer.signMessage(digestBuffer);
  }
}
