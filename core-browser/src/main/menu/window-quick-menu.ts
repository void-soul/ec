import {BaseContextMenu} from '@/main/menu/base-window-menu';
/**
 *
 * 快捷键菜单
 * 仅作用与当前视窗
 * @class ContextMenu
 */
class ContextMenu extends BaseContextMenu {
  constructor () {
    super();
    super.initWindowContextMenu(true);
    this.eventProxy
      .todo('window-view-focus', ({windowid, viewid}: {windowid: number; viewid?: number}) => {
        this.initMenus({windowid, viewid});
      });
  }
}
export const windowQuickMenu = new ContextMenu();
