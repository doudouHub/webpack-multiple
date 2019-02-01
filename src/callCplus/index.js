/**
 * Created by Doudou on 2018/7/4
 * description: C++定义的函数
 **/
import {subsEvents} from 'src/utils'

/***
 * C++方法函数
 * @param {String} cmd: c++类名
 * @param {String} tag: 方法名
 * @param {object} msg: 参数
 * @param {String} sortid: 回调返回的参数值
 **/
export const cefMsg = (cmd, tag, msg, sortid) => {
    try {
        console.log(`tag：${tag}，msg：${msg}，sortid：${sortid}`);
        if (cmd === 'AndroidCallHtmlData') {
            // 获取安卓数据
            window.Android.callHtmlData();
        } else {
            cef.message.sendMessage(cmd, [msg, tag]);
        }

        // 存在回调参数，生成C++方法的异步回调
        if (sortid != undefined || sortid) {
            return new Promise(function (resolve, reject) {
                // 监听全局executePdu方法
                subsEvents.listen(`executePdu_${sortid}`, function (data) {
                    if (data.sortid === sortid) {
                        resolve(data);
                        subsEvents.remove(`executePdu_${data.sortid}`);
                    }
                });
            })
        }
    } catch (err) {
        console.log(err)
    }
}

/***
 * 根据路径使用c++获取本地文件
 * @param {String} path: 文件路径
 **/
export const cefFile = (path) => {
    return new Promise(function (resolve, reject) {
        try {
            // 判断是否存在该文件
            if (cef.fs.fileExists(path)) {
                let jsonstr = cef.fs.readAll(path);
                resolve(JSON.parse(jsonstr));
            } else {
                reject(path)
            }
        } catch (err) {
            console.error('语法错误：', err);
        }
    })

}

/***
 * 调用C++写入数据
 * @param {String} path: 文件路径
 * @param {String} data: 写入的信息
 **/
export const cefWrite = (path, data) => {
    try {
        cef.fs.writeAll(path, data);
    } catch (err) {
    }
}
