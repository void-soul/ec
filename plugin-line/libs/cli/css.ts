import {writeFile} from './util';
import shell = require('shelljs');
export const css = () => {
  const name = process.argv[3];
  if (!name) {
    console.error('请指定要创建的css文件名');
    process.exit(1);
  }
  writeFile(`./src/inject/css/${ name }.styl`, `p {width: 100px;}`);
  writeFile(`./src/inject/css/${ name }.rule`, '');
  shell.exec('yarn lint --fix');
};