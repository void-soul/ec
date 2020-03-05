import {ipcMain} from 'electron';
import JingWindow from '../core/window';
import JingView from '../core/view';

/**
 *
 * @class Proxy
 * @extends {EventEmitter}
 */
export class EventProxy {
  constructor () {
    ipcMain.on('on=jing=window', (_event, id: number, methodName: string, ...args: any[]) => {
      const window = JingWindow.fromId(id);
      if (window) {
        window[`${ methodName }`](...args);
      }
    }).handle('handel=jing=window', async (_event, id: number, methodName: string, ...args: any[]) => {
      const window = JingWindow.fromId(id);
      if (window) {
        return await window[`${ methodName }`](...args);
      }
    });
    ipcMain.on('on=jing=view', (_event, id: number, methodName: string, ...args: any[]) => {
      const view = JingView.fromId(id);
      if (view) {
        view[`${ methodName }`](...args);
      }
    }).handle('handel=jing=view', async (event, id: number, methodName: string, ...args: any[]) => {
      const view = JingView.fromId(id);
      if (view) {
        return await view[`${ methodName }`](...args);
      }
    });
    ipcMain.on('get=id', (event) => {
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
    });
  }

  destroy() {
    JingWindow.getAllJingWindows().forEach(item => {
      item.destroy();
    });
  }
}
