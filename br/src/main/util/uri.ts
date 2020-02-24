/**
 * 地址管理
 * 包含：可信任的地址列表
 */
import {parse, UrlWithStringQuery} from 'url';
import querystring from 'querystring';
import {UrlInfo} from '@/typings';

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
export const uriParse = (urlStr: string): UrlInfo => {
  const data = parse(urlStr, false);
  const trustServer = trustHostName.includes(data.hostname || 'unknown');
  const buildIn = data.protocol === 'jing:';
  const https = data.protocol === 'https:';
  let host = '';
  let hostname = '';
  let fullUrl = urlStr;
  // app路径改造
  if (data.protocol === 'jing:') {
    hostname = host = 'jing-rise';
    if (process.env.WEBPACK_DEV_SERVER_URL) {
      fullUrl = `${ process.env.WEBPACK_DEV_SERVER_URL }/${ fullUrl.substr(7) }`;
    } else {
      fullUrl = `jing://./${ fullUrl.substr(6) }`;
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
    fullUrl,
    urlStr,
    trustServer,
    https,
    buildIn,
    ...data,
    host,
    hostname
  };
};
