import {JingWindow, JingUtil, ContextMenu} from 'plugin-line';
import {ContextMenuParams} from 'electron';
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
  readonly win: JingWindow;
  /** 工具辅助 */
  readonly util: JingUtil;
  constructor (win: JingWindow, util: JingUtil) {
    this.win = win;
    this.util = util;
  }
  /** 卸载时回调 */
  abstract destroy(): void;
  /** 在window上右键点击、window的全局菜单时，本插件追加的右键菜单,此菜单只会在窗口初始化时、view变化调用 */
  abstract windowMenu(viewId?: number): ContextMenu[];
  /** 在view上右键点击时，本插件追加的右键菜单 */
  abstract viewMenu(param: ContextMenuParams): ContextMenu[];
  /** 右键菜单点击时 */
  abstract onContextClick(param: ContextMenuParams, menuId: string): void;
}