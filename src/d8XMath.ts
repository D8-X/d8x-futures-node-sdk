import { BigNumberish } from "ethers";
import { DECIMALS, ONE_64x64 } from "./constants";

/**
 * @module d8xMath
 */

/**
 * Convert ABK64x64/2^35 bigint-format to float.
 * Divide by 2^64 to get a float, but it's already "divided" by 2^35,
 * so there's only 2^29 left
 * @param  {BigNumber|number} x number in ABDK-format/2^35
 * @returns {number} x/2^64 in number-format (float)
 */
export function ABDK29ToFloat(x: bigint | number): number {
  return Number(x) / 2 ** 29;
}

/**
 * Convert ABK64x64 bigint-format to float.
 * Result = x/2^64 if big number, x/2^29 if number
 * @param  {BigNumberish|number} x number in ABDK-format or 2^29
 * @returns {number} x/2^64 in number-format (float)
 */
export function ABK64x64ToFloat(x: bigint | number): number {
  if (typeof x == "number") {
    return x / 2 ** 29;
  }
  let s = x < 0n ? -1n : 1n;
  x = x * s;
  let xInt = x / ONE_64x64;
  let dec18 = 10n ** 18n; // BigNumber.from(10).pow(BigNumber.from(18));
  let xDec = x - xInt * ONE_64x64;
  xDec = (xDec * dec18) / ONE_64x64;
  let k = 18 - xDec.toString().length;
  // console.assert(k >= 0);
  let sPad = "0".repeat(k);
  let NumberStr = xInt.toString() + "." + sPad + xDec.toString();
  return parseFloat(NumberStr) * Number(s);
}

/**
 *
 * @param {BigNumberish} x BigNumber in Dec-N format
 * @returns {number} x as a float (number)
 */
export function decNToFloat(x: BigNumberish, numDec: BigNumberish): number {
  //x: BigNumber in DecN format to float
  const DECIMALS = 10n ** BigInt(numDec); // BigNumber.from(10).pow(BigNumber.from(numDec));
  x = BigInt(x);
  numDec = BigInt(numDec);
  let s = x < 0n ? -1n : 1n;
  x = x * s;
  let xInt = x / DECIMALS;
  let xDec = x - xInt * DECIMALS;
  let k = Number(numDec) - xDec.toString().length;
  let sPad = "0".repeat(k);
  let NumberStr = xInt.toString() + "." + sPad + xDec.toString();
  return parseFloat(NumberStr) * Number(s);
}

/**
 *
 * @param {BigNumberish} x BigNumber in Dec18 format
 * @returns {number} x as a float (number)
 */
export function dec18ToFloat(x: BigNumberish): number {
  //x: BigNumber in Dec18 format to float
  x = BigInt(x);
  let s = x < 0n ? -1n : 1n;
  x = x * s;
  let xInt = x / DECIMALS;
  let xDec = x - xInt * DECIMALS;
  let k = 18 - xDec.toString().length;
  let sPad = "0".repeat(k);
  let NumberStr = xInt.toString() + "." + sPad + xDec.toString();
  return parseFloat(NumberStr) * Number(s);
}

/**
 * Converts x into ABDK64x64 format
 * @param {number} x   number (float)
 * @returns {bigint} x^64 in big number format
 */
export function floatToABK64x64(x: number): bigint {
  // convert float to ABK64x64 bigint-format
  // Create string from number with 18 decimals
  if (x === 0) {
    return 0n;
  }
  let sg = Math.sign(x);
  x = Math.abs(x);
  let strX = Number(x).toFixed(18);
  const arrX = strX.split(".");
  let xInt = BigInt(arrX[0]);
  let xDec = BigInt(arrX[1]);
  let xIntBig = xInt * ONE_64x64;
  let dec18 = 10n ** 18n; //BigNumber.from(10).pow(BigNumber.from(18));
  let xDecBig = (xDec * ONE_64x64) / dec18;
  return (xIntBig + xDecBig) * BigInt(sg);
}

/**
 *
 * @param {number} x number (float)
 * @returns {BigNumber} x as a BigNumber in Dec18 format
 */
export function floatToDec18(x: number): bigint {
  // float number to dec 18
  if (x === 0) {
    return 0n;
  }
  let sg = Math.sign(x);
  x = Math.abs(x);
  let strX = x.toFixed(18);
  const arrX = strX.split(".");
  let xInt = BigInt(arrX[0]);
  let xDec = BigInt(arrX[1]);
  let xIntBig = xInt * DECIMALS;
  return (xIntBig + xDec) * BigInt(sg);
}

/**
 *
 * @param {number} x number (float)
 * @param {number} decimals number of decimals
 * @returns {BigNumber} x as a BigNumber in Dec18 format
 */
export function floatToDecN(x: number, decimals: number): bigint {
  // float number to dec 18
  if (x === 0) {
    return 0n;
  }
  let sg = Math.sign(x);
  x = Math.abs(x);
  let strX = x.toFixed(decimals);
  const arrX = strX.split(".");
  let xInt = BigInt(arrX[0]);
  let xDec = BigInt(arrX[1]);
  let xIntBig = xInt * 10n ** BigInt(decimals);
  return (xIntBig + xDec) * BigInt(sg);
}

/**
 * 9 are rounded up regardless of precision, e.g, 0.1899000 at precision 6 results in 3
 * @param {number} x
 * @param {number} precision
 * @returns number of decimals
 */
export function countDecimalsOf(x: number, precision: number): number {
  let decimalPart = x - Math.floor(x);
  if (decimalPart == 0) {
    return 0;
  }
  let decimalPartStr = decimalPart.toFixed(precision);
  // remove trailing zeros
  let c = decimalPartStr.charAt(decimalPartStr.length - 1);
  while (c == "0") {
    decimalPartStr = decimalPartStr.substring(0, decimalPartStr.length - 1);
    c = decimalPartStr.charAt(decimalPartStr.length - 1);
  }
  // remove trailing 9
  c = decimalPartStr.charAt(decimalPartStr.length - 1);
  while (c == "9") {
    decimalPartStr = decimalPartStr.substring(0, decimalPartStr.length - 1);
    c = decimalPartStr.charAt(decimalPartStr.length - 1);
  }

  return decimalPartStr.length > 2 ? decimalPartStr.length - 2 : 0;
}

/**
 * Round a number to a given lot size and return a string formated
 * to for this lot-size
 * @param {number} x number to round
 * @param {number} lot lot size (could be 'uneven' such as 0.019999999 instead of 0.02)
 * @param {number} precision optional lot size precision (e.g. if 0.01999 should be 0.02 then precision could be 5)
 * @returns formated number string
 */
export function roundToLotString(x: number, lot: number, precision: number = 7): string {
  // round lot to precision
  let lotRounded = Math.round(lot / 10 ** -precision) * 10 ** -precision;
  let v = Math.round(x / lotRounded) * lotRounded;

  // number of digits of rounded lot
  let numDig = countDecimalsOf(lotRounded, precision);
  return v.toFixed(numDig);
}

/**
 *
 * @param {bigint} x
 * @param {bigint} y
 * @returns {bigint} x * y
 */
export function mul64x64(x: bigint, y: bigint): bigint {
  return (x * y) / ONE_64x64;
}

/**
 *
 * @param {bigint} x
 * @param {bigint} y
 * @returns {bigint} x / y
 */
export function div64x64(x: bigint, y: bigint): bigint {
  return (x * ONE_64x64) / y;
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
  let numerator =
    marginCollateral * indexPriceS3 +
    currentPosition * markPrice -
    currentLockedInValue -
    Math.abs(currentPosition) * markPrice * initialMarginRate;
  let denominator =
    markPrice * initialMarginRate + feeRate * indexPriceS2 + Math.max(0, direction * (limitPrice - markPrice));
  return currentPosition + (numerator > 0 ? direction * (numerator / denominator) : 0);
}

/**
 * Compute the leverage resulting from a trade
 * @param tradeAmount Amount to trade, in base currency, signed
 * @param marginCollateral Amount of cash in the margin account, in collateral currency
 * @param currentPosition Position size before the trade
 * @param currentLockedInValue Locked-in value before the trade
 * @param price Price charged to trade tradeAmount
 * @param indexPriceS3 Spot price of the collateral currency when the trade happens
 * @param markPrice Mark price of the index when the trade happens
 * @returns Leverage of the resulting position
 */
export function getNewPositionLeverage(
  tradeAmount: number,
  marginCollateral: number,
  currentPosition: number,
  currentLockedInValue: number,
  price: number,
  indexPriceS3: number,
  markPrice: number
): number {
  let newPosition = tradeAmount + currentPosition;
  let pnlQC = currentPosition * markPrice - currentLockedInValue + tradeAmount * (markPrice - price);
  return (Math.abs(newPosition) * markPrice) / (marginCollateral * indexPriceS3 + pnlQC);
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
 * @param {boolean} isPredMkt - true if prediction market
 * @returns {number} Amount to be deposited to have the given leverage when trading into position pos before fees
 */
export function getDepositAmountForLvgTrade(
  pos0: number,
  b0: number,
  tradeAmnt: number,
  targetLvg: number,
  price: number,
  S3: number,
  S2Mark: number,
  isPredMkt: boolean
) {
  let pnl = (tradeAmnt * (S2Mark - price)) / S3;
  let S2MarkBefore = S2Mark;
  if (isPredMkt) {
    // adjust mark price to 'probability'
    S2Mark = S2Mark - 1;
    S2MarkBefore = S2Mark;
    if (pos0 < 0) {
      S2MarkBefore = 1 - S2Mark;
    }
    if (pos0 + tradeAmnt < 0) {
      S2Mark = 1 - S2Mark;
    }
  }
  if (targetLvg == 0) {
    // use current leverage
    targetLvg = (Math.abs(pos0) * S2MarkBefore) / S3 / b0;
  }
  let b = (Math.abs(pos0 + tradeAmnt) * S2Mark) / S3 / targetLvg;
  return -(b0 + pnl - b);
}

/**
 * Convert a perpetual price to probability (predtictive markets)
 * @param px Perpetual price
 * @returns Probability in [0,1]
 */
export function priceToProb(px: number) {
  if (px <= 0) {
    throw new Error(`Price must be positive: ${px}`);
  }
  return px - 1;
}

/**
 * Convert a probability to a predictive market price
 * @param prob Probability in [0,1]
 * @returns Perpetual price
 */
export function probToPrice(prob: number) {
  return 1 + prob;
}

// shannon entropy
export function entropy(prob: number) {
  if (prob < 1e-15 || prob - 1 > 1e-15) {
    return 0;
  }
  return -prob * Math.log2(prob) - (1 - prob) * Math.log2(1 - prob);
}

/**
 * Maintenance margin requirement for prediction markets
 * @param pos signed position
 * @param s2 mark price
 * @param s3 collateral to quote conversion
 * @param m base margin rate
 * @returns required margin balance
 */
function pmMarginThresh(pos: number, s2: number, s3: number, m: number | undefined = 0.18) {
  let p = s2 - 1;
  if (pos < 0) {
    p = 1 - p;
  }
  const h = entropy(p);
  const tau = m + (0.4 - m) * h;
  return (Math.abs(pos) * p * tau) / s3;
}

/**
 * Maintenance margin rate for prediction markets.
 * @param posSign sign of position in base currency (can be signed position or -1, 1)
 * @param sm  mark-price (=1+p)
 * @param m   max margin rate from fInitialMarginRate
 * @returns margin rate to be applied (Math.abs(pos) * p * tau) / s3;
 */
export function pmMaintenanceMarginRate(posSign: number, sm: number, m: number | undefined = 0.18): number {
  let p = sm - 1;
  if (posSign < 0) {
    p = 1 - p;
  }
  const h = entropy(p);
  return m + (0.4 - m) * h;
}

/**
 * Maintenance margin rate for prediction markets.
 * @param posSign sign of position in base currency (can be signed position or -1, 1)
 * @param sm  mark-price (=1+p)
 * @param m   max margin rate from fMaintenanceMarginRate
 * @returns margin rate to be applied (Math.abs(pos) * p * tau) / s3;
 */
export function pmInitialMarginRate(posSign: number, sm: number, m: number | undefined = 0.2): number {
  let p = sm - 1;
  if (posSign < 0) {
    p = 1 - p;
  }
  const h = entropy(p);
  return m + (0.5 - m) * h;
}

/**
 * Calculate the expected loss for a prediction market trade used for
 * prediction market fees
 * @param p probability derived from mark price (long)
 * @param m maximal maintenance rate from which we defer the actual maintenance margin rate
 * @param totLong total long in base currency
 * @param totShort total short
 * @param tradeAmt signed trade amount, can be zero
 * @param tradeMgnRate margin rate of the trader
 */
export function expectedLoss(
  p: number,
  m: number,
  totLong: number,
  totShort: number,
  tradeAmt: number,
  tradeMgnRate: number
): number {
  // maintenance margin rate
  m = (0.4 - m) * entropy(p) + m;
  let dlm = 0;
  let dl = 0;
  let dsm = 0;
  let ds = 0;
  if (tradeAmt > 0) {
    dlm = p * tradeAmt * tradeMgnRate;
    dl = tradeAmt;
  } else if (tradeAmt < 0) {
    dsm = (1 - p) * Math.abs(tradeAmt) * tradeMgnRate;
    ds = Math.abs(tradeAmt);
  }
  const a = Math.max(0, dl + totLong - m * totShort - dsm);
  const b = Math.max(0, ds + totShort - m * totLong + dsm);
  return p * (1 - p) * (a + b);
}

/**
 * Exchange fee as a rate for prediction markets
 * For opening trades only
 * @param prob long probability
 * @param m max maintenance margin rate (0.18)
 * @param totShort
 * @param totLong
 * @param tradeAmt trade amount in base currency
 * @param tradeMgnRate margin rate for this trade
 * @returns fee relative to tradeAmt
 */
export function pmExchangeFee(
  prob: number,
  m: number,
  totShort: number,
  totLong: number,
  tradeAmt: number,
  tradeMgnRate: number
): number {
  const el0 = expectedLoss(prob, m, totLong, totShort, 0, 0);
  const el1 = expectedLoss(prob, m, totLong, totShort, tradeAmt, tradeMgnRate);
  const fee = (el1 - el0) / Math.abs(tradeAmt);
  return Math.max(fee, 0.001);
}

/**
 * Margin balance for prediction markets
 * @param pos signed position
 * @param s2 mark price
 * @param s3 collateral to quote conversion
 * @param ell locked in value
 * @param mc margin cash in collateral currency
 * @returns current margin balance
 */
function pmMarginBalance(pos: number, s2: number, s3: number, ell: number, mc: number): number {
  return (pos * s2) / s3 - ell / s3 + mc;
}

function pmExcessBalance(pos: number, s2: number, s3: number, ell: number, mc: number, m: number | undefined): number {
  return pmMarginBalance(pos, mc, s2, s3, ell) - pmMarginThresh(pos, s2, s3, m);
}

// finds the liquidation price for prediction markets
// using Newton's algorithm
export function pmFindLiquidationPrice(
  pos: number,
  s3: number,
  ell: number,
  mc: number,
  baseMarginRate: number | undefined,
  s2Start: number | undefined = 0.5
): number {
  const delta_s = 0.01;
  let s = 100;
  let s_new = s2Start;

  while (Math.abs(s_new - s) > 0.01) {
    s = s_new;
    const f = Math.pow(pmExcessBalance(pos, s, s3, ell, mc, baseMarginRate), 2);
    const ds = (Math.pow(pmExcessBalance(pos, s + delta_s, s3, ell, mc, baseMarginRate), 2) - f) / delta_s;
    s_new = s - f / ds;

    if (s_new < 1) {
      return 1;
    }
    if (s_new > 2) {
      return 2;
    }
  }
  return s;
}

/**
 * Calculate the excess margin defined as
 * excess := margin balance - trading fee - initial margin threshold
 * for the given trade and position
 * @param tradeAmt
 * @param currentCashCC
 * @param currentPos
 * @param currentLockedInQC
 * @param limitPrice
 * @param Sm
 * @param S3
 * @param totLong
 * @param totShort
 * @returns excess margin as defined above
 */
function excessMargin(
  tradeAmt: number,
  currentCashCC: number,
  currentPos: number,
  currentLockedInQC: number,
  limitPrice: number,
  Sm: number,
  S3: number,
  totLong: number,
  totShort: number,
  targetMarginRate?: number
): number {
  const m = 0.18; //max maintenance margin rate
  const m0 = 0.2; //max initial margin rate
  const pos = currentPos + tradeAmt;
  let p = Sm - 1;
  if (pos < 0) {
    p = 2 - Sm; //=1-(Sm-1)
  }
  const h = entropy(p);
  const minMarginRate = m0 + (0.5 - m0) * h;
  if (targetMarginRate && targetMarginRate < minMarginRate) {
    return 0;
  }
  const tau = targetMarginRate ?? minMarginRate;
  const thresh = Math.abs(pos) * p * tau;
  const b0 = currentCashCC + Math.abs(currentPos) * Sm - currentLockedInQC + Math.max(0, tradeAmt * (Sm - limitPrice));
  // b0 + margin - fee > threshold
  // margin = threshold - b0 + fee
  const fee_cc = pmExchangeFee(p, m, totShort, totLong, tradeAmt, tau) / S3;

  // missing: referral rebate
  return b0 / S3 - thresh / S3 - fee_cc;
}

/**
 * Find maximal trade size (short dir=-1 or long dir=1) for prediction
 * markets.
 * @param dir
 * @param currentPosition
 * @param currentCashCC
 * @param currentLockedInValue
 * @param limitPrice
 * @param Sm
 * @param S3
 * @param totLong
 * @param totShort
 * @param maxShort
 * @param maxLong
 * @returns signed max trade size
 */
export function pmFindMaxTradeSize(
  dir: number,
  currentPosition: number,
  currentCashCC: number,
  currentLockedInValue: number,
  limitPrice: number,
  Sm: number,
  S3: number,
  totLong: number,
  totShort: number,
  maxShort: number,
  maxLong: number,
  targetMarginRate?: number
): number {
  if (dir < 0) {
    dir = -1;
  } else {
    dir = 1;
  }
  const lot = 10;
  const deltaS = 1; //for derivative
  const f0 = excessMargin(
    dir * deltaS,
    currentCashCC,
    currentPosition,
    currentLockedInValue,
    limitPrice,
    Sm,
    S3,
    totLong,
    totShort,
    targetMarginRate
  );
  if (f0 < lot) {
    // no trade possible
    return 0;
  }
  // numerically find maximal trade size
  let sNew = dir * lot * 10;
  let s = 2 * sNew;
  while (true) {
    let count = 0;
    while (Math.abs(sNew - s) > 1 && count < 100) {
      s = sNew;
      const f =
        excessMargin(
          s,
          currentCashCC,
          currentPosition,
          currentLockedInValue,
          limitPrice,
          Sm,
          S3,
          totLong,
          totShort,
          targetMarginRate
        ) ** 2;
      const f2 =
        excessMargin(
          s + deltaS,
          currentCashCC,
          currentPosition,
          currentLockedInValue,
          limitPrice,
          Sm,
          S3,
          totLong,
          totShort,
          targetMarginRate
        ) ** 2;
      let ds = (f2 - f) / deltaS;
      sNew = s - f / ds;
      count += 1;
    }
    if (count < 100) {
      break;
    }
    // Newton algorithm failed,
    // choose new starting value
    if (dir > 0) {
      sNew = Math.random() * (maxLong - currentPosition);
    } else {
      sNew = -Math.random() * (Math.abs(maxShort) + currentPosition);
    }
  }
  // ensure trade maximal trade sNew does not exceed
  // the contract limits
  if (currentPosition + sNew < maxShort) {
    sNew = maxShort - currentPosition;
  } else if (currentPosition + sNew > maxLong) {
    sNew = maxLong - currentPosition;
  }
  // round trade size down to lot
  sNew = Math.sign(sNew) * Math.floor(Math.abs(sNew) / lot) * lot;
  return sNew;
}
