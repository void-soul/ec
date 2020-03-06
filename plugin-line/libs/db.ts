export const db = (config: {
  tableName: string;
  ids?: string[];
  logicDelete?: {
    stateFileName: string;
    deleteState: string;
  };
}) => {
  return <T extends {new(...args: any[]): {}}>(constructor: T) => {
    constructor['__tableName'] = config.tableName;
    constructor['__ids'] = config.ids;
    constructor['__logicDelete'] = config.logicDelete;
    return class extends constructor {
    };
  };
};
