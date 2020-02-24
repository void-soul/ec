import {ContextMenuParams, BrowserWindow, BrowserView, Rectangle, WebPreferences, WebContents, NativeImage} from 'electron';
import {Url} from 'url';
import * as http from 'http';
export interface UrlInfo extends Url {
  /** 调整、解析后的完整地址 */
  fullUrl: string;
  /** 初始地址 */
  urlStr: string;
  /** 是否可信任地址 */
  trustServer: boolean;
  /** 是否是软件内部地址 */
  buildIn: boolean;
  /** 是否是https */
  https: boolean;
}
/** 缓存接口定义 */
export class Cache {
  cached(...keys: string[]): {[key: string]: any};
  cache(key: string, value: any): void;
  cache(data: {[key: string]: any}): void;
  cacheRemove(...keys: string[]): void;
  cacheClear(): void;
  destroy(): void;
}
export interface HttpData extends http.IncomingMessage {
  data: string;
}
export class FileManager {
  downLoadConfirmPath(url: string): Promise<string>;
  downdLoad2Tmp(url: string): Promise<string>;
  removeTmp(url: string): Promise<void>;
  downLoad2Buffer(url: string): Promise<HttpData>;
}
export class ImageManager {
  getDefIcon(): string;
  getWindowIcon(): NativeImage;
  parseIco(url: string): Promise<string>;
  copyImageFromUrl(url: string): Promise<void>;
  fixSize(filepath: string, local?: boolean): Promise<void>;
  reSize(data: Buffer, {width, height}: {width?: number | undefined; height?: number | undefined;}): Promise<Buffer>
}
export class Store {
  store(key: string, value: any): void;
  stored(key: string, defValue?: any): any;
  storeHave(key: string): boolean;
  storeRemove(key: string): void;
  storeClear(): void;
}
export interface JingUtil {
  windowPreferences: WebPreferences;
  windowUrl: UrlInfo;
  newViewOption: ViewOption;
  cache: Cache;
  fileManager: FileManager;
  imageManager: ImageManager;
  store: Store;
  buildWebPreferences: (uri: string) => WebPreferences;
  getConfig: (key: string) => string | undefined;
  confirm: (message: string, detail: string, title: string) => Promise<boolean>;
  devToolSwitch: (webContents: WebContents) => void;
  encode: (str: string, charset?: "utf-8" | "gbk") => string;
  decode: (str: string, charset?: "utf-8" | "gbk") => string;
  saveFileDialog: (name: string, extensions: string[], defaultPath?: string | undefined) => Promise<string | undefined>;
  uriParse: (urlStr: string) => UrlInfo;
}
/** view查找参数 */
export interface ViewQuery {
  id?: number;
  url?: string;
  view?: JingView;
  /** 查找匹配到的view的下一个view,如果是最后一个则返回第0个 */
  next?: boolean;
  /** 查找匹配到的view的上一个view */
  prev?: boolean;
}
/** view查找结果 */
export interface ViewFound {
  id: number;
  index: number;
  view: JingView | null
}
/** 视窗打开方式,分别是 当前窗口中打开、新窗口中打开、当前窗口中打开但不展示、对话框完整高度、对话框完整宽度、普通对话框*/
export type ViewMode = 'CurrentWindowShow' | 'NewWindow' | 'CurrentWindowHide' | 'DialogFullHeight' | 'DialogFullWidth' | 'Dialog';
/** 视窗 关闭方式，分别是：可关闭、仅开发时可关闭、禁止关闭、可关闭但要询问用户 */
export type CloseMode = 'Enabled' | 'OnlyDev' | 'Forbid' | 'EnabledAndConfirm';
/** 视窗 标题改变方式, 分别是 固定、跟随（自动随页面内容） */
export type TitleMode = 'Fixed' | 'Follow';
/**
 * view的位置坐标，结合ViewMode使用。
 * ViewMode=CurrentWindowShow、NewWindow、CurrentWindowHide 时忽略此参数
 * ViewMode=DialogFullHeight时忽略height、y参数
 * ViewMode=DialogFullWidth时忽略width、x参数
 * ViewMode=Dialog时四个参数都有效
 */
export interface ViewPoint {
  height?: number;
  width?: number;
  x?: number;
  y?: number;
}
/** 大小|位置  */
export interface ViewOption {
  /** 初始标题,非必须 */
  title?: string;
  viewMode: ViewMode;
  closeMode: CloseMode;
  titleMode: 'Fixed' | 'Follow';
  /** 大小|位置,结合viewMode使用  */
  point?: {
    height?: number;
    width?: number;
    x?: number;
    y?: number;
  };
  /** 要打开的地址 */
  url: string;
}
export type ViewNetState = 'none' | 'finish' | 'loading' | 'failed' | 'cancel';
/** 右键菜单声明 */
export interface ContextMenu {
  readonly label: string;
  readonly id: string;
  readonly accelerator?: string;
}
/**
 * 插件接口定义
 * 目录结构为
 * index.js
 * 同级文件：icon.png 可选
 *
 */
export abstract class JingPlugin {
  /** 名称 */
  readonly name: string;
  /** 描述 */
  readonly description: string;
  /** 插件的编号,必须保证唯一,使用UUID */
  readonly code: string;
  /** 版本 */
  readonly version: string;
  /** 是否需要登录才能使用 */
  readonly needLogin: boolean;
  /** 脚本注入,rule=url;script\css 都是插件目录的相对路径指向的文件 */
  readonly injects: Array<{rule: RegExp; script: string[]; css: string[]}>;
  /** 所在窗体 */
  win: JingWindow | null;
  /** 工具辅助 */
  util: JingUtil | null;
  constructor (win: JingWindow, util: JingUtil);
  /** 加载成功时的回调 */
  init(win: JingWindow, util: JingUtil): void;
  /** 卸载时回调 */
  destroy(): void;
  /** 在window上右键点击、window的全局菜单时，本插件追加的右键菜单,此菜单只会在窗口初始化时、view变化调用 */
  windowMenu(viewId?: number): ContextMenu[];
  /** 在view上右键点击时，本插件追加的右键菜单 */
  viewMenu(param: ContextMenuParams): ContextMenu[];
  /** 右键菜单点击时 */
  onContextClick(param: ContextMenuParams, menuId: string): void;
}
/** 视窗定义 */
export class JingView {
  /** 视窗id */
  id: number;
  /** 窗体的内容id */
  webContentId: number;
  /** 加载过的标记 */
  loaded: boolean;
  /** 网路状态 */
  netState: ViewNetState;
  /** url解析结果 */
  url: UrlInfo;
  /** 图标 */
  icon: string;
  /** 标题 */
  title: string;
  /** 绑定的窗体id */
  windowId: number;
  viewMode: ViewMode;
  canGoBack: boolean;
  canGoForward: boolean;
  readonly closeMode: CloseMode;
  readonly titleMode: 'Fixed' | 'Follow';
  readonly point: ViewPoint;
  /** 是否已经设置过位置？每个view只允许设置一次 */
  hasSetPointed: boolean;
  /** 是否是一个对话框？对话框是特殊的一类，可以接收内部事件调用 */
  isDialog: boolean;
  constructor (viewOption: ViewOption);
  initEvent(view: BrowserView): void;
  destroy(ask?: boolean): Promise<void>;
  refresh(): Promise<void>;
  print(): void;
  find(txt: string, forward: boolean, findNext: boolean): void;
  stopFind(): void;
  dev(): void;
  forward(): void;
  back(): void;
  stop(): void;
}
/** 窗体定义 */
export class JingWindow {
  /** 活跃视窗id */
  activeId: number;
  /** 窗体的内容id */
  webContentId: number;
  /** 窗体id */
  id: number;
  /** 窗体的视窗集合 */
  views: JingView[];
  /** 窗体的插件集合 */
  plugins: JingPlugin[];
  constructor (viewOption: ViewOption);
  /** 注销window */
  destroy(): void;
  /** 通过url打开一个view */
  open(url: string): void;
  /** 通过完整的选项新增一个view */
  add(viewOption: ViewOption): void;
  /** 追加一个view */
  push(jingView: JingView): void;
  /** 移除一个view，可指定是否关闭 */
  remove(query?: ViewQuery, close?: boolean): void;
  /** 匹配已经存在的view */
  find(query?: ViewQuery): ViewFound;
  /** 激活view */
  active(query?: ViewQuery): void;
  /** 从一个位置移动到另一个位置 */
  sort(fromIndex: number, toIndex: number): void;
  /** 通知内部事件 */
  notice(channel: string, ...args: any[]): void;
  /** 业务广播事件 */
  broadcast(channel: string, ...args: any[]): void;
}
