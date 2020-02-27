import {imageManager, devToolSwitch, uriParse, buildWebPreferences, confirm} from '@/main/util';
import {ContextMenuParams, Event, BrowserView, LoadURLOptions, webContents, InsertCSSOptions, WebSource, FindInPageOptions, WebContentsPrintOptions} from 'electron';
import log from 'electron-log';
import {UrlInfo, ViewOption, ViewNetState, ViewMode, CloseMode, ViewPoint} from 'plugin-line';
import {DEF_TITLE, DEF_VIEW_POINT} from '@/main/util/global';
import JingWindow from './window';
const JINGVIEW_VIEID: {[id: number]: JingView} = {};
const JINGVIEW_CONID: {[id: number]: JingView} = {};

export default class JingView {
  id: number;
  netState: ViewNetState;
  webContentId: number;
  url: UrlInfo;
  icon: string;
  title: string;
  windowId = 0;
  viewMode: ViewMode;
  canGoBack = false;
  canGoForward = false;
  readonly closeMode: CloseMode;
  readonly titleMode: 'Fixed' | 'Follow';
  readonly point: ViewPoint;
  hasSetPointed = false;
  isBuildIn = false;
  loaded = false;
  constructor (option: ViewOption) {
    this.title = option.title || DEF_TITLE;
    this.viewMode = option.viewMode;
    this.closeMode = option.closeMode;
    this.titleMode = option.titleMode;
    this.point = option.point || DEF_VIEW_POINT;
    this.url = uriParse(option.url);
    this.isBuildIn = this.viewMode === 'Dialog' || this.viewMode === 'DialogFullHeight' || this.viewMode === 'DialogFullWidth';
    const view = new BrowserView({
      webPreferences: buildWebPreferences(option.url)
    });
    this.id = view.id;
    this.webContentId = view.webContents.id;
    JINGVIEW_VIEID[this.id] = this;
    JINGVIEW_CONID[this.webContentId] = this;
    this.icon = imageManager.getDefIcon();
    this.netState = 'none';
    switch (this.viewMode) {
      case 'CurrentWindowShow':
      case 'CurrentWindowHide':
      case 'NewWindow':
        view.setAutoResize({height: true, width: true});
        break;
      case 'DialogFullHeight':
        view.setAutoResize({height: true});
        break;
      case 'DialogFullWidth':
        view.setAutoResize({width: true});
        break;
    }

    view.webContents
      .on('did-finish-load', () => {
        this.netState = 'finish';
        const window = JingWindow.fromId(this.windowId);
        window.notice('did-finish-load', this.id);
      })
      // errorCode 在 neterror 文件中
      .on('did-fail-load', (_event: Event, errorCode, errorDescription, validatedURL, isMainFrame, frameProcessId, frameRoutingId) => {
        log.error(`fail-load:${ validatedURL },code: ${ errorCode }, error: ${ errorDescription },isMainFrame: ${ isMainFrame }`);
        if (errorCode < -100 && (this.url!.fullUrl === validatedURL || `${ this.url!.fullUrl }/` === validatedURL)) {
          this.netState = 'failed';
          const window = JingWindow.fromId(this.windowId);
          window.notice('did-fail-load', this.id, errorCode, errorDescription, validatedURL, isMainFrame, frameProcessId, frameRoutingId);
        }
      })
      .on('did-fail-provisional-load', (_event: Event, errorCode, errorDescription, validatedURL, isMainFrame, frameProcessId, frameRoutingId) => {
        this.netState = 'cancel';
        const window = JingWindow.fromId(this.windowId);
        window.notice('did-fail-provisional-load', this.id, errorCode, errorDescription, validatedURL, isMainFrame, frameProcessId, frameRoutingId);
      })
      // 'did-frame-finish-load' 框架：例如页面内的广告
      .on('did-start-loading', () => {
        this.netState = 'loading';
        const window = JingWindow.fromId(this.windowId);
        window.notice('did-start-loading', this.id);
      })
      .on('did-stop-loading', () => {
        const window = JingWindow.fromId(this.windowId);
        window.notice('did-stop-loading', this.id);
        if (this.titleMode === 'Follow' && this.title === DEF_TITLE) {
          this.title = this.url!.urlStr;
          window.notice('page-title-updated', this.id, this.title);
        }
      })
      .on('dom-ready', () => {
        // TODO: 注入脚本
      })
      .on('page-title-updated', (_event: Event, title, explicitSet) => {
        if (this.titleMode === 'Follow') {
          this.title = title;
          const window = JingWindow.fromId(this.windowId);
          window.notice('page-title-updated', this.id, title, explicitSet);
        }
      })
      .on('page-favicon-updated', async (_event: Event, favicons) => {
        this.icon = await imageManager.parseIco(favicons[0]);
        const window = JingWindow.fromId(this.windowId);
        window.notice('page-favicon-updated', this.id, this.icon);
      })
      .on('new-window', (event: Event, uri, _frameName, disposition, options, additionalFeatures, referrer) => {
        event.preventDefault();
        if (uri.startsWith('about:') || uri.startsWith('javascript:')) {
          return;
        }
        const window = JingWindow.fromId(this.windowId);
        window.open(uri);
      })
      .on('will-navigate', (_event: Event, url) => {
        this.url = uriParse(url);
        this.canGoBack = view.webContents.canGoBack();
        this.canGoForward = view.webContents.canGoForward();
        const window = JingWindow.fromId(this.windowId);
        window.notice('page-url-updated', this.id, this.url);
      })
      // 'did-start-navigation'
      .on('will-redirect', (_event: Event, url, isInPlace, isMainFrame, frameProcessId, frameRoutingId) => {
        this.url = uriParse(url);
        this.canGoBack = view.webContents.canGoBack();
        this.canGoForward = view.webContents.canGoForward();
        const window = JingWindow.fromId(this.windowId);
        window.notice('page-url-updated', this.id, this.url);
      })
      // 'did-redirect-navigation'
      // 'did-navigate'
      // 'did-frame-navigate'
      // 'did-navigate-in-page'
      // 'will-prevent-unload'
      // 'crashed'
      // 'unresponsive'
      // 'responsive'
      // 'plugin-crashed'
      // 'destroyed'
      .on('before-input-event', (_event: Event, input) => {
        if (input.key === 'Control' || input.key === 'Command') {
          (global as any).isCtrl = input.type === 'keyDown';
        } else if (input.key === 'Esc') {
          this.stop();
        }
      })
      // 'enter-html-full-screen'
      // 'leave-html-full-screen'
      // 'zoom-changed'
      // 'devtools-opened'
      // 'devtools-closed'
      // 'devtools-focused'
      // 'certificate-error'
      // 'select-client-certificate'
      // 'login'
      .on('found-in-page', (_event: Event, result) => {
        const window = JingWindow.fromId(this.windowId);
        window.notice('found-in-page', this.id, result);
      })
      // 'media-started-playing'
      // 'media-paused'
      // 'did-change-theme-color'
      // 'update-target-url'
      // 'cursor-changed'
      .on('context-menu', (_event: Event, params: ContextMenuParams) => {
        // TODO 右键菜单
      })
      // 'select-bluetooth-device'
      // 'paint'
      // 'devtools-reload-page'
      // 'will-attach-webview'
      // 'did-attach-webview'
      // 'console-message'
      .on('preload-error', (_event: Event, preloadPath: string, error: Error) => {
        log.error(`load js ${ preloadPath }failed! = ${ error.message }`);
      });
    // 'ipc-message'
    // 'ipc-message-sync'
    // 'desktop-capturer-get-sources'
    // 'remote-require'
    // 'remote-get-global'
    // 'remote-get-builtin'
    // 'remote-get-current-window'
    // 'remote-get-current-web-contents'
    // 'remote-get-guest-web-contents'
  }

  static fromId(id: number) {
    return JINGVIEW_VIEID[id];
  }
  static fromContentId(id: number) {
    return JINGVIEW_CONID[id];
  }
  async loadURL(url?: string, options?: LoadURLOptions) {
    if (this.loaded === true && this.closeMode === 'EnabledAndConfirm' && await confirm('所有未保存的数据都将丢失', `您确认要刷新${ this.title }吗`, '刷新提醒') === false) {
      return;
    }
    if (url) {
      this.url = uriParse(url);
      webContents.fromId(this.webContentId).loadURL(this.url.fullUrl, options);
    } else if (this.loaded === false) {
      webContents.fromId(this.webContentId).reload();
    } else {
      webContents.fromId(this.webContentId).loadURL(this.url.fullUrl, options);
    }
    this.loaded = true;
  }

  stop() {
    webContents.fromId(this.webContentId).stop();
  }

  clearHistory() {
    webContents.fromId(this.webContentId).clearHistory();
  }

  goBack() {
    webContents.fromId(this.webContentId).goBack();
  }

  goForward() {
    webContents.fromId(this.webContentId).goForward();
  }

  goToIndex(index: number) {
    webContents.fromId(this.webContentId).goToIndex(index);
  }

  goToOffset(offset: number) {
    webContents.fromId(this.webContentId).goToOffset(offset);
  }

  async insertCSS(css: string, options?: InsertCSSOptions) {
    return await webContents.fromId(this.webContentId).insertCSS(css, options);
  }

  async removeInsertedCSS(key: string) {
    await webContents.fromId(this.webContentId).removeInsertedCSS(key);
  }

  async executeJavaScript(code: string, userGesture?: boolean) {
    return await webContents.fromId(this.webContentId).executeJavaScript(code, userGesture);
  }

  async executeJavaScriptInIsolatedWorld(worldId: number, scripts: WebSource[], userGesture?: boolean) {
    return await webContents.fromId(this.webContentId).executeJavaScriptInIsolatedWorld(worldId, scripts, userGesture);
  }

  undo() {
    webContents.fromId(this.webContentId).undo();
  }

  redo() {
    webContents.fromId(this.webContentId).redo();
  }

  cut() {
    webContents.fromId(this.webContentId).cut();
  }

  copy() {
    webContents.fromId(this.webContentId).copy();
  }

  copyImageAt(x: number, y: number) {
    webContents.fromId(this.webContentId).copyImageAt(x, y);
  }

  paste() {
    webContents.fromId(this.webContentId).paste();
  }

  pasteAndMatchStyle() {
    webContents.fromId(this.webContentId).pasteAndMatchStyle();
  }

  delete() {
    webContents.fromId(this.webContentId).delete();
  }

  selectAll() {
    webContents.fromId(this.webContentId).selectAll();
  }

  unselect() {
    webContents.fromId(this.webContentId).unselect();
  }

  replace(text: string) {
    webContents.fromId(this.webContentId).replace(text);
  }

  replaceMisspelling(text: string) {
    webContents.fromId(this.webContentId).replaceMisspelling(text);
  }

  async insertText(text: string) {
    await webContents.fromId(this.webContentId).insertText(text);
  }

  findInPage(text: string, options?: FindInPageOptions) {
    webContents.fromId(this.webContentId).findInPage(text, options);
  }

  stopFindInPage(action: 'clearSelection' | 'keepSelection' | 'activateSelection' = 'clearSelection') {
    webContents.fromId(this.webContentId).stopFindInPage(action);
  }

  send(channel: string, ...args: any) {
    webContents.fromId(this.webContentId).send(channel, ...args);
  }

  print(options?: WebContentsPrintOptions, callback?: (success: boolean, failureReason: 'cancelled' | 'failed') => void) {
    webContents.fromId(this.webContentId).print(options, callback);
  }

  async destroy(ask = false) {
    const view = BrowserView.fromId(this.id);
    if (view && view.isDestroyed() === false) {
      if (ask === true && this.closeMode === 'EnabledAndConfirm' && await confirm('所有未保存的数据都将丢失', `您确认要关闭${ this.title }吗`, '刷新提醒') === false) {
        return;
      }
      view.destroy();
      delete JINGVIEW_VIEID[this.id];
      delete JINGVIEW_CONID[this.webContentId];
    }
  }

  dev() {
    devToolSwitch(webContents.fromId(this.webContentId));
  }
}
