import {JingPlugin, ContextMenuParams} from 'plugin-line';
import JingWindow from '@/main/core/window';
class JingApp {
  /** 当前活跃的windowid */
  activeWindowId: number = 0;
  private plugins: JingPlugin[] = [];
  constructor () {

  }
  windowContext(win: JingWindow, viewId?: number) {

  }
  viewContext(win: JingWindow, param: ContextMenuParams) {

  }
}
export const jingApp = new JingApp();
