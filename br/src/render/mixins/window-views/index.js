export default {
  data () {
    return {
      views: [],
      viewid: 0,
      activeIndex: 0,
      windowid: window.brage.windowid,
      activeUrl: ''
    };
  },
  created () {
    window.brage.sub(`window-add-view-${ this.windowid }`, (_event, view) => {
      this.views.push(view);
    });
    window.brage.sub(`window-update-view-${ this.windowid }`, (_event, _viewid, view) => {
      const index = this.views.findIndex((item) => item.viewid === _viewid);
      if (index > -1) {
        this.views.splice(index, 1, view);
        this.activeChange();
      }
    });
    window.brage.sub(`window-active-view-${ this.windowid }`, (_event, _viewid) => {
      this.viewid = _viewid;
      this.activeChange();
    });
    window.brage.sub(`window-remove-view-${ this.windowid }`, (_event, _viewid) => {
      const index = this.views.findIndex((item) => item.viewid === _viewid);
      if (index > -1) {
        this.views.splice(index, 1);
        this.activeChange();
      }
    });
    window.brage.sub(`window-sort-view-${ this.windowid }`, (_event, oldIndex, newIndex) => {
      this.views.splice(newIndex, 0, ...this.views.splice(oldIndex, 1));
      this.activeChange();
    });

    const [views, viewid] = window.brage.excute(`window-views-${ this.windowid }`);
    this.viewid = viewid;
    for (const view of views) {
      this.views.push(view);
    }
    this.activeChange();
  },
  beforeDestroy () {
    window.brage.unsub(`window-add-view-${ this.windowid }`);
    window.brage.unsub(`window-update-view-${ this.windowid }`);
    window.brage.unsub(`window-active-view-${ this.windowid }`);
    window.brage.unsub(`window-remove-view-${ this.windowid }`);
    window.brage.unsub(`window-sort-view-${ this.windowid }`);
    this.views.length = 0;
  },
  methods: {
    active (id) {
      window.brage.do(`window-active-view-${ this.windowid }`, id);
    },
    closeView (id) {
      window.brage.do(`window-remove-view-${ this.windowid }`, id);
    },
    mainView2RenderView (view) {
      return {
        ...view,
        icon: view.icon || ''
      };
    },
    activeChange () {
      this.activeIndex = this.views.findIndex((item) => item.viewid === this.viewid);
      if (this.views[this.activeIndex]) {
        this.activeUrl = this.views[this.activeIndex].uri;
      }
    },
    contextMenu (id) {
      window.brage.do('window-context', { viewid: id, windowid: this.windowid });
    }
  }
};

