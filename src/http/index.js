// 封装请求
import axios from 'axios';
import {
    Toast
} from 'vant';
import store from '../store';
import api from './api';
console.log(store, 11);

// 全局设置
axios.defaults.headers.common['Authorization'] = 'demo';
axios.defaults.headers.post['Content-Type'] = 'text/xml;charset=UTF-8';

// 拦截request,设置全局请求为ajax请求
axios.interceptors.request.use(config => {
    // config.headers['X-Requested-With'] = 'XMLHttpRequest';
    return config;
});

const htp = axios.create({
    baseURL: '/',
    timeout: 10000
});

/**
 * 提示函数
 * 禁止点击蒙层、显示一秒后关闭
 */
const tip = msg => {
    Toast({
        message: msg,
        duration: 1000,
        forbidClick: true
    });
};

/**
 * 请求失败后的错误统一处理
 * @param {Number} status 请求失败的状态码
 */
const errorHandle = status => {
    //状态码判断
    switch (status) {
        case 400:
            tip('请求错误');
            break;

        case 401:
            tip('未授权，请登录');
            break;

        case 403:
            tip('拒绝访问');
            break;

        case 404:
            tip(`请求地址出错: ${err.response.config.url}`);
            break;

        case 408:
            tip('请求超时');
            break;

        case 500:
            tip('服务器内部错误');
            break;

        case 501:
            tip('服务未实现');
            break;

        case 502:
            tip('网关错误');
            break;

        case 503:
            tip('服务不可用');
            break;

        case 504:
            tip('网关超时');
            break;

        case 505:
            tip('HTTP版本不受支持');
            break;

        default:
            tip('未知错误');
    }
};

// 拦截响应response，并做一些错误处理
htp.interceptors.response.use(
    res => {
        res.status === 200 ? Promise.resolve(res) : Promise.reject(res);
        return res;
    },
    err => {
        const {
            response
        } = err;
        // 这里是返回状态码不为200时候的错误处理
        if (response) {
            //请求已发出，但是不在2XX的范围
            errorHandle(response.status);
            return Promise.reject(response);
        } else {
            return Promise.reject(response);
        }
    }
);

// 处理接口规范的公有方法
const xhr = ({
    method = 'post',
    ur,
    options
}) => {
    let p,
        m = false;
    let load = {
        close: () => {}
    };

    //   setTimeout(() => {
    //     !m &&
    //       (load = Loading.service({
    //         fullscreen: true,
    //         text: '拼命加载中...'
    //       }));
    //   }, 500);

    let ops = '';
    let unOps = {};

    if (store.state.userInfo) {
        unOps = JSON.parse(JSON.stringify(store.state.userInfo));
        if (method == 'get') {
            ops = getPostData();
        } else {
            ops = options;
        }
        // Object.assign(ops, options);
    } else {
        ops = options;
    }
    switch (method) {
        case 'get':
            p = new Promise(function(resolve, reject) {
                htp.get(api[ur], ops).then(
                    response => {
                        m = true;
                        load.close();
                        if (response.data && response.status == 200) {
                            resolve(response.data);
                        } else {
                            reject(response.status);
                        }
                    },
                    er => {
                        m = true;
                        load.close();
                        errHandler(er.status);
                    }
                );
            });
            break;
        case 'post':
            p = new Promise(function(resolve, reject) {
                htp.post(api[ur], ops).then(
                    response => {
                        m = true;
                        load.close();
                        if (response.data && response.status == 200) {
                            resolve(response.data);
                        } else {
                            reject(response.status);
                        }
                    },
                    er => {
                        m = true;
                        load.close();
                        errorHandle(er.status);
                    }
                );
            });
            break;
        default:
            break;
    }
    return p;
};

export default xhr;