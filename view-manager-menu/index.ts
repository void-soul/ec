import {JingPlugin, ContextMenuParams, ContextMenu, JingWindow, JingUtil} from 'plugin-line';
export default class extends JingPlugin {
  injects: {rule: RegExp; script: string[]; css: string[]}[] = [];

  constructor (win: JingWindow, util: JingUtil) {
    super(win, util);
    console.log(win, util);
  }

  destroy() {
    throw new Error('Method not implemented.');
  }

  windowMenu(viewId?: number | undefined): ContextMenu[] {
    throw new Error('Method not implemented.');
  }

  viewMenu(param: ContextMenuParams): ContextMenu[] {
    throw new Error('Method not implemented.');
  }

  onContextClick(param: ContextMenuParams, menuId: string): void {
    throw new Error('Method not implemented.');
  }
};
