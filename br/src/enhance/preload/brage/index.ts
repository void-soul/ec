import {ipcRenderer} from 'electron';
import {TO_FRONT, DO_BACK, MY_INFO, INVOKE_BACK, SUB, UN_SUB, EXCUTE_BACK} from '@/share/global';
import cloneDeep from 'lodash.clonedeep';
ipcRenderer.send('ddd');
const {windowid, viewid} = {windowid: 0, viewid: 0};
window.brage = {
  windowid,
  viewid,
  activeid() {
    return this.excute(`window-active-view-id-${ windowid }`);
  },
  config(name: string) {
    return this.excute('config', name);
  },

  sub: (channel: string, listener: (event: any, ...args: any[]) => any) => {
    ipcRenderer.send(SUB, channel);
    ipcRenderer.on(channel, listener);
  },
  unsub: (channel: string, listener?: (event: any, ...args: any[]) => any) => {
    if (listener) {
      ipcRenderer.removeListener(channel, listener);
    } else {
      ipcRenderer.removeAllListeners(channel);
    }
    if (ipcRenderer.listenerCount(channel) === 0) {
      ipcRenderer.send(UN_SUB, channel);
    }
  },
  notify: (channel: string, ...args: any[]) => {
    ipcRenderer.send(TO_FRONT, channel, ...args);
  },

  do: (channel: string, ...args: any[]) => {
    ipcRenderer.send(DO_BACK, channel, ...args);
  },

  on: (channel: string, listener: (event: any, ...args: any[]) => any) => {
    ipcRenderer.on(channel, listener);
  },
  off: (channel: string, listener?: (event: any, ...args: any[]) => any) => {
    if (listener) {
      ipcRenderer.removeListener(channel, listener);
    } else {
      ipcRenderer.removeAllListeners(channel);
    }
  },

  invoke: async (channel: string, ...args: any[]) => ipcRenderer.invoke(INVOKE_BACK, channel, ...args),

  excute: (channel: string, ...args: any[]) => ipcRenderer.sendSync(EXCUTE_BACK, channel, ...args),

  cached(...keys: string[]) {
    const data = this.excute('cached', ...keys);
    return cloneDeep(data);
  },
  cacheRemove(...keys: string[]) {
    this.excute('cacheRemove', ...keys);
  },
  cache(target: {[key: string]: any}) {
    this.excute('cache', target);
  },
  cacheHave(key: string) {
    return this.excute('cacheHave', key);
  },
  cacheClear() {
    this.excute('cacheClear');
  },

  windowCached(...keys: string[]) {
    const data = this.excute(`window-cached-${ windowid }`, ...keys);
    return cloneDeep(data);
  },
  windowCacheRemove(...keys: string[]) {
    this.excute(`window-cacheRemove-${ windowid }`, ...keys);
  },
  windowCache(target: {[key: string]: any}) {
    this.excute(`window-cache-${ windowid }`, target);
  },
  windowCacheHave(key: string) {
    return this.excute(`window-cacheHave-${ windowid }`, key);
  },
  windowCacheClear() {
    this.excute(`window-cacheClear-${ windowid }`);
  }
};
