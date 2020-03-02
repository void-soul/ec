import {JingPlugin, ContextMenuParams, ContextMenu, JingWindow} from 'plugin-line';
export default class extends JingPlugin {
  onNewWindow(win: JingWindow): void {
    console.log('onNewWindow', win);
  }

  shotMenu(): ContextMenu[] {
    console.log('shotMenu');
    return [];
  }

  windowContext(win: JingWindow, viewId?: number | undefined): ContextMenu[] {
    console.log('windowContext', win, viewId);
    return [];
  }

  viewContext(win: JingWindow, param: ContextMenuParams): ContextMenu[] {
    console.log('viewContext', win, param);
    return [];
  }

  destroy(): void {
    console.log('destory');
  }
};
