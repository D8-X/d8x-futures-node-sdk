import { Buffer } from "buffer";
import { NodeSDKConfig } from "./nodeSDKTypes";

/**
 * @module utils
 */

function _isVocal(char: string) {
  char = char.toLowerCase();
  return char == "a" || char == "e" || char == "i" || char == "o" || char == "u";
}

/**
 *
 * @param {string} s String to shorten/extend to 4 characters
 * @returns {string} String with 4 characters (or characters + null chars)
 */
export function to4Chars(s: string) {
  while (s.length < 4) {
    s = s + "\0";
  }
  let k = s.length - 1;
  while (s.length > 4 && k >= 0) {
    // chop off vocals from the end of string
    // e.g. MATIC -> MATC
    if (_isVocal(s.charAt(k))) {
      s = s.substring(0, k) + s.substring(k + 1, s.length);
    }
    k--;
  }
  s = s.substring(0, 4);
  return s;
}

/**
 * Converts string into 4-character bytes4
 * uses to4Chars to first convert the string into
 * 4 characters.
 * Resulting buffer can be used with smart contract to
 * identify tokens (BTC, USDC, MATIC etc.)
 * @param {string} s String to encode into bytes4
 * @returns {Buffer} 4-character bytes4.
 */
export function toBytes4(s: string): Buffer {
  s = to4Chars(s);
  let valBuff: Buffer = Buffer.from(s, "ascii");
  return valBuff;
}

/**
 * Decodes a buffer encoded with toBytes4 into
 * a string. The string is the result of to4Chars of the
 * originally encoded string stripped from null-chars
 * @param {Buffer} b Correctly encoded bytes4 buffer using toBytes4
 * @returns {string} String decoded into to4Chars-type string without null characters
 */
export function fromBytes4(b: Buffer): string {
  let val: string = b.toString("ascii");
  val = val.replace(/\0/g, "");
  return val;
}

/**
 * Decodes the bytes4 encoded string received from the
 * smart contract as a hex-number in string-format
 * @param {string} s string representing a hex-number ("0x...")
 * @returns {string} x of to4Chars(x) stripped from null-chars,
 * where x was originally encoded and
 * returned by the smart contract as bytes4
 */
export function fromBytes4HexString(s: string): string {
  let res = "";
  for (let k = 2; k < s.length; k = k + 2) {
    res = res + String.fromCharCode(parseInt(s.substring(k, k + 2), 16));
  }
  res = res.replace(/\0/g, "");
  return res;
}

/**
 *
 * @param {string} s String representing a hex-number ("0x...")
 * @param {Object} mapping List of symbol and clean symbol pairs, e.g. [{symbol: "MATIC", cleanSymbol: "MATC"}, ...]
 * @returns {string} User friendly currency symbol, e.g. "MATIC"
 */
export function contractSymbolToSymbol(s: string, mapping: Map<string, string>): string {
  let shortCCY = fromBytes4HexString(s);
  // assume CCY is already short if not in the mapping file
  let longCCY = mapping.get(shortCCY) ?? shortCCY;
  return longCCY;
}

/**
 *
 * @param {string} s User friendly currency symbol, e.g. "MATIC"
 * @param {Object} mapping List of symbol and clean symbol pairs, e.g. [{symbol: "MATIC", cleanSymbol: "MATC"}, ...]
 * @returns {Buffer} Buffer that can be used with smart contract to identify tokens
 */
export function symbolToContractSymbol(s: string, mapping: Map<string, string>): Buffer {
  let shortCCY: string | undefined = undefined;
  for (let [k, v] of mapping) {
    if (v == s) {
      shortCCY = k;
    }
  }
  // if not in the mapping file, assume ccy is already valid
  shortCCY = shortCCY ?? s;
  return toBytes4(shortCCY);
}

/**
 * Converts symbol or symbol combination into long format
 * @param {string} s symbol, e.g., USDC-MATC-USDC, MATC, USDC, ...
 * @param {Object} mapping list of symbol and clean symbol pairs, e.g. [{symbol: "MATIC", cleanSymbol: "MATC"}, ...]
 * @returns {string} long format e.g. MATIC. if not found the element is ""
 */
export function symbol4BToLongSymbol(s: string, mapping: Map<string, string>): string {
  let ccy = s.split("-");
  let longCCY = "";
  for (let k = 0; k < ccy.length; k++) {
    let sym = mapping.get(ccy[k]) ?? to4Chars(ccy[k]);
    sym = sym.replace(/\0/g, "");
    longCCY = longCCY + "-" + sym;
  }
  return longCCY.substring(1);
}

export function combineFlags(f1: bigint, f2: bigint): bigint {
  return BigInt((parseInt(f1.toString()) | parseInt(f2.toString())) >>> 0);
}

export function containsFlag(f1: bigint, f2: bigint): boolean {
  return (BigInt(f1.toString()) & BigInt(f2.toString())) > 0;
}

export function loadConfigAbis(config: NodeSDKConfig) {
  config.proxyABI = require(config.proxyABILocation);
  config.lobFactoryABI = require(config.limitOrderBookFactoryABILocation);
  config.lobABI = require(config.limitOrderBookABILocation);
  config.shareTokenABI = require(config.shareTokenABILocation);
}

export async function sleepForSec(seconds: number) {
  return new Promise((resolve) => setTimeout(resolve, seconds * 1_000));
}
