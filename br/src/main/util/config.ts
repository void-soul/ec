import fs from 'fs';
import log from 'electron-log';
import path from 'path';
import { app } from 'electron';
/**
 * 读取配置文件
 * 配置文件来源
 * 1 .env/.env.development/.env.production：根据运行环境自动编译到process.env中,编译后无法修改
 * 2 可执行文件根目录的dev.config.json：可覆盖编译后的配置
 */

const config: {
  [key: string]: string;
} = {};
const configFile = path.join(app.getPath('exe'), '../dev.config.json');
if (fs.existsSync(configFile) === true) {
  const configJson = JSON.parse(fs.readFileSync(configFile).toString());
  Object.assign(config, configJson);
  log.warn(`found config! => ${ configFile }, override default config!`);
}
config.platform = process.platform;
/**
 * 获取实际生效配置
 * @param key 可见.env/.env.development/.env.production
 */
export const getConfig = (key: string) => config[key] || process.env[key];
