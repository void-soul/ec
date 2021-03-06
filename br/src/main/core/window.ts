import {imageManager, devToolSwitch, getConfig, newViewOption, windowPreferences, windowUrl} from '@/main/util';
import {DEF_VIEW_POINT, TOOLBAR_HEIGHT} from '@/main/util/global';
import {BrowserWindow, BrowserView, ContextMenuParams, webContents} from 'electron';
import {ViewOption, ViewQuery, ViewFound} from 'plugin-line';
import JingView from '@/main/core/view';
import {jingApp} from './app';

const JINGWIN_WINID: {[id: number]: JingWindow} = {};
const JINGWIN_CONID: {[id: number]: JingWindow} = {};
let ACTIVE_WINID = 0;

export default class JingWindow {
  id: number;
  webContentId: number;
  views: JingView[] = [];
  buildInViews: JingView[] = [];
  activeId = 0;
  constructor () {
    // 初始化窗体
    const window = new BrowserWindow({
      frame: false,
      useContentSize: true,
      transparent: false,
      autoHideMenuBar: true,
      title: getConfig('VUE_APP_TITLE'),
      icon: imageManager.getWindowIcon(),
      webPreferences: windowPreferences,
      show: false
    });
    this.id = window.id;
    this.webContentId = window.webContents.id;
    JINGWIN_WINID[window.id] = this;
    JINGWIN_CONID[this.webContentId] = this;
    if (ACTIVE_WINID === 0) {
      ACTIVE_WINID = this.id;
    }
    // 窗体事件初始化
    window
      .once('ready-to-show', () => {
        window.show();
        window.maximize();
        devToolSwitch(window.webContents);
      })
      .on('focus', () => {
        ACTIVE_WINID = this.id;
      })
      .once('close', () => this.destroy())
      .webContents.on('context-menu', (_event: Event, _params: ContextMenuParams) => {
      });
    window.loadURL(windowUrl.fullUrl);
  }

  static fromId(id: number) {
    return JINGWIN_WINID[id];
  }

  static fromContentId(id: number) {
    return JINGWIN_CONID[id];
  }

  static getAllJingWindows() {
    return Object.values(JINGWIN_WINID);
  }

  static getFocusedWindow() {
    return JINGWIN_WINID[ACTIVE_WINID];
  }
  /** 右键菜单 */
  contextMenu(viewId: number) {
    jingApp.windowContext(this, JingView.fromId(viewId));
  }

  open(url: string) {
    this.add(false, {
      ...newViewOption,
      url
    });
  }

  add(buildIn: boolean, viewOption: ViewOption) {
    // 检查url是否重复
    let {view} = this.find(buildIn, {url: viewOption.url});
    // 不重复则调用add
    if (!view) {
      view = new JingView(viewOption);
      this.push(buildIn, {view});
    }
    view.loadURL();
    // 判断viewMode决定是否激活
    if (view.viewMode !== 'CurrentWindowHide') {
      this.active({view});
    }
  }

  push(buildIn: boolean, query: ViewQuery) {
    const jingView = query.view || JingView.fromId(query.id!);
    if (jingView) {
      jingView.windowId = this.id;
      jingView.isBuildIn = buildIn;
      if (buildIn) {
        this.buildInViews.push(jingView);
      } else {
        this.views.push(jingView);
        this.notice('add-view', jingView);
      }
    }
  }

  remove(buildIn: boolean, query?: ViewQuery, close?: boolean) {
    const {index, view} = this.find(buildIn, query);
    const next = this.find(buildIn, {
      ...query,
      next: true
    });
    if (view) {
      if (buildIn) {
        this.buildInViews.splice(index, 1);
      } else {
        this.views.splice(index, 1);
        this.notice('remove-view', view.id);
      }
      if (close === true) {
        view.destroy(true);
        this.active({id: next.id});
      }
    }
  }

  destroy() {
    const window = BrowserWindow.fromId(this.id);
    if (window && window.isDestroyed() === false) {
      window.destroy();
    }
    for (const view of this.views) {
      view.destroy();
    }
    this.views.splice(0, this.views.length);
    for (const view of this.buildInViews) {
      view.destroy();
    }
    this.buildInViews.splice(0, this.buildInViews.length);
    delete JINGWIN_WINID[this.id];
    delete JINGWIN_CONID[this.webContentId];
  }

  active(query?: ViewQuery) {
    const {view} = this.find(true, query);
    if (view) {
      const window = BrowserWindow.fromId(this.id);
      const browserView = BrowserView.fromId(view.id);
      switch (view.viewMode) {
        case 'CurrentWindowShow':
        case 'CurrentWindowHide':
        case 'NewWindow':
          if (this.activeId !== view.id) {
            this.hideBuildIn();
            this.activeId = view.id;
            window.setBrowserView(browserView);
            this.point(view, browserView, window);
            view.viewMode = 'CurrentWindowShow';
            this.notice('active-view', view.id);
          }
          break;
        case 'DialogFullHeight':
        case 'DialogFullWidth':
          this.hideBuildIn();
          window.addBrowserView(browserView);
          this.point(view, browserView, window);
          break;
      }
    }
  }

  hideBuildIn(query?: ViewQuery) {
    const window = BrowserWindow.fromId(this.id);
    if (query && query.id) {
      window.removeBrowserView(BrowserView.fromId(query.id));
    } else {
      for (const buildInView of this.buildInViews) {
        window.removeBrowserView(BrowserView.fromId(buildInView.id));
      }
    }
  }

  sort(id: number, toIndex: number) {
    const {index} = this.find(true, {id});
    this.views.splice(toIndex, 0, ...this.views.splice(index, 1));
  }

  notice(channel: string, ...args: any[]) {
    for (const view of this.buildInViews) {
      if (view.isBuildIn) {
        webContents.fromId(view.webContentId).send(channel, ...args);
      }
    }
    webContents.fromId(this.webContentId).send(channel, ...args);
  }

  broadcast(channel: string, ...args: any[]) {
    for (const view of this.views) {
      if (view.isBuildIn === false) {
        webContents.fromId(view.webContentId).send(channel, ...args);
      }
    }
  }

  find(buildIn: boolean, query?: ViewQuery): ViewFound {
    let index = -1;
    if (!query || (!query.id && !query.url && !query.view)) {
      query = {id: this.activeId};
    }
    if (buildIn) {
      if (query.id) {
        index = this.buildInViews.findIndex((item) => item.id === query!.id);
      } else if (query.url) {
        index = this.buildInViews.findIndex((item) => item.url.urlStr === query!.url);
      } else if (query.view) {
        index = this.buildInViews.findIndex((item) => item.id === query!.view!.id);
      }
      if (index > -1) {
        return {
          id: this.buildInViews[index].id,
          index,
          view: this.buildInViews[index]
        };
      } else {
        return {
          id: -1,
          index,
          view: null
        };
      }
    } else {
      if (query.id) {
        index = this.views.findIndex((item) => item.id === query!.id);
      } else if (query.url) {
        index = this.views.findIndex((item) => item.url.urlStr === query!.url);
      } else if (query.view) {
        index = this.views.findIndex((item) => item.id === query!.view!.id);
      }
      if (query.next === true) {
        index = index < this.views.length - 1 ? index++ : Math.max(index--, 0);
      } else if (query.prev === true) {
        index = index > 0 ? index-- : Math.min(index++, this.views.length - 1);
      }
      if (index > -1) {
        return {
          id: this.views[index].id,
          index,
          view: this.views[index]
        };
      } else {
        return {
          id: -1,
          index,
          view: null
        };
      }
    }
  }

  getViews() {
    return this.views;
  }

  getIds() {
    return {
      id: this.id,
      webContentId: this.webContentId,
      activeId: this.activeId
    }
  }

  toggle() {
    const win = BrowserWindow.fromId(this.id);
    if (win.isMaximized()) {
      win.unmaximize();
    } else {
      win.maximize();
    }
  }

  minimize() {
    BrowserWindow.fromId(this.id).minimize();
  }

  setFullScreen(flag: boolean) {
    BrowserWindow.fromId(this.id).setFullScreen(flag);
  }

  center() {
    BrowserWindow.fromId(this.id).center();
  }

  setTitle(title: string) {
    BrowserWindow.fromId(this.id).setTitle(title);
  }

  flashFrame(flag: boolean) {
    BrowserWindow.fromId(this.id).flashFrame(flag);
  }

  /** 初始化view的位置信息 */
  private point(jingView: JingView, view: BrowserView, window: BrowserWindow) {
    if (jingView.hasSetPointed === false) {
      jingView.hasSetPointed = true;
      const bounds = window.getBounds();
      switch (jingView.viewMode) {
        case 'CurrentWindowShow':
        case 'CurrentWindowHide':
          jingView.viewMode = 'CurrentWindowShow';
        case 'NewWindow':
          view.setBounds({x: 0, y: TOOLBAR_HEIGHT, height: bounds.height - TOOLBAR_HEIGHT, width: bounds.width});
          break;
        case 'DialogFullHeight':
          view.setAutoResize({height: true});
          view.setBounds({x: jingView.point.x || DEF_VIEW_POINT.x, y: TOOLBAR_HEIGHT, height: bounds.height - TOOLBAR_HEIGHT, width: jingView.point.width || DEF_VIEW_POINT.width});
          break;
        case 'DialogFullWidth':
          view.setAutoResize({width: true});
          view.setBounds({x: 0, y: jingView.point.y || DEF_VIEW_POINT.y, height: jingView.point.height || DEF_VIEW_POINT.height, width: bounds.width});
          break;
        case 'Dialog':
          view.setBounds({x: jingView.point.x || DEF_VIEW_POINT.x, y: jingView.point.y || DEF_VIEW_POINT.y, height: jingView.point.height || DEF_VIEW_POINT.height, width: jingView.point.width || DEF_VIEW_POINT.width});
          break;
      }
    }
  }
}
