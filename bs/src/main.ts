import {app} from 'electron';
import {homedir} from 'os';
import JingWindow from './core/window';
import {resolve} from 'path';
import './util/cache';
import {jingApp} from './core/app';
import {EventProxy} from './util/event-proxy';
app.setPath('userData', resolve(homedir(), 'ec'));
// 禁用硬件加速
// app.disableHardwareAcceleration();
app.once('ready', async () => {
  // createProtocol('plugin-template');
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
