export const APP_EXISTS = 'app-exists';
export const TOOLBAR_HEIGHT = 70;
export const WINDOW_CORE_URI = 'jing://layout.html';
export const FREE_URI = 'jing://free.html';
/**
 * 广播通知
 * 向订阅了某个通道的页面统一发通知
 */
export const TO_FRONT = 'to-front';
/**
 * 单通道事件 调用后台对象方法，无返回值、无promise
 * 向某个后台对象发送消息
 */
export const DO_BACK = 'do-back';
/**
 * 强调用通道:调用后台对象方法，有返回值、无promise
 */
export const INVOKE_BACK = 'invoke-back';
/**
 * 强调用通道:调用后台对象方法，有返回值、无promise
 */
export const EXCUTE_BACK = 'excute-back';
/**
 * 获取当前页面的视窗、窗体id
 */
export const MY_INFO = 'my-info';
/**
 * 订阅消息
 */
export const SUB = 'sub';
/**
 * 取消订阅消息
 */
export const UN_SUB = 'un-sub';
