import {writeFile} from './util';
import * as fs from 'fs';
export const table = () => {
  const name = process.argv[3];
  if (!name) {
    console.error('请指定要创建的版本号');
    process.exit(1);
  }
  if (fs.existsSync(`./src/table/${ name }.ts`)) {
    console.error('文件已存在');
    process.exit(1);
  }
  writeFile(`./src/table/${ name }.sql`, `create table test`);
};