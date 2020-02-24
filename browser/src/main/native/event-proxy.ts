import {EventEmitter} from 'events';
import {ipcMain, webContents, WebContents, IpcMainInvokeEvent, IpcMainEvent, BrowserView} from 'electron';
import {APP_EXISTS, TO_FRONT, DO_BACK, INVOKE_BACK, MY_INFO, SUB, UN_SUB, EXCUTE_BACK} from '@/share/global';
import {JingView} from '@/main/extends/view';
import log from 'electron-log';
/**
 *
 * 广播：向前端发送消息
 *      ipcRender进行订阅
 *      订阅后ipcRender会收到ipcMain发出的同名通道消息
 *      ipcMain发消息需要调用 notify 方法
 *      前端也可以发消息，但需要调用自己后端的notify方法
 *      sub/unsub/notify
 *
 * 通知：向后端发送消息
 *      ==============================================无返回值
 *      一次发送，可多处接收
 *      on/off/once/emit
 *
 * 调用：向后端发送消息
 *    有返回值
 *    一个事件一个接收
 *    可得到接收处理的返回值
 *    hand/unhand/handle
 *
 * @class EventBus
 * @extends {EventEmitter}
 */
class EventBus extends EventEmitter {
  /**
   *
   * 通知调度缓存
   * key=通道
   * value=订阅了通知的webcontents的id数组
   * @private
   * @type {({[channel: string]: Set<number>} | null)}
   * @memberof EventBus
   */
  private notifyDispatch: {[channel: string]: Set<number>} | null;
  /**
   *
   * 异步调用调度缓存
   * key=名称
   * value=调度响应方法
   * @private
   * @memberof EventBus
   */
  private invokeDispatch: {[name: string]: (...args: any[]) => Promise<any>} | null;
  /**
   *
   * 同步调用调度缓存
   * key=名称
   * value=调度响应方法
   * @private
   * @memberof EventBus
   */
  private excuteDispatch: {[name: string]: (...args: any[]) => Promise<any>} | null;
  /**
   *
   * 事件代理缓存
   * @private
   * @type {({[id: string]: EventProxy} | null)}
   * @memberof EventBus
   */
  private proxyCache: {[id: string]: EventProxy} | null;

  constructor () {
    super();
    this.setMaxListeners(0);
    this.notifyDispatch = {};
    this.invokeDispatch = {};
    this.excuteDispatch = {};
    this.proxyCache = {};
    this.once(APP_EXISTS, () => {
      this.notifyDispatch = null;
      this.invokeDispatch = null;
      ipcMain.removeAllListeners();
      this.removeAllListeners();
    });
    ipcMain
      .on(TO_FRONT, (_event: IpcMainEvent, channel: string, ...args: any[]) => this.notify(channel, ...args))
      .on(DO_BACK, (_event: IpcMainEvent, channel: string, ...args: any[]) => this.emit(channel, ...args))
      .on(SUB, (event: IpcMainEvent, channel: string) => this.sub(event.sender.id, channel))
      .on(UN_SUB, (event: IpcMainEvent, channel: string) => this.unsub(event.sender.id, channel))
      .on(EXCUTE_BACK, (event: IpcMainEvent, channel: string, ...args: any[]) => {
        if (this.excuteDispatch && this.excuteDispatch[channel]) {
          event.returnValue = this.excuteDispatch[channel](...args);
        }
      })
      .on(MY_INFO, (event: IpcMainEvent) => {
        const view = BrowserView.fromWebContents(event.sender);
        if (view) {
          const realView = view as JingView;
          event.returnValue = {
            viewid: event.sender.id,
            windowid: realView.option.windowid
          };
        } else {
          event.returnValue = {
            windowid: event.sender.id
          };
        }
      });
    ipcMain.handle(INVOKE_BACK, async (_event: IpcMainInvokeEvent, channel: string, ...args: any[]) => {
      if (this.invokeDispatch && this.invokeDispatch[channel]) {
        return await this.invokeDispatch[channel](...args);
      }
    });
  }
  sub(id: number, channel: string) {
    if (this.notifyDispatch) {
      if (!this.notifyDispatch[channel]) {
        this.notifyDispatch[channel] = new Set();
      }
      this.notifyDispatch[channel].add(id);
    }
  }
  unsub(id: number, channel?: string) {
    if (this.notifyDispatch) {
      if (channel) {
        this.notifyDispatch[channel].delete(id);
      } else {
        for (const [c, v] of Object.entries(this.notifyDispatch)) {
          v.delete(id);
        }
      }
    }
  }

  handle(channel: string, fn: (...args: any[]) => Promise<any>) {
    this.invokeDispatch![channel] = fn;
    return this;
  }
  handleOff(channel: string) {
    delete this.invokeDispatch![channel];
    return this;
  }
  excute(channel: string, fn: (...args: any[]) => Promise<any>) {
    this.excuteDispatch![channel] = fn;
    return this;
  }
  excuteOff(channel: string) {
    delete this.excuteDispatch![channel];
    return this;
  }
  /**
   * 广播一个事件
   * @param channel
   * @param args
   */
  notify(channel: string, ...args: any[]) {
    log.error(`[notify] ${ channel } -> ${ this.notifyDispatch && this.notifyDispatch[channel] }`);
    if (this.notifyDispatch && this.notifyDispatch[channel]) {
      for (const id of this.notifyDispatch[channel]) {
        const item = webContents.fromId(id);
        if (item) {
          item.send(channel, ...args);
        }
      }
    }
  }

  /**
   *
   * 注册proxy
   * @param {string} cid
   * @param {EventProxy} proxy
   * @memberof EventBus
   */
  reg(cid: string, proxy: EventProxy) {
    if (this.proxyCache) {
      this.proxyCache[cid] = proxy;
    }
  }

  /**
   *
   * 反注册proxy
   * @param {string} cid
   * @param {EventProxy} proxy
   * @memberof EventBus
   */
  unreg(cid: string) {
    if (this.proxyCache) {
      delete this.proxyCache[cid];
    }
  }
}
const eventBus = new EventBus();
export class EventProxy {
  private cid: number;
  private handels: Set<string>;
  private excutes: Set<string>;
  private webContent?: WebContents;
  constructor ({webContent, onExists}: {webContent?: WebContents; onExists?: () => void}) {
    this.cid = webContent ? webContent.id : Math.random();
    this.webContent = webContent;
    this.handels = new Set<string>();
    this.excutes = new Set<string>();
    eventBus.prependOnceListener(APP_EXISTS, () => {
      this.unsub();
      for (const key of this.handels) {
        eventBus.handleOff(key);
      }
      for (const key of this.excutes) {
        eventBus.excuteOff(key);
      }
      this.handels.clear();
      eventBus.unreg(`${ this.cid }`);
      if (onExists) {
        onExists();
      }
    });
    eventBus.reg(`${ this.cid }`, this);
  }
  /**
   *
   * 当前页面订阅一个通知,此后通过notivy发送消息时可收到
   * @param {string} channel
   * @returns
   * @memberof EventProxy
   */
  sub(channel: string) {
    eventBus.sub(this.cid, channel);
    return this;
  }
  /**
   *
   * 取消订阅通知
   * @param {string} [channel]
   * @returns
   * @memberof EventProxy
   */
  unsub(channel?: string) {
    eventBus.unsub(this.cid, channel);
    return this;
  }
  /**
   *
   * 后台对象注册方法以供其他地方调用,无返回值、无Promise
   * @param {string } event
   * @param {(...args: any[]) => void} listener
   * @returns
   * @memberof EventProxy
   */
  todo(channel: string | string[], listener: (...args: any[]) => void) {
    if (typeof channel === 'string') {
      eventBus.prependListener(channel, listener);
    } else {
      for (const cha of channel) {
        eventBus.prependListener(cha, listener);
      }
    }
    return this;
  }
  /**
   *
   * 后台对象注册方法以供其他地方调用, 有返回值、有Promise
   * @param {string } event
   * @param {(...args: any[]) => void} listener
   * @returns
   * @memberof EventProxy
   */
  handle(channel: string, listener: (...args: any[]) => Promise<any>) {
    eventBus.handle(channel, listener);
    this.handels.add(channel);
    return this;
  }
  /**
   *
   * 后台对象注册方法以供其他地方调用, 有返回值、无Promise
   * @param {string } event
   * @param {(...args: any[]) => void} listener
   * @returns
   * @memberof EventProxy
   */
  excute(channel: string, listener: (...args: any[]) => any) {
    eventBus.excute(channel, listener);
    this.excutes.add(channel);
    return this;
  }
  /**
   *
   * 向自己的前端发送消息
   * @param {string} channel
   * @param {...any[]} args
   * @memberof EventProxy
   */
  send(channel: string, ...args: any[]) {
    if (this.webContent) {
      this.webContent.send(channel, ...args);
    }
  }
  /**
   *
   * 调用后台对象方法
   * @param {string } event
   * @param {...any[]} args
   * @returns
   * @memberof EventProxy
   */
  do(event: string, ...args: any[]) {
    log.error(`[do] ${ event }`);
    return eventBus.emit(event, ...args);
  }
  /**
   * 向前台对象发送
   * @param {string} channel
   * @param {...any[]} args
   * @memberof EventProxy
   */
  notify(channel: string, ...args: any[]) {
    eventBus.notify(channel, ...args);
  }
}
