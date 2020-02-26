const fs = require('fs');
const package = require('./package.json');
const pagesNames = fs.readdirSync('./pages/');
const pages = {};
for (const page of pagesNames) {
  if (page.includes('.')) {
    continue;
  }
  pages[page] = {
    entry: `pages/${ page }/index.js`,
    template: `pages/${ page }/index.html`,
    filename: `pages/${ page }.html`,
    title: package.title
  };
}
module.exports = {
  publicPath: `${ package.name }`,
  assetsDir: 'asset',
  filenameHashing: false,
  productionSourceMap: false,
  css: {
    requireModuleExtension: true
  },
  pages
};
