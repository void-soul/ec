import {APP_EXISTS} from '@/share/global';
import {EventProxy} from '@/main/native/event-proxy';

const _cache: {
  [key: string]: any;
} = {};
export class Cache {
  cached(...keys: string[]): {
    [key: string]: any
  } {
    const result: {
      [key: string]: any
    } = {};
    for (const key of keys) {
      result[key] = _cache[key];
    }
    return result;
  }
  cacheRemove(...keys: string[]): void {
    for (const key of keys) {
      delete _cache[key];
    }
  }
  cache(target: {
    [key: string]: any
  }): void {
    Object.assign(_cache, target);
  }
  cacheHave(key: string): boolean {
    return _cache.hasOwnProperty(key);
  }
  cacheClear(): void {
    const keys = Object.keys(_cache);
    for (const key of keys) {
      delete _cache[key];
    }
  }
  destroy() {
    this.cacheClear();
  }
}
export const cache = new Cache();

const eventProxy = new EventProxy({
  onExists: () => cache.destroy()
});
eventProxy
  .excute('cached', (...keys: string[]) => cache.cached(...keys))
  .excute('cacheRemove', (...keys: string[]) => cache.cacheRemove(...keys))
  .excute('cache', (target: {[key: string]: any}) => cache.cache(target))
  .excute('cacheHave', (key: string) => cache.cacheHave(key))
  .excute('cacheClear', () => cache.cacheClear());
