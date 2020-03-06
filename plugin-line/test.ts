export const select_list = (page: number, size: number) => {
  return `
    SELECT * FROM dd ${ page }, ${ size }
  `;
};