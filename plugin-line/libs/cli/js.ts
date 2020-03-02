import {writeFile} from './util';
import * as fs from 'fs';
import shell = require('shelljs');
export const js = () => {
  const name = process.argv[3];
  if (!name) {
    console.error('请指定要创建的js文件名');
    process.exit(1);
  }
  if (fs.existsSync(`./src/inject/js/${ name }.ts`) || fs.existsSync(`./src/inject/css/${ name }.rule`)) {
    console.error('文件已存在，js、css都不能相同!');
    process.exit(1);
  }
  writeFile(`./src/inject/js/${ name }.ts`, `console.log('this is ${ name }')`);
  writeFile(`./src/inject/js/${ name }.rule`, '');
  shell.exec('yarn lint --fix');
};