import {writeFile} from './util';

export const js = () => {
  const name = process.argv[3];
  if (!name) {
    console.error('请指定要创建的js文件名');
    process.exit(1);
  }
  writeFile(`./src/inject/js/${ name }.ts`, `console.log('this is ${ name }')`);
  writeFile(`./src/inject/js/${ name }.rule`, '');
};