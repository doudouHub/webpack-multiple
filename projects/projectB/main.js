import Vue from 'vue';
import App from './App';
import {router} from './router';
import store from './store/index'
import './ui-settings'
// 引入全局工具类api
import Utils from 'src/utils'
import './utils'

Vue.use(Utils);

new Vue({
    store,
    router,
    render: h => h(App)
}).$mount('#app');
