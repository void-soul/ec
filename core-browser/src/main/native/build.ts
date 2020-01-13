/**
 * 窗体、视窗的构造选项
 */
import {WebPreferences} from 'electron';
import {WINDOW_CORE_URI} from '@/share/global';
import {uriParse} from '@/main/native/uri';
import {FREE_URI} from '../../share/global';
import enhance from './enhance';
/**
 * 构建窗体的特征选项
 * @param uri
 */
export const buildWebPreferences = (uri: string) => {
  const url = uriParse(uri);
  const preload = enhance.preload(url);
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
      fantasy: 'Impact',
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
export const newViewOption = {title: '正在加载', viewMode: 'CurrentWindowShowWithTab', closeMode: 'Enabled', titleMode: 'Follow'} as ViewOption;
// 释放资源路径
export const freeUrl = uriParse(FREE_URI);
// 释放资源窗体特征
export const freePreferences = buildWebPreferences(FREE_URI);
