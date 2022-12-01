import {
  NodeSDKConfig,
  Order,
  SmartContractOrder,
  ORDER_TYPE_STOP_LIMIT,
  ORDER_TYPE_LIMIT,
  ORDER_TYPE_MARKET,
  ORDER_TYPE_STOP_MARKET,
  MASK_LIMIT_ORDER,
  MASK_STOP_ORDER,
  MASK_KEEP_POS_LEVERAGE,
  MASK_CLOSE_ONLY,
  MASK_MARKET_ORDER,
  MAX_64x64,
} from "../src/nodeSDKTypes";
import PerpetualDataHandler from "../src/perpetualDataHandler";
import AccountTrade from "../src/accountTrade";
import { to4Chars, toBytes4, fromBytes4, fromBytes4HexString, containsFlag, combineFlags } from "../src/utils";
import { BigNumber, ethers } from "ethers";

let pk: string = <string>process.env.PK;
let RPC: string = <string>process.env.RPC;
const myAddress = new ethers.Wallet(pk).address;
jest.setTimeout(150000);

let config: NodeSDKConfig;

describe("utils", () => {
  it("read config", async function () {
    config = PerpetualDataHandler.readSDKConfig("../config/defaultConfig.json");
    if (RPC != undefined) {
      config.nodeURL = RPC;
    }
  });
  it("4Chars", async () => {
    let examples = ["MATIC", "FEDORA", "A", "AEIOUAEI", "D8X", "ARmAGEDON"];
    let solutions = ["MATC", "FEDR", "A\0\0\0", "AEIO", "D8X\0", "RmGD"];
    for (let k = 0; k < examples.length; k++) {
      let sol = to4Chars(examples[k]);
      let deencoded = fromBytes4(toBytes4(examples[k]));
      let bExpect = sol == solutions[k] && sol.replace(/\0/g, "") == deencoded;
      if (!bExpect) {
        console.log("example  =", examples[k]);
        console.log("solution =", sol);
        console.log("deencoded=", deencoded);
        console.log("expected =", solutions[k]);
      }
      expect(bExpect);
    }
  });
  it("contract bytes4 to string", async () => {
    let examples = ["0x4d415443", "0x55534400", "0x45544800", "0x42544300"];
    let solutions = ["MATC", "USD", "ETH", "BTC"];
    for (let k = 0; k < examples.length; k++) {
      let sol = fromBytes4HexString(examples[k]);
      let bExpect = sol == solutions[k];
      if (!bExpect) {
        console.log("example  =", examples[k]);
        console.log("solution =", sol);
        console.log("expected =", solutions[k]);
      }
      expect(bExpect);
    }
  });
  it("combine flags 1", async () => {
    let flag = combineFlags(MASK_STOP_ORDER, MASK_KEEP_POS_LEVERAGE);
    expect(containsFlag(flag, MASK_STOP_ORDER)).toBeTruthy;
    expect(containsFlag(flag, MASK_KEEP_POS_LEVERAGE)).toBeTruthy;
    expect(containsFlag(flag, MASK_MARKET_ORDER)).toBeFalsy;
  });
  it("combine flags 2", async () => {
    let flag = combineFlags(MASK_LIMIT_ORDER, MASK_STOP_ORDER);
    expect(containsFlag(flag, MASK_STOP_ORDER)).toBeTruthy;
    expect(containsFlag(flag, MASK_LIMIT_ORDER)).toBeTruthy;
    expect(containsFlag(flag, MASK_KEEP_POS_LEVERAGE)).toBeFalsy;
  });

  it("limit order translation", async () => {
    let order: Order = {
      symbol: "MATIC-USD-MATIC",
      side: "BUY",
      type: "LIMIT",
      limitPrice: 4,
      quantity: 10,
      leverage: 2,
      timestamp: Date.now() / 1000,
    };
    let flag = orderTypeToFlagCOPY(order);
    expect(containsFlag(flag, MASK_STOP_ORDER)).toBeTruthy;
    expect(containsFlag(flag, MASK_LIMIT_ORDER)).toBeTruthy;
    expect(containsFlag(flag, MASK_MARKET_ORDER)).toBeFalsy;
    expect(containsFlag(flag, MASK_KEEP_POS_LEVERAGE)).toBeFalsy;
  });

  it("stop limit order translation", async () => {
    let order: Order = {
      symbol: "MATIC-USD-MATIC",
      side: "BUY",
      type: "STOP_LIMIT",
      limitPrice: 4,
      stopPrice: 4.1,
      quantity: 10,
      leverage: 2,
      timestamp: Date.now() / 1000,
    };
    let flag = orderTypeToFlagCOPY(order);
    expect(containsFlag(flag, MASK_STOP_ORDER)).toBeFalsy;
    expect(containsFlag(flag, MASK_LIMIT_ORDER)).toBeTruthy;
    expect(containsFlag(flag, MASK_MARKET_ORDER)).toBeFalsy;
    expect(containsFlag(flag, MASK_KEEP_POS_LEVERAGE)).toBeFalsy;
  });

  function flagToOrderTypeCOPY(order: SmartContractOrder): string {
    let flag = BigNumber.from(order.flags);
    let isLimit = containsFlag(flag, MASK_LIMIT_ORDER);
    let hasLimit = !BigNumber.from(order.fLimitPrice).eq(0) || !BigNumber.from(order.fLimitPrice).eq(MAX_64x64);
    let isStop = containsFlag(flag, MASK_STOP_ORDER);

    if (isStop && hasLimit) {
      return ORDER_TYPE_STOP_LIMIT;
    } else if (isStop && !hasLimit) {
      return ORDER_TYPE_STOP_MARKET;
    } else if (isLimit && !isStop) {
      return ORDER_TYPE_LIMIT;
    } else {
      return ORDER_TYPE_MARKET;
    }
  }

  function orderTypeToFlagCOPY(order: Order): BigNumber {
    let flag: BigNumber;
    order.type = order.type.toUpperCase();
    switch (order.type) {
      case ORDER_TYPE_LIMIT:
        flag = MASK_LIMIT_ORDER;
        break;
      case ORDER_TYPE_MARKET:
        flag = MASK_MARKET_ORDER;
        break;
      case ORDER_TYPE_STOP_MARKET:
        flag = MASK_STOP_ORDER;
        break;
      case ORDER_TYPE_STOP_LIMIT:
        flag = MASK_STOP_ORDER;
        break;
      default: {
        throw Error(`Order type ${order.type} not found.`);
      }
    }
    if (order.keepPositionLvg != undefined && order.keepPositionLvg) {
      flag = combineFlags(flag, MASK_KEEP_POS_LEVERAGE);
    }
    if (order.reduceOnly != undefined && order.reduceOnly) {
      flag = combineFlags(flag, MASK_CLOSE_ONLY);
    }
    if ((order.type == ORDER_TYPE_LIMIT || order.type == ORDER_TYPE_STOP_LIMIT) && order.limitPrice == undefined) {
      throw Error(`Order type ${order.type} requires limit price.`);
    }
    if ((order.type == ORDER_TYPE_STOP_MARKET || order.type == ORDER_TYPE_STOP_LIMIT) && order.stopPrice == undefined) {
      throw Error(`Order type ${order.type} requires trigger price.`);
    }
    if ((order.type == ORDER_TYPE_MARKET || order.type == ORDER_TYPE_LIMIT) && order.stopPrice != undefined) {
      throw Error(`Order type ${order.type} has no trigger price.`);
    }
    if (order.type != ORDER_TYPE_STOP_LIMIT && order.type != ORDER_TYPE_STOP_MARKET && order.stopPrice != undefined) {
      throw Error(`Order type ${order.type} has no trigger price.`);
    }
    return flag;
  }
});
