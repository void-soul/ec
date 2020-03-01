
import StoreEle from 'electron-store';
const _store = new StoreEle();
class Store {
  store (key: string, value: any): void {
    _store.set(key, value);
  }

  stored (key: string, defValue?: any): any {
    return _store.get(key, defValue);
  }

  storeHave (key: string): boolean {
    return _store.has(key);
  }

  storeRemove (key: string): void {
    return _store.delete(key);
  }

  storeClear (): void {
    _store.clear();
  }
}
export const store = new Store();
