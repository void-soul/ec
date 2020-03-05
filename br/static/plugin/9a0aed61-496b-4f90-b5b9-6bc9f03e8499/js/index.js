
      class JingPlugin {
        constructor(util) {
            this.util = util;
        }
      };
      
class MyPlugin extends JingPlugin {
    onNewWindow(win) {
        console.log('onNewWindow', win);
    }
    shotMenu() {
        console.log('shotMenu');
        return [];
    }
    windowContext(win, viewId) {
        console.log('windowContext', win, viewId);
        return [];
    }
    viewContext(win, param) {
        console.log('viewContext', win, param);
        return [];
    }
    destroy() {
        console.log('destory');
    }
}
;

      (util) => new MyPlugin(util);