import Vue from 'vue';
import '#/style';
import '#/extend';
import App from './index.vue';
import Quasar, { QBtn, QInput, QToolbar, QTabs, QTab, QSpace, QSeparator } from 'quasar';
Vue.use(Quasar, {
  components: {
    QBtn,
    QInput,
    QToolbar,
    QTabs,
    QTab,
    QSpace,
    QSeparator
  },
  config: {
    loadingBar: {
      color: 'primary'
    }
  }
});
Vue.config.productionTip = false;
Vue.config.performance = true;
new Vue({
  render: h => h(App)
}).$mount('#app');
