/***
 * 工具类api
 **/

import axios from 'axios'
import {cefMsg} from 'callCplus'

// 全局发布订阅模式对象
export const subsEvents = (() => {
    let list = {},
        listen,
        trigger,
        remove;
    listen = function (key, fn) {
        if (!list[key]) {
            list[key] = [];
        }
        list[key].push(fn);
    };
    trigger = function () {
        let key = Array.prototype.shift.call(arguments),
            fns = list[key];
        if (!fns || fns.length === 0) {
            return false;
        }
        for (let i = 0, fn; fn = fns[i++];) {
            fn.apply(this, arguments);
        }
    };
    remove = function (key, fn) {
        let fns = list[key];
        if (!fns) {
            return false;
        }
        if (!fn) {
            fns && (fns.length = 0);
        } else {
            for (let i = fns.length - 1; i >= 0; i--) {
                let _fn = fns[i];
                if (_fn === fn) {
                    fns.splice(i, 1);
                }
            }
        }
    };
    return {
        listen: listen,
        trigger: trigger,
        remove: remove,
        list
    }
})();

export const getQueryString = (name, url) => {
    try {
        // 获取url中"?"符后的字串
        url = url ? url.substring(url.indexOf('?')) : (decodeURIComponent(location.search) || '?' + decodeURIComponent(location.hash.split("?")[1]));
        let theRequest = {};
        if (url.indexOf("?") !== -1) {
            let str = url.substr(1);
            let strs = str.split("&");
            for (let i = 0; i < strs.length; i++) {
                theRequest[strs[i].split("=")[0]] = strs[i].split("=")[1];
            }
        }
        return name ? theRequest[name] : theRequest;
    } catch (e) {
        console.log(" getQueryString function error=" + e.message);
    }
}

export default {
    install (Vue, options) {
        Vue.prototype.$cefMsg = cefMsg;
        Vue.prototype.$axios = axios;

        // 获取连接参数
        Vue.prototype.$getQueryString = getQueryString

        // 判断元素父节点是否包含class
        Vue.prototype.$parentIndexOf = (node, parentClassName) => {
            if (node.className.indexOf(parentClassName) !== -1) {
                return node;
            }
            for (let i = 0, n = node; n = n.parentNode; i++) {
                if (n.className.indexOf(parentClassName) !== -1) {
                    // console.log(n.className)
                    return n;
                }
                // 找不到目标父节点，防止死循环
                if (n === document.documentElement) {
                    return false;
                }
            }
        }

        // 缓存读取操作
        Vue.prototype.$localSave = {
            get: function (key) {
                let data = localStorage.getItem(key);
                try {
                    data = JSON.parse(localStorage.getItem(key));
                } catch (err) {
                    // console.log(err)
                }
                return data;
            },
            set: function (key, val) {
                val = JSON.stringify(val);
                localStorage.setItem(key, val)
            }
        }

        // 对象深层复制
        Vue.prototype.$deepClone = (data) => {
            return JSON.parse(JSON.stringify(data))
        };

        // 数组对象排序
        Vue.prototype.$sortBy = function (prop) {
            return function (obj1, obj2) {
                let val1 = obj1[prop];
                let val2 = obj2[prop];
                if (!isNaN(Number(val1)) && !isNaN(Number(val2))) {
                    val1 = Number(val1);
                    val2 = Number(val2);
                }
                if (val1 < val2) {
                    return -1;
                } else if (val1 > val2) {
                    return 1;
                } else {
                    return 0;
                }
            }
        }

        // 获取可编辑框内光标位置
        Vue.prototype.$getSelection = (target) => {
            // chrome uc
            if (window.getSelection) {
                // 获取Selection对象
                let se = window.getSelection();
                // 获取起始位置，这个是字符的序号位置，而不是坐标
                let start = se.anchorOffset;
                // 获取结束位置
                let end = se.focusOffset;
                // 获取结束的dom元素
                let endEl = target || se.focusNode.parentElement;

                return {
                    start,
                    end,
                    // 被选中的内容
                    txt: se.toString(),
                    endEl,
                    className: endEl.className
                }
            }
        }

        // 设置光标位置
        Vue.prototype.$setSelectionPos = (target, pos) => {
            try {
                target.focus();
                window.getSelection().collapse(window.getSelection().anchorNode, pos)
            } catch (err) {
                console.log(err)
            }
        }

        // 插入字符串
        Vue.prototype.$insertString = (start) => {

        }
    }
}
