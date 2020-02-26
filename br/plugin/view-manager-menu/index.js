import { JingPlugin } from 'plugin-line';
export default class extends JingPlugin {
    constructor(win, util) {
        super(win, util);
        this.injects = [];
        console.log(win, util);
    }
    destroy() {
        throw new Error('Method not implemented.');
    }
    windowMenu(viewId) {
        throw new Error('Method not implemented.');
    }
    viewMenu(param) {
        throw new Error('Method not implemented.');
    }
    onContextClick(param, menuId) {
        throw new Error('Method not implemented.');
    }
}
;
