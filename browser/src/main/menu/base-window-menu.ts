import {Menu, MenuItemConstructorOptions, clipboard, ContextMenuParams} from 'electron';
import {getConfig} from '@/main/rs/config';
import manager from '@/main/extends/window-manager';
import {EventProxy} from '@/main/native/event-proxy';
import {JingWindow} from '@/main/extends/window';
/**
 *
 * 快捷键菜单
 * 仅作用与当前视窗
 * @class ContextMenu
 */
export abstract class BaseContextMenu {
  // 事件代理
  protected eventProxy: EventProxy;
  // 选项卡\页面通用右键菜单
  private windowContextMenu: Menu | null = null;
  private activeWindowid = 0;
  private activeViewid = 0;
  constructor () {
    this.eventProxy = new EventProxy({onExists: () => this.windowContextMenu = null});
  }
  protected initMenus({windowid, viewid}: {windowid: number; viewid?: number}, open = false) {
    const window = manager.get(windowid);
    const {index, view, id} = window.find({id: viewid || window.actionid});
    this.activeWindowid = windowid;
    this.activeViewid = viewid || id;
    this.switchContextMenu(window.size() > 1 && view!.option.close === true, 'shift');
    this.switchContextMenu(manager.size() > 1 && view!.option.close === true, 'switch');
    this.switchContextMenu(view!.option.url!.trustServer === false && view!.option.url!.buildIn === false, 'chromeBrowserView', 'copyBrowserViewUri');
    this.switchContextMenu(window.size() > 1 && view!.option.url!.buildIn === false, 'copy', 'shift', 'switch');
    this.switchContextMenu(view!.option.free === false, 'foundInPage', 'print', 'free');
    this.switchContextMenu(view!.option.close === true, 'remove');
    this.switchContextMenu(window.size() > 1, 'removeOthers');
    this.switchContextMenu(window.size() - 1 > index, 'removeToRight');
    this.switchContextMenu(index > 0, 'removeToLeft');
    this.switchContextMenu(view!.webContents.canGoForward() && view!.option.free === false, 'forwardBrowserView');
    this.switchContextMenu(view!.webContents.canGoBack() && view!.option.free === false, 'backBrowserView');
    if (open === true) {
      this.windowContextMenu!.popup({window});
    }
  }
  protected initWindowContextMenu(isQuick: boolean) {
    let menus: MenuItemConstructorOptions[];
    if (process.platform === 'darwin' && isQuick) {
      menus = [
        {label: '选项卡', submenu: this.initFileMenu()},
        {label: '历史', submenu: this.initHistoryMenu()},
        {label: '编辑', submenu: this.initEditMenu()}
      ];
      if (getConfig('VUE_APP_DEV') === '1') {
        menus.push({label: '开发', submenu: this.initDevMenu()});
      }
    } else if (getConfig('VUE_APP_DEV') === '1') {
      menus = [...this.initHistoryMenu(), ...this.initFileMenu(), ...this.initDevMenu()];
    } else {
      menus = [...this.initHistoryMenu(), ...this.initFileMenu()];
    }
    const menu = Menu.buildFromTemplate(menus);
    if (isQuick) {
      Menu.setApplicationMenu(menu);
    }
    this.windowContextMenu = menu;
  }
  private initFileMenu(): MenuItemConstructorOptions[] {
    return [
      {
        label: '新窗口中打开',
        id: 'shift',
        accelerator: 'Alt+Z',
        click: () => this.eventProxy.do(`window-shift-view-${ this.activeWindowid }`, this.activeViewid)
      },
      {
        label: '换到另一个窗口',
        accelerator: 'Alt+X',
        id: 'switch',
        click: () => this.eventProxy.do('switch-window', this.activeWindowid, this.activeViewid)
      },
      {
        label: '在其他浏览器中打开',
        id: 'chromeBrowserView',
        accelerator: 'Alt+A',
        click: () => this.eventProxy.do(`chrome-view-${ this.activeViewid }`)
      },
      {
        label: '复制页面地址',
        id: 'copyBrowserViewUri',
        accelerator: 'Alt+C',
        click: () => this.eventProxy.do(`view-copy-url-${ this.activeViewid }`)
      },
      {
        label: '复制视窗',
        id: 'copy',
        accelerator: 'Alt+V',
        click: () => this.eventProxy.do(`window-copy-view-${ this.activeWindowid }`, this.activeViewid)
      },
      {
        label: '关闭',
        id: 'remove',
        accelerator: 'Alt+Q',
        click: () => this.eventProxy.do(`window-remove-view-${ this.activeWindowid }`, this.activeViewid)
      },
      {
        label: '关闭其他标签页',
        id: 'removeOthers',
        click: () => this.eventProxy.do(`window-remove-other-view-${ this.activeWindowid }`, this.activeViewid)
      },
      {
        label: '关闭右侧标签页',
        id: 'removeToRight',
        click: () => this.eventProxy.do(`window-remove-right-view-${ this.activeWindowid }`, this.activeViewid)
      },
      {
        label: '关闭左侧标签页',
        id: 'removeToLeft',
        click: () => this.eventProxy.do(`window-remove-left-view-${ this.activeWindowid }`, this.activeViewid)
      },
      {
        label: '切换显示',
        accelerator: 'Alt+S',
        id: 'beginSwitch',
        click: () => this.eventProxy.do(`dialog-show-${ this.activeWindowid }-switch`)
      }
    ];
  }
  private initHistoryMenu(): MenuItemConstructorOptions[] {
    return [
      {
        label: '刷新',
        id: 'refreshBrowserView',
        accelerator: 'F5',
        click: () => this.eventProxy.do(`view-refresh-${ this.activeViewid }`)
      },
      {
        label: '搜索',
        id: 'foundInPage',
        accelerator: 'CmdOrCtrl+F',
        click: () => this.eventProxy.do(`dialog-show-${ this.activeWindowid }-find`)
      },
      {
        label: '前进',
        accelerator: 'Alt+Right',
        id: 'forwardBrowserView',
        click: () => this.eventProxy.do(`view-forward-${ this.activeViewid }`)
      },
      {
        label: '后退',
        accelerator: 'Alt+Left',
        id: 'backBrowserView',
        click: () => this.eventProxy.do(`view-back-${ this.activeViewid }`)
      },
      {
        label: '打印',
        id: 'print',
        accelerator: 'CmdOrCtrl+P',
        click: () => this.eventProxy.do(`view-print-${ this.activeViewid }`)
      },
      {
        label: '冻结',
        id: 'free',
        accelerator: 'CmdOrCtrl+H',
        click: () => this.eventProxy.do(`view-free-${ this.activeViewid }`)
      },
      {
        label: '关闭活动弹框',
        accelerator: 'Escape',
        id: 'escape',
        click: () => this.eventProxy.do(`window-hide-all-dialog-${ this.activeWindowid }`)
      }
    ];
  }
  private initEditMenu(): MenuItemConstructorOptions[] {
    return [
      {
        label: '复制',
        accelerator: 'Command+C',
        role: 'copy'
      },
      {
        label: '粘贴',
        accelerator: 'Command+V',
        role: 'paste'
      },
      {
        label: '粘贴为文本',
        role: 'pasteAndMatchStyle',
        accelerator: 'Shift+Command+V'
      },
      {
        label: '全选',
        accelerator: 'Command+A',
        role: 'selectAll'
      },
      {
        label: '删除',
        accelerator: 'Delete',
        role: 'delete'
      },
      {
        label: '剪切',
        accelerator: 'Command+X',
        role: 'cut'
      },
      {
        label: '撤销',
        accelerator: 'Command+Z',
        role: 'undo'
      },
      {
        label: '重做',
        accelerator: 'Shift+Command+Z',
        role: 'redo'
      }
    ];
  }
  private initDevMenu(): MenuItemConstructorOptions[] {
    return [
      {
        label: '开发者工具',
        id: 'devBrowserView',
        accelerator: 'F12',
        click: () => this.eventProxy.do(`view-dev-${ this.activeViewid }`)
      }
    ];
  }
  private switchContextMenu(enabled: boolean, ...ids: string[]) {
    for (const id of ids) {
      const menu = this.windowContextMenu!.getMenuItemById(id);
      menu.enabled = menu.visible = enabled;
    }
  }
}
