/**
 * Created by Doudou on 2018/5/14
 * description: axios请求全局配置
 **/
import qs from 'qs'
import axios from 'axios'
import config from './config'
import { sessionSave } from 'src/utils'

// 基地址
config.baseURL = process.env.NODE_ENV === 'development' ? BASE_URL : (location.protocol.indexOf('http') > -1 ? '' : sessionSave.get('baseUrl'));

const service = axios.create(config);

// 请求拦截
service.interceptors.request.use((config) => {
    if (config.method === 'post') {
        config.data = qs.stringify(config.data);
    }
    return config;
}, (error) => {
    return Promise.reject(error);
});

// 返回状态判断
service.interceptors.response.use((res) => {
    let _data = '';

    switch (res.data.code) {
        case 1:
            _data = res.data.data;
            break;
        case -1:
            console.error(`请求失败: ${res.config.url} ${JSON.stringify(res.config.params)}`);
            _data = Promise.reject(res.data);
            break;
        default:
            _data = Promise.reject(res.data);
            break;
    }

    return _data;
}, (error) => {
    // 404等问题可以在这里处理
    switch (error.response.status) {
        case 400:
            error.message = '请求错误'
            break;

        case 401:
            error.message = '未授权，请登录'
            break;

        case 402:
            error.message = '登录过期，请重新登录'
            break;

        case 403:
            error.message = '拒绝访问'
            break;

        case 404:
            error.message = `请求地址出错: ${error.response.config.url}`
            break;

        case 408:
            error.message = '请求超时';
            break;

        case 500:
            error.message = '服务器内部错误'
            break;

        case 501:
            error.message = '服务未实现'
            break;

        case 502:
            error.message = '网关错误'
            break;

        case 503:
            error.message = '服务不可用'
            break;

        case 504:
            error.message = '网关超时'
            break;

        case 505:
            error.message = 'HTTP版本不受支持'
            break;
        default:
    }
    console.error(error.message);
    return Promise.reject(error);
});

// 通用方法
export const POST = (url, params) => {
    return service({
        method: 'post',
        url,
        data: params
    })
}

export const GET = (url, params) => {
    return service({
        method: 'get',
        url,
        params
    })
}

export const DELETE = (url, params) => {
    return service({
        method: 'delete',
        url,
        params
    })
}
