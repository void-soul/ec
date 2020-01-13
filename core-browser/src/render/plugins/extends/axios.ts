import Last from './state';
import Vue from 'vue';
import axios from 'axios';
const productMode = process.env.NODE_ENV !== 'development';
const productErrorTip = '请求数据时发现错误,无法继续咯';
const sessionTimeoutCode = 201001;
const actMessages = ['Okay', 'Created'];
type Method = 'get' | 'post' | 'delete' | 'put';
const axiosInstance = axios.create({
  // baseURL: await window.brage.config('VUE_APP_NET_PATH'),
  // timeout: parseInt(window.brage.config('VUE_APP_NET_TIME_OUT'), 10),
  responseType: 'json',
  headers: {
    'Content-Type': 'application/json;charset=utf-8',
    Accept: 'application/json'
  },
  maxContentLength: Infinity,
});
const axiosHandelExcption = (message: string, status = 500, url: string) => {
  // 非用户异常
  let type = 'warning';
  if (status.toString().startsWith('1')) {
    type = 'error';
    if (productMode === true) {
      message = productErrorTip;
    }
  }
  if (productMode === false) {
    message = `${ message }(${ status }) from ${ url }`;
  }
  if (status === sessionTimeoutCode) {
    Vue.prototype.$router.push('/');
  }
  return {
    status,
    message,
    type,
    url,
  };
};
const axiosHandel = (response: any, url: string) => {
  if (response.status - 300 > 0) {
    return axiosHandelExcption(response.data.message, +response.status, url);
  } else if (
    response.data.status ||
    (response.data.message && actMessages.indexOf(response.data.message) === -1)
  ) {
    return axiosHandelExcption(
      response.data.message,
      response.data.status || response.status,
      url,
    );
  } else {
    return response.data;
  }
};
export default class extends Last {
  async $get(url: string, param: any, error = false) {
    return await this.axiosMethod('get', url, param, error);
  }
  async $post(url: string, param: any, error = false) {
    return await this.axiosMethod('post', url, param, error);
  }
  async $delete(url: string, param: any, error = false) {
    return await this.axiosMethod('delete', url, param, error);
  }
  async $put(url: string, param: any, error = false) {
    return await this.axiosMethod('put', url, param, error);
  }
  private async axiosMethod(
    method: Method,
    url: string,
    param: any,
    error = false,
  ) {
    let response: any;
    let params: any;
    let data: any;
    if (method === 'post' || method === 'put') {
      data = param;
    } else {
      params = param;
    }
    let result: any;
    try {
      const headers: {
        [key: string]: any
      } = {};
      // if (this.devid) {
      //   headers.devid = this.devid;
      // }
      response = await axiosInstance.request({
        url,
        method,
        headers,
        params,
        data,
      });
      result = axiosHandel(response, url);
    } catch (e) {
      result = {
        status: 500,
        message: '网络请求错误~',
      };
    }
    if (result.status) {
      if (error === true) {
        Vue.prototype.$q.notify({
          color: 'negative',
          textColor: 'white',
          icon: 'warning',
          message: result.message,
          position: 'bottom',
          multiLine: false,
          actions: [{icon: 'close', color: 'white'}],
          timeout: 1500,
        });
      }
      throw result;
    } else {
      return result;
    }
  }
}
