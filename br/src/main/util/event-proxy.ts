import {ipcMain, WebContents, BrowserWindow, BrowserView} from 'electron';
import {ViewOption} from 'plugin-line';
import JingWindow from '@/main/core/window';
import JingView from '@/main/core/view';

/**
 *
 * @class Proxy
 * @extends {EventEmitter}
 */
class Proxy {
  constructor () {
    ipcMain
      .on('open', (event, url: string) => {
        const {window} = this.getWindow(event.sender);
        if (window) {
          window.open(url);
        }
      })
      .on('add', (event, viewOption: ViewOption) => {
        const {window} = this.getWindow(event.sender);
        if (window) {
          window.add(viewOption);
        }
      })
      .on('push', (event, id: number) => {
        const {window} = this.getWindow(event.sender);
        if (window) {
          window.push({id});
        }
      })
      .on('remove', (event, id: number) => {
        const {window} = this.getWindow(event.sender);
        if (window) {
          window.remove({id});
        }
      })
      .on('close', (event, id: number) => {
        const {window} = this.getWindow(event.sender);
        if (window) {
          window.remove({id}, true);
        }
      })
      .on('destroy', (event) => {
        const {window} = this.getWindow(event.sender);
        if (window) {
          window.destroy();
        }
      })
      .on('active', (event, id: number) => {
        const {window} = this.getWindow(event.sender);
        if (window) {
          window.active({id});
        }
      })
      .on('sort', (event, id: number, toIndex: number) => {
        const {window} = this.getWindow(event.sender);
        if (window) {
          window.sort(id, toIndex);
        }
      })
      .on('broadcast', (event, channel: string, ...args: any[]) => {
        const {window} = this.getWindow(event.sender);
        if (window) {
          window.broadcast(channel, ...args);
        }
      })
      .on('loadURL', (event, id: number, url?: string) => {
        const {view} = this.getWindow(event.sender, id);
        if (view) {
          view.loadURL(url);
        }
      })
      .on('print', (event, id: number) => {
        const {view} = this.getWindow(event.sender, id);
        if (view) {
          view.print();
        }
      })
      .on('find', (event, id: number, txt: string, forward: boolean, findNext: boolean) => {
        const {view} = this.getWindow(event.sender, id);
        if (view) {
          view.print();
        }
      })
      .on('stopFindInPage', (event, id: number) => {
        const {view} = this.getWindow(event.sender, id);
        if (view) {
          view.stopFindInPage();
        }
      })
      .on('dev', (event, id: number) => {
        const {view} = this.getWindow(event.sender, id);
        if (view) {
          view.dev();
        }
      })
      .on('goForward', (event, id: number) => {
        const {view} = this.getWindow(event.sender, id);
        if (view) {
          view.goForward();
        }
      })
      .on('goBack', (event, id: number) => {
        const {view} = this.getWindow(event.sender, id);
        if (view) {
          view.goBack();
        }
      })
      .on('stop', (event, id: number) => {
        const {view} = this.getWindow(event.sender, id);
        if (view) {
          view.stop();
        }
      })
      .on('get-views', (event) => {
        const {window} = this.getWindow(event.sender);
        if (window) {
          event.returnValue = window.views.filter(item => item.isDialog === false);
        }
      })
      .on('get-windows', (event) => {
        event.returnValue = JingWindow.getAllJingWindows();
      });
  }

  getWindow(webContent: WebContents, viewId?: number) {
    const window = BrowserWindow.fromWebContents(webContent);
    if (window) {
      return {
        window: JingWindow.fromId(window.id),
        view: viewId ? JingView.fromId(viewId) : null
      };
    } else {
      const view = BrowserView.fromWebContents(webContent);
      if (view) {
        const jingView = JingView.fromId(view.id);
        return {
          window: JingWindow.fromId(jingView.windowId),
          view: viewId ? JingView.fromId(viewId) : jingView
        };
      }
    }
    return {
      window: null,
      view: null
    };
  }

  destroy() {
    JingWindow.getAllJingWindows().forEach(item => {
      item.destroy();
    });
  }
}
export const EventProxy = new Proxy();
