import {BrowserView, Rectangle} from 'electron';
import {buildWebPreferences} from '@/main/native/build';
import {uriParse} from '@/main/native/uri';
import windowManager from '@/main/extends/window-manager';
import {devToolSwitch} from '@/main/native/dev-tool';
import {EventProxy} from '@/main/native/event-proxy';
import {FREE_URI} from '@/share/global';
const hideBounds = {
  height: 0,
  width: 0,
  x: 0,
  y: 0
};
export abstract class JingDialog extends BrowserView {
  public option: DialogOption;
  public cid: number;
  public eventProxy: EventProxy;
  protected vif: boolean = false;
  protected dev: boolean = true;
  protected vifSwitch: boolean = false;
  protected intelName: boolean = false;
  constructor (option: DialogOption) {
    super({
      webPreferences: buildWebPreferences(FREE_URI)
    });
    this.cid = this.webContents.id;
    this.eventProxy = new EventProxy({
      webContent: this.webContents,
      onExists: () => {
        if (!this.isDestroyed()) {
          super.destroy();
        }
      }
    });
    this.setBounds(hideBounds);
    this.option = option;
    if (option.uri) {
      this.option.url = uriParse(option.uri);
      this.webContents.loadURL(this.option.url.url);
    }
    const win = windowManager.get(option.windowid)!;
    win.addBrowserView(this);
    this.eventProxy
      .todo(`dialog-hide-${ option.windowid }-${ option.name }`, () => {
        if (this.vif === false) {
          return;
        }
        this.vif = false;
        this.setBounds(hideBounds);
        this.eventProxy.send('dialog-hide');
        win.focus();
      })
      .todo(`dialog-show-${ option.windowid }-${ option.name }`, (viewUrl?: UrlInfo) => {
        if (this.vif === false) {
          this.vif = true;
          this.eventProxy.do(`dialog-reset-${ option.windowid }-${ option.name }`);
          this.eventProxy.do(`dialog-top-${ option.windowid }-${ option.name }`);
          this.eventProxy.send('dialog-show');
        } else if (this.vifSwitch === false) {
          this.eventProxy.send('dialog-show');
        } else if (this.vifSwitch === true) {
          this.eventProxy.do(`dialog-hide-${ option.windowid }-${ option.name }`);
        }
      })
      .todo(`dialog-resize-${ option.windowid }-${ option.name }`, (bound: Rectangle) => {
        this.resize(bound);
        this.eventProxy.do(`dialog-reset-${ option.windowid }-${ option.name }`);
      })
      .todo(`dialog-destroy-${ option.windowid }-${ option.name }`, () => super.destroy())
      .todo(`dialog-top-${ option.windowid }-${ option.name }`, () => {
        win.removeBrowserView(this);
        win.addBrowserView(this);
      })
      .todo(`dialog-reset-${ option.windowid }-${ option.name }`, () => {
        if (this.vif) {
          this.setBounds({
            width: this.option.width,
            height: this.option.height,
            x: this.option.x,
            y: this.option.y
          });
        }
      })
      .todo(`dialog-excute-${ option.windowid }-${ option.name }`, (channel: string, ...args: any[]) => this.webContents.send(channel, ...args));
    if (this.dev) {
      devToolSwitch(this.webContents);
    }
  }
  abstract resize(bound: Rectangle): void;
}
