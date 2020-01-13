export const loadJS = url => {
  return new Promise(resolve => {
    const script = document.createElement('script');
    script.type = 'text/javascript';
    script.onload = () => {
      resolve();
    };
    script.src = url;
    document.getElementsByTagName('head')[0].appendChild(script);
  });
};
export const loadCss = url => {
  return new Promise(resolve => {
    const link = document.createElement('link');
    link.rel = 'stylesheet';
    link.onload = () => {
      resolve();
    };
    link.href = url;
    document.getElementsByTagName('head')[0].appendChild(link);
  });
};
export const createToolBar = async (data, html) => {
  await Promise.all([
    loadCss('https://cdn.bootcss.com/material-design-icons/3.0.1/iconfont/material-icons.min.css'),
    loadCss('https://cdn.bootcss.com/animate.css/3.7.2/animate.min.css'),
    loadCss('https://cdn.jsdelivr.net/npm/quasar@^1.0.0/dist/quasar.min.css'),
    loadJS('https://unpkg.com/vue/dist/vue.js'),
    loadJS('https://unpkg.com/element-ui/lib/index.js'),
    loadCss('https://unpkg.com/element-ui/lib/theme-chalk/index.css')
  ]);
  const div = document.createElement('div');
  div.className = 'jing-rise-bar';
  div.id = 'jing-rise-app';
  div.innerHTML = html;
  document.body.appendChild(div);
  new Vue({
    el: '#jing-rise-app',
    ...data
  });
};
