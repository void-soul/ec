export = decimal;
declare class decimal {
  // Circular reference from decimal
  static Decimal: any;
  static EUCLID: number;
  static ROUND_CEIL: number;
  static ROUND_DOWN: number;
  static ROUND_FLOOR: number;
  static ROUND_HALF_CEIL: number;
  static ROUND_HALF_DOWN: number;
  static ROUND_HALF_EVEN: number;
  static ROUND_HALF_FLOOR: number;
  static ROUND_HALF_UP: number;
  static ROUND_UP: number;
  static crypto: boolean;
  static maxE: number;
  static minE: number;
  static modulo: number;
  static precision: number;
  static rounding: number;
  static toExpNeg: number;
  static toExpPos: number;
  constructor (v: any);
  static abs(x: any): any;
  static acos(x: any): any;
  static acosh(x: any): any;
  static add(x: any, y: any): any;
  static asin(x: any): any;
  static asinh(x: any): any;
  static atan(x: any): any;
  static atan2(y: any, x: any): any;
  static atanh(x: any): any;
  static cbrt(x: any): any;
  static ceil(x: any): any;
  static clone(obj: any): any;
  static config(obj: any): any;
  static cos(x: any): any;
  static cosh(x: any): any;
  static div(x: any, y: any): any;
  static exp(x: any): any;
  static floor(x: any): any;
  static hypot(...args: any[]): any;
  static isDecimal(obj: any): any;
  static ln(x: any): any;
  static log(x: any, y: any): any;
  static log10(x: any): any;
  static log2(x: any): any;
  static max(...args: any[]): any;
  static min(...args: any[]): any;
  static mod(x: any, y: any): any;
  static mul(x: any, y: any): any;
  static pow(x: any, y: any): any;
  static random(sd: any): any;
  static round(x: any): any;
  static set(obj: any): any;
  static sign(x: any): any;
  static sin(x: any): any;
  static sinh(x: any): any;
  static sqrt(x: any): any;
  static sub(x: any, y: any): any;
  static tan(x: any): any;
  static tanh(x: any): any;
  static trunc(x: any): any;
  abs(): any;
  absoluteValue(): any;
  acos(): any;
  acosh(): any;
  add(y: any): any;
  asin(): any;
  asinh(): any;
  atan(): any;
  atanh(): any;
  cbrt(): any;
  ceil(): any;
  cmp(y: any): any;
  comparedTo(y: any): any;
  cos(): any;
  cosh(): any;
  cosine(): any;
  cubeRoot(): any;
  decimalPlaces(): any;
  div(y: any): any;
  divToInt(y: any): any;
  dividedBy(y: any): any;
  dividedToIntegerBy(y: any): any;
  dp(): any;
  eq(y: any): any;
  equals(y: any): any;
  exp(): any;
  floor(): any;
  greaterThan(y: any): any;
  greaterThanOrEqualTo(y: any): any;
  gt(y: any): any;
  gte(y: any): any;
  hyperbolicCosine(): any;
  hyperbolicSine(): any;
  hyperbolicTangent(): any;
  inverseCosine(): any;
  inverseHyperbolicCosine(): any;
  inverseHyperbolicSine(): any;
  inverseHyperbolicTangent(): any;
  inverseSine(): any;
  inverseTangent(): any;
  isFinite(): any;
  isInt(): any;
  isInteger(): any;
  isNaN(): any;
  isNeg(): any;
  isNegative(): any;
  isPos(): any;
  isPositive(): any;
  isZero(): any;
  lessThan(y: any): any;
  lessThanOrEqualTo(y: any): any;
  ln(): any;
  log(base: any): any;
  logarithm(base: any): any;
  lt(y: any): any;
  lte(y: any): any;
  minus(y: any): any;
  mod(y: any): any;
  modulo(y: any): any;
  mul(y: any): any;
  naturalExponential(): any;
  naturalLogarithm(): any;
  neg(): any;
  negated(): any;
  plus(y: any): any;
  pow(y: any): any;
  precision(z: any): any;
  round(): any;
  sd(z: any): any;
  sin(): any;
  sine(): any;
  sinh(): any;
  sqrt(): any;
  squareRoot(): any;
  sub(y: any): any;
  tan(): any;
  tangent(): any;
  tanh(): any;
  times(y: any): any;
  toBinary(sd: any, rm: any): any;
  toDP(dp: any, rm: any): any;
  toDecimalPlaces(dp: any, rm: any): any;
  toExponential(dp: any, rm: any): any;
  toFixed(dp: any, rm: any): any;
  toFraction(maxD: any): any;
  toHex(sd: any, rm: any): any;
  toHexadecimal(sd: any, rm: any): any;
  toJSON(): any;
  toNearest(y: any, rm: any): any;
  toNumber(): any;
  toOctal(sd: any, rm: any): any;
  toPower(y: any): any;
  toPrecision(sd: any, rm: any): any;
  toSD(sd: any, rm: any): any;
  toSignificantDigits(sd: any, rm: any): any;
  trunc(): any;
  truncated(): any;
  valueOf(): any;
}
