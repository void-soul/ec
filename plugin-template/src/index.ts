import {JingPlugin, ContextMenuParams, ContextMenu, JingWindow, JingView} from 'plugin-line';
export default class extends JingPlugin {
  autoContextMenu(_win: JingWindow, _view: JingView, _param: ContextMenuParams): ContextMenu[] {
    console.log('autoContextMenu');
    return [];
  }

  customContextMenu(_win: JingWindow, _view: JingView, ..._args: any[]): ContextMenu[] {
    console.log('customContextMenu');
    return [];
  }

  onNewWindow(_win: JingWindow): void {
    console.log('onNewWindow');
  }

  shotMenu(): ContextMenu[] {
    console.log('shotMenu');
    return [];
  }

  destroy(): void {
    console.log('destory');
  }
};
