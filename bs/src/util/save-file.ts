import { dialog, app } from 'electron';
/**
 * 文件存储
 * @param name
 * @param extensions
 * @param defaultPath
 */
export const saveFileDialog = async (name: string, extensions: string[], defaultPath?: string) => {
  const result = await dialog.showSaveDialog({
    title: '请选择保存路径',
    defaultPath: defaultPath || app.getPath('desktop'),
    filters: [{
      name, extensions
    }]
  });
  return result.filePath;
};
