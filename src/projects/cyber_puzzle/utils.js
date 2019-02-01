import {subsEvents} from 'src/utils'

// C++调用js的方法
window.executePdu = (data) => {
    console.log(data, '获得返回数据');

    try {
        data = data.replace(/&apos;/g, '\'').replace(/&quot;/g, '\\"');
    } catch (err) {
    }
    if (typeof data === 'string') {
        data = JSON.parse(data);
    }

    if (subsEvents.list[`executePdu_${data.sortid}`]) {
        subsEvents.trigger(`executePdu_${data.sortid}`, data);
    } else {
        // 消息类型需要页面监听
        store.dispatch('updatePushMsg', data)
    }
};

// android调用方法
window.executePduAndroid = function (data) {
    executePdu(data);
}
