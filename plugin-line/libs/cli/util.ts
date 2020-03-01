import fs = require('fs');
import path = require('path');

export const fs_stat = function (filePath: string) {
  try {
    fs.statSync(filePath);
    return true;
  } catch (e) {
    return false;
  }
};

export const writeFile = (filePath: string, data: string) => {
  const dir = path.dirname(filePath);
  if (fs_stat(dir) === false) {
    let pathtmp = '';
    const pathes = dir.split('/');
    for (const dirname of pathes) {
      if (pathtmp) {
        pathtmp = path.join(pathtmp, dirname);
      } else {
        pathtmp = dirname;
      }
      if (fs_stat(pathtmp) === false) {
        fs.mkdirSync(pathtmp);
      }
    }
  }
  fs.writeFileSync(filePath, data, {encoding: 'utf-8'});
  console.log(`[succ] ${ filePath }`);
};