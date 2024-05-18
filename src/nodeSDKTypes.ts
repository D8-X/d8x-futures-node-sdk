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
  priceFeedEndpoints?: Array<{ type: string; endpoints: string[] }>;
  multicall?: string;
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
 * @global
 * @typedef {Object} SmartContractOrder
 * @property {BigNumberish} flags
 * @property {number} iPerpetualId
 * @property {number} brokerFeeTbps
 * @property {string} traderAddr
 * @property {string} brokerAddr
 * @property {string} executorAddr
 * @property {BytesLike} brokerSignature
 * @property {BigNumberish} fAmount
 * @property {BigNumberish} fLimitPrice
 * @property {BigNumberish} fTriggerPrice
 * @property {number} leverageTDR
 * @property {number} iDeadline
 * @property {number} executionTimestamp
 * @property {number} submittedTimestamp
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
 * @global
 * @typedef {Object} ClientOrder
 * @property {BigNumberish} flags
 * @property {BigNumberish} iPerpetualId
 * @property {BigNumberish} brokerFeeTbps
 * @property {string} traderAddr
 * @property {string} brokerAddr
 * @property {string} executorAddr
 * @property {BytesLike} brokerSignature
 * @property {BigNumberish} fAmount
 * @property {BigNumberish} fLimitPrice
 * @property {BigNumberish} fTriggerPrice
 * @property {BigNumberish} leverageTDR
 * @property {BigNumberish} iDeadline
 * @property {BigNumberish} executionTimestamp
 * @property {string} parentChildDigest1
 * @property {string} parentChildDigest2
 * @property {string} callbackTarget
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
  callbackTarget: string;
}

export interface TypeSafeOrder {
  flags: bigint;
  iPerpetualId: number;
  brokerFeeTbps: number;
  traderAddr: string;
  brokerAddr: string;
  brokerSignature: string;
  fAmount: bigint;
  fLimitPrice: bigint;
  fTriggerPrice: bigint;
  leverageTDR: number;
  iDeadline: number;
  executionTimestamp: number;
  parentChildDigest1: string;
  parentChildDigest2: string;
  callbackTarget: string;
}

export interface PriceFeedConfig {
  network: string;
  ids: Array<{ symbol: string; id: string; type: string; origin: string }>;
  endpoints: Array<{ type: string; endpoints: string[] }>;
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
  createdOn: number;
  passOnPercTDF: number;
  signature: string;
}

// Payload to be sent to backend when an agency/broker
// assigns a "partner".
export interface APIReferPayload {
  parentAddr: string;
  referToAddr: string;
  passOnPercTDF: number;
  createdOn: number;
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

export interface TokenOverride {
  tokenAddress: string;
  newSymbol: string;
}

/**
 * Perpetualdata corresponding to the data in the smart contract
 */
export interface PerpetualData {
  poolId: number;
  id: number;
  fInitialMarginRate: number; //parameter: initial margin
  fSigma2: number; // parameter: volatility of base-quote pair
  iLastFundingTime: number; //timestamp since last funding rate payment
  fDFCoverNRate: number; // parameter: cover-n rule for default fund. E.g., fDFCoverNRate=0.05 -> we try to cover 5% of active accounts with default fund
  fMaintenanceMarginRate: number; // parameter: maintenance margin
  perpetualState: string; // Perpetual AMM state
  eCollateralCurrency: number; //parameter: in what currency is the collateral held?
  // ------ 1
  S2BaseCCY: string; //base currency of S2
  S2QuoteCCY: string; //quote currency of S2
  incentiveSpreadBps: number; //parameter: maximum spread added to the PD
  minimalSpreadBps: number; //parameter: minimal spread between long and short perpetual price
  S3BaseCCY: string; //base currency of S3
  S3QuoteCCY: string; //quote currency of S3
  fSigma3: number; // parameter: volatility of quanto-quote pair
  fRho23: number; // parameter: correlation of quanto/base returns
  liquidationPenaltyRateBps: number; //parameter: penalty if AMM closes the position and not the trader
  //------- 2
  currentMarkPremiumRatePrice: number; //relative diff to index price EMA, used for markprice.
  currentMarkPremiumRateTime: number; //relative diff to index price EMA, used for markprice.
  //------- 3
  premiumRatesEMA: number; // EMA of premium rate
  fUnitAccumulatedFunding: number; //accumulated funding in collateral currency
  //------- 4
  fOpenInterest: number; //open interest is the larger of the amount of long and short positions in base currency
  fTargetAMMFundSize: number; //target liquidity pool funds to allocate to the AMM
  //------- 5
  fCurrentTraderExposureEMA: number; // trade amounts (storing absolute value)
  fCurrentFundingRate: number; // current instantaneous funding rate
  //------- 6
  fLotSizeBC: number; //parameter: minimal trade unit (in base currency) to avoid dust positions
  fReferralRebateCC: number; //parameter: referall rebate in collateral currency
  //------- 7
  fTargetDFSize: number; // target default fund size
  fkStar: number; // signed trade size that minimizes the AMM risk
  //------- 8
  fAMMTargetDD: number; // parameter: target distance to default (=inverse of default probability)
  fAMMMinSizeCC: number; // parameter: minimal size of AMM pool, regardless of current exposure
  //------- 9
  fMinimalTraderExposureEMA: number; // parameter: minimal value for fCurrentTraderExposureEMA that we don't want to undershoot
  fMinimalAMMExposureEMA: number; // parameter: minimal abs value for fCurrentAMMExposureEMA that we don't want to undershoot
  //------- 10
  fSettlementS3PriceData: number; //quanto index
  fSettlementS2PriceData: number; //base-quote pair. Used as last price in normal state.
  //------- 11
  fTotalMarginBalance: number; //calculated for settlement, in collateral currency
  fMarkPriceEMALambda: number; // parameter: Lambda parameter for EMA used in mark-price for funding rates
  fFundingRateClamp: number; // parameter: funding rate clamp between which we charge 1bps
  fMaximalTradeSizeBumpUp: number; // parameter: >1, users can create a maximal position of size fMaximalTradeSizeBumpUp*fCurrentAMMExposureEMA
  iLastTargetPoolSizeTime: number; //timestamp (seconds) since last update of fTargetDFSize and fTargetAMMFundSize
  //------- 12
  fStressReturnS3: [number, number]; // parameter: negative and positive stress returns for quanto-quote asset
  fDFLambda: [number, number]; // parameter: EMA lambda for AMM and trader exposure K,k: EMA*lambda + (1-lambda)*K. 0 regular lambda, 1 if current value exceeds past
  fCurrentAMMExposureEMA: [number, number]; // 0: negative aggregated exposure (storing negative value), 1: positive
  fStressReturnS2: [number, number]; // parameter: negative and positive stress returns for base-quote asset
}

/**
 * LiquidityPoolData corresponding to the data in the smart contract
 */
export interface LiquidityPoolData {
  isRunning: boolean; // state
  iPerpetualCount: number; // state
  id: number; // parameter: index, starts from 1
  fCeilPnLShare: number; // parameter: cap on the share of PnL allocated to liquidity providers
  marginTokenDecimals: number; // parameter: decimals of margin token, inferred from token contract
  iTargetPoolSizeUpdateTime: number; //parameter: timestamp in seconds. How often we update the pool's target size
  marginTokenAddress: string; //parameter: address of the margin token
  // -----
  prevAnchor: number; // state: keep track of timestamp since last withdrawal was initiated
  fRedemptionRate: number; // state: used for settlement in case of AMM default
  shareTokenAddress: string; // parameter
  fPnLparticipantsCashCC: number; // state: addLiquidity/withdrawLiquidity + profit/loss - rebalance
  fTargetAMMFundSize: number; // state: target liquidity for all perpetuals in pool (sum)
  fDefaultFundCashCC: number; // state: profit/loss
  fTargetDFSize: number; // state: target default fund size for all perpetuals in pool
  fBrokerCollateralLotSize: number; // param:how much collateral do brokers deposit when providing "1 lot" (not trading lot)
  prevTokenAmount: number; // state
  nextTokenAmount: number; // state
  totalSupplyShareToken: number; // state
  fBrokerFundCashCC: number; // state: amount of cash in broker fund
}
