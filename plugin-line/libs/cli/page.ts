
import {writeFile} from './util';
import shell = require('shelljs');
export const page = () => {
  const name = process.argv[3];
  if (!name) {
    console.error('请指定要创建的page文件名');
    process.exit(1);
  }
  const mode = process.argv[4];
  if (mode === 'full') {
    writeFile(`./src/page/${ name }/router/index.js`, `
import Vue from 'vue';
import VueRouter from 'vue-router';

Vue.use(VueRouter);

const routes = [
  {
    path: '/',
    name: 'home',
    component: import('../views/home.vue')
  },
  {
    path: '/about',
    name: 'about',
    component: () => import('../views/about.vue')
  }
];

const router = new VueRouter({
  mode: 'hash',
  base: process.env.BASE_URL,
  routes
});

export default router;
`);

    writeFile(`./src/page/${ name }/store/index.js`, `
import Vue from 'vue';
import Vuex from 'vuex';

Vue.use(Vuex);

export default new Vuex.Store({
  state: {
  },
  mutations: {
  },
  actions: {
  },
  modules: {
  }
});
`);

    writeFile(`./src/page/${ name }/views/about.vue`, `
<template>
  <div class="about">
    <h1>This is an about ${ name }</h1>
  </div>
</template>
`);
    writeFile(`./src/page/${ name }/views/home.vue`, `
<template>
  <div class="home">
    <h1>This is the ${ name }</h1>
  </div>
</template>

<script>
export default {

};
</script>
`);
    writeFile(`./src/page/${ name }/index.vue`, `
<template>
  <div id="app">
    <div id="nav">
      <router-link to="/">Home</router-link> |
      <router-link to="/about">About</router-link>
    </div>
    <router-view />
  </div>
</template>
`);
    writeFile(`./src/page/${ name }/index.js`, `
import Vue from 'vue';
import App from './index.vue';
import router from './router';
import store from './store';

Vue.config.productionTip = false;
/* eslint-disable no-new */
new Vue({
  router,
  store,
  render: h => h(App)
}).$mount('#app');
`);
  } else {
    writeFile(`./src/page/${ name }/index.vue`, `
<template>
  <div class="home">
  <h1>This is the ${ name }</h1>
  </div>
</template>

<script>
export default {
};
</script>
`);
    writeFile(`./src/page/${ name }/index.js`, `
import Vue from 'vue';
import App from './index.vue';

/* eslint-disable no-new */
new Vue({
  el: '#app',
  render: h => h(App)
});
`);
  }
  shell.exec('yarn lint --fix');
};