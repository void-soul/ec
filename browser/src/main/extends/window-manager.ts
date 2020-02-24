import {app, BrowserWindow} from 'electron';
import {
  Menu,
  MenuItemConstructorOptions
} from 'electron';
import {EventProxy} from '@/main/native/event-proxy';
import {JingWindow} from '@/main/extends/window';

class WindowViewManager {
  private windows: {[id: number]: JingWindow} | null = {};
  // 当前激活的windowid
  private activeWindowid = 0;
  // windows切换菜单
  private windowSwitchMenu: Menu | null = null;
  // 事件代理
  private eventProxy: EventProxy;
  constructor () {
    this.eventProxy = new EventProxy({
      onExists: () => {
        this.windows = null;
        this.windowSwitchMenu = null;
      }
    });
    this.eventProxy
      .todo('switch-window', (windowid: number, viewid?: number) => {
        const activeWindow = this.get(windowid);
        if (activeWindow) {
          const menus = new Array<MenuItemConstructorOptions>();
          for (const id in this.windows) {
            if (this.windows[id]) {
              const realId = parseInt(id, 10);
              const enabled = realId !== this.activeWindowid;
              menus.push({
                label: `${ this.windows[realId].getTitle() }等${ this.windows[realId].size() }个页面`,
                enabled,
                click: () => this.eventProxy.do(`window-shift-view-${ windowid }`, viewid, realId)
              });
            }
          }
          if (this.windowSwitchMenu) {
            this.windowSwitchMenu = null;
          }
          this.windowSwitchMenu = Menu.buildFromTemplate(menus);
          this.windowSwitchMenu.popup({
            window: activeWindow
          });
        }
      })
      .todo('window-view-focus', ({windowid}: {windowid: number}) => {
        this.activeWindowid = windowid;
      });
    app.on('browser-window-created', (_event: Event, _window: BrowserWindow) => {
      const window = _window as JingWindow;
      const id = window.webContents.id;
      this.windows![id] = window;
      window.on('closed', () => {
        delete this.windows![id];
      });
    });
  }
  get(id?: number) {
    return this.windows![id || this.activeWindowid];
  }
  size() {
    if (this.windows) {
      return Object.values(this.windows).length;
    }
    return 0;
  }
  create(viewOption?: ViewOption) {
    return new JingWindow(viewOption);
  }
}
export default new WindowViewManager();
