import {JingPlugin} from 'plugin-line';
import path from 'path';
import fs from 'fs';
import vm from 'vm';
import * as util from '@/main/util';
import {app} from 'electron';

interface Plugin extends JingPlugin {
  name: string;
  title: string;
  version: string;
  description: string;
  required: boolean;
  beta: boolean;
  login: boolean;
  keywords: string;
  homepage: string;
  rule: string;
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
      if ((await fs.promises.stat(fullDir)).isDirectory()) {

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
