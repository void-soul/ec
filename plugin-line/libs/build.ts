import shell = require('shelljs');
import fs = require('fs');
export const BuildHelper = {
  build: () => {
    shell.exec('vue-cli-service build');
    shell.exec('yarn tsc');
    try {
      shell.cp('./icon.ico', './dist/icon.ico');
    } catch (error) {
    }
    const info = JSON.parse(fs.readFileSync('./package.json', {encoding: 'utf-8'}).toString());
    const outInfo = {
      name: info.name,
      title: info.title,
      version: info.version,
      description: info.description,
      required: info.required,
      beta: info.beta,
      login: info.login,
      keywords: info.keywords,
      homepage: info.homepage
    };
    fs.writeFileSync('./dist/package.json', JSON.stringify(outInfo), {encoding: 'utf-8'});
  }
}