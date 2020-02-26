import {app} from 'electron';
import {createProtocol} from 'vue-cli-plugin-electron-builder/lib';
import {getConfig} from '@/main/util/config';
import {homedir} from 'os';
import JingWindow from '@/main/core/window';
import {resolve} from 'path';

import '@/main/util/cache';
// import '@/main/menu/view-context-menu';
// import '@/main/menu/window-context-menu';
// import '@/main/menu/window-quick-menu';

// const eventProxy = new EventProxy({});
app.setPath('userData', resolve(homedir(), 'ec'));
// 禁用硬件加速
app.disableHardwareAcceleration();
app.once('ready', () => {
  if (!process.env.WEBPACK_DEV_SERVER_URL) {
    createProtocol('jing');
  }
  /* eslint-disable no-new */
  new JingWindow({
    url: 'https://www.baidu.com',
    title: '新标签页',
    viewMode: 'CurrentWindowShow',
    closeMode: 'Forbid',
    titleMode: 'Fixed'
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
  // // bug收集
  // crashReporter.start({
  //   productName: 'ec',
  //   companyName: 'ec',
  //   ignoreSystemCrashHandler: true,
  //   submitURL: 'https://sentry.io/api/1680858/minidump/?sentry_key=e2433fe4fd844359b2b61b2d227137f1'
  // });
});
