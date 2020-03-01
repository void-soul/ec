<template>
  <q-input filled
           square
           dense
           standout
           class="bg-grey-2 rounded-borders "
           ref="input"
           autofocus
           label="搜索页面内容"
           @keyup.enter="next"
           @input="changeInput"
           v-model="viewData.txt">
    <template v-slot:append>
      <div v-if="viewData.matches > 0"
           class="text-caption q-mr-xs">{{viewData.activeMatchOrdinal}}/{{viewData.matches}}</div>
      <q-separator vertical></q-separator>
      <q-btn flat
             dense
             round
             class="q-mr-xs"
             :ripple="false"
             @click="prev"
             icon="expand_less"></q-btn>
      <q-btn flat
             dense
             :ripple="false"
             @click="next"
             icon="expand_more"
             round
             class="q-mr-xs"></q-btn>
      <q-btn flat
             dense
             :ripple="false"
             @click="close"
             icon="close"
             round
             class="q-mr-xs"></q-btn>
    </template>
  </q-input>
</template>
<script>
export default {
  data () {
    return {
      viewData: {
        txt: '',
        requestId: 0,
        activeMatchOrdinal: 0,
        matches: 0,
        finalUpdate: false
      },
      viewid: ''
    };
  },
  created () {
    window.brage.on('dialog-show', () => {
      const viewid = `${ window.brage.activeid() }`;
      if (this.viewid !== viewid) {
        if (this.viewid) {
          window.brage.cache({ [`find-data-${ this.viewid }`]: this.viewData });
        }
        const cachedData = window.brage.cached(`find-data-${ viewid }`);
        if (cachedData && cachedData[`find-data-${ viewid }`]) {
          this.viewData = cachedData[`find-data-${ viewid }`];
        } else {
          this.viewData = this.newData();
        }
        this.viewid = viewid;
      }
      let input = this.$refs.input;
      if (input) {
        input.select();
      } else {
        this.$nextTick(() => {
          input = this.$refs.input;
          if (input) {
            input.select();
          }
        });
      }
    });
    window.brage.on('dialog-hide', () => {
      window.brage.do(`view-stop-find-${ this.viewid }`);
    });
    window.brage.on('found', (_event, result) => {
      Object.assign(this.viewData, result);
      window.brage.cache({ [`find-data-${ this.viewid }`]: this.viewData });
    });
    window.brage.sub(`window-remove-view-${ window.brage.windowid }`, (event, viewid) => {
      window.brage.cacheRemove(`find-data-${ viewid }`);
      if (this.viewid === `${ viewid }`) {
        window.brage.do(`dialog-hide-${ window.brage.windowid }-find`);
      }
    });
    window.brage.sub(`window-free-view-${ window.brage.windowid }`, (event, viewid) => {
      window.brage.cacheRemove(`find-data-${ viewid }`);
      if (this.viewid === `${ viewid }`) {
        window.brage.do(`dialog-hide-${ window.brage.windowid }-find`);
        window.brage.do(`view-stop-find-${ this.viewid }`);
      }
    });
  },
  beforeDestroy () {
    window.brage.off('dialog-show');
    window.brage.off('dialog-hide');
    window.brage.off('found');
    window.brage.unsub(`window-remove-view-${ window.brage.windowid }`);
    window.brage.unsub(`window-free-view-${ window.brage.windowid }`);
  },
  methods: {
    close () {
      window.brage.do(`view-stop-find-${ this.viewid }`);
      this.viewData.matches = 0;
      window.brage.do(`dialog-hide-${ window.brage.windowid }-find`);
    },
    changeInput (value) {
      console.log(`view-find-${ this.viewid }`);
      if (value) {
        window.brage.do(`view-find-${ this.viewid }`, value, true, false);
      } else {
        window.brage.do(`view-stop-find-${ this.viewid }`);
        this.viewData.matches = 0;
      }
    },
    prev () {
      if (this.viewData.txt) {
        window.brage.do(
          `view-find-${ this.viewid }`,
          this.viewData.txt,
          false,
          true
        );
      }
    },
    next () {
      if (this.viewData.txt) {
        window.brage.do(
          `view-find-${ this.viewid }`,
          this.viewData.txt,
          true,
          false
        );
      }
    },
    newData () {
      return {
        txt: '',
        activeMatchOrdinal: 0,
        matches: 0,
        finalUpdate: false,
        requestId: 0
      };
    }
  }
};
</script>
