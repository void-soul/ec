import {imageManager, devToolSwitch, getConfig, newViewOption, windowPreferences, windowUrl} from '@/main/util';
import * as util from '@/main/util';
import {DEF_VIEW_POINT, TOOLBAR_HEIGHT} from '@/share/global';
import {BrowserWindow, BrowserView, ContextMenuParams, webContents, WebContents, app} from 'electron';
import {JingPlugin, ViewOption, ViewQuery, ViewFound} from 'plugin-line';
import JingView from '@/main/core/view';
import path from 'path';
import * as fs from 'fs';

const JINGWINDOWS: {[id: number]: JingWindow} = {};

interface Plugin extends JingPlugin {
  inner: boolean;
}

export default class JingWindow {
  id: number;
  activeId: number = 0;
  webContentId: number;
  views: JingView[] = [];
  plugins: JingPlugin[] = [];
  constructor (viewOption: ViewOption) {
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
    JINGWINDOWS[window.id] = this;
    this.webContentId = window.webContents.id;
    // 窗体事件初始化
    window
      .once('ready-to-show', () => {
        window.show();
        window.maximize();
        devToolSwitch(window.webContents);
      })
      .once('close', () => {
        this.destroy();
      })
      .webContents.on('context-menu', (_event: Event, params: ContextMenuParams) => {
        // TODO 右键菜单
        this.initMenu(true);
      });
    // 加载view
    this.add(viewOption);
    window.loadURL(windowUrl.fullUrl);
    this.initPlugin();
  }
  static fromId(id: number) {
    return JINGWINDOWS[id];
  }
  static getAllJingWindows() {
    return Object.values(JINGWINDOWS);
  }
  open(url: string) {
    this.add({
      ...newViewOption,
      url
    });
  }
  add(viewOption: ViewOption) {
    // 检查url是否重复
    let {view} = this.find({
      url: viewOption.url
    });
    // 不重复则调用add
    if (!view) {
      view = new JingView(viewOption);
      this.push({view});
    }
    view.refresh();
    // 判断viewMode决定是否激活
    if (view.viewMode !== 'CurrentWindowHide') {
      this.active({view});
    }
  }
  push(query: ViewQuery) {
    const jingView = query.view || JingView.fromId(query.id!);
    if (jingView) {
      jingView.windowId = this.id;
      this.views.push(jingView);
    }
  }
  remove(query?: ViewQuery, close?: boolean) {
    const {index, view} = this.find(query);
    const prev = this.find({
      ...query,
      prev: true
    });
    if (view) {
      this.views.splice(index, 1);
      if (close === true) {
        view.destroy(true);
      }
      if (prev) {
        this.active({id: prev.id});
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

    for (const plugin of this.plugins) {
      plugin.destroy();
    }
    this.plugins.splice(0, this.plugins.length);
    delete JINGWINDOWS[this.id];
  }
  active(query?: ViewQuery) {
    const {view} = this.find(query);
    if (view) {
      const window = BrowserWindow.fromId(this.id);
      const browserView = BrowserView.fromId(view.id);
      switch (view.viewMode) {
        case 'CurrentWindowShow':
        case 'CurrentWindowHide':
        case 'NewWindow':
          if (this.activeId !== view.id) {
            this.activeId = view.id;
            window.setBrowserView(browserView);
            this.point(view, browserView, window);
            view.viewMode = 'CurrentWindowShow';
            this.initMenu();
          }
          break;
        case 'DialogFullHeight':
        case 'DialogFullWidth':
          window.removeBrowserView(browserView);
          window.addBrowserView(browserView);
          this.point(view, browserView, window);
          break;
      }
    }
  }
  sort(id: number, toIndex: number) {
    const {index} = this.find({id});
    this.views.splice(toIndex, 0, ...this.views.splice(index, 1));
  }
  notice(channel: string, ...args: any[]) {
    for (const view of this.views) {
      if (view.isDialog) {
        webContents.fromId(view.webContentId).send(channel, ...args);
      }
      webContents.fromId(this.webContentId).send(channel, ...args);
    }
  }
  broadcast(channel: string, ...args: any[]) {
    for (const view of this.views) {
      if (view.isDialog === false) {
        webContents.fromId(view.webContentId).send(channel, ...args);
      }
    }
  }
  find(query?: ViewQuery): ViewFound {
    let index = -1;
    if (!query || (!query.id && !query.url && !query.view)) {
      query = {id: this.activeId};
    }
    if (query.id) {
      index = this.views.findIndex((item) => item.id === query!.id);
    } else if (query.url) {
      index = this.views.findIndex((item) => item.url.urlStr === query!.url);
    } else if (query.view) {
      index = this.views.findIndex((item) => item.id === query!.view!.id);
    }
    if (query.next === true) {
      index = index < this.views.length - 1 ? index++ : 0;
    }
    if (query.prev === true) {
      index = index > 0 ? index-- : 0;
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
  /** 初始化窗体菜单 */
  private initMenu(show = false) {
    //
  }
  private async initPlugin() {
    // 加载外置插件
    const pluginPathOuter = path.join(app.getPath('exe'), './plugin');
    const pluginPathInner = path.join(app.getAppPath(), 'plugin-inner');

    // 读取文件
    const filesInner = await fs.promises.readdir(pluginPathInner);
    for (const file of filesInner) {
      const plugin = new (await import(path.join(pluginPathInner, file)))(this, util) as Plugin;
      plugin.inner = true;
      this.plugins.push(plugin);
    }

    // const filesOuter = await fs.promises.readdir(pluginPathOuter);
    // for (const file of filesOuter) {
    //   const plugin = new (await import(path.join(pluginPathOuter, file)))(this, util) as Plugin;
    //   plugin.inner = false;
    //   this.plugins.push(plugin);
    // }
  }
}