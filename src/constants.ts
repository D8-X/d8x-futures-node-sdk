import { BigNumber } from "@ethersproject/bignumber";
import { AddressZero, HashZero } from "@ethersproject/constants";
import { NodeSDKConfig } from "./nodeSDKTypes";

export const ERC20_ABI = require("./abi/ERC20.json");
export const MOCK_TOKEN_SWAP_ABI = require("./abi/MockTokenSwap.json");
export const PROXY_ABI = require("./abi/IPerpetualManager.json");
export const LOB_FACTORY_ABI = require("./abi/LimitOrderBookFactory.json");
export const LOB_ABI = require("./abi/LimitOrderBook.json");
export const SHARE_TOKEN_ABI = require("./abi/ShareToken.json");
export const MULTICALL3_ABI = require("./abi/Multicall3.json");

export const SYMBOL_LIST = new Map<string, string>(Object.entries(require(`./config/symbolList.json`)));
export const COLLATERAL_CURRENCY_QUOTE = 0;
export const COLLATERAL_CURRENCY_BASE = 1;
export const COLLATERAL_CURRENCY_QUANTO = 2;
export const PERP_STATE_STR = ["INVALID", "INITIALIZING", "NORMAL", "EMERGENCY", "SETTLE", "CLEARED"];
export const ZERO_ADDRESS = AddressZero;
export const ZERO_ORDER_ID = HashZero;
export const MULTICALL_ADDRESS = "0xcA11bde05977b3631167028862bE2a173976CA11";
export const ONE_64x64 = BigNumber.from("0x010000000000000000");
export const MAX_64x64 = BigNumber.from("0x7FFFFFFFFFFFFFFFFFFFFFFFFFFFFFFF");
export const MAX_UINT_256 = BigNumber.from(2).pow(256).sub(BigNumber.from(1));
export const DECIMALS = BigNumber.from(10).pow(BigNumber.from(18));

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

export enum CollaterlCCY {
  QUOTE = 0,
  BASE,
  QUANTO,
}

export enum OrderStatus {
  CANCELED = 0,
  EXECUTED,
  OPEN,
  UNKNOWN,
}

export const DEFAULT_CONFIG_MAINNET_NAME = "mainnet";
export const DEFAULT_CONFIG_TESTNET_NAME = "testnet";

let defaultConfigs = require("./config/defaultConfig.json") as NodeSDKConfig[];
defaultConfigs.map((config) => {
  config.proxyABI = PROXY_ABI;
  config.lobABI = LOB_ABI;
  config.lobFactoryABI = LOB_FACTORY_ABI;
  config.shareTokenABI = SHARE_TOKEN_ABI;
});
export const DEFAULT_CONFIG = defaultConfigs;
