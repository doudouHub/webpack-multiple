import Vue from 'vue';
import App from './App';
import {router} from './router';
import VueTouch from 'vue-touch';
import store from './store/index'
import './ui-settings'
// 引入全局工具类api
import Utils from 'src/utils'
import './utils'
import VueAwesomeSwiper from 'vue-awesome-swiper'
import contenteditable from 'vue-contenteditable'
// require styles
import 'swiper/dist/css/swiper.css'

Vue.use(VueAwesomeSwiper);
Vue.use(VueTouch, {name: 'v-touch'});
Vue.use(Utils);
Vue.use(contenteditable);

new Vue({
    store,
    router,
    render: h => h(App)
}).$mount('#app');
