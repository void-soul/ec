import {app} from 'electron';
import {createProtocol} from 'vue-cli-plugin-electron-builder/lib';
import {homedir} from 'os';
import JingWindow from '@/main/core/window';
import {resolve} from 'path';
import '@/main/util/cache';
import {jingApp} from './core/app';
app.setPath('userData', resolve(homedir(), 'ec'));
// 禁用硬件加速
app.disableHardwareAcceleration();
app.once('ready', async () => {
  if (!process.env.WEBPACK_DEV_SERVER_URL) {
    createProtocol('jing');
  }
  await jingApp.loadPlugin();
  /* eslint-disable no-new */
  new JingWindow();
});
