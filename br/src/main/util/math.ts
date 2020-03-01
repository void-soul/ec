import Decimal from 'decimal.js';

function isNum (a: any): boolean {
  return a !== '' && a !== null && !isNaN(a);
}
export const num = (val: any, def = 0): number => {
  if (!isNum(val)) {
    return def;
  }
  return +val;
};
function filterNumber (array: any[]): number[] {
  const res: number[] = [];
  array.forEach((element) => {
    if (isNum(element)) {
      res.push(+element);
    }
  });
  return res;
}
function filterNumber2 (array: any[]): Decimal[] {
  const res: Decimal[] = [];
  array.forEach((element) => {
    if (isNum(element)) {
      res.push(new Decimal(element));
    }
  });
  return res;
}

export const max = (...args: any[]): number => {
  const arr = filterNumber(args);
  return Math.max.apply(null, arr);
};

export const min = (...args: any[]): number => {
  const arr = filterNumber(args);
  return Math.min.apply(null, arr);
};

export const div = (...args: any[]): number => {
  const arr: Decimal[] = filterNumber2(args);
  if (arr.length > 1) {
    return arr.reduce((a, b) => a.div(b)).toNumber();
  } else if (arr.length > 0) {
    return arr[0].toNumber();
  } else {
    return 0;
  }
};

export const add = (...args: any[]): number => {
  const arr = filterNumber2(args);
  if (arr.length > 1) {
    return arr.reduce((a, b) => a.add(b)).toNumber();
  } else if (arr.length > 0) {
    return arr[0].toNumber();
  } else {
    return 0;
  }
};

export const mul = (...args: any[]): number => {
  const arr = filterNumber2(args);
  if (arr.length > 1) {
    return arr.reduce((a, b) => a.mul(b)).toNumber();
  } else if (arr.length > 0) {
    return arr[0].toNumber();
  } else {
    return 0;
  }
};

export const sub = (...args: any[]): number => {
  const arr = filterNumber2(args);
  if (arr.length > 1) {
    return arr.reduce((a, b) => a.sub(b)).toNumber();
  } else if (arr.length > 0) {
    return arr[0].toNumber();
  } else {
    return 0;
  }
};

const roundMode = [Decimal.ROUND_HALF_UP, Decimal.ROUND_UP, Decimal.ROUND_DOWN];
export const round = (number: any, numDigits: number, upOrDown = 0): number => {
  if (isNum(number)) {
    const nu = new Decimal(number);
    return nu.toDP(numDigits, roundMode[upOrDown]).toNumber();
  } else {
    return 0;
  }
};

export enum MoneyStyle {
  currency = 'currency',
  decimal = 'decimal',
  percent = 'percent'
}

export const money = (
  value: any,
  style: MoneyStyle = MoneyStyle.currency,
  currency = 'CNY',
  prefix = 2,
  def = 0
): string => (isNum(value) ? value : def).toLocaleString('zh', {
  style,
  currency,
  minimumFractionDigits: prefix
});

export class Bus {
  private result: number;
  constructor (result) {
    this.result = num(result);
  }

  add (...args: any[]): this {
    this.result = add(this.result, ...args);
    return this;
  }

  sub (...args: any[]): this {
    this.result = sub(this.result, ...args);
    return this;
  }

  div (...args: any[]): this {
    this.result = div(this.result, ...args);
    return this;
  }

  mul (...args: any[]): this {
    this.result = mul(this.result, ...args);
    return this;
  }

  max (...args: any[]): this {
    this.result = max(this.result, ...args);
    return this;
  }

  min (...args: any[]): this {
    this.result = min(this.result, ...args);
    return this;
  }

  ac (): this {
    this.result = sub(0, this.result);
    return this;
  }

  abs (): this {
    this.result = Math.abs(this.result);
    return this;
  }

  round (numDigits: number, upOrDown?: number): this {
    this.result = round(this.result, numDigits, upOrDown);
    return this;
  }

  over (): number {
    return this.result;
  }

  money (
    style?: MoneyStyle,
    currency?: string,
    prefix?: number,
    def?: number
  ): string {
    return money(this.result, style, currency, prefix, def);
  }
}

export const calc = (result: any) => new Bus(result);
