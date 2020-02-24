<template>
  <q-layout view="lHh lpr lFf"
            container
            class="full scroll electron bg-grey-1 box">
    <q-header elevated>
      <q-input filled
               square
               dense
               standout
               class="bg-grey-2 rounded-borders "
               ref="input"
               autofocus
               label="搜索标题\路径"
               v-model="text">
        <template v-slot:append>
          <q-separator vertical></q-separator>
          <q-btn v-if="text === ''"
                 round
                 dense
                 flat
                 icon="search"
                 class="q-mr-xs" />
          <q-btn v-else
                 round
                 dense
                 flat
                 icon="clear"
                 class="q-mr-xs"
                 @click="text = ''" />
          <q-btn round
                 dense
                 flat
                 icon="keyboard_hide"
                 class="q-mr-xs rotate-90"
                 @click="close" />
        </template>

      </q-input>
    </q-header>
    <q-page-container style="padding-bottom:40px">
      <q-list dense
              separator>
        <div v-for="(group, index) in groups"
             :key="index">
          <q-item-label header>
            {{group.host}}
          </q-item-label>
          <q-item v-for="(item, index2) in group.items"
                  :key="`${index}-${index2}`"
                  @click="active(item.viewid)"
                  active-class="bg-positive text-white"
                  :active="item.viewid === viewid"
                  :clickable="item.viewid !== viewid"
                  :class="{'q-bg-free':item.free}"
                  @contextmenu="contextMenu(item.viewid)"
                  dense>
            <q-item-section>
              {{item.title}}
            </q-item-section>
            <q-item-section side>
              <q-avatar size="15px">
                <img :src="item.icon">
              </q-avatar>
            </q-item-section>
          </q-item>
          <q-separator spaced
                       v-if="index < groups.length - 1" />
        </div>

      </q-list>
    </q-page-container>
  </q-layout>
</template>
<script>
import windowViews from '^/window-views';
export default {
  data () {
    return {
      text: ''
    };
  },
  computed: {
    groups () {
      const items = {};
      for (const item of this.views) {
        if (this.text && !item.title.includes(this.text) && !item.url.url.includes(this.text)) {
          continue;
        }
        if (!items[item.url.host]) {
          items[item.url.host] = {
            host: item.url.host,
            icon: item.icon,
            items: []
          };
        }
        items[item.url.host].items.push(item);
      }
      return Object.values(items);
    }
  },
  mixins: [windowViews],
  beforeDestroy () {
    window.brage.off('dialog-show');
  },
  methods: {
    close () {
      window.brage.do(`dialog-hide-${ window.brage.windowid }-switch`);
    }
  }
};
</script>
<style lang="stylus" scoped>
.box {
  box-shadow: inset -7px 0px 13px -5px rgba(0, 0, 0, 0.2);
}

.q-bg-free {
  filter: contrast(0.5);
}
</style>