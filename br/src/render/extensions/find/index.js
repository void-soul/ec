import Vue from 'vue';
import '#/style';
import App from './index.vue';
import Quasar, { QInput, QBtn, QSeparator } from 'quasar';
Vue.use(Quasar, {
  components: {
    QInput,
    QBtn,
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
