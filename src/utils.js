/***
 * 工具类api
 **/

import axios from 'axios'
import Clipboard from 'clipboard'
import {Message} from 'element-ui'

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
        delete  list[key];
    };
    return {
        listen: listen,
        trigger: trigger,
        remove: remove,
        list
    }
})();

export const handleClipboard = (text, event) => {
    const clipboard = new Clipboard(event.target, {
        text: () => text
    })
    clipboard.on('success', () => {
        Message({
            message: '复制成功',
            type: 'success'
        });
        clipboard.off('error')
        clipboard.off('success')
        clipboard.destroy()
    })
    clipboard.on('error', () => {
        Message({
            message: '复制失败',
            type: 'error'
        });
        clipboard.off('error')
        clipboard.off('success')
        clipboard.destroy()
    })
    clipboard.onClick(event)
}

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

// 获取vw单位数值
export const getVW = (value, width) => {
    return (value / width) * 100;
}

// cookie存取操作
export const cookieSave = {
    // 设置cookies
    set: function (name, value, days) {
        let Days = days || 30;
        let exp = new Date();
        exp.setTime(exp.getTime() + Days * 24 * 60 * 60 * 1000);
        let expires = days ? `expires=${exp.toGMTString()}` : '';
        // document.cookie = name + "=" + escape(JSON.stringify(value)) + ";expires=" + exp.toGMTString();
        document.cookie = `${name}=${escape(JSON.stringify(value))};${expires}`;
    },
    // 读取cookies
    get: function (name) {
        if (document.cookie.length > 0) {
            let c_start = document.cookie.indexOf(name + "=");
            if (c_start != -1) {
                c_start = c_start + name.length + 1;
                let c_end = document.cookie.indexOf(";", c_start);
                if (c_end == -1) c_end = document.cookie.length;

                let _result = unescape(document.cookie.substring(c_start, c_end));
                try {
                    _result = JSON.parse(_result);
                } catch (err) {
                }
                return _result;
            }
        }
        return ""
    },
    // 删除cookies
    del: function (name) {
        let exp = new Date();
        exp.setTime(exp.getTime() - 1);
        let cval = cookieSave.get(name);
        if (cval != null) document.cookie = name + "=" + cval + "expires=" + exp.toGMTString()
    }
}

// 会话缓存读取操作
export const sessionSave = {
    get: function (key) {
        let data = sessionStorage.getItem(key)
        try {
            data = JSON.parse(sessionStorage.getItem(key))
        } catch (err) {
            // console.log(err)
        }
        return data
    },
    set: function (key, val) {
        val = JSON.stringify(val)
        sessionStorage.setItem(key, val)
    }
}

//格式化时间
export const dateFormat = (fmt) => {
    var curdate = new Date();
    var o = {
        "M+": curdate.getMonth() + 1, //月份
        "d+": curdate.getDate() //日
        // "h+" : date.getHours(),     //小时
        // "m+" : date.getMinutes(),     //分
        // "s+" : date.getSeconds(),     //秒
    };
    if (/(y+)/.test(fmt))
        fmt = fmt.replace(
            RegExp.$1,
            (curdate.getFullYear() + "").substr(4 - RegExp.$1.length)
        );
    for (var k in o)
        if (new RegExp("(" + k + ")").test(fmt))
            fmt = fmt.replace(
                RegExp.$1,
                RegExp.$1.length == 1
                    ? o[k]
                    : ("00" + o[k]).substr(("" + o[k]).length)
            );
    return fmt;
}

// 非对象数组去重
export const removeDuplicatedItem = (arr) => {
    for (let i = 0; i < arr.length - 1; i++) {
        for (let j = i + 1; j < arr.length; j++) {
            if (arr[i] === arr[j]) {
                arr.splice(j, 1);
                j--;
            }
        }
    }
    return arr;
}

export default {
    install (Vue, options) {
        Vue.prototype.$axios = axios;

        Vue.prototype.$getVW = getVW;
        Vue.prototype.$removeDuplicatedItem = removeDuplicatedItem;
        Vue.prototype.$handleClipboard = handleClipboard;

        // 获取连接参数
        Vue.prototype.$getQueryString = getQueryString;
        Vue.prototype.$cookieSave = cookieSave;
        Vue.prototype.$sessionSave = sessionSave;

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

        // 生成随机id
        Vue.prototype.$createUuid = (start) => {
            let s = [];
            let hexDigits = "0123456789abcdef";
            for (let i = 0; i < 36; i++) {
                s[i] = hexDigits.substr(Math.floor(Math.random() * 0x10), 1);
            }
            s[14] = "4";
            s[19] = hexDigits.substr((s[19] & 0x3) | 0x8, 1);
            s[8] = s[13] = s[18] = s[23] = "-";
            return s.join("");
        }
    }
}
