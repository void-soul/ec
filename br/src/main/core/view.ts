import {imageManager, devToolSwitch, uriParse, buildWebPreferences, confirm} from '@/main/util';
import {ContextMenuParams, Event, BrowserView, BrowserWindow, Rectangle, MouseWheelInputEvent, webContents} from 'electron';
import log from 'electron-log';
import {UrlInfo, ViewOption, ViewNetState, ViewMode, CloseMode, ViewPoint} from 'plugin-line';
import {DEF_TITLE, DEF_VIEW_POINT} from '@/share/global';
import JingWindow from './window';
const JINGVIEWS: {[id: number]: JingView} = {};

export default class JingView {
  id: number;
  netState: ViewNetState;
  webContentId: number;
  loaded: boolean = false;
  url: UrlInfo;
  icon: string;
  title: string;
  windowId: number = 0;
  viewMode: ViewMode;
  canGoBack: boolean = false;
  canGoForward: boolean = false;
  readonly closeMode: CloseMode;
  readonly titleMode: 'Fixed' | 'Follow';
  readonly point: ViewPoint;
  /** 是否已经设置过位置？每个view只允许设置一次 */
  hasSetPointed = false;
  /** 是否是一个对话框？对话框是特殊的一类，可以接收内部事件调用 */
  isDialog = false;
  constructor (option: ViewOption) {
    this.title = option.title || DEF_TITLE;
    this.viewMode = option.viewMode;
    this.closeMode = option.closeMode;
    this.titleMode = option.titleMode;
    this.point = option.point || DEF_VIEW_POINT;
    this.url = uriParse(option.url);
    this.isDialog = this.viewMode === 'Dialog' || this.viewMode === 'DialogFullHeight' || this.viewMode === 'DialogFullWidth';
    const view = new BrowserView({
      webPreferences: buildWebPreferences(option.url)
    });
    this.id = view.id;
    this.webContentId = view.webContents.id;
    this.icon = imageManager.getDefIcon();
    this.netState = 'none';
    JINGVIEWS[this.id] = this;
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
    this.initEvent(view);
  }
  static fromId(id: number) {
    return JINGVIEWS[id];
  }
  initEvent(view: BrowserView) {
    view.webContents
      .on('did-finish-load', () => {
        this.netState = 'finish';
        const window = JingWindow.fromId(this.windowId);
        window.notice('did-finish-load', this.id);
      })
      // eventCode 在 neterror 文件中
      .on('did-fail-load', (_event: Event, eventCode, errorDescription, validatedURL, isMainFrame, frameProcessId, frameRoutingId) => {
        log.error(`fail-load:${ validatedURL },code: ${ eventCode }, error: ${ errorDescription },isMainFrame: ${ isMainFrame }`);
        if (eventCode < -100 && (this.url!.fullUrl === validatedURL || `${ this.url!.fullUrl }/` === validatedURL)) {
          this.netState = 'failed';
          const window = JingWindow.fromId(this.windowId);
          window.notice('did-fail-load', this.id, eventCode, errorDescription, validatedURL, isMainFrame, frameProcessId, frameRoutingId);
        }
      })
      .on('did-fail-provisional-load', (_event: Event, eventCode, errorDescription, validatedURL, isMainFrame, frameProcessId, frameRoutingId) => {
        this.netState = 'cancel';
        const window = JingWindow.fromId(this.windowId);
        window.notice('did-fail-provisional-load', this.id, eventCode, errorDescription, validatedURL, isMainFrame, frameProcessId, frameRoutingId);
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
  async destroy(ask = false) {
    const view = BrowserView.fromId(this.id);
    if (view && view.isDestroyed() === false) {
      if (ask === true && this.closeMode === 'EnabledAndConfirm' && await confirm('所有未保存的数据都将丢失', `您确认要关闭${ this.title }吗`, '刷新提醒') === false) {
        return;
      }
      view.destroy();
      delete JINGVIEWS[this.id];
    }
  }
  async refresh() {
    if (this.netState === 'loading' && this.closeMode === 'EnabledAndConfirm' && await confirm('所有未保存的数据都将丢失', `您确认要刷新${ this.title }吗`, '刷新提醒') === false) {
      return;
    }
    const view = BrowserView.fromId(this.id);
    view.webContents.loadURL(this.url.fullUrl);
  }
  print() {
    webContents.fromId(this.webContentId).print();
  }
  find(txt: string, forward: boolean, findNext: boolean) {
    webContents.fromId(this.webContentId).findInPage(txt, {forward, findNext});
  }
  stopFind() {
    webContents.fromId(this.webContentId).stopFindInPage('clearSelection');
  }
  dev() {
    devToolSwitch(webContents.fromId(this.webContentId));
  }
  forward() {
    webContents.fromId(this.webContentId).goForward();
  }
  back() {
    webContents.fromId(this.webContentId).goBack();
  }
  stop() {
    webContents.fromId(this.webContentId).stop();
  }
}