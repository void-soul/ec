export default class SetEx<T> extends Set {
  private key: keyof T;
  private onExist?: (oldData: T, newData: T) => void;
  private replaceWhenExits: boolean;
  constructor (
    key: keyof T,
    onExist?: (oldData: T, newData: T) => void,
    replaceWhenExits = false,
    values?: readonly T[] | null
  ) {
    super(values);
    this.onExist = onExist;
    this.key = key;
    this.replaceWhenExits = replaceWhenExits;
  }

  add(value: T): this {
    let flag = false;
    this.forEach((item) => {
      if (item[this.key] === value[this.key]) {
        flag = true;
        if (this.onExist) {
          this.onExist(item, value);
        }
        if (this.replaceWhenExits === true) {
          super.delete(item);
          flag = false;
        }
        return false;
      }
    });
    if (flag === false) {
      super.add(value);
    }
    return this;
  }

  add2(value: T): T {
    let flag = false;
    let tmp = value;
    this.forEach((item) => {
      if (item[this.key] === value[this.key]) {
        flag = true;
        if (this.onExist) {
          this.onExist(item, value);
        }
        if (this.replaceWhenExits === true) {
          super.delete(item);
          flag = false;
        }
        tmp = item;
        return false;
      }
    });
    if (flag === false) {
      super.add(value);
    }
    return tmp;
  }

  /**
   * 用key找到匹配的第一个对象
   * @param {*} value 这是对象的关键属性,而非对象
   * @returns {(T | null)}
   */
  find(value: T[keyof T]): T | null {
    for (const item of this) {
      if (item[this.key] === value) {
        return item;
      }
    }
    return null;
  }

  /**
   * 用key找到匹配的所有对象
   * @param {*} value 这是对象的关键属性,而非对象
   * @returns {T[]}
   */
  findAll(value: T[keyof T]): T[] {
    const res = new Array<T>();
    this.forEach((item) => {
      if (item[this.key] === value) {
        res.push(item);
      }
    });
    return res;
  }

  /**
   *
   * 用函数回调找到匹配的第一个对象
   * @param {(item: T) => boolean} fn
   * @returns {T[]}
   */
  filter(fn: (item: T) => boolean): T | null {
    for (const item of this) {
      if (fn(item) === true) {
        return item;
      }
    }
    return null;
  }

  /**
   *
   * 用函数回调找到匹配的所有对象
   * @param {(item: T) => boolean} fn
   * @returns {T[]}
   */
  filterAll(fn: (item: T) => boolean): T[] {
    const res = new Array<T>();
    this.forEach((item) => {
      if (fn(item) === true) {
        res.push(item);
      }
    });
    return res;
  }

  /**
   *
   * 是否存在key对应的对象
   * @param {*} value 这是对象的关键属性,而非对象
   * @returns {boolean}
   */
  has(value: T[keyof T]): boolean {
    for (const item of this) {
      if (item[this.key] === value) {
        return true;
      }
    }
    return false;
  }

  toArray(): T[] {
    return Array.from(this);
  }

  /**
   *
   * 删除key对应的对象
   * @param {*} value 这是对象的关键属性,而非对象
   * @returns {boolean}
   */
  delete(value: T[keyof T]): boolean {
    for (const item of this) {
      if (item[this.key] === value) {
        super.delete(item);
        return true;
      }
    }
    return false;
  }
}
