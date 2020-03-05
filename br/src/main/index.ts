import {app, session} from 'electron';
import {createProtocol} from 'vue-cli-plugin-electron-builder/lib';
import {homedir} from 'os';
import JingWindow from '@/main/core/window';
import {resolve} from 'path';
import '@/main/util/cache';
import {jingApp} from '@/main/core/app';
import {EventProxy} from '@/main/util/event-proxy';
app.setPath('userData', resolve(homedir(), 'ec'));
// 禁用硬件加速
// app.disableHardwareAcceleration();
app.once('ready', async () => {
  if (!process.env.WEBPACK_DEV_SERVER_URL) {
    createProtocol('jing');
  }
  // session.defaultSession.webRequest.onHeadersReceived((details, callback) => {
  //   callback({
  //     responseHeaders: {
  //       ...details.responseHeaders,
  //       'Content-Security-Policy': ['default-src \'none\'']
  //     }
  //   })
  // });
  /* eslint-disable no-new */
  new EventProxy();
  await jingApp.loadPlugin();
  /* eslint-disable no-new */
  const win = new JingWindow();
  win.open('https://www.baidu.com');
});
