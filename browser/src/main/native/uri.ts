/**
 * 地址管理
 * 包含：可信任的地址列表
 */
import {parse, UrlWithStringQuery} from 'url';
import querystring from 'querystring';

const trustHostName = [
  'erp.jingrise.com',
  '127.0.0.1',
  'localhost',
  '10.0.0.200'
];
const hostNameMethods = {
  'amazon.com'(item: UrlWithStringQuery) {
    if (item.pathname && item.pathname.includes('/dp/')) {
      return 'item.amazon.com';
    } else {
      return item.hostname;
    }
  }
};
export const uriParse = (url: string, id = 0, copy = false): UrlInfo => {
  if (!url) {
    return {
      url: '',
      trustServer: false,
      https: false,
      buildIn: false,
      host: '',
      hostname: ''
    };
  }
  const data = parse(url);
  const trustServer = trustHostName.includes(data.hostname || 'unknown');
  const buildIn = data.protocol === 'jing:';
  const https = data.protocol === 'https:';
  let host = '';
  let hostname = '';
  // 复制窗体
  if (copy) {
    if (data.query) {
      url = `${ url }&${ Math.random() }`;
    } else {
      url = `${ url }?${ Math.random() }`;
    }
  }
  // app路径改造
  if (data.protocol === 'jing:') {
    hostname = host = 'jing-rise';
    if (process.env.WEBPACK_DEV_SERVER_URL) {
      url = `${ process.env.WEBPACK_DEV_SERVER_URL }/${ url.substr(7) }`;
    } else {
      url = `jing://./${ url.substr(6) }`;
    }
  } else if (trustServer) {
    hostname = host = 'jing-rise';
  } else {
    hostname = data.hostname!;
    host = hostname ? hostname.split('.').slice(-2).join('.') : 'unknown';
  }
  const covertHostName = hostNameMethods[host] && hostNameMethods[host](data);
  if (covertHostName) {
    hostname = covertHostName;
  }
  return {
    url,
    trustServer,
    https,
    buildIn,
    host,
    hostname
  };
};
export const uriCopy = (url: string) => {
  const data = parse(url);
  const b = data.query ? querystring.parse(data.query) : {};
  b.dmnextid = `${ Math.random() }`;
  return `${ data.protocol }//${ data.host }${ data.pathname }?${ querystring.stringify(b) }`;
};
