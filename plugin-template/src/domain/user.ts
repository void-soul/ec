export default class {
  static defined = {
    tableName: 'cp_user',
    ids: ['userid'],
    columns: {
      username: {
        dbType: 'TEXT(20)',
        realType: 'string',
        name: 'username'
      }
    }
  };
}