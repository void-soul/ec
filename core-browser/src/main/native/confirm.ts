import {dialog} from 'electron';
import {getConfig} from '@/main/rs/config';
/**
 * 询问对话框
 * @param detail
 * @param message
 * @param title
 */
export const confirm = async (message: string, detail: string, title: string) => {
  const result = await dialog.showMessageBox({
    type: 'question',
    buttons: ['确认', '再看看'],
    defaultId: 1,
    message,
    detail,
    cancelId: 1,
    noLink: true,
    title
  });
  return result.response !== 1;
};
