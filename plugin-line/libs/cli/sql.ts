import {writeFile} from './util';
import * as fs from 'fs';
import shell = require('shelljs');
export const sql = () => {
  const name = process.argv[3];
  if (!name) {
    console.error('请指定要创建的模块名');
    process.exit(1);
  }
  if (fs.existsSync(`./src/sql/${ name }.ts`)) {
    console.error('文件已存在');
    process.exit(1);
  }
  writeFile(`./src/sql/${ name }.ts`, `export const selectList = () => \`SELECT * FROM ${ name }\`;`);
  shell.exec('yarn lint --fix');
};