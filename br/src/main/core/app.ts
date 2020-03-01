import {JingPlugin, ContextMenuParams} from 'plugin-line';
import path from 'path';
import fs from 'fs';
import vm from 'vm';
import * as util from '@/main/util';
import {app} from 'electron';
class JingApp {
  private plugins: JingPlugin[] = [];
  async loadPlugin() {
    const pluginPath = path.join(app.getPath('userData'), 'ec', 'plugin');
  }
}
export const jingApp = new JingApp();
