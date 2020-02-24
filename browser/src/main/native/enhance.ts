import {app, webContents} from 'electron';
import fs from 'fs';
import path from 'path';
import {EventProxy} from '@/main/native/event-proxy';
import {APP_EXISTS} from '@/share/global';
import common from '@/enhance/css/common';
/**
 * 脚本注入
 * inject目录存放：页面加载完毕后注入的脚本,只会注入host/index.ts， item.taobao.com/index.ts
 * preload目录存放：一开始就注入的脚本，默认加载index.ts,除非存在 host/index.ts,例如 item.taobao.com/index.ts
 * @class Enhance
 */
class Enhance {
  private injectCache: {[name: string]: string} | null = {};
  private preloadCache: {[name: string]: string} | null = {};
  private preloadCommon = path.join(app.getAppPath(), 'preload', 'brage.js');
  constructor () {
    // tslint:disable-next-line: no-unused-expression
    new EventProxy({
      onExists: () => {
        this.injectCache = null;
        this.preloadCache = null;
      }
    });
  }

  inject(url: UrlInfo, contexts: webContents) {
    if (this.injectCache) {
      if (this.injectCache[url.hostname] === undefined) {
        const preloadFs = path.join(app.getAppPath(), 'inject', `${ url.hostname }.js`);
        if (fs.existsSync(preloadFs)) {
          this.injectCache[url.hostname] = `
            (function(){
              ${ fs.readFileSync(preloadFs, {encoding: 'utf-8'}) }
            })();
          `;
        } else {
          this.injectCache[url.hostname] = '';
        }
      }
      if (this.injectCache[url.hostname]) {
        contexts.executeJavaScript(this.injectCache[url.hostname], true);
      }
    }
    contexts.insertCSS(common);
  }

  preload(url: UrlInfo) {
    if (this.preloadCache) {
      if (!this.preloadCache[url.hostname]) {
        const preloadFs = path.join(app.getAppPath(), 'preload', `${ url.hostname }.js`);
        if (fs.existsSync(preloadFs)) {
          this.preloadCache[url.hostname] = preloadFs;
        } else {
          this.preloadCache[url.hostname] = '';
        }
      }
      return this.preloadCache[url.hostname] || this.preloadCommon;
    }
  }
}

export default new Enhance();
