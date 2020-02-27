/**
 * 窗体、视窗的构造选项
 */
import {WebPreferences, app} from 'electron';
import {WINDOW_CORE_URI, DEF_TITLE} from '@/main/util/global';
import {uriParse} from '@/main/util/uri';

import {ViewOption} from 'plugin-line';
import path from 'path';

const preload = path.join(app.getAppPath(), 'preload', 'brage.js');
/**
 * 构建窗体的特征选项
 * @param uri
 */
export const buildWebPreferences = (uri: string) => {
  const url = uriParse(uri);
  return {
    nodeIntegration: url.trustServer || url.buildIn,
    // nodeIntegration: true,
    nodeIntegrationInWorker: false,
    nodeIntegrationInSubFrames: false,
    enableRemoteModule: true,

    devTools: true,
    zoomFactor: 1,
    javascript: true,

    webSecurity: false,
    allowRunningInsecureContent: true,

    images: true,
    textAreasAreResizable: false,
    webgl: true,
    webaudio: true,
    plugins: true,
    experimentalFeatures: true,
    scrollBounce: true,

    defaultFontSize: 13,
    defaultFontFamily: {
      standard: 'Times New Roman',
      serif: 'Times New Roman',
      sansSerif: 'Arial',
      monospace: 'Courier New',
      cursive: 'Script',
      fantasy: 'Impact'
    },
    defaultMonospaceFontSize: 13,
    backgroundThrottling: true,
    offscreen: false,
    minimumFontSize: 0,
    defaultEncoding: 'utf-8',
    nativeWindowOpen: false,
    webviewTag: false,
    safeDialogs: true,
    safeDialogsMessage: '这个界面弹出了很多确认框，是否禁止继续弹出?',
    navigateOnDragDrop: false,

    contextIsolation: false,

    preload
  } as WebPreferences;
};
// 主页面的窗体特征
export const windowPreferences = buildWebPreferences(WINDOW_CORE_URI);
// 主页面的路径
export const windowUrl = uriParse(WINDOW_CORE_URI);
// 默认视窗选项
export const newViewOption = {title: DEF_TITLE, viewMode: 'CurrentWindowShow', closeMode: 'Enabled', titleMode: 'Follow'} as ViewOption;
