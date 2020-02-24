import imageManager from '@/main/fs/image-manager';
import windowManager from '@/main/extends/window-manager';
import {APP_EXISTS, TOOLBAR_HEIGHT} from '@/share/global';
import {BrowserWindow, ContextMenuParams} from 'electron';
import {confirm} from '@/main/native/confirm';
import {devToolSwitch} from '@/main/native/dev-tool';
import {EventProxy} from '@/main/native/event-proxy';
import {getConfig} from '@/main/rs/config';
import {JingView} from '@/main/extends/view';
import {newViewOption, windowPreferences, windowUrl} from '@/main/native/build';
import {JingDialog} from '@/main/extends/dialog';
import {FindDialog} from '@/main/extends/find';
import {Cache} from '@/main/rs/cache';
import {SwitchDialog} from '@/main/extends/switch';
import {uriCopy} from '@/main/native/uri';
export class JingWindow extends BrowserWindow {
  public actionid = 0;
  public windowManager = windowManager;
  public eventProxy: EventProxy;
  public cid: number;
  private cache = new Cache();
  private views = new Array<JingView>();
  private dialogs = new Array<JingDialog>();
  constructor (viewOption?: ViewOption) {
    super({
      frame: false,
      useContentSize: true,
      transparent: false,
      autoHideMenuBar: true,
      title: getConfig('VUE_APP_TITLE'),
      icon: imageManager.getWindowIcon(),
      webPreferences: windowPreferences,
      show: false
    });
    this.cid = this.webContents.id;
    this.eventProxy = new EventProxy({
      webContent: this.webContents,
      onExists: () => this.eventProxy.do(`window-destroy-${ this.cid }`)
    });
    this
      .on('resize', () => this.eventProxy.do(`window-resize-${ this.cid }`))
      .on('focus', () => this.eventProxy.do('window-view-focus', {windowid: this.cid}))
      .once('ready-to-show', () => this.show());
    this.webContents.on('context-menu', (_event: Event, params: ContextMenuParams) => this.eventProxy.do('window-view-context', params));

    // #region this.eventProxy
    this.eventProxy
      .todo(`window-destroy-${ this.cid }`, () => {
        if (this.isDestroyed() === false) {
          for (const view of this.views) {
            this.eventProxy.do(`view-destroy-${ view.cid }`);
          }
          this.views.length = 0;
          for (const dia of this.dialogs) {
            this.eventProxy.do(`dialog-destroy-${ this.cid }-${ dia.option.name }`);
          }
          this.cache.destroy();
          super.destroy();
        }
      })
      .todo(`window-title-${ this.cid }`, (viewid: number, title: string) => {
        if (this.actionid === viewid) {
          title = `${ title }-${ getConfig('VUE_APP_TITLE') }`;
          super.setTitle(title);
        }
      })
      .todo(`window-toggle-${ this.cid }`, () => {
        if (this.isMaximized()) {
          this.unmaximize();
        } else {
          this.maximize();
        }
      })
      .todo(`window-add-view-${ this.cid }`, (option: ViewOption) => {
        if (getConfig('VUE_APP_DEV') === '1' && option.viewMode === 'CurrentWindowHideNoTab') {
          option.viewMode = 'CurrentWindowShowWithTab';
        }
        if (option.viewMode === 'CurrentWindowShowWithTab' || option.viewMode === 'CurrentWindowHideWithTab' || option.viewMode === 'CurrentWindowHideNoTab') {
          const {
            view
          } = this.find({url: option.uri});
          let thisView = view;
          let flag = false;
          if (!thisView) {
            thisView = new JingView(option);
            this.eventProxy.do(`window-append-view-${ this.cid }`, thisView);
            if (option.viewMode === 'CurrentWindowShowWithTab' || option.viewMode === 'CurrentWindowHideWithTab') {
              this.eventProxy.notify(`window-add-view-${ this.cid }`, thisView.option);
            }
            flag = true;
          }
          if (option.viewMode === 'CurrentWindowShowWithTab' && (global as any).isCtrl !== true) {
            this.eventProxy.do(`window-active-view-${ this.cid }`, thisView.cid);
          }
          if (flag) {
            this.eventProxy.do(`view-refresh-${ thisView.cid }`);
          }
        } else if (option.viewMode === 'NewWindowWithTab') {
          option.viewMode = 'CurrentWindowShowWithTab';
          this.windowManager.create(option);
        }
      })
      .todo(`window-append-view-${ this.cid }`, (view: JingView) => {
        view.option.viewid = view.cid;
        view.option.windowid = this.cid;
        this.views.push(view);
      })
      .todo(`window-hide-all-dialog-${ this.cid }`, () => {
        for (const dia of this.dialogs) {
          this.eventProxy.do(`dialog-hide-${ this.cid }-${ dia.option.name }`);
        }
      })
      .todo(`window-active-view-${ this.cid }`, (viewid: number) => {
        if (this.actionid !== viewid) {
          const {
            view
          } = this.find({id: viewid});
          if (view) {
            const nowview = this.find().view;
            if (nowview) {
              this.eventProxy.do(`window-hide-all-dialog-${ this.cid }`);
              this.removeBrowserView(nowview);
            }
            view.option.viewMode = 'CurrentWindowShowWithTab';
            this.setBrowserView(view);
            this.eventProxy.do(`window-resize-${ this.cid }`, view.cid);
            this.actionid = view.cid;
            this.eventProxy.notify(`window-active-view-${ this.cid }`, view.cid);
            this.eventProxy.do(`window-title-${ this.cid }`, view.cid, view.option.title);
            this.eventProxy.do('window-view-focus', {
              windowid: this.cid,
              viewid: this.actionid
            });
          }
        }
      })
      .todo(`window-resize-${ this.cid }`, (viewid = 0) => {
        const bounds = this.getBounds();
        const target = {
          width: bounds.width,
          height: bounds.height - TOOLBAR_HEIGHT,
          y: TOOLBAR_HEIGHT,
          x: 0,
        };
        const {
          view
        } = this.find({id: viewid});
        if (view) {
          view.setBounds(target);
        }
        for (const dia of this.dialogs) {
          this.eventProxy.do(`dialog-resize-${ this.cid }-${ dia.option.name }`, bounds);
        }
      })
      .todo(`window-copy-view-${ this.cid }`, (viewid: number) => {
        const {
          view
        } = this.find({id: viewid});
        if (view && view.option.url!.trustServer === false) {
          this.eventProxy.do(`window-add-view-${ this.cid }`, {
            ...view.option,
            ...newViewOption,
            uri: uriCopy(view.option.uri)
          });
        }
      })
      .todo(`window-shift-view-${ this.cid }`, (viewid: number, windowid?: number) => {
        const {
          view
        } = this.find({id: viewid});
        const win = windowid ? this.windowManager.get(windowid) : this.windowManager.create();
        if (view) {
          view.option.viewMode = 'CurrentWindowShowWithTab';
          this.eventProxy.do(`window-append-view-${ win.cid }`, view);
          this.eventProxy.do(`window-active-view-${ win.cid }`, view.cid);
          this.eventProxy.do(`window-remove-view-${ this.cid }`, view.cid, false);
        }
      })
      .todo(`window-remove-view-${ this.cid }`, async (viewid: number, destroy = true, confirmUser = true) => {
        const {
          view,
          index
        } = this.find({id: viewid});
        if (view) {
          if (view.option.close === false) {
            return;
          }
          if (destroy === true && confirmUser === true && view.option.closeMode === 'EnabledAndConfirm' && await confirm('所有未保存的数据都将丢失', `您确认要关闭${ view.option.title }吗`, '关闭提醒') === false) {
            return;
          }
          this.eventProxy.do(`window-hide-all-dialog-${ this.cid }`);
          this.views.splice(index, 1);
          this.eventProxy.notify(`window-remove-view-${ this.cid }`, view.cid);
          console.log(view.cid);
          if (destroy === true) {
            this.eventProxy.do(`view-destroy-${ view.cid }`);
          }
          if (this.views.length === 0 && this.windowManager.size() > 1) {
            this.eventProxy.do(`window-destroy-${ this.cid }`);
          }
          if (this.actionid === viewid) {
            let lastView: JingView | undefined;
            for (let i = index - 1; i > -1; i--) {
              if (this.views[i].option.viewMode !== 'CurrentWindowHideNoTab') {
                lastView = this.views[i];
                break;
              }
            }
            if (!lastView) {
              for (let i = index + 1; i < this.views.length; i++) {
                if (this.views[i].option.viewMode !== 'CurrentWindowHideNoTab') {
                  lastView = this.views[i];
                  break;
                }
              }
            }
            this.actionid = 0;
            if (lastView) {
              this.eventProxy.do(`window-active-view-${ this.cid }`, lastView.cid);
            }
          }
        }
      })
      .todo(`window-replace-view-${ this.cid }`, (viewid: number, uri: string) => {
        const {
          view,
          index
        } = this.find({id: viewid});
        if (view) {
          this.eventProxy.do(`window-hide-all-dialog-${ this.cid }`);
          this.eventProxy.notify(`window-remove-view-${ this.cid }`, view.cid);
          this.eventProxy.do(`view-destroy-${ view.cid }`);

          const option = {
            ...view.option,
            uri
          } as ViewOption;

          const thisView = new JingView(option);
          if (option.viewMode === 'CurrentWindowShowWithTab' || option.viewMode === 'CurrentWindowHideWithTab') {
            this.eventProxy.notify(`window-add-view-${ this.cid }`, thisView.option);
          }
          this.eventProxy.do(`view-refresh-${ thisView.cid }`);
          if (option.viewMode === 'CurrentWindowShowWithTab' && (global as any).isCtrl !== true) {
            this.eventProxy.do(`window-active-view-${ this.cid }`, thisView.cid);
          }

          if (this.actionid === viewid) {
            let lastView: JingView | undefined;
            for (let i = index - 1; i > -1; i--) {
              if (this.views[i].option.viewMode !== 'CurrentWindowHideNoTab') {
                lastView = this.views[i];
                break;
              }
            }
            if (!lastView) {
              for (let i = index + 1; i < this.views.length; i++) {
                if (this.views[i].option.viewMode !== 'CurrentWindowHideNoTab') {
                  lastView = this.views[i];
                  break;
                }
              }
            }
            this.actionid = 0;
            if (lastView) {
              this.eventProxy.do(`window-active-view-${ this.cid }`, lastView.cid);
            }
          }
        }
      })
      .todo(`window-remove-other-view-${ this.cid }`, async (viewid: number) => {
        const ids = new Array<number>();
        const titles = new Array<string>();
        this.views.forEach((tab) => {
          if (tab.option.close === true && tab.cid !== viewid) {
            if (tab.option.closeMode === 'EnabledAndConfirm') {
              titles.push(tab.option.title);
            }
            ids.push(tab.cid);
          }
        });
        const msg = titles.length > 0 ? `请确认以下窗体中数据已经全部保存:\n${ titles.join('\n') }` : '';
        if (msg && await confirm('确定关闭这些页面吗', msg, '关闭提醒') === false) {
          return;
        }
        for (const idOne of ids) {
          this.eventProxy.do(`window-remove-view-${ this.cid }`, idOne, true, false);
        }
        if (ids.includes(this.actionid)) {
          this.eventProxy.do(`window-active-view-${ this.cid }`, viewid);
        }
      })
      .todo(`window-remove-right-view-${ this.cid }`, async (viewid: number) => {
        const {
          index,
          id
        } = this.find({id: viewid});
        if (index > -1) {
          const titles = new Array<string>();
          const ids = new Array<number>();
          for (let i = index + 1; i < this.views.length; i++) {
            if (this.views[i].option.close === true) {
              if (this.views[i].option.closeMode === 'EnabledAndConfirm') {
                titles.push(this.views[i].option.title);
              }
              ids.push(this.views[i].cid);
            }
          }
          const msg = titles.length > 0 ? `请确认以下窗体中数据已经全部保存:\n${ titles.join('\n') }` : '';
          if (msg && await confirm('确定关闭这些页面吗', msg, '关闭提醒') === false) {
            return;
          }
          for (const idOne of ids) {
            this.eventProxy.do(`window-remove-view-${ this.cid }`, idOne, true, false);
          }
          if (ids.includes(this.actionid)) {
            this.eventProxy.do(`window-active-view-${ this.cid }`, id);
          }
        }
      })
      .todo(`window-remove-left-view-${ this.cid }`, async (viewid: number) => {
        const {
          index,
          id
        } = this.find({id: viewid});
        if (index > -1) {
          const titles = new Array<string>();
          const ids = new Array<number>();
          for (let i = index - 1; i > -1; i--) {
            if (this.views[i].option.close === true) {
              if (this.views[i].option.closeMode === 'EnabledAndConfirm') {
                titles.push(this.views[i].option.title);
              }
              ids.push(this.views[i].cid);
            }
          }
          const msg = titles.length > 0 ? `请确认以下窗体中数据已经全部保存:\n${ titles.join('\n') }` : '';
          if (msg && await confirm('确定关闭这些页面吗', msg, '关闭提醒') === false) {
            return;
          }
          for (const idOne of ids) {
            this.eventProxy.do(`window-remove-view-${ this.cid }`, idOne, true, false);
          }
          if (ids.includes(this.actionid)) {
            this.eventProxy.do(`window-active-view-${ this.cid }`, id);
          }
        }
      })
      .todo(`window-sort-view-${ this.cid }`, (oldIndex: number, newIndex: number) => {
        this.views.splice(newIndex, 0, ...this.views.splice(oldIndex, 1));
        this.eventProxy.notify(`window-sort-view-${ this.cid }`, oldIndex, newIndex);
      })
      .todo(`window-close-${ this.cid }`, async () => {
        const titles = this.views.filter(item => item.option.closeMode === 'EnabledAndConfirm').map(item => item.option.title);
        const msg = titles.length > 0 ? '请确认以下窗体中数据已经全部保存:\n{ titles.join(\'\n\') }' : '';
        if (this.windowManager.size() === 1) { // 统一退出事件
          if (await confirm('您确认要关闭本软件吗', msg, '退出提醒') === false) {
            return;
          }
          this.eventProxy.do(APP_EXISTS);
        } else { // 只管自己退出
          if (msg && await confirm('确定关闭这些页面吗', msg, '关闭提醒') === false) {
            return;
          }
          this.eventProxy.do(`window-destroy-${ this.cid }`);
        }
      })
      .todo(`window-min-${ this.cid }`, () => this.minimize())
      .excute(`window-active-view-id-${ this.cid }`, () => this.actionid)
      .excute(`window-views-${ this.cid }`, () => [this.views.filter(view => view.option.viewMode !== 'CurrentWindowHideNoTab').map(view => view.option), this.actionid])
      .excute(`window-cached-${ this.cid }`, (...keys: string[]) => this.cache.cached(...keys))
      .excute(`window-cacheRemove-${ this.cid }`, (...keys: string[]) => this.cache.cacheRemove(...keys))
      .excute(`window-cache-${ this.cid }`, (target: {[key: string]: any}) => this.cache.cache(target))
      .excute(`window-cacheHave-${ this.cid }`, (key: string) => this.cache.cacheHave(key))
      .excute(`window-cacheClear-${ this.cid }`, () => this.cache.cacheClear());
    // #endregion

    super.loadURL(windowUrl.url);
    super.maximize();
    // 创建dialogs
    this.dialogs.push(new FindDialog(this.cid, this.getBounds()));
    this.dialogs.push(new SwitchDialog(this.cid, this.getBounds()));
    devToolSwitch(this.webContents);
    if (viewOption) {
      this.eventProxy.do(`window-add-view-${ this.cid }`, viewOption);
    }
  }
  find(query?: {
    id?: number;
    url?: string;
  }): {id: number; index: number; view: JingView | null} {
    let index = -1;
    if (!query || query.id === 0) {
      query = {id: this.actionid};
    }
    if (query.id) {
      index = this.views.findIndex((item) => item.option.viewid === query!.id);
    } else if (query.url) {
      index = this.views.findIndex((item) => item.option.uri === query!.url);
    }
    if (index > -1) {
      return {
        id: this.views[index].cid,
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
  size() {
    return this.views.length;
  }
  focus() {
    super.focus();
    const {view} = this.find();
    if (view) {
      view.webContents.focus();
    }
  }
}
