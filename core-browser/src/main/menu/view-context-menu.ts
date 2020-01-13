import {Menu, MenuItemConstructorOptions, clipboard, ContextMenuParams} from 'electron';
import manager from '@/main/extends/window-manager';
import {newViewOption} from '@/main/native/build';
import ImageManager from '@/main/fs/image-manager';
import FileManager from '@/main/fs/file-manager';
import SearchEngines from '@/main/web/search-engine';
import {searchText} from '@/main/web/web-app-model';
import {EventProxy} from '@/main/native/event-proxy';

class ContextMenu {
  private viewContextMenu: Menu | null = null;
  // 右键选中的文件
  private contextText: string = '';
  // 右键链接
  private contextUrl: string = '';
  // 右键图片链接
  private consextImage: string = '';
  // 事件代理
  private eventProxy: EventProxy;
  private activeWindowid: number = 0;
  constructor () {
    this.viewContextMenu = this.initViewContextMenu();
    this.eventProxy = new EventProxy({onExists: () => this.viewContextMenu = null});
    this.eventProxy
      .todo('view-context', (params: ContextMenuParams) => {
        const isMedia = this.initMenu(params);
        if (!isMedia) {
          this.eventProxy.do('window-context', {
            windowid: this.activeWindowid
          });
        }
      })
      .todo('window-view-context', (params: ContextMenuParams) => {
        this.initMenu(params);
      })
      .todo('window-view-focus', ({windowid}: {windowid: number}) => {
        this.activeWindowid = windowid;
      });
  }
  private initMenu(params: ContextMenuParams) {
    const window = manager.get(this.activeWindowid);
    let isMedia = false;
    if (params.selectionText) {
      isMedia = true;
      this.contextText = params.selectionText;
      this.switchContextMenu(true, 'txtSearch', 'txtTran', 'txtCopy');
    } else {
      this.contextText = '';
      this.switchContextMenu(false, 'txtSearch', 'txtTran', 'txtCopy');
    }
    if (params.linkURL && !params.linkURL.startsWith('about:')) {
      this.contextUrl = params.linkURL;
      isMedia = true;
      this.switchContextMenu(true, 'newTab', 'newTab2', 'addWindow');
    } else {
      this.contextUrl = '';
      this.switchContextMenu(false, 'newTab', 'newTab2', 'addWindow');
    }
    if (params.mediaType === 'image') {
      this.consextImage = params.srcURL;
      isMedia = true;
      this.switchContextMenu(true, 'picCopy', 'picCopy2', 'picDown', 'picOpen');
    } else {
      this.consextImage = '';
      this.switchContextMenu(false, 'picCopy', 'picCopy2', 'picDown', 'picOpen');
    }
    if (params.isEditable) {
      isMedia = true;
      this.switchContextMenu(params.editFlags.canUndo, 'txtUndo');
      this.switchContextMenu(params.editFlags.canRedo, 'txtRedo');
      this.switchContextMenu(params.editFlags.canPaste, 'txtPaste');
      this.switchContextMenu(params.editFlags.canPaste, 'txtPaste2');
      this.switchContextMenu(params.editFlags.canSelectAll, 'txtSelectAll');
    } else {
      this.switchContextMenu(false, 'txtUndo', 'txtRedo', 'txtPaste', 'txtPaste2', 'txtSelectAll');
    }
    if (isMedia) {
      this.viewContextMenu!.popup({
        window
      });
    }
    return isMedia;
  }
  private initViewContextMenu() {
    return Menu.buildFromTemplate([
      {
        label: '复制文字',
        id: 'txtCopy',
        accelerator: 'CmdOrCtrl+C',
        role: 'copy'
      },
      {
        label: '搜索选中的文字',
        id: 'txtSearch',
        submenu: this.initSearchMenus()
      },
      {
        label: '翻译选中的文字',
        id: 'txtTran'
      },
      {
        label: '撤销',
        id: 'txtUndo',
        accelerator: 'CmdOrCtrl+Z',
        role: 'undo'
      },
      {
        label: '重做',
        id: 'txtRedo',
        accelerator: 'Shift+CmdOrCtrl+Z',
        role: 'redo'
      },
      {
        label: '粘贴',
        id: 'txtPaste',
        accelerator: 'CmdOrCtrl+V',
        role: 'paste'
      },
      {
        label: '粘贴为文本',
        id: 'txtPaste2',
        role: 'pasteAndMatchStyle',
        accelerator: 'Shift+Command+V'
      },
      {
        label: '全选',
        accelerator: 'CmdOrCtrl+A',
        id: 'txtSelectAll',
        role: 'selectAll'
      },
      {
        label: '在新标签页中打开链接',
        id: 'newTab',
        click: () => this.eventProxy.do(`window-add-view-${ this.activeWindowid }`, {
          ...newViewOption,
          uri: this.contextUrl
        })
      },
      {
        label: '复制链接',
        id: 'newTab',
        click: () => clipboard.writeText(this.contextUrl)
      },
      {
        label: '在后台打开链接',
        id: 'newTab2',
        click: () => this.eventProxy.do(`window-add-view-${ this.activeWindowid }`, {
          ...newViewOption,
          uri: this.contextUrl,
          viewMode: 'CurrentWindowHideWithTab'
        })
      },
      {
        label: '在新窗口中打开链接',
        id: 'addWindow',
        click: () => this.eventProxy.do(`window-add-view-${ this.activeWindowid }`, {
          ...newViewOption,
          uri: this.contextUrl,
          viewMode: 'NewWindowWithTab'
        })
      },
      {
        label: '复制图片',
        id: 'picCopy',
        click: async () => ImageManager.copyImageFromUrl(this.consextImage)
      },
      {
        label: '复制图片地址',
        id: 'picCopy2',
        click: () => clipboard.writeText(this.consextImage)
      },
      {
        label: '图片另存为',
        id: 'picDown',
        click: async () => FileManager.downLoadConfirmPath(this.consextImage)
      },
      {
        label: '新选项卡中打开图片',
        id: 'picOpen',
        click: () => this.eventProxy.do(`window-add-view-${ this.activeWindowid }`, {
          ...newViewOption,
          uri: this.consextImage
        })
      }
    ]);
  }
  private initSearchMenus(): MenuItemConstructorOptions[] {
    return SearchEngines.map(item => {
      return {
        label: item[0] as string,
        click: () => {
          searchText(item[1] as string, this.contextText, item[2] as boolean);
        }
      };
    });
  }
  private switchContextMenu(enabled: boolean, ...ids: string[]) {
    for (const id of ids) {
      const menu = this.viewContextMenu!.getMenuItemById(id);
      menu.enabled = menu.visible = enabled;
    }
  }
}

export const viewMenu = new ContextMenu();
