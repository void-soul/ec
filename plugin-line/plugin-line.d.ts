/// <reference types="node" />
import {Url} from 'url';
import * as http from 'http';
declare module 'plugin-line';
declare module 'plugin-line' {
  interface MediaFlags {
    /**
     * Whether the media element has crashed.
     */
    inError: boolean;
    /**
     * Whether the media element is paused.
     */
    isPaused: boolean;
    /**
     * Whether the media element is muted.
     */
    isMuted: boolean;
    /**
     * Whether the media element has audio.
     */
    hasAudio: boolean;
    /**
     * Whether the media element is looping.
     */
    isLooping: boolean;
    /**
     * Whether the media element's controls are visible.
     */
    isControlsVisible: boolean;
    /**
     * Whether the media element's controls are toggleable.
     */
    canToggleControls: boolean;
    /**
     * Whether the media element can be rotated.
     */
    canRotate: boolean;
  }
  interface EditFlags {
    /**
     * Whether the renderer believes it can undo.
     */
    canUndo: boolean;
    /**
     * Whether the renderer believes it can redo.
     */
    canRedo: boolean;
    /**
     * Whether the renderer believes it can cut.
     */
    canCut: boolean;
    /**
     * Whether the renderer believes it can copy
     */
    canCopy: boolean;
    /**
     * Whether the renderer believes it can paste.
     */
    canPaste: boolean;
    /**
     * Whether the renderer believes it can delete.
     */
    canDelete: boolean;
    /**
     * Whether the renderer believes it can select all.
     */
    canSelectAll: boolean;
  }
  interface ContextMenuParams {
    /**
   * x coordinate.
   */
    x: number;
    /**
     * y coordinate.
     */
    y: number;
    /**
     * URL of the link that encloses the node the context menu was invoked on.
     */
    linkURL: string;
    /**
     * Text associated with the link. May be an empty string if the contents of the
     * link are an image.
     */
    linkText: string;
    /**
     * URL of the top level page that the context menu was invoked on.
     */
    pageURL: string;
    /**
     * URL of the subframe that the context menu was invoked on.
     */
    frameURL: string;
    /**
     * Source URL for the element that the context menu was invoked on. Elements with
     * source URLs are images, audio and video.
     */
    srcURL: string;
    /**
     * Type of the node the context menu was invoked on. Can be `none`, `image`,
     * `audio`, `video`, `canvas`, `file` or `plugin`.
     */
    mediaType: ('none' | 'image' | 'audio' | 'video' | 'canvas' | 'file' | 'plugin');
    /**
     * Whether the context menu was invoked on an image which has non-empty contents.
     */
    hasImageContents: boolean;
    /**
     * Whether the context is editable.
     */
    isEditable: boolean;
    /**
     * Text of the selection that the context menu was invoked on.
     */
    selectionText: string;
    /**
     * Title or alt text of the selection that the context was invoked on.
     */
    titleText: string;
    /**
     * The misspelled word under the cursor, if any.
     */
    misspelledWord: string;
    /**
     * An array of suggested words to show the user to replace the `misspelledWord`.
     * Only available if there is a misspelled word and spellchecker is enabled.
     */
    dictionarySuggestions: string[];
    /**
     * The character encoding of the frame on which the menu was invoked.
     */
    frameCharset: string;
    /**
     * If the context menu was invoked on an input field, the type of that field.
     * Possible values are `none`, `plainText`, `password`, `other`.
     */
    inputFieldType: string;
    /**
     * Input source that invoked the context menu. Can be `none`, `mouse`, `keyboard`,
     * `touch` or `touchMenu`.
     */
    menuSourceType: ('none' | 'mouse' | 'keyboard' | 'touch' | 'touchMenu');
    /**
     * The flags for the media element the context menu was invoked on.
     */
    mediaFlags: MediaFlags;
    /**
     * These flags indicate whether the renderer believes it is able to perform the
     * corresponding action.
     */
    editFlags: EditFlags;
  }
  interface Referrer {

    // Docs: http://electronjs.org/docs/api/structures/referrer

    /**
     * Can be `default`, `unsafe-url`, `no-referrer-when-downgrade`, `no-referrer`,
     * `origin`, `strict-origin-when-cross-origin`, `same-origin` or `strict-origin`.
     * See the Referrer-Policy spec for more details on the meaning of these values.
     */
    policy: ('default' | 'unsafe-url' | 'no-referrer-when-downgrade' | 'no-referrer' | 'origin' | 'strict-origin-when-cross-origin' | 'same-origin' | 'strict-origin');
    /**
     * HTTP Referrer URL.
     */
    url: string;
  }
  interface UploadRawData {

    // Docs: http://electronjs.org/docs/api/structures/upload-raw-data

    /**
     * Data to be uploaded.
     */
    bytes: Buffer;
    /**
     * `rawData`.
     */
    type: string;
  }
  interface UploadFile {

    // Docs: http://electronjs.org/docs/api/structures/upload-file

    /**
     * Path of file to be uploaded.
     */
    filePath: string;
    /**
     * Number of bytes to read from `offset`. Defaults to `0`.
     */
    length: number;
    /**
     * Last Modification time in number of seconds since the UNIX epoch.
     */
    modificationTime: number;
    /**
     * Defaults to `0`.
     */
    offset: number;
    /**
     * `file`.
     */
    type: string;
  }

  interface UploadBlob {

    // Docs: http://electronjs.org/docs/api/structures/upload-blob

    /**
     * UUID of blob data to upload.
     */
    blobUUID: string;
    /**
     * `blob`.
     */
    type: string;
  }

  interface LoadURLOptions {
    /**
     * An HTTP Referrer url.
     */
    httpReferrer?: (string) | (Referrer);
    /**
     * A user agent originating the request.
     */
    userAgent?: string;
    /**
     * Extra headers separated by "\n"
     */
    extraHeaders?: string;
    postData?: (UploadRawData[]) | (UploadFile[]) | (UploadBlob[]);
    /**
     * Base url (with trailing path separator) for files to be loaded by the data url.
     * This is needed only if the specified `url` is a data url and needs to load other
     * files.
     */
    baseURLForDataURL?: string;
  }
  interface InsertCSSOptions {
    /**
     * Can be either 'user' or 'author'; Specifying 'user' enables you to prevent
     * websites from overriding the CSS you insert. Default is 'author'.
     */
    cssOrigin?: string;
  }
  interface WebSource {

    // Docs: http://electronjs.org/docs/api/structures/web-source

    code: string;
    /**
     * Default is 1.
     */
    startLine?: number;
    url?: string;
  }
  interface FindInPageOptions {
    /**
     * Whether to search forward or backward, defaults to `true`.
     */
    forward?: boolean;
    /**
     * Whether the operation is first request or a follow up, defaults to `false`.
     */
    findNext?: boolean;
    /**
     * Whether search should be case-sensitive, defaults to `false`.
     */
    matchCase?: boolean;
    /**
     * Whether to look only at the start of words. defaults to `false`.
     */
    wordStart?: boolean;
    /**
     * When combined with `wordStart`, accepts a match in the middle of a word if the
     * match begins with an uppercase letter followed by a lowercase or non-letter.
     * Accepts several other intra-word matches, defaults to `false`.
     */
    medialCapitalAsWordStart?: boolean;
  }
  interface Margins {
    /**
     * Can be `default`, `none`, `printableArea`, or `custom`. If `custom` is chosen,
     * you will also need to specify `top`, `bottom`, `left`, and `right`.
     */
    marginType?: ('default' | 'none' | 'printableArea' | 'custom');
    /**
     * The top margin of the printed web page, in pixels.
     */
    top?: number;
    /**
     * The bottom margin of the printed web page, in pixels.
     */
    bottom?: number;
    /**
     * The left margin of the printed web page, in pixels.
     */
    left?: number;
    /**
     * The right margin of the printed web page, in pixels.
     */
    right?: number;
  }
  interface WebContentsPrintOptions {
    /**
     * Don't ask user for print settings. Default is `false`.
     */
    silent?: boolean;
    /**
     * Prints the background color and image of the web page. Default is `false`.
     */
    printBackground?: boolean;
    /**
     * Set the printer device name to use. Must be the system-defined name and not the
     * 'friendly' name, e.g 'Brother_QL_820NWB' and not 'Brother QL-820NWB'.
     */
    deviceName?: string;
    /**
     * Set whether the printed web page will be in color or grayscale. Default is
     * `true`.
     */
    color?: boolean;
    margins?: Margins;
    /**
     * Whether the web page should be printed in landscape mode. Default is `false`.
     */
    landscape?: boolean;
    /**
     * The scale factor of the web page.
     */
    scaleFactor?: number;
    /**
     * The number of pages to print per page sheet.
     */
    pagesPerSheet?: number;
    /**
     * Whether the web page should be collated.
     */
    collate?: boolean;
    /**
     * The number of copies of the web page to print.
     */
    copies?: number;
    /**
     * The page range to print. Should have two keys: `from` and `to`.
     */
    pageRanges?: Record<string, number>;
    /**
     * Set the duplex mode of the printed web page. Can be `simplex`, `shortEdge`, or
     * `longEdge`.
     */
    duplexMode?: ('simplex' | 'shortEdge' | 'longEdge');
    dpi?: Dpi;
    /**
     * String to be printed as page header.
     */
    header?: string;
    /**
     * String to be printed as page footer.
     */
    footer?: string;
  }
  interface Dpi {
    /**
     * The horizontal dpi.
     */
    horizontal?: number;
    /**
     * The vertical dpi.
     */
    vertical?: number;
  }
  interface Rectangle {

    // Docs: http://electronjs.org/docs/api/structures/rectangle

    /**
     * The height of the rectangle (must be an integer).
     */
    height: number;
    /**
     * The width of the rectangle (must be an integer).
     */
    width: number;
    /**
     * The x coordinate of the origin of the rectangle (must be an integer).
     */
    x: number;
    /**
     * The y coordinate of the origin of the rectangle (must be an integer).
     */
    y: number;
  }
  interface Result {
    requestId: number;
    /**
     * Position of the active match.
     */
    activeMatchOrdinal: number;
    /**
     * Number of Matches.
     */
    matches: number;
    /**
     * Coordinates of first match region.
     */
    selectionArea: Rectangle;
    finalUpdate: boolean;
  }
  interface UrlInfo extends Url {
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
  /** 内存缓存接口定义 */
  class Cache {
    /** 获取已经缓存好的对象 */
    cached(...keys: string[]): {[key: string]: any};
    /** 缓存对象 */
    cache(key: string, value: any): void;
    /** 缓存对象 */
    cache(data: {[key: string]: any}): void;
    /** 删除缓存 */
    cacheRemove(...keys: string[]): void;
    /** 是否缓存过 */
    cacheHave(key: string): boolean;
    /** 缓存清除 */
    cacheClear(): void;
  }
  interface HttpData extends http.IncomingMessage {
    data: string;
  }
  class FileManager {
    /** 先询问用户，再下载到用户指定的路径 */
    downLoadConfirmPath(url: string): Promise<string>;
    /** 不询问用户，直接下载到用户的临时目录 */
    downdLoad2Tmp(url: string): Promise<string>;
    /** 删除url下载的临时文件 */
    removeTmp(url: string): Promise<void>;
    /** 下载文件到一个buffer之中 */
    downLoad2Buffer(url: string): Promise<HttpData>;
  }
  class ImageManager {
    /** 获取默认图标 */
    getDefIcon(): string;
    /** 转换url图标地址为buffer */
    parseIco(url: string): Promise<string>;
    /** 将url指向的图复制到剪贴板 */
    copyImageFromUrl(url: string): Promise<void>;
    /** 根据指定的最小宽、长优化图片大小 */
    fixSize(filepath: string, local?: boolean): Promise<void>;
    /** 重新设置一个图大小 */
    reSize(data: Buffer, {width, height}: {width?: number | undefined; height?: number | undefined}): Promise<Buffer>
  }
  /** 持久缓存定义 */
  class Store {
    /** 缓存起来  */
    store(key: string, value: any): void;
    /** 取回缓存 */
    stored(key: string, defValue?: any): any;
    /** 是否有某个缓存 */
    storeHave(key: string): boolean;
    /** 删除缓存 */
    storeRemove(key: string): void;
    /** 缓存清空 */
    storeClear(): void;
  }
  interface JingUtil {
    /** 内存缓存接口定义 */
    cache: Cache;
    /** 文件处理 */
    fileManager: FileManager;
    /** 图片处理 */
    imageManager: ImageManager;
    /** 持久缓存 */
    store: Store;
    /** window管理 */
    window: {
      /** 根据id获取一个window */
      fromId(id: number): JingWindow;
      /** 获取到所有window */
      getAllJingWindows(): JingWindow[];
      /** 获取到当前活动window */
      getFocusedWindow(): JingWindow;
    };
    /** view管理 */
    view: {
      /** 根据id获取一个view */
      fromId(id: number): JingView;
    };
    /** 获取系统配置 */
    getConfig: (key: string) => string | undefined;
    /** 弹出用户询问 */
    confirm: (message: string, detail: string, title: string) => Promise<boolean>;
    /** 加码 */
    encode: (str: string, charset?: 'utf-8' | 'gbk') => string;
    /** 转码 */
    decode: (str: string, charset?: 'utf-8' | 'gbk') => string;
    /** 打开文件保存询问框，并返回用户的选择 */
    saveFileDialog: (name: string, extensions: string[], defaultPath?: string | undefined) => Promise<string | undefined>;
  }
  /** view查找参数 */
  interface ViewQuery {
    id?: number;
    url?: string;
    view?: JingView;
    /** 查找匹配到的view的下一个view,如果是最后一个则返回第0个 */
    next?: boolean;
    /** 查找匹配到的view的上一个view */
    prev?: boolean;
  }
  /** view查找结果 */
  interface ViewFound {
    id: number;
    index: number;
    view: JingView | null;
  }
  type ViewMode = 'CurrentWindowShow' | 'NewWindow' | 'CurrentWindowHide' | 'DialogFullHeight' | 'DialogFullWidth' | 'Dialog';
  type CloseMode = 'Enabled' | 'OnlyDev' | 'Forbid' | 'EnabledAndConfirm';
  type TitleMode = 'Fixed' | 'Follow';
  /**
   * view的位置坐标，结合ViewMode使用。
   * ViewMode=CurrentWindowShow、NewWindow、CurrentWindowHide 时忽略此参数
   * ViewMode=DialogFullHeight时忽略height、y参数
   * ViewMode=DialogFullWidth时忽略width、x参数
   * ViewMode=Dialog时四个参数都有效
   */
  interface ViewPoint {
    height?: number;
    width?: number;
    x?: number;
    y?: number;
  }
  /** 大小|位置  */
  interface ViewOption {
    /** 初始标题,非必须 */
    title?: string;
    /** 视窗打开方式,分别是 当前窗口中打开、新窗口中打开、当前窗口中打开但不展示、对话框完整高度、对话框完整宽度、普通对话框*/
    viewMode: ViewMode;
    /** 视窗 关闭方式，分别是：可关闭、仅开发时可关闭、禁止关闭、可关闭但要询问用户 */
    closeMode: CloseMode;
    /** 视窗 标题改变方式, 分别是 固定、跟随（自动随页面内容） */
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
  type ViewNetState = 'none' | 'finish' | 'loading' | 'failed' | 'cancel';
  /** 右键菜单声明 */
  interface ContextMenu {
    readonly label: string;
    readonly id: string;
    readonly accelerator?: string;
  }
  /** 插件接口定义 */
  abstract class JingPlugin {
    /** 工具辅助 */
    protected readonly util: JingUtil;
    /** 程序启动时会创建插件 */
    constructor (util: JingUtil);
    /** 当创建新window时调用此函数 */
    abstract onNewWindow(win: JingWindow): void;
    /** 注册全局快捷键时调用 */
    abstract shotMenu(): ContextMenu[];
    /** 在window上右键点击、window的全局菜单时，本插件追加的右键菜单,此菜单只会在窗口初始化时、view变化调用 */
    abstract windowContext(win: JingWindow, viewId?: number): ContextMenu[];
    /** 在view上右键点击时，本插件追加的右键菜单 */
    abstract viewContext(win: JingWindow, param: ContextMenuParams): ContextMenu[];
    /** 插件的注销方法 */
    abstract destroy(): void;
  }
  /** 视窗定义 */
  class JingView {
    /** 视窗id */
    id: number;
    /** 窗体的内容id */
    webContentId: number;
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
    /** 视窗打开方式,分别是 当前窗口中打开、新窗口中打开、当前窗口中打开但不展示、对话框完整高度、对话框完整宽度、普通对话框*/
    viewMode: ViewMode;
    /** 当前视窗能返回吗 */
    canGoBack: boolean;
    /** 当前视窗能前进吗 */
    canGoForward: boolean;
    /** 视窗 关闭方式，分别是：可关闭、仅开发时可关闭、禁止关闭、可关闭但要询问用户 */
    readonly closeMode: CloseMode;
    /** 视窗 标题改变方式, 分别是 固定、跟随（自动随页面内容） */
    readonly titleMode: 'Fixed' | 'Follow';
    /** 初始坐标信息 */
    readonly point: ViewPoint;
    /** 是否已经设置过位置？每个view只允许设置一次 */
    hasSetPointed: boolean;
    /** 是否内部专用的、功能特殊的插件产生的页面？这种页面可接收 window、view变动事件 */
    isBuildIn: boolean;
    /** 是否加载过 */
    loaded: boolean;
    constructor (viewOption: ViewOption);
    /** 【有变更】url不传时，表示刷新 https://www.electronjs.org/docs/api/web-contents#contentsloadurlurl-options */
    loadURL(url?: string | undefined, options?: LoadURLOptions | undefined): Promise<void>;
    /** https://www.electronjs.org/docs/api/web-contents#contentsstop */
    stop(): void;
    /** https://www.electronjs.org/docs/api/web-contents#contentsclearhistory */
    clearHistory(): void;
    /** https://www.electronjs.org/docs/api/web-contents#contentsgoback */
    goBack(): void;
    /** https://www.electronjs.org/docs/api/web-contents#contentsgoforward */
    goForward(): void;
    /** 跳到指定 https://www.electronjs.org/docs/api/web-contents#contentsgotoindexindex */
    goToIndex(index: number): void;
    /** https://www.electronjs.org/docs/api/web-contents#contentsgotooffsetoffset */
    goToOffset(offset: number): void;
    /** https://www.electronjs.org/docs/api/web-contents#contentsinsertcsscss-options */
    insertCSS(css: string, options?: InsertCSSOptions | undefined): Promise<string>;
    /** https://www.electronjs.org/docs/api/web-contents#contentsremoveinsertedcsskey */
    removeInsertedCSS(key: string): Promise<void>;
    /** https://www.electronjs.org/docs/api/web-contents#contentsexecutejavascriptcode-usergesture */
    executeJavaScript(code: string, userGesture?: boolean | undefined): Promise<any>;
    /** https://www.electronjs.org/docs/api/web-contents#contentsexecutejavascriptinisolatedworldworldid-scripts-usergesture */
    executeJavaScriptInIsolatedWorld(worldId: number, scripts: WebSource[], userGesture?: boolean | undefined): Promise<any>;
    /** https://www.electronjs.org/docs/api/web-contents#contentsundo */
    undo(): void;
    /** https://www.electronjs.org/docs/api/web-contents#contentsredo */
    redo(): void;
    /** https://www.electronjs.org/docs/api/web-contents#contentscut */
    cut(): void;
    /** https://www.electronjs.org/docs/api/web-contents#contentscopy */
    copy(): void;
    /** https://www.electronjs.org/docs/api/web-contents#contentscopyimageatx-y */
    copyImageAt(x: number, y: number): void;
    /** https://www.electronjs.org/docs/api/web-contents#contentspaste */
    paste(): void;
    /** https://www.electronjs.org/docs/api/web-contents#contentspasteandmatchstyle */
    pasteAndMatchStyle(): void;
    /** https://www.electronjs.org/docs/api/web-contents#contentsdelete */
    delete(): void;
    /** https://www.electronjs.org/docs/api/web-contents#contentsselectall */
    selectAll(): void;
    /** https://www.electronjs.org/docs/api/web-contents#contentsunselect */
    unselect(): void;
    /** https://www.electronjs.org/docs/api/web-contents#contentsreplacetext */
    replace(text: string): void;
    /** https://www.electronjs.org/docs/api/web-contents#contentsreplacemisspellingtext */
    replaceMisspelling(text: string): void;
    /** https://www.electronjs.org/docs/api/web-contents#contentsinserttexttext */
    insertText(text: string): Promise<void>;
    /** https://www.electronjs.org/docs/api/web-contents#contentsfindinpagetext-options */
    findInPage(text: string, options?: FindInPageOptions | undefined): void;
    /** 【有变更】默认clearSelection  https://www.electronjs.org/docs/api/web-contents#contentsstopfindinpageaction */
    stopFindInPage(action?: "clearSelection" | "keepSelection" | "activateSelection"): void;
    /** https://www.electronjs.org/docs/api/web-contents#contentssendchannel-args */
    send(channel: string, ...args: any): void;
    /** https://www.electronjs.org/docs/api/web-contents#contentsprintoptions-callback */
    print(options?: WebContentsPrintOptions | undefined, callback?: ((success: boolean, failureReason: "cancelled" | "failed") => void) | undefined): void;
    /** 注销 */
    destroy(ask?: boolean): Promise<void>;
    /** 切换开发者工具 */
    dev(): void;
  }
  /** 窗体定义 */
  class JingWindow {
    /** 活跃视窗id */
    activeId: number;
    /** 窗体的内容id */
    webContentId: number;
    /** 窗体id */
    id: number;
    /** 窗体的视窗集合 */
    views: JingView[];
    constructor (viewOption: ViewOption);
    /** 注销window */
    destroy(): void;
    /** 通过url打开一个view */
    open(url: string): void;
    /** 通过完整的选项新增一个view */
    add(viewOption: ViewOption): void;
    /** 追加一个view */
    push(query: ViewQuery): void;
    /** 移除一个view，可指定是否关闭 */
    remove(query?: ViewQuery, close?: boolean): void;
    /** 匹配已经存在的view */
    find(query?: ViewQuery): ViewFound;
    /** 激活view */
    active(query?: ViewQuery): void;
    /** 从一个位置移动到另一个位置 */
    sort(id: number, toIndex: number): void;
    /** 通知内部事件 */
    notice(channel: string, ...args: any[]): void;
    /** 业务广播事件 */
    broadcast(channel: string, ...args: any[]): void;
    /** 获取视图列表 */
    getViews(): JingView[];
    /** 右键菜单 */
    contextMenu(viewId: number): void;
  }
}
declare global {
  interface JingViewMir {
    /** 【有变更】url不传时，表示刷新 https://www.electronjs.org/docs/api/web-contents#contentsloadurlurl-options */
    loadURL(url?: string | undefined, options?: LoadURLOptions | undefined): void;
    /** https://www.electronjs.org/docs/api/web-contents#contentsstop */
    stop(): void;
    /** https://www.electronjs.org/docs/api/web-contents#contentsclearhistory */
    clearHistory(): void;
    /** https://www.electronjs.org/docs/api/web-contents#contentsgoback */
    goBack(): void;
    /** https://www.electronjs.org/docs/api/web-contents#contentsgoforward */
    goForward(): void;
    /** 跳到指定 https://www.electronjs.org/docs/api/web-contents#contentsgotoindexindex */
    goToIndex(index: number): void;
    /** https://www.electronjs.org/docs/api/web-contents#contentsgotooffsetoffset */
    goToOffset(offset: number): void;
    /** https://www.electronjs.org/docs/api/web-contents#contentsinsertcsscss-options */
    insertCSS(css: string, options?: InsertCSSOptions | undefined): Promise<string>;
    /** https://www.electronjs.org/docs/api/web-contents#contentsremoveinsertedcsskey */
    removeInsertedCSS(key: string): void;
    /** https://www.electronjs.org/docs/api/web-contents#contentsexecutejavascriptcode-usergesture */
    executeJavaScript(code: string, userGesture?: boolean | undefined): Promise<any>;
    /** https://www.electronjs.org/docs/api/web-contents#contentsexecutejavascriptinisolatedworldworldid-scripts-usergesture */
    executeJavaScriptInIsolatedWorld(worldId: number, scripts: WebSource[], userGesture?: boolean | undefined): Promise<any>;
    /** https://www.electronjs.org/docs/api/web-contents#contentsundo */
    undo(): void;
    /** https://www.electronjs.org/docs/api/web-contents#contentsredo */
    redo(): void;
    /** https://www.electronjs.org/docs/api/web-contents#contentscut */
    cut(): void;
    /** https://www.electronjs.org/docs/api/web-contents#contentscopy */
    copy(): void;
    /** https://www.electronjs.org/docs/api/web-contents#contentscopyimageatx-y */
    copyImageAt(x: number, y: number): void;
    /** https://www.electronjs.org/docs/api/web-contents#contentspaste */
    paste(): void;
    /** https://www.electronjs.org/docs/api/web-contents#contentspasteandmatchstyle */
    pasteAndMatchStyle(): void;
    /** https://www.electronjs.org/docs/api/web-contents#contentsdelete */
    delete(): void;
    /** https://www.electronjs.org/docs/api/web-contents#contentsselectall */
    selectAll(): void;
    /** https://www.electronjs.org/docs/api/web-contents#contentsunselect */
    unselect(): void;
    /** https://www.electronjs.org/docs/api/web-contents#contentsreplacetext */
    replace(text: string): void;
    /** https://www.electronjs.org/docs/api/web-contents#contentsreplacemisspellingtext */
    replaceMisspelling(text: string): void;
    /** https://www.electronjs.org/docs/api/web-contents#contentsinserttexttext */
    insertText(text: string): void;
    /** https://www.electronjs.org/docs/api/web-contents#contentsfindinpagetext-options */
    findInPage(text: string, options?: FindInPageOptions | undefined): void;
    /** 【有变更】默认clearSelection  https://www.electronjs.org/docs/api/web-contents#contentsstopfindinpageaction */
    stopFindInPage(action?: "clearSelection" | "keepSelection" | "activateSelection"): void;
    /** https://www.electronjs.org/docs/api/web-contents#contentsprintoptions-callback */
    print(options?: WebContentsPrintOptions | undefined): void;
    /** 注销 */
    destroy(ask?: boolean): void;
    /** 切换开发者工具 */
    dev(): void;
  }
  interface JingWindowMir {
    /** 注销window */
    destroy(): void;
    /** 通过url打开一个view */
    open(url: string): void;
    /** 通过完整的选项新增一个view */
    add(viewOption: ViewOption): void;
    /** 追加一个view */
    push(query: ViewQuery): void;
    /** 移除一个view，可指定是否关闭 */
    remove(query?: ViewQuery, close?: boolean): void;
    /** 激活view */
    active(query?: ViewQuery): void;
    /** 从一个位置移动到另一个位置 */
    sort(id: number, toIndex: number): void;
    /** 通知内部事件 */
    notice(channel: string, ...args: any[]): void;
    /** 业务广播事件 */
    broadcast(channel: string, ...args: any[]): void;
    /** 获取视图列表 */
    getViews(): Promise<JingView[]>;
    /** 打开右键菜单 */
    contextMenu(viewId: number): void;
  }
  class NoticeEvent {
    on(channel: 'did-finish-load', listener: (viewid: number) => void): void;
    on(channel: 'did-fail-load', listener: (viewid: number, errorCode: number, errorDescription: string, validatedURL: string, isMainFrame: boolean, frameProcessId: number, frameRoutingId: number) => void): void;
    on(channel: 'did-fail-provisional-load', listener: (viewid: number, errorCode: number, errorDescription: string, validatedURL: string, isMainFrame: boolean, frameProcessId: number, frameRoutingId: number) => void): void;
    on(channel: 'did-start-loading', listener: (viewid: number) => void): void;
    on(channel: 'did-stop-loading', listener: (viewid: number) => void): void;
    on(channel: 'page-title-updated', listener: (viewid: number, title: string, explicitSet: boolean) => void): void;
    on(channel: 'page-favicon-updated', listener: (viewid: number, title: string, icon: string) => void): void;
    on(channel: 'page-url-updated', listener: (viewid: number, url: UrlInfo) => void): void;
    on(channel: 'found-in-page', listener: (viewid: number, result: Result) => void): void;
    on(channel: 'add-view', listener: (view: JingView) => void): void;
    on(channel: 'remove-view', listener: (viewid: number) => void): void;
    on(channel: 'active-view', listener: (viewid: number) => void): void;
  }
  interface Window {
    brage: {
      /** 当前所在视窗id */
      windowid: number;
      /** 当前所在窗体id */
      viewid?: number;
      /** 获取一个window对象 */
      getWindow(id?: number): JingWindowMir;
      /** 获取一个view对象 */
      getView(id?: number): JingViewMir;
      /** 监听内部事件 */
      notice: NoticeEvent;
      /** 监听业务事件 */
      broadcast: (channel: string, listener: (...args: any[]) => void) => void;
    };
  }
}