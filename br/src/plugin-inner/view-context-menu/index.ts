import {JingPlugin, JingWindow, JingUtil, ContextMenu} from 'plugin-line';
export default abstract class extends JingPlugin {
  name: string = '右键菜单';
  description: string = '常用右键菜单,管理view和manager';
  code: string = 'view-context-menu';
  version: string = '1.0.0';
  needLogin: boolean = false;
  injects: {rule: RegExp; script: string[]; css: string[];}[] = [];
  win: JingWindow | null = null;
  init(win: JingWindow, util: JingUtil): void {
    this.win = win;
  }
  destroy(): void {
    throw new Error('Method not implemented.');
  }
  windowMenu(viewId?: number | undefined): ContextMenu[] {
    throw new Error('Method not implemented.');
  }
  viewMenu(param: Electron.ContextMenuParams): ContextMenu[] {
    throw new Error('Method not implemented.');
  }
  onContextClick(param: Electron.ContextMenuParams, menuId: string): void {
    throw new Error('Method not implemented.');
  }
}