
export class StatusError extends Error {
  status: number;
  constructor (message: string, status = 500) {
    super(message);
    this.status = status;
  }
}

/**
* 立即抛出一个异常
* @param {string} message
* @param {number} [status]
* @returns {never}
*/
export const throwNow = (message: string, status?: number): never => {
  throw new StatusError(message, status);
};
/**
* 若test成立，则抛出一个异常
* @param {boolean} test
* @param {string} message
* @param {number} [status]
*/
export const throwIf = (test: boolean, message: string, status?: number) => {
  if (test === true) {
    throw new StatusError(message, status);
  }
};
/**
* 若test 不成立，则抛出一个异常
* @param {boolean} test
* @param {string} message
* @param {number} [status]
*/
export const throwIfNot = (test: boolean, message: string, status?: number) => {
  if (test !== true) {
    throw new StatusError(message, status);
  }
};
