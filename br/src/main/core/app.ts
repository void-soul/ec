import {JingPlugin} from 'plugin-line';
import path from 'path';
import fs from 'fs';
import vm from 'vm';
import * as util from '@/main/util';
import {app, nativeImage} from 'electron';

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
  rule?: string;
  injectJs: string[][];
  injectCss: string[][];
}

class JingApp {
  private plugins: Plugin[] = [];

  async loadPlugin() {
    const pluginPath = path.join(app.getPath('userData'), 'ec', 'plugin');
    const dirs = await fs.promises.readdir(pluginPath);
    for (const dir of dirs) {
      const fullDir = path.join(pluginPath, dir);
      const stat = await fs.promises.stat(fullDir);
      const indexFile = path.join(pluginPath, dir, 'js', 'index.js');
      // 如果是目录、index.js存在,开始初始化
      if (stat.isDirectory() && fs.existsSync(indexFile)) {
        const js = await fs.promises.readFile(indexFile, {encoding: 'utf-8'});
        const PluginBuild = vm.runInThisContext(js.toString());
        const plugin = new PluginBuild(util) as Plugin;

        // 读取manifest.json
        const manifestData = await fs.promises.readFile(path.join(pluginPath, dir, 'manifest.json'), {encoding: 'utf-8'});
        const manifest = JSON.parse(manifestData.toString());
        Object.assign(plugin, manifest);

        // 读取icon
        const iconFile = path.join(pluginPath, dir, 'icon.png');
        if (fs.existsSync(iconFile)) {
          plugin.icon = nativeImage.createFromPath(iconFile).toDataURL();
        }

        this.plugins.push(plugin);
      }
    }
  }

  destory() {
    for (const plugin of this.plugins) {
      plugin.destroy();
    }
    this.plugins.splice(0, this.plugins.length);
  }
}
export const jingApp = new JingApp();
