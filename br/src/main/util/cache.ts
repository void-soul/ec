const _cache: {
  [key: string]: any;
} = {};
export class Cache {
  cached (...keys: string[]): {
    [key: string]: any;
  } {
    const result: {
      [key: string]: any;
    } = {};
    for (const key of keys) {
      result[key] = _cache[key];
    }
    return result;
  }

  cacheRemove (...keys: string[]): void {
    for (const key of keys) {
      delete _cache[key];
    }
  }

  cache (target: {
    [key: string]: any;
  } | string, value?: any): void {
    if (typeof target === 'string') {
      _cache[target] = value;
    } else {
      Object.assign(_cache, target);
    }
  }

  cacheHave (key: string): boolean {
    return _cache.hasOwnProperty(key);
  }

  cacheClear (): void {
    const keys = Object.keys(_cache);
    for (const key of keys) {
      delete _cache[key];
    }
  }
}
export const cache = new Cache();
