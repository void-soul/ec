import {app, crashReporter} from 'electron';
import {APP_EXISTS} from '@/share/global';
import {createProtocol} from 'vue-cli-plugin-electron-builder/lib';
import {EventProxy} from '@/main/util/event-proxy';
import {getConfig} from '@/main/util/config';
import {homedir} from 'os';
import JingWindow from '@/main/core/window';
import {resolve} from 'path';

import '@/main/util/cache';
// import '@/main/menu/view-context-menu';
// import '@/main/menu/window-context-menu';
// import '@/main/menu/window-quick-menu';

// const eventProxy = new EventProxy({});
app.setPath('userData', resolve(homedir(), 'dmce'));
// 禁用硬件加速
app.disableHardwareAcceleration();
app.once('ready', () => {
  if (!process.env.WEBPACK_DEV_SERVER_URL) {
    createProtocol('jing');
  }
  // tslint:disable-next-line: no-unused-expression
  new JingWindow({
    url: 'https://www.baidu.com',
    title: '新标签页',
    viewMode: 'CurrentWindowShow',
    closeMode: 'Forbid',
    titleMode: 'Fixed',
  });
  // ctrl+c 关闭
  if (getConfig('VUE_APP_DEV') === '1') {
    process.on('message', (data: string) => {
      if (data === 'graceful-exit') {
        // eventProxy.do(APP_EXISTS);
      }
    });
    process.on('SIGTERM', () => {
      // eventProxy.do(APP_EXISTS);
    });
  }
  // bug收集
  crashReporter.start({
    productName: 'dmce',
    companyName: 'dmce',
    ignoreSystemCrashHandler: true,
    submitURL: 'https://sentry.io/api/1680858/minidump/?sentry_key=e2433fe4fd844359b2b61b2d227137f1'
  });
});
