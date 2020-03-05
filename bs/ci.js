const shell = require('shelljs');
const fs = require('fs');
shell.rm('-rf', './dist/');
shell.exec('yarn electron-webpack');
const js = fs.readdirSync('./dist/main');
for (const f of js) {
  if (f.endsWith('.js.map')) {
    fs.unlinkSync(`./dist/main/${ f }`);
  } else {
    fs.writeFileSync(`./dist/main/${ f }`, fs.readFileSync(`./dist/main/${ f }`).toString().substr(62));
  }
}
shell.exec('yarn electron-builder build --config .build.js');
shell.rm('-rf', './dist/main');