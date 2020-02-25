import JingWindow from '@/main/core/window';
import JingView from '@/main/core/view';
export * from '@/main/util/build';
export * from '@/main/util/cache';
export * from '@/main/util/config';
export * from '@/main/util/confirm';
export * from '@/main/util/dev-tool';
export * from '@/main/util/encode';
export * from '@/main/util/file-manager';
export * from '@/main/util/image-manager';
export * from '@/main/util/save-file';
export * from '@/main/util/store';
export * from '@/main/util/uri';
export const window = {
  fromId(id: number) {
    return JingWindow.fromId(id);
  },
  getAllJingWindows() {
    return JingWindow.getAllJingWindows();
  }
};
export const view = {
  fromId(id: number) {
    return JingView.fromId(id);
  }
};
