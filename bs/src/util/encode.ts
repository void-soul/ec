/**
 * 底层编码器
 */
import iconv from 'iconv-lite';
export const encode = (str: string, charset: 'utf-8' | 'gbk' = 'utf-8') => {
  if (charset === 'utf-8') {
    return encodeURIComponent(str);
  }
  const buf = iconv.encode(str, charset);
  const encodeStr: string[] = [];
  let ch = '';
  for (const cha of buf) {
    ch = cha.toString(16);
    if (ch.length === 1) {
      ch = '0' + ch;
    }
    encodeStr.push(`%${ ch }`);
  }
  return encodeStr.join('').toUpperCase();
};
export const decode = (str: string, charset: 'utf-8' | 'gbk' = 'utf-8') => {
  if (charset === 'utf-8') {
    return decodeURIComponent(str);
  }
  const bytes: number[] = [];
  for (let i = 0; i < str.length;) {
    if (str[i] === '%') {
      i++;
      bytes.push(parseInt(str.substring(i, i + 2), 16));
      i += 2;
    } else {
      bytes.push(str.charCodeAt(i));
      i++;
    }
  }
  const buf = Buffer.from(bytes);
  return iconv.decode(buf, charset);
};
