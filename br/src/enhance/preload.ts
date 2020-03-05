import {ipcRenderer} from 'electron';
const {windowid, viewid} = ipcRenderer.sendSync('get=id');
const winCache: {[id: number]: JingWindowMir} = {};
const viewCache: {[id: number]: JingViewMir} = {};
const channels = new Array<string>();
window.brage = {
  windowid,
  viewid,
  getWindow(_windowid?: number) {
    _windowid = _windowid || 0;
    if (!winCache[_windowid]) {
      winCache[_windowid] = {
        destroy: () => ipcRenderer.send('on=jing=window', _windowid, 'destroy'),
        open: (url) => ipcRenderer.send('on=jing=window', _windowid, 'open', url),
        add: (viewOption) => ipcRenderer.send('on=jing=window', _windowid, 'add', viewOption),
        push: (query) => ipcRenderer.send('on=jing=window', _windowid, 'push', query),
        remove: (query?, close?) => ipcRenderer.send('on=jing=window', _windowid, 'remove', query, close),
        active: (query?) => ipcRenderer.send('on=jing=window', _windowid, 'active', query),
        sort: (id, toIndex) => ipcRenderer.send('on=jing=window', _windowid, 'sort', id, toIndex),
        notice: (channel, ...args) => ipcRenderer.send('on=jing=window', _windowid, 'notice', channel, ...args),
        broadcast: (channel, ...args) => ipcRenderer.send('on=jing=window', _windowid, 'broadcast', channel, ...args),
        getViews: () => ipcRenderer.invoke('handel=jing=window', _windowid, 'getViews'),
        contextMenu: (viewId: number) => ipcRenderer.invoke('handel=jing=window', _windowid, 'contextMenu', viewId),
        getIds: () => ipcRenderer.invoke('handel=jing=window', _windowid, 'getIds'),
        toggle: () => ipcRenderer.send('on=jing=window', _windowid, 'toggle'),
        minimize: () => ipcRenderer.send('on=jing=window', _windowid, 'min')
      };
    }
    return winCache[_windowid];
  },
  getView(_viewid?: number) {
    _viewid = _viewid || 0;
    if (!viewCache[_viewid]) {
      viewCache[_viewid] = {
        loadURL: (url?, options?) => ipcRenderer.send('on=jing=view', _viewid, 'loadURL', url, options),
        stop: () => ipcRenderer.send('on=jing=view', _viewid, 'stop'),
        clearHistory: () => ipcRenderer.send('on=jing=view', _viewid, 'clearHistory'),
        goBack: () => ipcRenderer.send('on=jing=view', _viewid, 'goBack'),
        goForward: () => ipcRenderer.send('on=jing=view', _viewid, 'goForward'),
        goToIndex: (index) => ipcRenderer.send('on=jing=view', _viewid, 'goToIndex', index),
        goToOffset: () => ipcRenderer.send('on=jing=view', _viewid, 'goToOffset'),
        insertCSS: (css, options) => ipcRenderer.invoke('handel=jing=view', _viewid, 'insertCSS', css, options),
        removeInsertedCSS: (key) => ipcRenderer.send('on=jing=view', _viewid, 'removeInsertedCSS', key),
        executeJavaScript: (code, userGesture?) => ipcRenderer.invoke('handel=jing=view', _viewid, 'executeJavaScript', code, userGesture),
        executeJavaScriptInIsolatedWorld: (worldId, scripts, userGesture?) => ipcRenderer.invoke('handel=jing=view', _viewid, 'executeJavaScriptInIsolatedWorld', worldId, scripts, userGesture),
        undo: () => ipcRenderer.send('on=jing=view', _viewid, 'undo'),
        redo: () => ipcRenderer.send('on=jing=view', _viewid, 'redo'),
        cut: () => ipcRenderer.send('on=jing=view', _viewid, 'cut'),
        copy: () => ipcRenderer.send('on=jing=view', _viewid, 'copy'),
        copyImageAt: (x: number, y: number) => ipcRenderer.send('on=jing=view', _viewid, 'copyImageAt', x, y),
        paste: () => ipcRenderer.send('on=jing=view', _viewid, 'paste'),
        pasteAndMatchStyle: () => ipcRenderer.send('on=jing=view', _viewid, 'pasteAndMatchStyle'),
        delete: () => ipcRenderer.send('on=jing=view', _viewid, 'delete'),
        selectAll: () => ipcRenderer.send('on=jing=view', _viewid, 'selectAll'),
        unselect: () => ipcRenderer.send('on=jing=view', _viewid, 'unselect'),
        replace: (text) => ipcRenderer.send('on=jing=view', _viewid, 'replace', text),
        replaceMisspelling: (text) => ipcRenderer.send('on=jing=view', _viewid, 'replaceMisspelling', text),
        insertText: (text) => ipcRenderer.send('on=jing=view', _viewid, 'insertText', text),
        findInPage: (text, options?) => ipcRenderer.send('on=jing=view', _viewid, 'findInPage', text, options),
        stopFindInPage: (action?) => ipcRenderer.send('on=jing=view', _viewid, 'stopFindInPage', action),
        print: (options?) => ipcRenderer.send('on=jing=view', _viewid, 'print', options),
        destroy: (ask) => ipcRenderer.send('on=jing=view', _viewid, 'destroy', ask),
        dev: () => ipcRenderer.send('on=jing=view', _viewid, 'dev'),
        info: () => ipcRenderer.invoke('handel=jing=view', _viewid, 'info')
      }
    }
    return viewCache[_viewid];
  },
  notice: {
    on: (channel: string, listener: (...args: any[]) => void) => {
      channels.push(channel);
      ipcRenderer.on(channel, (_event, ...ags: any[]) => listener(...ags));
    }
  } as NoticeEvent,
  broadcast: (channel: string, listener: (...args: any[]) => void) => {
    ipcRenderer.on(channel, (_event, ...ags: any[]) => listener(...ags));
    channels.push(channel);
  },
  destory() {
    for (const channel of channels) {
      ipcRenderer.removeAllListeners(channel);
    }
  }
};
