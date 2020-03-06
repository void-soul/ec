import {calc} from './math';
import {Empty} from './empty';
import {notEmptyString} from './string';
import BetterSqlite3 from 'better-sqlite3';
import log from 'electron-log';
import {throwIf, throwIfNot} from './throw';
import {DbOption, SQLManConfig, SqlCache} from 'sql-man';
import {JingPlugin, ContextMenuParams, ContextMenu, JingWindow, JingView, UrlInfo} from 'plugin-line';

const SKIP_KEYS = ['__tableName', '__ids', '__logicDelete'];
const MAX_DEAL = 500;
interface RunResults {
  changes: number;
  lastInsertRowid: Array<number | string>;
}
function newRunResults() {
  return {
    changes: 0,
    lastInsertRowid: []
  } as RunResults;
}
const EmptyRunResults = newRunResults();
interface RunResult {
  changes: number;
  lastInsertRowid: number | string;
}

/** 默认选项注解 */
function defOption() {
  return (_target: any, _propertyKey: string, descriptor: PropertyDescriptor) => {
    const fn = descriptor.value;
    const length = descriptor.value.length;
    descriptor.value = function (...args: any[]) {
      for (let i = args.length; i < length; i++) {
        args[i] = undefined;
      }
      if (args[length - 1]) {
        if (args[length - 1].skipNullUndefined === undefined) {
          args[length - 1].skipNullUndefined = false;
        }
        if (args[length - 1].skipEmptyString === undefined) {
          args[length - 1].skipEmptyString = false;
        }
        if (args[length - 1].skipEmptyString === true) {
          args[length - 1].skipNullUndefined = true;
        }
        if (args[length - 1].tableName === undefined) {
          args[length - 1].tableName = (serviceTable: string) => serviceTable;
        }
      } else {
        args[length - 1] = {
          skipNullUndefined: false,
          skipEmptyString: false,
          tableName: (serviceTable: string) => serviceTable
        };
      }
      return fn.call(this, ...args);
    };
  };
}
/** 转换返回类型为可开放类型 */
function parse2Result(result: BetterSqlite3.RunResult): RunResult {
  if (typeof result.lastInsertRowid === 'string') {
    return {
      changes: result.changes,
      lastInsertRowid: result.lastInsertRowid
    };
  } else if (typeof result.lastInsertRowid === 'number') {
    return {
      changes: result.changes,
      lastInsertRowid: result.lastInsertRowid
    };
  } else {
    return {
      changes: result.changes,
      lastInsertRowid: result.lastInsertRowid.toNumber()
    };
  }
}

class DbServer<T> {
  private tableName: string;
  private idNames: (keyof T)[];
  private keys: (keyof T)[];
  private stateFileName?: string;
  private deleteState?: string;
  private db: BetterSqlite3.Database;
  constructor (classtype: any, db: BetterSqlite3.Database) {
    this.db = db;
    this.tableName = classtype.__tableName;
    this.idNames = classtype.__ids;
    this.keys = [];
    for (const key in classtype) {
      if (!SKIP_KEYS.includes(key)) {
        this.keys.push(key as any);
      }
    }
    if (classtype.__logicDelete) {
      this.stateFileName = classtype.__logicDelete.stateFileName;
      this.deleteState = classtype.__logicDelete.deleteState;
    }
  }

  /**
   * 插入
   * @param {{[P in keyof T]?: T[P]}} data
   * @param {DbOption} [option]
   * @returns {RunResult} 返回自增主键或者rowid以及受影响行数
   * @memberof DbServer
   */
  @defOption()
  insert(data: {[P in keyof T]?: T[P]}, option?: DbOption): RunResult {
    data = this.filterEmptyAndTransient(data, option!.skipNullUndefined, option!.skipNullUndefined);
    const keys = Object.keys(data);

    const sql = [
      `INSERT INTO ${ option!.tableName!(this.tableName) } (`,
      keys.join(','),
      ') VALUES (',
      new Array<string>(keys.length).fill('?').join(',')
    ].join(' ');

    return parse2Result(this.db.prepare(sql).run(
      Object.values(data)
        .flatMap(item => item === undefined ? null : item)
    ));
  }

  /**
   * 如果指定列名不存在数据库中，则插入数据
   * @param {{[P in keyof T]?: T[P]}} data
   * @param {(keyof T)[]} columns
   * @param {DbOption} [option]
   * @returns {RunResult} 返回自增主键或者rowid以及受影响行数
   * @memberof DbServer
   */
  @defOption()
  insertIfNotExists(data: {[P in keyof T]?: T[P]}, columns: (keyof T)[], option?: DbOption): RunResult {
    const tableName = option!.tableName!(this.tableName);
    data = this.filterEmptyAndTransient(data, option!.skipNullUndefined, option!.skipNullUndefined);
    const keys = Object.keys(data);

    const sql = [
      `INSERT INTO ${ tableName } (`,
      keys.join(','),
      new Array<string>(keys.length).fill('?').join(','),
      ` WHERE NOT EXISTS( SELECT 1 FROM ${ tableName } WHERE `,
      columns.flatMap(item => `${ item } = ?`).join(' AND ')
    ].join(' ');

    return parse2Result(this.db.prepare(sql).run(
      Object.values(data)
        .flatMap(item => item === undefined ? null : item)
        .concat(
          columns.flatMap(item => data[item] === undefined ? null : data[item])
        )
    ));
  }

  /**
   * 插入或替换(按唯一约束判断且先删除再插入,因此性能较低于insertIfNotExists)
   * @param {{[P in keyof T]?: T[P]}} data
   * @param {DbOption} [option]
   * @returns {RunResult} 返回自增主键或者rowid以及受影响行数
   * @memberof DbServer
   */
  @defOption()
  replace(data: {[P in keyof T]?: T[P]}, option?: DbOption): RunResult {
    data = this.filterEmptyAndTransient(data, option!.skipNullUndefined, option!.skipNullUndefined);
    const keys = Object.keys(data);

    const sql = [
      `REPLACE INTO ${ option!.tableName!(this.tableName) } (`,
      new Array<string>(keys.length).fill('?').join(','),
      ')'
    ].join(' ');

    return parse2Result(this.db.prepare(sql).run(
      Object.values(data)
        .flatMap(item => item === undefined ? null : item)
    ));
  }

  /**
   *
   * 批量插入
   * @param {{[P in keyof T]?: T[P]}[]} datas
   * @param {DbOption} [option]
   * @returns {RunResults}
   * @memberof DbServer
   */
  @defOption()
  insertBatch(datas: {[P in keyof T]?: T[P]}[], option?: DbOption): RunResults {
    if (datas.length === 0) {
      return EmptyRunResults;
    }
    const results = newRunResults();
    const length = Math.ceil(datas.length / MAX_DEAL);
    const tableName = option!.tableName!(this.tableName);
    const keys = Object.keys(datas[0]);
    const values = '(' + new Array<string>(keys.length).fill('?').join(',') + ')';
    const start = `INSERT INTO ${ tableName } (`;
    const keyStr = keys.join(',');

    for (let i = 0; i < length; i++) {
      const target = this.filterEmptyAndTransients(datas.slice(i * MAX_DEAL, (i + 1) * MAX_DEAL), option!.skipNullUndefined, option!.skipNullUndefined);

      const sql = [
        start,
        keyStr,
        ') VALUES ',
        new Array<string>(target.length).fill(values).join(',')
      ].join(' ');

      const result = parse2Result(this.db.prepare(sql).run(
        target.flatMap(item =>
          keys.flatMap(key => item[key] === undefined ? null : item[key])
        ).flat()
      ));
      results.changes += result.changes;
      results.lastInsertRowid.push(result.lastInsertRowid);
    }
    return results;
  }


  /**
   * 批量进行：如果指定列名不存在数据库中，则插入数据
   * @param {{[P in keyof T]?: T[P]}} data
   * @param {(keyof T)[]} columns
   * @param {DbOption} [option]
   * @returns {RunResult} 返回自增主键或者rowid以及受影响行数
   * @memberof DbServer
   */
  @defOption()
  insertBatchIfNotExists(datas: {[P in keyof T]?: T[P]}[], columns: (keyof T)[], option?: DbOption): RunResults {
    if (datas.length === 0) {
      return EmptyRunResults;
    }
    const results = newRunResults();
    const length = Math.ceil(datas.length / MAX_DEAL);
    const tableName = option!.tableName!(this.tableName);
    const keys = Object.keys(datas[0]);
    const values = [
      'SELECT',
      new Array<string>(keys.length).fill('?').join(','),
      `WHERE NOT EXISTS( SELECT 1 FROM ${ tableName } WHERE`,
      columns.flatMap(item => `${ item } = ?`).join(' AND ')
    ].join(' ');
    const start = `INSERT INTO ${ tableName } (`;
    const keyStr = keys.join(',');

    for (let i = 0; i < length; i++) {
      const target = this.filterEmptyAndTransients(datas.slice(i * MAX_DEAL, (i + 1) * MAX_DEAL), option!.skipNullUndefined, option!.skipNullUndefined);

      const sql = [
        start,
        keyStr,
        ')',
        new Array<string>(target.length).fill(values).join(' UNION ALL  ')
      ].join(' ');

      const result = parse2Result(this.db.prepare(sql).run(
        target.flatMap(item =>
          keys.flatMap(key => item[key] === undefined ? null : item[key]).concat(
            columns.flatMap(key => item[key] === undefined ? null : item[key])
          )
        ).flat()
      ));
      results.changes += result.changes;
      results.lastInsertRowid.push(result.lastInsertRowid);
    }
    return results;
  }

  /**
   *
   * 批量进行：插入或替换(按唯一约束判断且先删除再插入,因此性能较低于insertIfNotExists)
   * @param {{[P in keyof T]?: T[P]}[]} datas
   * @param {DbOption} [option]
   * @returns {RunResults}
   * @memberof DbServer
   */
  @defOption()
  replaceBatch(datas: {[P in keyof T]?: T[P]}[], option?: DbOption): RunResults {
    if (datas.length === 0) {
      return EmptyRunResults;
    }
    const results = newRunResults();
    const length = Math.ceil(datas.length / MAX_DEAL);
    const tableName = option!.tableName!(this.tableName);
    const keys = Object.keys(datas[0]);
    const values = '(' + new Array<string>(keys.length).fill('?').join(',') + ')';
    const start = `REPLACE INTO ${ tableName } (`;
    const keyStr = keys.join(',');

    for (let i = 0; i < length; i++) {
      const target = this.filterEmptyAndTransients(datas.slice(i * MAX_DEAL, (i + 1) * MAX_DEAL), option!.skipNullUndefined, option!.skipNullUndefined);

      const sql = [
        start,
        keyStr,
        ') VALUES ',
        new Array<string>(target.length).fill(values).join(',')
      ].join(' ');

      const result = parse2Result(this.db.prepare(sql).run(
        target.flatMap(item =>
          keys.flatMap(key => item[key] === undefined ? null : item[key])
        ).flat()
      ));
      results.changes += result.changes;
      results.lastInsertRowid.push(result.lastInsertRowid);
    }
    return results;
  }

  /**
   * 根据主键修改
   * @param {{[P in keyof T]?: T[P]}} data
   * @param {DbOption} [option]
   * @returns {number}
   * @memberof DbServer
   */
  @defOption()
  updateById(data: {[P in keyof T]?: T[P]}, option?: DbOption): number {
    const where: {[P in keyof T]?: T[P]} = {};
    for (const idName of this.idNames) {
      throwIf(!data[idName], `id must be set!${ this.tableName }`);
      where[idName] = data[idName];
    }
    data = this.filterEmptyAndTransient(data, option!.skipNullUndefined, option!.skipNullUndefined);
    const keys = Object.keys(data);

    const sql = [
      `UPDATE ${ option!.tableName!(this.tableName) } (`,
      'SET',
      keys.flatMap(key => `${ key } = ?`).join(','),
      'WHERE',
      this.idNames.flatMap(key => `${ key } = ?`).join(' AND '),
    ].join(' ');

    return this.db.prepare(sql).run(
      Object.values(data)
        .flatMap(item => item === undefined ? null : item)
        .concat(Object.values(where))
    ).changes;
  }

  /**
   *
   * 根据主键 批量修改
   * @param {{[P in keyof T]?: T[P]}[]} datas
   * @param {DbOption} [option]
   * @returns {number}
   * @memberof DbServer
   */
  @defOption()
  updateBatchById(datas: {[P in keyof T]?: T[P]}[], option?: DbOption): number {
    if (datas.length === 0) {
      return 0;
    }

    let results = 0;
    const length = Math.ceil(datas.length / MAX_DEAL);
    const tableName = option!.tableName!(this.tableName);
    const keys = Object.keys(datas[0]);
    const start = `UPDATE ${ tableName } SET `;
    const caseStr = `WHEN ${ this.idNames.flatMap(item => `${ item } = ?`).join(' AND ') } THEN ?`;

    for (let i = 0; i < length; i++) {
      const target = this.filterEmptyAndTransients(datas.slice(i * MAX_DEAL, (i + 1) * MAX_DEAL), option!.skipNullUndefined, option!.skipNullUndefined);
      const realLengt = target.length;
      const data = new Array<any>();
      const sql = [
        start,
        keys.flatMap(key => {
          data.splice(data.length - 1, 0, ...target.flatMap(item => this.idNames.flatMap(id => item[id]).concat(item[key]).flat()));
          return [
            key,
            '= CASE',
            new Array<string>(realLengt).fill(caseStr).join(' '),
            'END'
          ].join(',');
        }),
        'WHERE',
        this.idNames.flatMap(key => {
          data.splice(data.length - 1, 0, ...target.flatMap(item => item[key]));
          return `${ key } IN (${ new Array<string>(realLengt).fill('?').join(',') })`;
        }).join(' AND ')
      ].join(' ');

      const result = parse2Result(this.db.prepare(sql).run(data));
      results += result.changes;
    }

    return results;
  }

  /**
   *
   * 根据条件修改
   * @param {{[P in keyof T]?: T[P]}} data
   * @param {{[P in keyof T]?: T[P]}} where
   * @param {DbOption} [option]
   * @returns {number}
   * @memberof DbServer
   */
  @defOption()
  updateBatch(data: {[P in keyof T]?: T[P]}, where: {[P in keyof T]?: T[P]}, option?: DbOption): number {
    const realData = this.filterEmptyAndTransient(data, option!.skipNullUndefined, option!.skipNullUndefined);

    const sql = [
      `UPDATE ${ option!.tableName!(this.tableName) } SET `,
      Object.keys(realData).flatMap(item => `${ item } = ?`),
      'WHERE',
      Object.keys(where).flatMap(item => `${ item } = ?`),
    ].join(' ');

    const result = this.db.prepare(sql).run(Object.values(realData).concat(Object.values(where)));
    return result.changes;
  }

  /**
   *
   * 根据条件删除
   * @param {{[P in keyof T]?: T[P]}} where
   * @param {DbOption} [option]
   * @returns {number}
   * @memberof DbServer
   */
  @defOption()
  deleteBatch(where: {[P in keyof T]?: T[P]}, option?: DbOption): number {
    const sql = [
      `DELETE FROM ${ option!.tableName!(this.tableName) } `,
      'WHERE',
      Object.keys(where).flatMap(item => `${ item } = ?`),
    ].join(' ');

    const result = this.db.prepare(sql).run(Object.values(where));
    return result.changes;
  }

  /**
   * 根据单个主键删除
   *
   * @param {*} id
   * @param {DbOption} [option]
   * @returns {number}
   * @memberof DbServer
   */
  @defOption()
  deleteById(id: any, option?: DbOption): number {
    throwIfNot(
      this.idNames.length === 1,
      'this table is muti id(or not set id), please use deleteByIdMuti'
    );
    if (this.deleteState !== undefined && this.stateFileName !== undefined) {
      const sql = [
        `UPDATE ${ option!.tableName!(this.tableName) } `,
        'SET',
        this.stateFileName,
        '= ?',
        'WHERE',
        this.idNames[0],
        '= ?'
      ].join(' ');
      const result = this.db.prepare(sql).run([this.deleteState, id]);
      return result.changes;
    } else {
      const sql = [
        `DELETE FROM ${ option!.tableName!(this.tableName) } `,
        'WHERE',
        this.idNames[0],
        '= ?'
      ].join(' ');

      const result = this.db.prepare(sql).run([id]);
      return result.changes;
    }
  }

  /**
   *
   * 根据多个主键删除
   * @param {{[P in keyof T]?: T[P]}} data
   * @param {DbOption} [option]
   * @returns {number}
   * @memberof DbServer
   */
  @defOption()
  deleteByIdMuti(data: {[P in keyof T]?: T[P]}, option?: DbOption): number {
    for (const idName of this.idNames) {
      throwIf(!data[idName], `id must be set!${ this.tableName }`);
    }
    if (this.deleteState !== undefined && this.stateFileName !== undefined) {
      const sql = [
        `UPDATE ${ option!.tableName!(this.tableName) } `,
        'SET',
        this.stateFileName,
        '= ?',
        'WHERE',
        this.idNames.flatMap(id => `${ id } = ?`).join(' AND ')
      ].join(' ');
      const result = this.db.prepare(sql).run([this.deleteState, ...this.idNames.flatMap(id => data[id])]);
      return result.changes;
    } else {
      const sql = [
        `DELETE FROM ${ option!.tableName!(this.tableName) } `,
        'WHERE',
        this.idNames.flatMap(id => `${ id } = ?`).join(' AND ')
      ].join(' ');

      const result = this.db.prepare(sql).run(this.idNames.flatMap(id => data[id]));
      return result.changes;
    }
  }

  // unique<L>(id: any, error?: string, option?: DbOption): L {
  //   throwIfNot(
  //     this.idNames.length === 1,
  //     'this table is muti id(or not set id), please use uniqueMuti'
  //   );
  // }

  /**
   *
   * 过滤掉空属性
   * @private
   * @param {*} source
   * @returns {T}
   */
  private filterEmptyAndTransient(source: any, skipEmpty = true, dealEmptyString = true): {[P in keyof T]?: T[P]} {
    const result: {[P in keyof T]?: T[P]} = {};
    this.keys.forEach((key) => {
      if (skipEmpty === true) {
        if (notEmptyString(source[key], dealEmptyString)) {
          result[key] = source[key];
        }
      } else {
        result[key] = source[key];
      }
    });
    return result;
  }

  /**
   *
   * 过滤掉空属性
   * @private
   * @param {*} source
   * @returns {T}
   */
  private filterEmptyAndTransients(source: any[], skipEmpty = true, dealEmptyString = true): {[P in keyof T]?: T[P]}[] {
    const result = new Array<{[P in keyof T]?: T[P]}>();
    source.forEach((item) => {
      result.push(this.filterEmptyAndTransient(item, skipEmpty, dealEmptyString));
    });
    return result;
  }
}
/**
 * 提供一个：server缓存、server工厂
 * app里设置
 */
class DbGener {
  private db: BetterSqlite3.Database;
  private hash: {[key: string]: DbServer<any>} = {};

  constructor (dbPath: string) {
    this.db = new BetterSqlite3(dbPath, {
      verbose: log.info
    });
  }

  get<T>(classtype: any) {
    const key = classtype.toString();
    if (!this.hash[key]) {
      this.hash[key] = new DbServer<T>(classtype, this.db);
    }
    return this.hash[key];
  }

  transction(fn: () => any) {
    return this.db.transaction(fn)();
  }

  destory() {
    this.db.close();
  }
}

const dbs: {[key: string]: DbGener} = {};
export const getDb = (dbPath: string): DbGener => {
  if (!dbs[dbPath]) {
    dbs[dbPath] = new DbGener(dbPath);
  }
  return dbs[dbPath];
};
