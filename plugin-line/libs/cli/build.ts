import shell = require('shelljs');
import fs = require('fs');
import Adm = require('adm-zip');
import path = require('path');
import {writeFile} from './util';

export const build = () => {
  shell.exec('vue-cli-service build');
  shell.exec('yarn tsc');
  const info = JSON.parse(fs.readFileSync('./package.json', {encoding: 'utf-8'}).toString());
  const outInfo = {
    name: info.name,
    title: info.title,
    version: info.version,
    description: info.description,
    required: info.required,
    beta: info.beta,
    login: info.login,
    keywords: info.keywords,
    homepage: info.homepage,
    injectJs: new Array<string[]>(),
    injectCss: new Array<string[]>()
  };
  const jsNames = ['.js', '.ts'];
  const cssNames = ['.css', '.styl'];
  // 读取注入脚本
  if (fs.existsSync('./src/inject/js')) {
    const syncNames = fs.readdirSync('./src/inject/js');
    for (const item of syncNames) {
      const ext = path.extname(item);
      const bname = path.basename(item, path.extname(item));
      const rule = `src/inject/js/${ bname }.rule`;
      // 是js文件，同时存在规则约束文件
      if (jsNames.includes(ext) && fs.existsSync(rule)) {
        outInfo.injectJs.push([fs.readFileSync(rule, {encoding: 'utf-8'}).toString(), item]);
      }
    }
  }
  // 读取注入样式
  if (fs.existsSync('./src/inject/css')) {
    const syncNames = fs.readdirSync('./src/inject/css');
    for (const item of syncNames) {
      const ext = path.extname(item);
      const bname = path.basename(item, path.extname(item));
      const rule = `src/inject/css/${ bname }.rule`;
      // 是css文件，同时存在规则约束文件
      if (cssNames.includes(ext) && fs.existsSync(rule)) {
        outInfo.injectCss.push([fs.readFileSync(rule, {encoding: 'utf-8'}).toString(), item]);
      }
    }
  }
  writeFile('./dist/manifest.json', JSON.stringify(outInfo, null, 2));
  const index = fs.readFileSync('./dist/js/index.js', {encoding: 'utf-8'}).toString();
  writeFile('./dist/js/index.js', `${
    index.replace("import { JingPlugin } from 'plugin-line';", `
import { writeFile } from './util';
      class JingPlugin {
        constructor(win, util) {
            this.win = win;
            this.util = util;
        }
      };
      `).replace('export default class ', 'class MyPlugin ')
    }
      (win, util) => new MyPlugin(win, util);`);
  shell.rm('-rf', './output/');
  const inners = fs.readdirSync('./dist');
  const zip = new Adm();
  for (const inner of inners) {
    const f = path.join('./dist', inner);
    const stat = fs.statSync(f);
    if (stat.isDirectory()) {
      zip.addLocalFolder(f, inner);
    } else {
      zip.addLocalFile(f);
    }
  }
  shell.exec('mkdir output');
  zip.writeZip(`./output/${ info.name }-${ info.version }.zip`);
}