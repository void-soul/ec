import JingWindow from '../core/window';
import JingView from '../core/view';
export * from './build';
export * from './cache';
export * from './config';
export * from './confirm';
export * from './dev-tool';
export * from './encode';
export * from './file-manager';
export * from './image-manager';
export * from './save-file';
export * from './store';
export * from './uri';
export const window = {
  fromId(id: number) {
    return JingWindow.fromId(id);
  },
  getAllJingWindows() {
    return JingWindow.getAllJingWindows();
  },
  getFocusedWindow() {
    return JingWindow.getFocusedWindow();
  }
};
export const view = {
  fromId(id: number) {
    return JingView.fromId(id);
  }
};
