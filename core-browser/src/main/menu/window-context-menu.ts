import {BaseContextMenu} from '@/main/menu/base-window-menu';

class ContextMenu extends BaseContextMenu {
  constructor () {
    super();
    super.initWindowContextMenu(false);
    this.eventProxy
      .todo('window-context', ({viewid, windowid}: {
        viewid: number;
        windowid: number;
      }) => {
        this.initMenus({windowid, viewid}, true);
      });
  }
}
export const windowMenu = new ContextMenu();
