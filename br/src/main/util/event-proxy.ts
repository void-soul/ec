import {ipcMain, WebContents, BrowserWindow, BrowserView} from 'electron';
import JingWindow from '@/main/core/window';
import JingView from '@/main/core/view';

/**
 *
 * @class Proxy
 * @extends {EventEmitter}
 */
export class EventProxy {
  constructor () {
    ipcMain.on('on=jing=window', (event, id: number, methodName: string, ...args: any[]) => {
      const window = id ? JingWindow.fromId(id) : JingWindow.fromContentId(event.sender.id);
      if (window) {
        window[`${ methodName }`](...args);
      }
    }).handle('handel=jing=window', async (event, id: number, methodName: string, ...args: any[]) => {
      const window = id ? JingWindow.fromId(id) : JingWindow.fromContentId(event.sender.id);
      if (window) {
        return await window[`${ methodName }`](...args);
      }
    });
    ipcMain.on('on=jing=view', (event, id: number, methodName: string, ...args: any[]) => {
      const view = id ? JingView.fromId(id) : JingView.fromContentId(event.sender.id);
      if (view) {
        view[`${ methodName }`](...args);
      }
    }).handle('handel=jing=view', async (event, id: number, methodName: string, ...args: any[]) => {
      const view = id ? JingView.fromId(id) : JingView.fromContentId(event.sender.id);
      if (view) {
        return await view[`${ methodName }`](...args);
      }
    });
    ipcMain.on('get=id', (event) => {
      const window = JingWindow.fromContentId(event.sender.id);
      if (window) {
        event.returnValue = {
          viewid: undefined,
          windowid: window.id
        };
      } else {
        const view = JingView.fromContentId(event.sender.id);
        if (view) {
          event.returnValue = {
            windowid: view.windowId,
            viewid: view.id
          };
        } else {
          event.returnValue = {
            viewid: undefined,
            windowid: undefined
          };
        }
      }
    });
  }

  destroy() {
    JingWindow.getAllJingWindows().forEach(item => {
      item.destroy();
    });
  }
}
