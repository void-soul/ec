import * as fs from 'fs';
import * as path from 'path';
import {fileManager} from '@/main/util/file-manager';
import {fromBuffer} from 'file-type';
import icojs from 'icojs';
import sharp from 'sharp';
import {
  app,
  clipboard,
  nativeImage,
  NativeImage
} from 'electron';
import {Buffer} from 'buffer';
import {getConfig} from '@/main/util/config';
const sharpQuality = 80;
const iconSize = {
  width: 16,
  height: 16
};
/**
 *
 * 图片管理器
 * 提供图片下载、图标提取功能
 * @export
 * @class ImageManager
 */
class ImageManager {
  private icons: {
    [key: string]: string
  } | null;
  private defIcon: string;
  private defWindowIconNative: NativeImage;
  constructor () {
    let iconPath: string | undefined;
    // 16x16图标读取，用于默认视窗图标
    if (process.env.NODE_ENV !== 'production') {
      iconPath = path.join(app.getAppPath(), '../public/icons/16x16.png');
    } else {
      iconPath = path.join(app.getAppPath(), './icons/16x16.png');
    }
    const iconBuffer = fs.readFileSync(iconPath);
    this.defIcon = `data:png;base64,${ iconBuffer.toString('base64') }`;
    // 64x64图标读取，用于窗体图标
    if (process.env.NODE_ENV !== 'production') {
      iconPath = path.join(app.getAppPath(), '../public/icons/64x64.png');
    } else {
      iconPath = path.join(app.getAppPath(), './icons/64x64.png');
    }
    this.defWindowIconNative = nativeImage.createFromBuffer(fs.readFileSync(iconPath));

    this.icons = {};
  }
  getDefIcon() {
    return this.defIcon;
  }
  getWindowIcon() {
    return this.defWindowIconNative;
  }
  /**
   * 将远程url转换为icon
   *
   * @param {string} url
   * @returns
   * @memberof ImageManager
   */
  async parseIco(url: string) {
    if (!this.icons![url]) {
      const res = await fileManager.downLoad2Buffer(url);
      let data = Buffer.from(res.data, 'binary');
      const type = await fromBuffer(data);
      if (type) {
        if (type.ext === 'ico') {
          const img = await icojs.parse(data, 'image/png');
          data = Buffer.from(img[0].buffer);
        }
        data = await this.reSize(data, iconSize);
        this.icons![url] = `data:png;base64,${ Buffer.from(data).toString('base64') }`;
      } else {
        this.icons![url] = this.defIcon;
      }
    }
    return this.icons![url];
  }
  /**
   *
   * 从远程路径复制到剪贴板
   * @param {string} url
   * @memberof ImageManager
   */
  async copyImageFromUrl(url: string) {
    const res = await fileManager.downLoad2Buffer(url);
    const data = Buffer.from(res.data, 'binary');
    const img = nativeImage.createFromBuffer(data);
    clipboard.writeImage(img, 'clipboard');
  }
  /**
   *
   * 修正图片尺寸
   * 按照亚马逊图片要求
   * @param {string} filepath
   * @param {boolean} [local=true]
   * @memberof ImageManager
   */
  async fixSize(filepath: string, local: boolean = true) {
    if (local === false) {
      filepath = await fileManager.downdLoad2Tmp(filepath);
      sharp.cache(false);
      const img = sharp(filepath).jpeg({
        quality: sharpQuality,
        chromaSubsampling: '4:4:4'
      });
      const meta = await img.metadata();
      if (meta.width && meta.height) {
        // 两个边都小于预定尺寸,放大处理
        const maxFile = parseInt(getConfig('VUE_APP_FILE_MAX_SIZE')!, 10);
        if (meta.width - maxFile < 0 && meta.height - maxFile < 0) {
          if (meta.width > meta.height) {
            img.resize(maxFile, null, {fit: sharp.fit.outside});
          } else {
            img.resize(null, maxFile, {fit: sharp.fit.outside});
          }
        }
        await img.toFile(filepath);
        const stat = await fs.promises.stat(filepath);
        if (stat.size > parseInt(getConfig('VUE_APP_FILE_MAX')!, 10)) {
          throw new Error(
            `${ filepath }太大,请控制在${ getConfig('VUE_APP_FILE_MAX_NAME') }以内`
          );
        }
      }
    }
  }
  /**
   *
   * 重调图片大小
   * @param {Buffer} data
   * @param {{width?: number; height?: number}} {width, height}
   * @returns
   * @memberof ImageManager
   */
  async reSize(data: Buffer, {width, height}: {width?: number; height?: number}) {
    sharp.cache(false);
    try {
      return await sharp(data).resize(width, height, {
        fit: sharp.fit.outside
      }).toBuffer();
    } catch (error) {
      console.error(error);
      return data;
    }
  }
}

export const imageManager = new ImageManager();
