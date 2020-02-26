const shell = require('shelljs');
const fs = require('fs');
shell.exec('vue-cli-service build');
shell.exec('yarn tsc');
try {
  shell.cp('./icon.ico', './dist/icon.ico');
} catch (error) {
}
const info = JSON.parse(fs.readFileSync('./package.json', { encoding: 'utf-8' }).toString());
const outInfo = {
  name: info.name,
  title: info.title,
  version: info.version,
  description: info.description,
  required: info.required,
  beta: info.beta,
  login: info.login,
  keywords: info.keywords,
  homepage: info.homepage
};
fs.writeFileSync('./dist/package.json', JSON.stringify(outInfo), { encoding: 'utf-8' });
const index = fs.readFileSync('./dist/index.js', { encoding: 'utf-8' }).toString();
fs.writeFileSync('./dist/index.js', index.replace("import { JingPlugin } from 'plugin-line';", `
class JingPlugin {
  constructor(win, util) {
      this.win = win;
      this.util = util;
  }
};
`), { encoding: 'utf-8' });
