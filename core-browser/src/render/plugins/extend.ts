import Extend from './extends/axios';
import Vue from 'vue';

Vue.prototype.sen = new Extend();
// Vue.prototype.$mac = window.brage.config('platform') === 'darwin';
// Vue.prototype.$dev = window.brage.config('VUE_APP_DEV') === '1';
Vue.filter('dataConfig', (value, configName, def) => {
  try {
    return Vue.prototype.sen.config.GlobalMap[configName][value] || def;
  } catch (e) {
    return def;
  }
});
