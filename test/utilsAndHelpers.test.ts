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
  SYMBOL_LIST,
} from "../src/nodeSDKTypes";
import PerpetualDataHandler from "../src/perpetualDataHandler";
import AccountTrade from "../src/accountTrade";
import {
  to4Chars,
  symbol4BToLongSymbol,
  toBytes4,
  fromBytes4,
  fromBytes4HexString,
  containsFlag,
  combineFlags,
  symbolToContractSymbol,
  contractSymbolToSymbol,
} from "../src/utils";
import { roundToLotString, countDecimalsOf } from "../src/d8XMath";
import { BigNumber, ethers } from "ethers";

let pk: string = <string>process.env.PK;
let RPC: string = <string>process.env.RPC;
const myAddress = new ethers.Wallet(pk).address;
jest.setTimeout(150000);

let config: NodeSDKConfig;

describe("utils", () => {
  it("countDecimalsOf", async function () {
    let x = [0.12349999, 52.1999999999999, 0.123212, 52.100000001111111, 0.12349999];
    let resExp = [4, 1, 6, 1];
    for (let k = 0; k < resExp.length; k++) {
      let res = countDecimalsOf(x[k], 7);
      expect(res).toEqual(resExp[k]);
    }
  });

  it("round to lot (small lot)", async function () {
    let lot = 0.01999999;
    let x = [52.123212, 52.100000001111111, 52.1360000990000001];
    let resExp = ["52.12", "52.10", "52.14"];
    for (let k = 0; k < resExp.length; k++) {
      let res = roundToLotString(x[k], lot);
      expect(res).toEqual(resExp[k]);
    }
  });
  it("round to lot (small lot 2)", async function () {
    let lot = 0.0199;
    let x = [52.123212, 52.100000001111111, 52.1360000990000001];
    let resExp = ["52.12", "52.10", "52.14"];
    for (let k = 0; k < resExp.length; k++) {
      let res = roundToLotString(x[k], lot);
      expect(res).toEqual(resExp[k]);
    }
  });
  it("round to lot (large lot)", async function () {
    let lot = 26;
    let x = [52.123212, 52.100000001111111, 52.1360000990000001];
    let resExp = ["52", "52", "52"];
    for (let k = 0; k < resExp.length; k++) {
      let res = roundToLotString(x[k], lot);
      expect(res).toEqual(resExp[k]);
    }
  });
  it("read config", async function () {
    // get config by chain id (latest version)
    const chainId = 80001;
    config = PerpetualDataHandler.readSDKConfig(chainId);
    if (RPC != undefined) {
      config.nodeURL = RPC;
    }
  });
  it("4Chars", async () => {
    let examples = ["MATIC", "FEDORA", "A", "AEIOUAEI", "D8X", "ARmAGEDON", "stMATIC"];
    let solutions = ["MATC", "FEDR", "A\0\0\0", "AEIO", "D8X\0", "RmGD", "stMT"];
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
    expect(flag.gt(0)).toBeTruthy;
    expect(containsFlag(flag, MASK_STOP_ORDER)).toBeTruthy;
    expect(containsFlag(flag, MASK_KEEP_POS_LEVERAGE)).toBeTruthy;
    expect(containsFlag(flag, MASK_MARKET_ORDER)).toBeFalsy;
  });
  it("combine flags 2", async () => {
    let flag = combineFlags(MASK_LIMIT_ORDER, MASK_STOP_ORDER);
    expect(flag.gt(0)).toBeTruthy;
    expect(containsFlag(flag, MASK_STOP_ORDER)).toBeTruthy;
    expect(containsFlag(flag, MASK_LIMIT_ORDER)).toBeTruthy;
    expect(containsFlag(flag, MASK_KEEP_POS_LEVERAGE)).toBeFalsy;
  });

  it("combine flags 3", async () => {
    let flag = combineFlags(MASK_LIMIT_ORDER, MASK_CLOSE_ONLY);
    expect(flag.gt(0)).toBeTruthy;
    expect(containsFlag(flag, MASK_LIMIT_ORDER)).toBeTruthy;
    expect(containsFlag(flag, MASK_CLOSE_ONLY)).toBeTruthy;
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

  it("symbol4BToLongSymbol", async () => {
    let symbolList = SYMBOL_LIST;
    // add fake ccy with clash
    symbolList.set("MXTC", "MATUC");
    // add actual liquid staked matic
    symbolList.set(to4Chars("stMATIC"), "stMATIC");
    let examples = ["MATC", "MXTC-ETH", "XXX-ETH", "MATC-ETH-XAU", "MATC-USD-stMT"];
    let solutions = ["MATIC", "MATUC-ETH", "XXX-ETH", "MATIC-ETH-XAU", "MATIC-USD-stMATIC"];
    for (let j = 0; j < examples.length; j++) {
      let v = symbol4BToLongSymbol(examples[j], symbolList);
      let bIsEqual = v == solutions[j];
      if (!bIsEqual) {
        console.log("symbol4BToLongSymbol mismatch:");
        console.log("input  =", examples[j]);
        console.log("received =", v);
        console.log("expected =", solutions[j]);
      }
      expect(bIsEqual).toBeTruthy();
    }
  });

  it("symbol <-> contract symbol", async () => {
    let symbolList = new Map(SYMBOL_LIST);
    // add fake ccy with clash
    symbolList.set("MXTC", "MATUC");
    // add actual liquid staked matic
    symbolList.set(to4Chars("stMATIC"), "stMATIC");
    let examples = ["MATC", "MXTC", "XXX", "ETH", "stMT"];
    let solutions = ["MATIC", "MATUC", "XXX", "ETH", "stMATIC"];
    for (let k = 0; k < examples.length; k++) {
      let hexString = toHexString(symbolToContractSymbol(examples[k], symbolList));
      let longSymbol = contractSymbolToSymbol(hexString, symbolList);
      let isEqual = solutions[k] == longSymbol;
      if (!isEqual) {
        console.log("example    =", examples[k]);
        console.log("hexString  =", hexString);
        console.log("longSymbol =", longSymbol);
        console.log("solutions  =", solutions[k]);
      }
      expect(isEqual).toBeTruthy();
    }
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

  function toHexString(byteArray: Buffer): string {
    return (
      "0x" +
      Array.from(byteArray, function (byte: any) {
        return ("0" + (byte & 0xff).toString(16)).slice(-2);
      }).join("")
    );
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
