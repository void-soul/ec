import Vue from 'vue';
import '#/style';
import App from './index.vue';
import Quasar, { QInput, QBtn, QList, QItem, QSeparator, QItemSection, QAvatar, QItemLabel, QBadge, QLayout, QPageContainer, QHeader } from 'quasar';
Vue.use(Quasar, {
  components: {
    QInput, QBtn, QList, QItem, QSeparator, QItemSection, QAvatar, QItemLabel, QLayout, QPageContainer, QBadge, QHeader
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
