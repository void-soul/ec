module.exports = {
  appId: 'org.jingrise.erp',
  productName: 'ec',
  copyright: 'Copyright © year ${author}',
  asar: true,
  files: [
    { from: 'dist/main', to: '', filter: '**/*.js' },
    'package.json'
  ],
  publish: [
    { provider: 'generic', url: 'http://down.jingrise.com' }
  ],
  nsis: {
    oneClick: false,
    perMachine: true,
    allowToChangeInstallationDirectory: true,
    installerIcon: 'static/icons/icon64.ico',
    uninstallerIcon: 'static/icons/icon64.ico',
    installerHeaderIcon: 'static/icons/icon64.ico'
  },
  nsisWeb: {
    appPackageUrl: 'http://down.jingrise.com'
  },
  win: {
    icon: 'static/icons/icon.ico',
    target: ['nsis']
  },
  mac: {
    icon: 'static/icons/icon.icns'
  }
}