import { JingPlugin, ContextMenu, PluginManifest } from 'plugin-line';
import path from 'path';
import fs from 'fs';
import vm from 'vm';
import * as util from '@/main/util';
import { app, nativeImage, ContextMenuParams, Menu, MenuItemConstructorOptions, BrowserWindow, webContents, WebContents } from 'electron';
import JingWindow from './window';
import JingView from './view';

interface Plugin extends JingPlugin {
  name: string;
  title?: string;
  icon?: string;
  version: string;
  description?: string;
  required?: boolean;
  beta?: boolean;
  login?: boolean;
  keywords?: string;
  homepage?: string;
  rule?: RegExp;
  id: string;
}

class JingApp {
  private plugins: Plugin[] = [];
  private injectJsItems: Array<{rule?: RegExp; code: string}> = [];
  private injectCssItems: Array<{rule?: RegExp; code: string}> = [];
  async loadPlugin () {
    const pluginPath = path.join(app.getPath('userData'), 'plugin');
    const dirs = await fs.promises.readdir(pluginPath);
    for (const dir of dirs) {
      const fullDir = path.join(pluginPath, dir);
      const stat = await fs.promises.stat(fullDir);
      const indexFile = path.join(pluginPath, dir, 'js', 'index.js');
      // 如果是目录、index.js存在,开始初始化
      if (stat.isDirectory() && fs.existsSync(indexFile)) {
        const js = await fs.promises.readFile(indexFile, { encoding: 'utf-8' });
        const PluginBuild = vm.runInThisContext(js.toString());
        const plugin = PluginBuild(util) as Plugin;
        // 读取manifest.json
        const manifestData = await fs.promises.readFile(path.join(pluginPath, dir, 'manifest.json'), { encoding: 'utf-8' });
        const manifest = JSON.parse(manifestData.toString()) as PluginManifest;
        Object.assign(plugin, manifest);
        if (manifest.rule) {
          console.log(manifest.rule);
          plugin.rule = new RegExp(manifest.rule);
        }
        for (const js of manifest.injectJs) {
          const code = await fs.promises.readFile(path.join(pluginPath, dir, 'js', `${ js[1] }.js`), { encoding: 'utf-8' });
          const rule = js[0] ? new RegExp(js[0]) : undefined;
          this.injectJsItems.push({ code, rule });
        }
        for (const js of manifest.injectCss) {
          const code = await fs.promises.readFile(path.join(pluginPath, dir, 'css', `${ js[1] }.css`), { encoding: 'utf-8' });
          const rule = js[0] ? new RegExp(js[0]) : undefined;
          this.injectCssItems.push({ code, rule });
        }
        // 读取icon
        const iconFile = path.join(pluginPath, dir, 'icon.png');
        if (fs.existsSync(iconFile)) {
          plugin.icon = nativeImage.createFromPath(iconFile).toDataURL();
        }

        this.plugins.push(plugin);
      }
    }
    this.shotMenu();
  }

  /** 当创建新window时调用此函数 */
  onNewWindow (win: JingWindow): void {
    for (const plugin of this.plugins) {
      plugin.onNewWindow(win);
    }
  }

  /** 注册全局快捷键时调用 */
  shotMenu (): void {
    const menus = new Array<MenuItemConstructorOptions>();
    for (const plugin of this.plugins) {
      const plMenus = plugin.shotMenu();
      for (const menu of plMenus) {
        menus.push(this.generMenu(menu));
      }
    }
    Menu.setApplicationMenu(Menu.buildFromTemplate(menus));
  }

  /** 在window上右键点击、window的全局菜单时，本插件追加的右键菜单,此菜单只会在窗口初始化时、view变化调用 */
  windowContext (win: JingWindow, view: JingView) {
    const menus = new Array<MenuItemConstructorOptions>();
    for (const plugin of this.plugins) {
      const plMenus = plugin.windowContext(win, view);
      for (const menu of plMenus) {
        menus.push(this.generMenu(menu));
      }
    }
    Menu.buildFromTemplate(menus).popup({
      window: BrowserWindow.fromId(win.id)
    });
  }

  /** 在view上右键点击时，本插件追加的右键菜单 */
  viewContext (win: JingWindow, view: JingView, param: ContextMenuParams) {
    const menus = new Array<MenuItemConstructorOptions>();
    const plugins = this.filter(webContents.fromId(view.webContentId).getURL());
    for (const plugin of plugins) {
      const plMenus = plugin.viewContext(win, view, param);
      for (const menu of plMenus) {
        menus.push(this.generMenu(menu));
      }
    }
    Menu.buildFromTemplate(menus).popup({
      window: BrowserWindow.fromId(win.id)
    });
  }

  inject (content: WebContents) {
    const url = content.getURL();
    for (const item of this.injectJsItems) {
      if (!item.rule || item.rule.test(url)) {
        content.executeJavaScript(item.code, true);
      }
    }
    for (const item of this.injectCssItems) {
      if (!item.rule || item.rule.test(url)) {
        content.insertCSS(item.code);
      }
    }
  }

  filter (url: string): Plugin[] {
    return this.plugins.filter(item => !item.rule || item.rule.test(url));
  }

  destory () {
    for (const plugin of this.plugins) {
      plugin.destroy();
    }
    this.plugins.splice(0, this.plugins.length);
  }

  private generMenu (menu: ContextMenu): MenuItemConstructorOptions {
    const menuResult: MenuItemConstructorOptions = {
      role: menu.role,
      type: menu.type,
      label: menu.label,
      sublabel: menu.sublabel,
      toolTip: menu.toolTip,
      accelerator: menu.accelerator,
      enabled: menu.enabled,
      acceleratorWorksWhenHidden: menu.acceleratorWorksWhenHidden,
      visible: menu.visible,
      checked: menu.checked,
      registerAccelerator: menu.registerAccelerator,
      id: menu.id,
      before: menu.before,
      after: menu.after,
      beforeGroupContaining: menu.beforeGroupContaining,
      afterGroupContaining: menu.afterGroupContaining
    };
    if (menu.submenu) {
      menuResult.submenu = [];
      for (const sub of menu.submenu) {
        menuResult.submenu.push(this.generMenu(sub));
      }
    }
    if (menu.click) {
      menuResult.click = (menuItem, browserWindow, event) => {
        menu.click && menu.click(JingWindow.fromId(browserWindow.id));
      };
    }
    return menuResult;
  }
}
export const jingApp = new JingApp();
