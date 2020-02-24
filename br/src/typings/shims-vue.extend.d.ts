import Vue from 'vue';
import {QVueGlobals} from 'quasar';
declare module 'vue/types/vue' {
  interface Vue {
    $q: QVueGlobals;
    $mac: boolean;
    $dev: boolean;
    $get: (url: string, params?: any, handelErrorAuto?: boolean) => Promise<any>;
    $post: (url: string, params?: any, handelErrorAuto?: boolean) => Promise<any>;
    $put: (url: string, params?: any, handelErrorAuto?: boolean) => Promise<any>;
    $del: (url: string, params?: any, handelErrorAuto?: boolean) => Promise<any>;
  }
}

declare global {
  interface Window {
    brage: {
      /** 当前所在视窗id */
      windowid: number;
      /** 当前所在窗体id */
      viewid?: number;
      /** 当前活动窗体id */
      activeid: () => number;

      /** 获取系统配置 */
      config: (name: string) => string;


      /** 当前页面订阅一个通知,此后通过notivy发送消息时可收到 */
      sub: (channel: string, listener: (event: any, ...args: any[]) => void) => void;
      /** 取消订阅通知 */
      unsub: (channel: string, listener?: (event: any, ...args: any[]) => void) => void;
      /** 向前台对象发送 */
      notify: (channel: string, ...args: any[]) => void;

      /** 监听本页面事件 */
      on: (channel: string, listener: (event: any, ...args: any[]) => void) => void;
      /** 取消本页面监听事件 */
      off: (channel: string, listener?: (event: any, ...args: any[]) => void) => void;

      /** 调用后台对象方法，无返回值、无promise */
      do: (channel: string, ...args: any[]) => void;

      /** 调用后台对象方法，有返回值、有promise */
      invoke: (channel: string, ...args: any[]) => Promise<any>;

      /** 调用后台对象方法，有返回值、无promise */
      excute: (channel: string, ...args: any[]) => any;


      /** 全局缓存：取 */
      cached(...keys: string[]): {[key: string]: any};
      /** 全局缓存：删 */
      cacheRemove(...keys: string[]): void;
      /** 全局缓存：存 */
      cache(target: {[key: string]: any}): void;
      /** 全局缓存：验 */
      cacheHave(key: string): boolean;
      /** 全局缓存：清 */
      cacheClear(): void;


      /** 当前视窗缓存：取 */
      windowCached(...keys: string[]): {[key: string]: any};
      /** 当前视窗缓存：删 */
      windowCacheRemove(...keys: string[]): void;
      /** 当前视窗缓存：存 */
      windowCache(target: {[key: string]: any}): void;
      /** 当前视窗缓存：验 */
      windowCacheHave(key: string): boolean;
      /** 当前视窗缓存：清 */
      windowCacheClear(): void;
    };
  }
}
