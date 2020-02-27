import {ipcMain, WebContents, BrowserWindow, BrowserView, FindInPageOptions} from 'electron';
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
    ipcMain.on('on=jing=window', (event, id: number, methodName: string, ...args: any[]) => {
      const window = id ? JingWindow.fromId(id) : JingWindow.fromContentId(event.sender.id);
      if (window) {
        window[`${ methodName }`](...args)
      }
    }).handle('handel=jing=window', async (event, id: number, methodName: string, ...args: any[]) => {
      const window = id ? JingWindow.fromId(id) : JingWindow.fromContentId(event.sender.id);
      if (window) {
        return await window[`${ methodName }`](...args)
      }
    });
    ipcMain.on('on=jing=view', (event, id: number, methodName: string, ...args: any[]) => {
      const view = id ? JingView.fromId(id) : JingView.fromContentId(event.sender.id);
      if (view) {
        view[`${ methodName }`](...args)
      }
    }).handle('handel=jing=view', async (event, id: number, methodName: string, ...args: any[]) => {
      const view = id ? JingView.fromId(id) : JingView.fromContentId(event.sender.id);
      if (view) {
        return await view[`${ methodName }`](...args)
      }
    });
    ipcMain.on('get=id', (event) => {
      const window = JingWindow.fromContentId(event.sender.id);
      if (window) {
        return {
          view: 0,
          window: window.id
        };
      } else {
        const view = JingView.fromContentId(event.sender.id);
        if (view) {
          return {
            window: view.windowId,
            view: view.id
          }
        }
      }
      return {
        view: 0,
        window: 0
      };
    });
  }

  getWindow(webContent: WebContents, id: {window?: number; view?: number}) {
    const window = BrowserWindow.fromWebContents(webContent);
    if (window) {
      return {
        window: id.window ? JingWindow.fromId(window.id) : JingWindow.fromId(window.id),
        view: id.view ? JingView.fromId(id.view) : null
      };
    } else {
      const view = BrowserView.fromWebContents(webContent);
      if (view) {
        const jingView = JingView.fromId(view.id);
        return {
          window: id.window ? JingWindow.fromId(id.window) : JingWindow.fromId(jingView.windowId),
          view: id.view ? JingView.fromId(id.view) : jingView
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
