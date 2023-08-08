import { BigNumber, type BigNumberish } from "@ethersproject/bignumber";
import type { BytesLike } from "@ethersproject/bytes";
import type { ContractInterface, ContractTransaction } from "@ethersproject/contracts";
import { CollaterlCCY } from "./constants";

export interface NodeSDKConfig {
  name: string | undefined;
  chainId: number;
  version: number;
  nodeURL: string;
  proxyAddr: string;
  proxyABILocation: string;
  shareTokenABILocation: string;
  limitOrderBookABILocation: string;
  limitOrderBookFactoryABILocation: string;
  symbolListLocation: string;
  priceFeedConfigNetwork: string;
  gasLimit?: number | undefined;
  proxyABI?: ContractInterface | undefined;
  lobFactoryABI?: ContractInterface | undefined;
  lobABI?: ContractInterface | undefined;
  shareTokenABI?: ContractInterface | undefined;
  priceFeedEndpoints?: Array<{ type: string; endpoint: string }>;
}

export interface MarginAccount {
  symbol: string;
  positionNotionalBaseCCY: number;
  side: string;
  entryPrice: number;
  leverage: number;
  markPrice: number;
  unrealizedPnlQuoteCCY: number;
  unrealizedFundingCollateralCCY: number;
  collateralCC: number;
  liquidationPrice: [number, number | undefined];
  liquidationLvg: number;
  collToQuoteConversion: number;
}

export interface PoolStaticInfo {
  poolId: number;
  poolMarginSymbol: string;
  poolMarginTokenAddr: string;
  poolMarginTokenDecimals?: number;
  shareTokenAddr: string;
  oracleFactoryAddr: string;
  isRunning: boolean;
}

export interface PerpetualStaticInfo {
  id: number;
  poolId: number;
  limitOrderBookAddr: string;
  initialMarginRate: number;
  maintenanceMarginRate: number;
  collateralCurrencyType: CollaterlCCY;
  S2Symbol: string;
  S3Symbol: string;
  lotSizeBC: number;
  referralRebate: number;
  priceIds: string[];
}

/*
PerpetualStaticInfo {
  uint24 id;
  address limitOrderBookAddr;
  int128 fInitialMarginRate;
  int128 fMaintenanceMarginRate;
  uint8 perpetualState;
  AMMPerpLogic.CollateralCurrency collCurrencyType;
  bytes4 S2BaseCCY; //base currency of S2
  bytes4 S2QuoteCCY; //quote currency of S2
  bytes4 S3BaseCCY; //base currency of S3
  bytes4 S3QuoteCCY; //quote currency of S3
  int128 fLotSizeBC;
  int128 fReferralRebateCC;
  bytes32[] priceIds;
  bool[] isPyth;
}
*/

/**
 * @global
 * @typedef {Object} ExchangeInfo
 * @property {PoolState[]} pools Array of state objects for all pools in the exchange.
 * @property {string} oracleFactoryAddr Address of the oracle factory used by the pools in the exchange.
 */
export interface ExchangeInfo {
  pools: PoolState[];
  oracleFactoryAddr: string;
  proxyAddr: string;
}

/**
 * @global
 * @typedef {Object} PoolState
 * @property {boolean} isRunning True if the pool is running.
 * @property {string} marginTokenAddr  Address of the token used by the pool.
 * This is the token used for margin deposits, liquidity provision, and trading fees.
 * @property {string} poolShareTokenAddr Address of the pool share token.
 * This is the token issued to external liquidity providers.
 * @property {number} defaultFundCashCC Amount of cash in the default fund of this pool, denominated in margin tokens.
 * @property {number} pnlParticipantCashCC Amount of cash in the PnL participation pool, i.e. cash deposited by external liquidity providers.
 * @property {number} totalTargetAMMFundSizeCC Target AMM funds aggregated across all perpetuals in this pool.
 * @property {number} brokerCollateralLotSize Price of one lot for brokers who wish to participate in this pool. Denominated in margin tokens.
 * @property {PerpetualState[]} perpetuals Array of all perpetuals in this pool.
 */
export interface PoolState {
  isRunning: boolean;
  poolSymbol: string;
  marginTokenAddr: string;
  poolShareTokenAddr: string;
  defaultFundCashCC: number;
  pnlParticipantCashCC: number;
  totalTargetAMMFundSizeCC: number;
  brokerCollateralLotSize: number;
  perpetuals: PerpetualState[];
}

export interface PerpetualState {
  id: number;
  state: string;
  baseCurrency: string;
  quoteCurrency: string;
  indexPrice: number;
  collToQuoteIndexPrice: number;
  markPrice: number;
  midPrice: number;
  currentFundingRateBps: number;
  openInterestBC: number;
  isMarketClosed: boolean;
}

export interface OrderResponse {
  tx: ContractTransaction;
  orderId: string;
}

export interface OrderStruct {
  orders: Order[];
  orderIds: string[];
}

export interface Order {
  symbol: string; //symbol of the form ETH-USD-MATIC
  side: string;
  type: string;
  quantity: number;
  reduceOnly?: boolean | undefined;
  limitPrice?: number | undefined;
  keepPositionLvg?: boolean | undefined;
  brokerFeeTbps?: number | undefined;
  brokerAddr?: string | undefined;
  brokerSignature?: BytesLike | undefined;
  stopPrice?: number | undefined;
  leverage?: number | undefined;
  deadline?: number | undefined;
  executionTimestamp: number;
  submittedTimestamp?: number;
  parentChildOrderIds?: [string, string];
}

export interface TradeEvent {
  perpetualId: number;
  positionId: string;
  orderId: string;
  newPositionSizeBC: number;
  executionPrice: number;
}

/**
 *      struct Order {
        uint16 leverageTDR; // 12.43x leverage is represented by 1243 (two-digit integer representation); 0 if deposit and trade separate
        uint16 brokerFeeTbps; // broker can set their own fee
        uint24 iPerpetualId; // global id for perpetual
        address traderAddr; // address of trader
        uint32 executionTimestamp; // normally set to current timestamp; order will not be executed prior to this timestamp.
        address brokerAddr; // address of the broker or zero
        uint32 submittedTimestamp;
        uint32 flags; // order flags
        uint32 iDeadline; //deadline for price (seconds timestamp)
        address executorAddr; // address of the executor set by contract
        int128 fAmount; // amount in base currency to be traded
        int128 fLimitPrice; // limit price
        int128 fTriggerPrice; //trigger price. Non-zero for stop orders.
        bytes brokerSignature; //signature of broker (or 0)
    }
 */
export interface SmartContractOrder {
  flags: BigNumberish;
  iPerpetualId: number;
  brokerFeeTbps: number;
  traderAddr: string;
  brokerAddr: string;
  executorAddr: string;
  brokerSignature: BytesLike;
  fAmount: BigNumberish;
  fLimitPrice: BigNumberish;
  fTriggerPrice: BigNumberish;
  leverageTDR: number;
  iDeadline: number;
  executionTimestamp: number;
  submittedTimestamp: number;
}

/**
 *    struct ClientOrder {
        uint24 iPerpetualId; // unique id of the perpetual
        int128 fLimitPrice; // order will not execute if realized price is above (buy) or below (sell) this price
        uint16 leverageTDR; // leverage, set to 0 if deposit margin and trade separate; format: two-digit integer (e.g., 12.34 -> 1234)
        uint32 executionTimestamp; // the order will not be executed before this timestamp, allows TWAP orders
        uint32 flags; // Order-flags are specified in OrderFlags.sol
        uint32 iDeadline; // order will not be executed after this deadline
        address brokerAddr; // can be empty, address of the broker
        int128 fTriggerPrice; // trigger price for stop-orders|0. Order can be executed if the mark price is below this price (sell order) or above (buy)
        int128 fAmount; // signed amount of base-currency. Will be rounded to lot size
        bytes32 parentChildDigest1; // see notice in LimitOrderBook.sol
        address traderAddr; // address of the trader
        bytes32 parentChildDigest2; // see notice in LimitOrderBook.sol
        uint16 brokerFeeTbps; // broker fee in tenth of a basis point
        bytes brokerSignature; // signature, can be empty if no brokerAddr provided
        //address executorAddr; <- will be set by LimitOrderBook
        //uint64 submittedBlock <- will be set by LimitOrderBook
    }
 */
export interface ClientOrder {
  flags: BigNumberish;
  iPerpetualId: BigNumberish;
  brokerFeeTbps: BigNumberish;
  traderAddr: string;
  brokerAddr: string;
  executorAddr: string;
  brokerSignature: BytesLike;
  fAmount: BigNumberish;
  fLimitPrice: BigNumberish;
  fTriggerPrice: BigNumberish;
  leverageTDR: BigNumberish;
  iDeadline: BigNumberish;
  executionTimestamp: BigNumberish;
  parentChildDigest1: string;
  parentChildDigest2: string;
}

export interface TypeSafeOrder {
  flags: number;
  iPerpetualId: number;
  brokerFeeTbps: number;
  traderAddr: string;
  brokerAddr: string;
  executorAddr: string;
  brokerSignature: string;
  fAmount: bigint;
  fLimitPrice: bigint;
  fTriggerPrice: bigint;
  leverageTDR: number;
  iDeadline: number;
  executionTimestamp: number;
  parentChildDigest1: string;
  parentChildDigest2: string;
}

export interface PriceFeedConfig {
  network: string;
  ids: Array<{ symbol: string; id: string; type: string; origin: string }>;
  endpoints: Array<{ type: string; endpoint: string }>;
}

export interface PriceFeedSubmission {
  symbols: string[];
  priceFeedVaas: string[];
  prices: number[];
  isMarketClosed: boolean[];
  timestamps: number[];
}

export interface PriceFeedFormat {
  conf: BigNumber;
  expo: number;
  price: BigNumber;
  publish_time: number;
}

export interface PythLatestPriceFeed {
  ema_price: {
    conf: string;
    expo: number;
    price: string;
    publish_time: number;
  };
  id: string;
  price: PriceFeedFormat;
  vaa: string;
}

// Payload to be sent to backend when creating
// a new referral code. Intended for trader-
// backends that have an active referral system
export interface APIReferralCodePayload {
  code: string;
  referrerAddr: string;
  agencyAddr: string;
  createdOn: number;
  traderRebatePerc: number;
  agencyRebatePerc: number;
  referrerRebatePerc: number;
  signature: string;
}

// Payload to be sent to backend when the trader
// selects a new referral code. Intended for trader-
// backends that have an active referral system
export interface APIReferralCodeSelectionPayload {
  code: string;
  traderAddr: string;
  createdOn: number;
  signature: string;
}

export interface GasPriceV2 {
  maxPriorityFee: number;
  maxfee: number;
}

export interface GasInfo {
  safeLow: number | GasPriceV2;
  standard: number | GasPriceV2;
  fast: number | GasPriceV2;
  fastest?: number;
  estimatedBaseFee?: number;
  blockTime: number;
  blockNumber: number;
}
