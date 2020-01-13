import {JingDialog} from '@/main/extends/dialog';
import {Rectangle} from 'electron';
import {TOOLBAR_HEIGHT} from '@/share/global';
const width = 300;
const height = 40;
export class FindDialog extends JingDialog {
  constructor (windowid: number, bound: Rectangle) {
    super({
      windowid,
      uri: 'jing://find.html',
      width,
      height,
      x: bound.width - width - 10,
      y: TOOLBAR_HEIGHT + 10,
      name: 'find'
    });
  }
  resize(bound: Rectangle): void {
    this.option.x = bound.width - width - 10;
  }
}
