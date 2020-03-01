import { JingPlugin, ContextMenuParams, ContextMenu, JingWindow, JingUtil } from 'plugin-line';
export default class extends JingPlugin {
  constructor (win: JingWindow, util: JingUtil) {
    super(win, util);
    console.log(win, util);
  }

  destroy () {
    throw new Error('Method not implemented.');
  }

  windowMenu (_viewId?: number | undefined): ContextMenu[] {
    throw new Error('Method not implemented.');
  }

  viewMenu (_param: ContextMenuParams): ContextMenu[] {
    throw new Error('Method not implemented.');
  }

  onContextClick (_param: ContextMenuParams, _menuId: string): void {
    throw new Error('Method not implemented.');
  }
};
