import { BigNumber } from "ethers";
import { DECIMALS, ONE_64x64 } from "./nodeSDKTypes";

/**
 * @module d8xMath
 */

/**
 * Convert ABK64x64 bigint-format to float.
 * Result = x/2^64 if big number, x/2^29 if number
 * @param  {BigNumber|number} x number in ABDK-format or 2^29
 * @returns {number} x/2^64 in number-format (float)
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
 * @param {BigNumber} x BigNumber in Dec18 format
 * @returns {number} x as a float (number)
 */
export function dec18ToFloat(x: BigNumber): number {
  //x: BigNumber in Dec18 format to float
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
 * @param {number} x   number (float)
 * @returns {BigNumber} x^64 in big number format
 */
export function floatToABK64x64(x: number): BigNumber {
  // convert float to ABK64x64 bigint-format
  // Create string from number with 18 decimals
  if (x === 0) {
    return BigNumber.from(0);
  }
  let sg = Math.sign(x);
  x = Math.abs(x);
  let strX = Number(x).toFixed(18);
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
 * @param {number} x number (float)
 * @returns {BigNumber} x as a BigNumber in Dec18 format
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
 * @param {BigNumber} x
 * @param {BigNumber} y
 * @returns {BigNumber} x * y
 */
export function mul64x64(x: BigNumber, y: BigNumber) {
  return x.mul(y).div(ONE_64x64);
}

/**
 *
 * @param {BigNumber} x
 * @param {BigNumber} y
 * @returns {BigNumber} x / y
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
  LockedInValueQC: number,
  position: number,
  cash_cc: number,
  maintenance_margin_rate: number
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
  LockedInValueQC: number,
  position: number,
  cash_cc: number,
  maintenance_margin_rate: number,
  S3: number,
  Sm: number
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
  LockedInValueQC: number,
  position: number,
  cash_cc: number,
  maintenance_margin_rate: number
): number {
  // m_r  = (Sm * Pi - L + cash ) / (Sm * |Pi|)
  // -> Sm * (m_r |Pi| - Pi) = - L + cash
  let numerator = -LockedInValueQC + cash_cc;
  let denominator = maintenance_margin_rate * Math.abs(position) - position;
  return numerator / denominator;
}

/**
 *
 * @param targetLeverage Leverage of the resulting position. It must be positive unless the resulting position is closed.
 * @param currentPosition Current position size, in base currency, signed.
 * @param currentLockedInValue Current locked in value, average entry price times position size, in quote currency.
 * @param tradeAmount Trade amount, in base currency, signed.
 * @param markPrice Mark price, positive.
 * @param indexPriceS2 Index price, positive.
 * @param indexPriceS3 Collateral index price, positive.
 * @param tradePrice Expected price to trade tradeAmount.
 * @param feeRate
 * @returns {number} Total collateral amount needed for the new position to have he desired leverage.
 */
export function getMarginRequiredForLeveragedTrade(
  targetLeverage: number | undefined,
  currentPosition: number,
  currentLockedInValue: number,
  tradeAmount: number,
  markPrice: number,
  indexPriceS2: number,
  indexPriceS3: number,
  tradePrice: number,
  feeRate: number
): number {
  // we solve for margin in:
  // |new position| * Sm / leverage + fee rate * |trade amount| * S2 = margin * S3 + current position * Sm - L + trade amount * (Sm - trade price)
  // --> M S3 = |P'|Sm/L + FeeQC - PnL + (P'-P)(Price - Sm) = pos value / leverage + fees + price impact - pnl
  let isClosing =
    currentPosition != 0 && currentPosition * tradeAmount < 0 && currentPosition * (currentPosition + tradeAmount) >= 0;
  let feesCC = (feeRate * Math.abs(tradeAmount) * indexPriceS2) / indexPriceS3;
  let collRequired = feesCC;

  if (!isClosing) {
    if (targetLeverage == undefined || targetLeverage <= 0) {
      throw Error("opening trades must have positive leverage");
    }
    // unrealized pnl (could be + or -)  - price impact premium (+)
    let pnlQC = currentPosition * markPrice - currentLockedInValue - tradeAmount * (tradePrice - markPrice);
    collRequired +=
      Math.max(0, (Math.abs(currentPosition + tradeAmount) * markPrice) / targetLeverage - pnlQC) / indexPriceS3;
  }
  return collRequired;
}

export function getMaxSignedPositionSize(
  marginCollateral: number,
  currentPosition: number,
  currentLockedInValue: number,
  direction: number,
  limitPrice: number,
  initialMarginRate: number,
  feeRate: number,
  markPrice: number,
  indexPriceS2: number,
  indexPriceS3: number
): number {
  // we solve for new position in:
  // |new position| * Sm / leverage + fee rate * |trade amount| * S2 = margin * S3 + current position * Sm - L + trade amount * (Sm - entry price)
  // |trade amount| = (new position - current position) * direction
  let availableCash = marginCollateral * indexPriceS3 + currentPosition * markPrice - currentLockedInValue;
  let effectiveMarginRate =
    markPrice * initialMarginRate + feeRate * indexPriceS2 + direction * (limitPrice - markPrice);

  return availableCash / effectiveMarginRate;
}

/**
 * Compute the leverage resulting from a trade
 * @param tradeAmount Amount to trade, in base currency, signed
 * @param marginCollateral Amount of cash in the margin account, after the trade, in collateral currency
 * @param currentPosition Position size before the trade
 * @param currentLockedInValue Locked-in value before the trade
 * @param indexPriceS2 Spot price of the index when the trade happens
 * @param indexPriceS3 Spot price of the collateral currency when the trade happens
 * @param markPrice Mark price of the index when the trade happens
 * @param limitPrice Price charged to trade tradeAmount
 * @param feeRate Trading fee rate applicable to this trade
 * @returns Leverage of the resulting position
 */
export function getNewPositionLeverage(
  tradeAmount: number,
  marginCollateral: number,
  currentPosition: number,
  currentLockedInValue: number,
  indexPriceS2: number,
  indexPriceS3: number,
  markPrice: number,
  limitPrice: number,
  feeRate: number
): number {
  let newPosition = tradeAmount + currentPosition;
  let pnlQC = currentPosition * markPrice - currentLockedInValue + tradeAmount * (markPrice - limitPrice);
  return (
    (Math.abs(newPosition) * indexPriceS2) / (marginCollateral * indexPriceS3 + pnlQC - feeRate * Math.abs(tradeAmount))
  );
}

/**
 * Determine amount to be deposited into margin account so that the given leverage
 * is obtained when trading a position pos (trade amount = position)
 * Does NOT include fees
 * Smart contract equivalent: calcMarginForTargetLeverage(..., _ignorePosBalance = false & balance = b0)
 * @param {number} pos0 - current position
 * @param {number} b0 - current balance
 * @param {number} tradeAmnt - amount to trade
 * @param {number} targetLvg - target leverage
 * @param {number} price - price to trade amount 'tradeAmnt'
 * @param {number} S3 - collateral to quote conversion (=S2 if base-collateral, =1 if quote collateral, = index S3 if quanto)
 * @param {number} S2Mark - mark price
 * @returns {number} Amount to be deposited to have the given leverage when trading into position pos before fees
 */
export function getDepositAmountForLvgTrade(
  pos0: number,
  b0: number,
  tradeAmnt: number,
  targetLvg: number,
  price: number,
  S3: number,
  S2Mark: number
) {
  let pnl = (tradeAmnt * (S2Mark - price)) / S3;
  if (targetLvg == 0) {
    targetLvg = (Math.abs(pos0) * S2Mark) / S3 / b0;
  }
  let b = (Math.abs(pos0 + tradeAmnt) * S2Mark) / S3 / targetLvg;
  return -(b0 + pnl - b);
}
