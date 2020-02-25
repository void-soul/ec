const shell = require('shelljs');
shell.rm('-rf', './dist/');
shell.exec('yarn tsc');
shell.cp('./plugin-line.d.ts', './dist/plugin-line.d.ts');
shell.cp('./package.json', './dist/package.json');
shell.cp('./yarn.lock', './dist/yarn.lock');
shell.cp('./README.md', './dist/README.md');
shell.cp('./LICENSE', './dist/LICENSE');