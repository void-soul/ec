import {JingDialog} from '@/main/extends/dialog';
import {Rectangle} from 'electron';
import {TOOLBAR_HEIGHT} from '@/share/global';
const width = 300;
export class SwitchDialog extends JingDialog {
  protected vifSwitch = true;
  constructor (windowid: number, bound: Rectangle) {
    super({
      windowid,
      uri: 'jing://switch.html',
      width,
      height: bound.height - TOOLBAR_HEIGHT,
      x: 0,
      y: TOOLBAR_HEIGHT,
      name: 'switch'
    });
  }
  resize(bound: Rectangle): void {
    this.option.height = bound.height - TOOLBAR_HEIGHT;
  }
}
