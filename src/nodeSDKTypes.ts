import { BytesLike, BigNumber, BigNumberish } from "ethers";
export const ERC20_ABI = require("./ERC20.json");
export const COLLATERAL_CURRENCY_QUOTE = 0;
export const COLLATERAL_CURRENCY_BASE = 1;
export const COLLATERAL_CURRENCY_QUANTO = 2;
export const PERP_STATE_STR = ["INVALID", "INITIALIZING", "NORMAL", "EMERGENCY", "CLEARED"];
export const ZERO_ADDRESS = "0x0000000000000000000000000000000000000000";

export const ONE_64x64 = BigNumber.from("0x010000000000000000");
export const MAX_64x64 = BigNumber.from("0x7FFFFFFFFFFFFFFFFFFFFFFFFFFFFFFF");
export const MAX_UINT_256 = BigNumber.from(2).pow(256).sub(BigNumber.from(1));

export const ORDER_MAX_DURATION_SEC = 60 * 60 * 24 * 30 * 4;

export const MASK_CLOSE_ONLY = BigNumber.from("0x80000000");
export const MASK_LIMIT_ORDER = BigNumber.from("0x04000000");
export const MASK_MARKET_ORDER = BigNumber.from("0x40000000");
export const MASK_STOP_ORDER = BigNumber.from("0x20000000");
export const MASK_KEEP_POS_LEVERAGE = BigNumber.from("0x08000000");

export const ORDER_TYPE_LIMIT = "LIMIT";
export const ORDER_TYPE_MARKET = "MARKET";
export const ORDER_TYPE_STOP_MARKET = "STOP_MARKET";
export const ORDER_TYPE_STOP_LIMIT = "STOP_LIMIT";
export const BUY_SIDE = "BUY";
export const SELL_SIDE = "SELL";
export const CLOSED_SIDE = "CLOSED";
export interface NodeSDKConfig {
  nodeURL: string;
  proxyAddr: string;
  proxyABILocation: string;
  limitOrderBookFactoryAddr: string;
  limitOrderBookABILocation: string;
  limitOrderBookFactoryABILocation: string;
  gasLimit?: number | undefined;
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

export enum CollaterlCCY {
  QUOTE = 0,
  BASE,
  QUANTO,
}
export interface PerpetualStaticInfo {
  id: number;
  limitOrderBookAddr: string;
  maintenanceMarginRate: number;
  collateralCurrencyType: CollaterlCCY;
}

export interface ExchangeInfo {
  pools: PoolState[];
}
export interface PoolState {
  isRunning: boolean;
  marginTokenAddr: string;
  poolShareTokenAddr: string;
  defaultFundCashCC: number;
  pnlParticipantCashCC: number;
  totalAMMFundCashCC: number;
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
  currentFundingRateBps: number;
  initialMarginRate: number;
  maintenanceMarginRate: number;
  openInterestBC: number;
  maxPositionBC: number;
}

export interface Order {
  symbol: string;
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
  timestamp: number;
}

export interface SmartContractOrder {
  flags: BigNumberish;
  iPerpetualId: BigNumberish;
  brokerFeeTbps: BigNumberish;
  traderAddr: string;
  brokerAddr: string;
  referrerAddr: string;
  brokerSignature: BytesLike;
  fAmount: BigNumberish;
  fLimitPrice: BigNumberish;
  fTriggerPrice: BigNumberish;
  fLeverage: BigNumberish;
  iDeadline: BigNumberish;
  createdTimestamp: BigNumberish;
}
/*
        t32 flags;
        uint24 iPerpetualId;
        uint16 brokerFeeTbps;
        address traderAddr;
        address brokerAddr;
        address referrerAddr;
        bytes brokerSignature;
        int128 fAmount;
        int128 fLimitPrice;
        int128 fTriggerPrice;
        int128 fLeverage; // 0 if deposit and trade separate
        uint256 iDeadline;
        uint256 createdTimestamp;
        */
