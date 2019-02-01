
// 更新消息推送
export const updatePushMsg = (state, data) => {
    state.pushMsg = {
        timestamp: new Date().valueOf(),
        data
    }
}
