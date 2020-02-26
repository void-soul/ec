#!/usr/bin/env node
import * as cli from './cli';

const command = process.argv[2];
if (cli[command]) {
  cli[command]();
  console.log('finished!');
} else {
  console.error(`可用命令有${ Object.keys(cli) }`);
}

