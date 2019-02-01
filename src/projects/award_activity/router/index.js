import Vue from 'vue';
import Router from 'vue-router';

Vue.use(Router);
export const router = new Router({
    routes: [
        {
            path: '/',
            component: resolve => require(['../pages/index'], resolve),
            meta: {
                title: '有奖活动'
            }
        }
    ]
});
