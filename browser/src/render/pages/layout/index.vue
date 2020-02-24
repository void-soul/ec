<template>
  <div class="all-box  z-max text-white">
    <q-toolbar class="tool toolbar q-electron-drag">
      <q-tabs v-model="viewid"
              dense
              shrink
              inline-label
              narrow-indicator
              no-caps
              class="q-electron-drag--exception"
              style="max-width: calc(100% - 200px)"
              :breakpoint="0"
              indicator-color="transparent"
              @mousewheel="scrollMenu($event)">
        <q-tab v-for="(item,index) in views"
               :key="item.viewid"
               :name="item.viewid"
               ripple
               :title="item.title"
               @click="active(item.viewid)"
               @contextmenu="contextMenu(item.viewid)"
               :class="{'q-bg-loading': item.loading, 'q-bg-error': item.fail, 'q-bg-free': item.free, 'q-tab-no-0': index > 0, 'q-last': index === views.length - 1}">
          <img :src="item.icon"
               class="q-tab-icon"
               v-if="item.icon">
          <div class="q-tab-span">{{item.title}}</div>
          <q-space />
          <q-btn icon="close"
                 flat
                 v-if="item.close"
                 dense
                 alert="red"
                 size="xs"
                 @click.native.stop="closeView(item.viewid)"
                 :ripple="false"
                 :stretch="false" />
        </q-tab>
      </q-tabs>
      <q-btn dense
             class="q-electron-drag--exception q-btn-fix"
             flat
             title="打开新页面"
             :ripple="false"
             icon="add"></q-btn>
      <q-space></q-space>
      <q-btn dense
             class="q-electron-drag--exception q-btn-fix"
             flat
             @click="minimize"
             :ripple="false"
             title="最小化"
             icon="remove"></q-btn>
      <q-btn dense
             class="q-electron-drag--exception q-btn-fix"
             flat
             @click="toggle"
             title="最大化/还原"
             icon="crop_square"></q-btn>
      <q-btn dense
             class="q-electron-drag--exception q-btn-fix"
             flat
             :ripple="false"
             @click="close"
             title="关闭"
             icon="close"></q-btn>
    </q-toolbar>
    <q-toolbar class="tool toolbar2">
      <template v-if="views[activeIndex]">
        <q-btn dense
               flat
               :ripple="false"
               :disabled="views[activeIndex].canGoBack === false"
               @click="back"
               title="返回上一页"
               icon="chevron_left"></q-btn>
        <q-btn dense
               flat
               :ripple="false"
               :disabled="views[activeIndex].canGoForward === false"
               @click="forward"
               title="跳到下一页"
               icon="chevron_right"></q-btn>
        <q-btn v-if="views[activeIndex].loading"
               dense
               flat
               :ripple="false"
               @click="stop"
               title="停止加载"
               icon="close"></q-btn>
        <q-btn v-else
               dense
               flat
               :ripple="false"
               @click="refresh"
               title="刷新"
               icon="refresh"></q-btn>
        <q-input v-model="activeUrl"
                 dense
                 rounded
                 outlined
                 hide-bottom-space
                 bg-color="white"
                 @keyup.enter="open"
                 :disabled="views[activeIndex].url.buildIn"
                 autofocus>
          <template v-slot:prepend>
            <q-btn v-if="views[activeIndex].url.https"
                   round
                   dense
                   flat
                   :ripple="false"
                   icon="https"
                   title="您的链接十分安全" />
            <q-btn v-else-if="views[activeIndex].url.buildIn"
                   round
                   dense
                   flat
                   :ripple="false"
                   icon="security"
                   title="这是一个官方出品的内部模块" />
            <q-btn v-else
                   round
                   dense
                   flat
                   :ripple="false"
                   icon="warning"
                   title="此连接不安全，您的信息可能被篡改" />
          </template>
          <template v-if="views[activeIndex].url.buildIn === false"
                    v-slot:append>
            <q-btn dense
                   class="q-electron-drag--exception"
                   flat
                   :ripple="false"
                   title="收藏"
                   icon="grade"></q-btn>
          </template>
        </q-input>
      </template>
      <q-space></q-space>
      <q-btn dense
             class="q-electron-drag--exception"
             flat
             :ripple="false"
             title="书签"
             icon="grade"></q-btn>
      <q-btn dense
             class="q-electron-drag--exception"
             flat
             :ripple="false"
             title="设置"
             icon="settings"></q-btn>
      <q-btn dense
             class="q-electron-drag--exception"
             flat
             :ripple="false"
             title="消息"
             icon="message"></q-btn>
      <q-btn dense
             class="q-electron-drag--exception"
             flat
             :ripple="false"
             title="帮助中心"
             icon="help"></q-btn>
    </q-toolbar>
  </div>

</template>

<script >
import Sortable from 'sortablejs';
import windowViews from '^/window-views';
export default {
  data () {
    return {
      sortAble: null
    };
  },
  mixins: [windowViews],
  created () {
    this.$nextTick(() => {
      const tabsBox = document.querySelector('.q-tabs__content');
      if (tabsBox) {
        this.sortAble = new Sortable(tabsBox, {
          onEnd: ({ oldIndex, newIndex }) => {
            const $li = tabsBox.children[newIndex];
            const $oldLi = tabsBox.children[oldIndex];
            // 先删除移动的节点
            tabsBox.removeChild($li);
            // 再插入移动的节点到原有节点，还原了移动的操作
            if (newIndex > oldIndex) {
              tabsBox.insertBefore($li, $oldLi);
            } else {
              tabsBox.insertBefore($li, $oldLi.nextSibling);
            }
            window.brage.do(`window-sort-view-${ this.windowid }`, oldIndex, newIndex);
          }
        });
      }
    });
  },
  methods: {
    close () {
      window.brage.do(`window-close-${ this.windowid }`);
    },
    toggle () {
      window.brage.do(`window-toggle-${ this.windowid }`);
    },
    minimize () {
      window.brage.do(`window-min-${ this.windowid }`);
    },
    scrollMenu (event) {
      let index = this.views.findIndex((item) => {
        return item.viewid === this.viewid;
      });
      if (event.wheelDelta < 0 && index < this.views.length - 1) {
        index += 1;
        this.viewid = this.views[index].viewid;
        this.active(this.viewid);
      } else if (event.wheelDelta > 0 && index > 0) {
        index -= 1;
        this.viewid = this.views[index].viewid;
        this.active(this.viewid);
      }
    },
    open () {
      window.brage.do(`view-refresh-${ this.viewid }`, this.activeUrl);
    },
    back () {
      window.brage.do(`view-back-${ this.viewid }`);
    },
    forward () {
      window.brage.do(`view-forward-${ this.viewid }`);
    },
    refresh () {
      window.brage.do(`view-refresh-${ this.viewid }`);
    },
    stop () {
      window.brage.do(`view-stop-${ this.viewid }`);
    }
  }
};
</script>
<style lang="stylus">
.q-tab {
  padding: 5px 0;
  pointer-events: auto !important;

  .q-tab-span {
    display: -webkit-box;
    text-overflow: ellipsis;
    overflow: hidden;
    max-width: 150px;
    min-width: 100px;
  }

  .q-tab-icon {
    width: 16px;
    height: 16px;
    margin-right: 3px;
  }

  .q-tab__content {
    padding: 0 5px;
  }
}

.q-tab-no-0 {
  .q-tab__content {
    border-left: 1px solid hsla(0, 0%, 100%, 0.25);
  }
}

.q-last {
  .q-tab__content {
    border-right: 1px solid hsla(0, 0%, 100%, 0.25);
  }
}

.q-tab--active {
  background: hsla(0, 0%, 100%, 0.25);
  border-radius: 5px 5px 0 0;
}

.q-tab--active+.q-tab, .q-tab--active {
  .q-tab__content {
    border-left-color: transparent !important;
    border-right-color: transparent !important;
  }
}

.q-bg-loading {
  background-size: 50px 50px !important;
  background-image: linear-gradient(
    45deg,
    hsla(0, 0%, 100%, 0.15) 25%,
    transparent 0,
    transparent 50%,
    hsla(0, 0%, 100%, 0.15) 0,
    hsla(0, 0%, 100%, 0.15) 75%,
    transparent 0,
    transparent
  ) !important;
  animation: q-bg-move 10s infinite linear;
}

.q-bg-error {
  background-color: #c10015;
}

.q-bg-free {
  filter: contrast(0.5);
}

.q-tabs--dense .q-tab {
  min-height: 32px;
  margin-top: 3px;
}

.q-btn-fix {
  margin-top: 5px;
}

@keyframes q-bg-move {
  from {
    background-position-x: 0;
  }

  to {
    background-position-x: 350px;
  }
}

.all-box {
  background: radial-gradient(circle, #35a2ff 0%, #014a88 100%);
  pointer-events: auto !important;

  .q-toolbar {
    padding: 0;
  }

  .tool {
    min-height: 35px;
    display: flex;
    padding: 0 5px;
  }

  .toolbar {
    align-items: flex-start;
  }

  .toolbar2 {
    align-items: center;
    background: hsla(0, 0%, 100%, 0.25);
  }
}

.q-field--dense .q-field__control, .q-field--dense .q-field__marginal {
  height: 30px;
}

.q-field {
  width: 100%;
}

.q-separator--vertical.q-separator--spaced {
  margin-left: 0;
  margin-right: 0;
  height: 20px;
  margin-top: 7.5px;
}
</style>