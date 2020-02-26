const fs = require('fs');
const path = require('path');
// 读取页面
const pagesNames = fs.readdirSync('./src/page/');
const pages = {};
for (const page of pagesNames) {
  if (page.includes('.')) {
    continue;
  }
  pages[page] = {
    entry: `src/page/${ page }/index.js`,
    emplate: 'public/index.html',
    filename: `page/${ page }.html`
  };
}
const jsNames = ['.js', '.ts'];
const cssNames = ['.css', '.styl'];
const entries = {};
// 读取注入脚本
if (fs.existsSync('./src/inject/js')) {
  const syncNames = fs.readdirSync('./src/inject/js');
  for (const item of syncNames) {
    const ext = path.extname(item);
    const bname = path.basename(item, path.extname(item));
    // 是js文件，同时存在规则约束文件
    if (jsNames.includes(ext) && fs.existsSync(`src/inject/js/${ bname }.rule`)) {
      entries[path.basename(item, path.extname(item))] = [`src/inject/js/${ item }`];
    }
  }
}
// 读取注入样式
if (fs.existsSync('./src/inject/css')) {
  const syncNames = fs.readdirSync('./src/inject/css');
  for (const item of syncNames) {
    const ext = path.extname(item);
    const bname = path.basename(item, path.extname(item));
    // 是css文件，同时存在规则约束文件
    if (cssNames.includes(ext) && fs.existsSync(`src/inject/css/${ bname }.rule`)) {
      entries[path.basename(item, path.extname(item))] = [`src/inject/css/${ item }`];
    }
  }
}
module.exports = {
  publicPath: '..',
  filenameHashing: false,
  productionSourceMap: false,
  css: {
    requireModuleExtension: true
  },
  pages,
  pluginOptions: {
    browserExtension: {
      components: {
        background: false,
        popup: false,
        options: false,
        contentScripts: true,
        override: false,
        standalone: false,
        devtools: false
      },
      componentOptions: {
        contentScripts: { entries }
      },
      manifestSync: ['version', 'description'],
      artifactsDir: './output'
    }
  }
};
