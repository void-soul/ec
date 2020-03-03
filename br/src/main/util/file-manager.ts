import * as http from 'http';
import * as https from 'https';
import {URL} from 'url';
import * as path from 'path';
import * as fs from 'fs';
import axios from 'axios';
import {saveFileDialog} from '@/main/util/save-file';
import {app} from 'electron';
import log from 'electron-log';
import {HttpData} from 'plugin-line';

/**
 *
 * 文件管理器
 * @class FileManager
 */
class FileManager {
  private title = '文件';
  /**
   *
   * 下载到询问用户的路径中
   * @param {string} url
   * @returns {Promise<string>}
   * @memberof FileManager
   */
  downLoadConfirmPath(url: string): Promise<string> {
    return new Promise((resolve) => {
      const reader = this.readUrl(url);
      if (reader) {
        saveFileDialog(this.title, [reader.ext], reader.base).then(filePath => this.download2Path(url, filePath));
      } else {
        resolve('');
      }
    });
  }

  /**
   *
   * 下载到临时文件
   * @param {string} url
   * @returns {Promise<string>}
   * @memberof FileManager
   */
  async downdLoad2Tmp(url: string): Promise<string> {
    const reader = this.readUrl(url);
    if (reader) {
      return await this.download2Path(url, `${ app.getPath('temp') }${ path.sep }${ reader.name }`);
    } else {
      return '';
    }
  }

  /**
   *
   * 删除url下载的临时文件
   * @param {string} url
   * @memberof FileManager
   */
  async removeTmp(url: string) {
    const reader = this.readUrl(url);
    if (reader) {
      try {
        await fs.promises.unlink(`${ app.getPath('temp') }${ path.sep }${ reader.name }`);
      } catch (error) {
        log.error(error);
      }
    }
  }

  /**
   *
   * 下载为buffer
   * @param {string} url
   * @returns
   * @memberof FileManager
   */
  downLoad2Buffer(url: string) {
    return new Promise((resolve: (data: HttpData) => void, reject) => {
      const options = new URL(url);
      let {request} = http;
      if (options.protocol === 'https:') {
        request = https.request;
      }
      const req = request(options, res => {
        let data = '';
        res.setEncoding('binary');
        res.on('data', chunk => {
          data += chunk;
        });
        res.on('end', () => {
          const d: any = {...res, data};
          resolve(d);
        });
      });
      req.on('error', e => {
        reject(e);
      });
      req.end();
    });
  }
  // uploadFile() {

  // }
  /**
   *
   * 下载
   * @private
   * @param {string} url
   * @param {string} [filePath]
   * @returns
   * @memberof FileManager
   */
  private download2Path(url: string, filePath?: string): Promise<string> {
    return new Promise((resolve) => {
      if (url) {
        const name = new URL(url).pathname;
        if (name) {
          if (!filePath) {
            return resolve('');
          }
          try {
            axios({method: 'get', url, responseType: 'stream'}).then((response) => {
              response.data.once('end', () => {
                resolve(filePath);
              });
              response.data.pipe(fs.createWriteStream(filePath));
            });
          } catch (error) {
            resolve('');
          }
        }
      } else {
        resolve('');
      }
    });
  }

  /**
   *
   * 解析路径
   * @private
   * @param {string} url
   * @returns
   * @memberof FileManager
   */
  private readUrl(url: string) {
    if (url) {
      const name = new URL(url).pathname;
      if (name) {
        const parseItem = path.parse(name);
        return {
          ext: parseItem.ext.substr(1),
          base: parseItem.base,
          name
        };
      }
    }
  }
}
export const fileManager = new FileManager();
