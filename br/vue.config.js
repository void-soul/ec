const path = require('path');
const fs = require('fs');
function resolve (...dir) {
  return path.join(__dirname, ...dir);
}

const pagesNames = fs.readdirSync('./src/render/pages/');
const pages = {};
for (const page of pagesNames) {
  if (page === '.DS_Store') {
    continue;
  }
  pages[page] = {
    entry: `src/render/pages/${ page }/index.js`,
    template: 'public/index.html',
    filename: `${ page }.html`,
    title: process.env.VUE_APP_TITLE
  };
}

const extensionNames = fs.readdirSync('./src/render/extensions/');
const extensions = {};
for (const page of extensionNames) {
  if (page === '.DS_Store') {
    continue;
  }
  extensions[page] = {
    entry: `src/render/extensions/${ page }/index.js`,
    template: 'public/index.html',
    filename: `${ page }.html`,
    title: process.env.VUE_APP_TITLE
  };
}

const preLoadNames = fs.readdirSync('./src/enhance/preload/');
const preLoads = [];
for (const page of preLoadNames) {
  if (page === '.DS_Store') {
    continue;
  }
  preLoads.push(page);
}

const pluginNames = fs.readdirSync('./src/plugin-inner/');
const plugins = [];
for (const page of pluginNames) {
  if (page === '.DS_Store') {
    continue;
  }
  plugins.push(page);
}

module.exports = {
  chainWebpack: config => {
    config.resolve.alias.set('@', resolve('src/main'));
    config.resolve.alias.set('~', resolve('src/render/components'));
    config.resolve.alias.set('#', resolve('src/render/plugins'));
    config.resolve.alias.set('^', resolve('src/render/mixins'));
  },
  configureWebpack: {},
  transpileDependencies: [/[\\\/]node_modules[\\\/]quasar[\\\/]/],
  publicPath: '',
  runtimeCompiler: true,
  productionSourceMap: false,
  pluginOptions: {
    electronBuilder: {
      chainWebpackMainProcess: config => {
        // const prefixRE = /^VUE_APP_/;
        const resolveClientEnv = () => {
          const env = {};
          Object.keys(process.env).forEach(key => {
            if (key.startsWith('VUE_APP_') || key === 'NODE_ENV') {
              env[key] = process.env[key];
            }
          });
          for (const key in env) {
            if (env[key]) {
              env[key] = JSON.stringify(env[key]);
            }
          }
          return {
            'process.env': env
          };
        };
        config.plugin('define').use(require('webpack/lib/DefinePlugin'), [resolveClientEnv()]);
        for (const preload of preLoads) {
          config
            .entry(`preload/${ preload }`)
            .add(`./src/enhance/preload/${ preload }/index.ts`)
            .end();
        }
        for (const preload of plugins) {
          config
            .entry(`plugin-inner/${ preload }`)
            .add(`./src/plugin-inner/${ preload }/index.ts`)
            .end();
        }
        return config;
      },
      customFileProtocol: 'jing://./',
      externals: ['sqlite3', 'bufferutil', 'utf-8-validate', 'sharp', 'better-sqlite3'],
      mainProcessFile: 'src/main/index.ts',
      mainProcessWatch: ['src/main/**/*', 'src/main/index.ts', 'src/preload/**/*'],
      mainProcessArgs: ['--experimental-worker'],
      builderOptions: {
        appId: 'org.dmce.erp',
        productName: 'dmce',
        copyright: 'Copyright © year ${author}',
        asar: true,
        files: ['**/*', 'preload/**/*'],
        publish: [
          {
            provider: 'generic',
            url: process.env.VUE_APP_UPDATE
          }
        ],
        nsis: {
          oneClick: false,
          perMachine: true,
          allowToChangeInstallationDirectory: true,
          installerIcon: 'public/icons/icon64.ico',
          uninstallerIcon: 'public/icons/icon64.ico',
          installerHeaderIcon: 'public/icons/icon64.ico'
        },
        nsisWeb: {
          appPackageUrl: 'http://down.jingrise.com'
        },
        win: {
          icon: 'public/icons/icon.ico',
          target: ['nsis']
        },
        mac: {
          icon: 'public/icons/icon.icns'
        }
      }
    },
    quasar: {}
  },
  pages: {
    ...pages,
    ...extensions
  }
};
