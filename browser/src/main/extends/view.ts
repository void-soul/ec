import ImageManager from '@/main/fs/image-manager';
import {EventProxy} from '@/main/native/event-proxy';
import {BrowserView, clipboard, shell, ContextMenuParams, Event} from 'electron';
import {devToolSwitch} from '@/main/native/dev-tool';
import {getConfig} from '@/main/rs/config';
import {uriParse} from '@/main/native/uri';
import {buildWebPreferences, newViewOption} from '@/main/native/build';
import log from 'electron-log';
import {confirm} from '@/main/native/confirm';
import {freeUrl} from '@/main/native/build';
import enhance from '../native/enhance';

export class JingView extends BrowserView {
  public option: ViewOption;
  public eventProxy: EventProxy;
  public cid: number;
  private loaded = false;
  constructor (option: ViewOption) {
    super({
      webPreferences: buildWebPreferences(option.uri)
    });
    this.option = {
      ...option,
      icon: ImageManager.getDefIcon(),
      url: uriParse(option.uri),
      close: option.closeMode === 'Enabled' || option.closeMode === 'EnabledAndConfirm' || (option.closeMode === 'OnlyDev' && getConfig('VUE_APP_DEV') === '1'),
      free: false
    };
    this.cid = this.webContents.id;
    this.eventProxy = new EventProxy({webContent: this.webContents});
    // #region event-bus事件监听
    this.eventProxy
      .todo(`view-destroy-${ this.cid }`, () => {
        if (this.isDestroyed() === false) {
          super.destroy();
        }
      })
      .todo(`view-refresh-${ this.cid }`, async (uri?: string) => {
        if (this.loaded === true && this.option.closeMode === 'EnabledAndConfirm' && await confirm('所有未保存的数据都将丢失', `您确认要刷新${ this.option.title }吗`, '刷新提醒') === false) {
          return;
        }
        this.loaded = true;
        this.eventProxy.do(`view-reset-url-${ this.cid }`, uri);
        this.webContents.loadURL(this.option.url!.url);
        this.eventProxy.do('window-view-focus', {
          windowid: this.option.windowid,
          viewid: this.cid
        });
      })
      .todo(`view-free-${ this.cid }`, async (uri?: string) => {
        if (this.option.closeMode === 'EnabledAndConfirm' && await confirm('所有未保存的数据都将丢失', `您确认要冻结${ this.option.title }吗`, '冻结提醒') === false) {
          return;
        }
        this.option.free = true;
        this.eventProxy.notify(`window-update-view-${ this.option.windowid }`, this.cid, this.option);
        this.webContents.loadURL(freeUrl.url);
        this.eventProxy.do('window-view-focus', {
          windowid: this.option.windowid,
          viewid: this.cid
        });
      })
      .todo(`view-forward-${ this.cid }`, () => this.webContents.goForward())
      .todo(`view-back-${ this.cid }`, () => this.webContents.goBack())
      .todo(`view-stop-${ this.cid }`, () => this.webContents.stop())
      .todo(`view-chrome-${ this.cid }`, () => shell.openExternal(this.option.url!.url))
      .todo(`view-copy-url-${ this.cid }`, () => clipboard.writeText(this.option.url!.url))
      .todo(`view-dev-${ this.cid }`, () => devToolSwitch(this.webContents))
      .todo(`view-find-${ this.cid }`, (txt: string, forward: boolean, findNext: boolean) => this.webContents.findInPage(txt, {forward, findNext}))
      .todo(`view-print-${ this.cid }`, () => this.webContents.print())
      .todo(`view-reset-url-${ this.cid }`, (uri: string) => {
        if (uri) {
          this.option.url = uriParse(uri);
          this.option.uri = uri;
          this.option.canGoBack = this.webContents.canGoBack();
          this.option.canGoForward = this.webContents.canGoForward();
          this.eventProxy.notify(`window-update-view-${ this.option.windowid }`, this.cid, this.option);
        }
      })
      .todo(`view-stop-find-${ this.cid }`, () => this.webContents.stopFindInPage('clearSelection'));
    // #endregion

    // #region webContents事件监听
    this
      .webContents
      .on('did-start-loading', () => {
        this.option.loading = true;
        this.option.fail = false;
        this.eventProxy.notify(`window-update-view-${ this.option.windowid }`, this.cid, this.option);
      })
      .on('did-stop-loading', () => {
        this.option.loading = false;
        if (this.option.titleMode === 'Follow' && this.option.title === '正在加载') {
          this.option.title = this.option.uri;
          this.eventProxy.do(`window-title-${ this.option.windowid }`, this.cid, this.option.title);
        }
        this.eventProxy.notify(`window-update-view-${ this.option.windowid }`, this.cid, this.option);
      })
      .on('did-finish-load', () => {
        this.option.loading = false;
        this.eventProxy.notify(`window-update-view-${ this.option.windowid }`, this.cid, this.option);
      })
      .on(
        'did-fail-load',
        (
          _event: Event,
          eventCode: number,
          errorDescription: string,
          validatedURL: string,
          isMainFrame: boolean
        ) => {
          log.error(`fail-load:${ validatedURL },code: ${ eventCode }, error: ${ errorDescription },isMainFrame: ${ isMainFrame }`);
          if (eventCode < -100 && (this.option.url!.url === validatedURL || `${ this.option.url!.url }/` === validatedURL)) {
            this.option.loading = false;
            this.option.fail = true;
            this.eventProxy.notify(`window-update-view-${ this.option.windowid }`, this.cid, this.option);
          }
        },
      )
      .on('preload-error', (_event: Event, preloadPath: string, error: Error) => {
        log.error(`load js ${ preloadPath }failed! = ${ error.message }`);
      })
      .on('will-navigate', (_event: Event, uri: string) => this.eventProxy.do(`view-reset-url-${ this.cid }`, uri))
      .on('will-redirect', (_event: Event, uri: string) => this.eventProxy.do(`view-reset-url-${ this.cid }`, uri))
      .on('dom-ready', () => enhance.inject(this.option.url!, this.webContents))
      .on('new-window', (event: Event, uri: string, _frameName, disposition) => {
        event.preventDefault();
        if (uri.startsWith('about:blank')) {
          return;
        }
        this.eventProxy.do(`window-add-view-${ this.option.windowid }`, {
          ...newViewOption,
          uri,
          viewMode: disposition === 'background-tab' ? 'CurrentWindowHideWithTab' : 'CurrentWindowShowWithTab'
        });
      })
      .on('page-title-updated', (_event: Event, newTitle: string) => {
        if (this.option.titleMode === 'Follow' && this.option.free === false) {
          this.option.title = newTitle;
          this.eventProxy.notify(`window-update-view-${ this.option.windowid }`, this.cid, this.option);
          this.eventProxy.do(`window-title-${ this.option.windowid }`, this.cid, this.option.title);
        }
      })
      .on('page-favicon-updated', async (_event: Event, favicons: string[]) => {
        if (this.option.free === false) {
          this.option.icon = await ImageManager.parseIco(favicons[0]);
          this.eventProxy.notify(`window-update-view-${ this.option.windowid }`, this.cid, this.option);
        }
      })
      .on('context-menu', (_event: Event, params: ContextMenuParams) => this.eventProxy.do('view-context', params))
      .on('found-in-page', (_event: Event, result) => this.eventProxy.do(`dialog-excute-${ this.option.windowid }-find`, 'found', result))
      .on('before-input-event', (_event: Event, input) => {
        if (input.key === 'Control' || input.key === 'Command') {
          (global as any).isCtrl = input.type === 'keyDown';
        }
      });
    // #endregion
  }
  getOption() {
    return this.option;
  }
  async query(fn: () => any, ...args: any[]) {
    // this.webContents.executeJavaScript();
  }
}
