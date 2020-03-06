import * as  path from 'path';
function d() {
  const x = require(path.join(__dirname, '.sqlman.js'));
  console.log(x);
  const y = require(path.join(__dirname, 'test.js'));
  console.log(y);
}
d();