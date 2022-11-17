import { BigNumber } from "ethers";
const BN = BigNumber;

export const ONE_64x64 = BN.from("0x10000000000000000");

/**
 * Convert ABK64x64 bigint-format to float.
 * Result = x/2^64 if big number, x/2^29 if number
 * @param   x number in ABDK-format or 2^29
 * @returns x/2^64 in number-format (float)
 */
export function ABK64x64ToFloat(x: BigNumber | number): number {
  if (typeof x == "number") {
    return x / 2 ** 29;
  }
  let s = x.lt(0) ? -1 : 1;
  x = x.mul(s);
  let xInt = x.div(ONE_64x64);
  let dec18 = BigNumber.from(10).pow(BigNumber.from(18));
  let xDec = x.sub(xInt.mul(ONE_64x64));
  xDec = xDec.mul(dec18).div(ONE_64x64);
  let k = 18 - xDec.toString().length;
  // console.assert(k >= 0);
  let sPad = "0".repeat(k);
  let NumberStr = xInt.toString() + "." + sPad + xDec.toString();
  return parseFloat(NumberStr) * s;
}

/**
 *
 * @param x BigNumber in Dec18 format
 * @returns x as a float (number)
 */
export function dec18ToFloat(x: BigNumber): number {
  //x: BigNumber in Dec18 format to float
  const DECIMALS = BN.from(10).pow(BN.from(18));
  let s = x.lt(0) ? -1 : 1;
  x = x.mul(s);
  let xInt = x.div(DECIMALS);
  let xDec = x.sub(xInt.mul(DECIMALS));
  let k = 18 - xDec.toString().length;
  let sPad = "0".repeat(k);
  let NumberStr = xInt.toString() + "." + sPad + xDec.toString();
  return parseFloat(NumberStr) * s;
}

/**
 * Converts x into ABDK64x64 format
 * @param   x   number (float)
 * @returns x^64 in big number format
 */
export function floatToABK64x64(x: number): BigNumber {
  // convert float to ABK64x64 bigint-format
  // Create string from number with 18 decimals
  if (x === 0) {
    return BigNumber.from(0);
  }
  let sg = Math.sign(x);
  x = Math.abs(x);
  let strX = parseFloat(x).toFixed(18);
  const arrX = strX.split(".");
  let xInt = BigNumber.from(arrX[0]);
  let xDec = BigNumber.from(arrX[1]);
  let xIntBig = xInt.mul(ONE_64x64);
  let dec18 = BigNumber.from(10).pow(BigNumber.from(18));
  let xDecBig = xDec.mul(ONE_64x64).div(dec18);
  return xIntBig.add(xDecBig).mul(sg);
}

/**
 *
 * @param x number (float)
 * @returns x as a BigNumber in Dec18 format
 */
export function floatToDec18(x: number): BigNumber {
  // float number to dec 18
  if (x === 0) {
    return BigNumber.from(0);
  }
  let sg = Math.sign(x);
  x = Math.abs(x);
  let strX = x.toFixed(18);
  const arrX = strX.split(".");
  let xInt = BigNumber.from(arrX[0]);
  let xDec = BigNumber.from(arrX[1]);
  let xIntBig = xInt.mul(DECIMALS);
  return xIntBig.add(xDec).mul(sg);
}

/**
 *
 * @param x
 * @param y
 * @returns x * y
 */
export function mul64x64(x: BigNumber, y: BigNumber) {
  return x.mul(y).div(ONE_64x64);
}

/**
 *
 * @param x
 * @param y
 * @returns x / y
 */
export function div64x64(x: BigNumber, y: BigNumber) {
  return x.mul(ONE_64x64).div(y);
}

/**
 * Determine the liquidation price
 * @param {number} LockedInValueQC - trader locked in value in quote currency
 * @param {number} position - trader position in base currency
 * @param {number} cash_cc - trader available margin cash in collateral currency
 * @param {number} maintenance_margin_rate - maintenance margin ratio
 * @param {number} S3 - collateral to quote conversion (=S2 if base-collateral, =1 if quuote collateral, = index S3 if quanto)
 * @returns {number} Amount to be deposited to have the given leverage when trading into position pos
 */
export function calculateLiquidationPriceCollateralBase(
  LockedInValueQC,
  position,
  cash_cc,
  maintenance_margin_rate
): number {
  // correct only if markprice = spot price
  // m_r  <= (Sm * Pi - L + cash * S3) / (Sm * |Pi|)
  // -> Sm * (Pi + cash - m_r|Pi|) => L
  return LockedInValueQC / (position - maintenance_margin_rate * Math.abs(position) + cash_cc);
}

/**
 * Determine the liquidation price
 * @param {number} LockedInValueQC - trader locked in value in quote currency
 * @param {number} position - trader position in base currency
 * @param {number} cash_cc - trader available margin cash in collateral currency
 * @param {number} maintenance_margin_rate - maintenance margin ratio
 * @param {number} S3 - collateral to quote conversion (=S2 if base-collateral, =1 if quuote collateral, = index S3 if quanto)
 * @param {number} Sm - mark price
 * @returns {number} Amount to be deposited to have the given leverage when trading into position pos
 */
export function calculateLiquidationPriceCollateralQuanto(
  LockedInValueQC,
  position,
  cash_cc,
  maintenance_margin_rate,
  S3,
  Sm
): number {
  // correct only if markprice = spot price and S3 co-moves with Sm
  // m_r  = (Sm * Pi - L + cash * S3) / (Sm * |Pi|)
  // m_r  = [Sm * Pi - L + cash * S3(0) * (1 + sign(Pi) (Sm / Sm(0) - 1)] / (Sm * |Pi|)
  // -> Sm * (m_r |Pi| - Pi - cash * S3(0) * sign(Pi) / Sm(0)) = - L + cash * S3(0) * (1 - sign(Pi))
  let numerator = -LockedInValueQC + cash_cc * S3 * (1 - Math.sign(position));
  let denominator = maintenance_margin_rate * Math.abs(position) - position - (cash_cc * S3 * Math.sign(position)) / Sm;
  return numerator / denominator;
}

/**
 * Determine the liquidation price
 * @param {number} LockedInValueQC - trader locked in value in quote currency
 * @param {number} position - trader position in base currency
 * @param {number} cash_cc - trader available margin cash in collateral currency
 * @param {number} maintenance_margin_rate - maintenance margin ratio
 * @param {number} S3 - collateral to quote conversion (=S2 if base-collateral, =1 if quuote collateral, = index S3 if quanto)
 * @returns {number} Amount to be deposited to have the given leverage when trading into position pos
 */
export function calculateLiquidationPriceCollateralQuote(
  LockedInValueQC,
  position,
  cash_cc,
  maintenance_margin_rate
): number {
  // m_r  = (Sm * Pi - L + cash ) / (Sm * |Pi|)
  // -> Sm * (m_r |Pi| - Pi) = - L + cash
  let numerator = -LockedInValueQC + cash_cc;
  let denominator = maintenance_margin_rate * Math.abs(position) - position;
  return numerator / denominator;
}
