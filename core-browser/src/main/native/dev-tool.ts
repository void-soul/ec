import {WebContents} from 'electron';
import {getConfig} from '@/main/rs/config';
/**
 * 开发工具切换
 * @param webContents
 */
export const devToolSwitch = (webContents: WebContents) => {
  if (getConfig('VUE_APP_DEV') === '1') {
    if (webContents.isDevToolsOpened() === false) {
      webContents.openDevTools({
        mode: 'undocked',
      });
    } else if (webContents.isDevToolsFocused() === false) {
      webContents.devToolsWebContents.focus();
    } else {
      webContents.closeDevTools();
    }
  }
};
