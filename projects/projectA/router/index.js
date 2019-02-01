import Vue from 'vue';
import Router from 'vue-router';

Vue.use(Router);
export const router = new Router({
    routes: [
        {
            path: '/',
            component: resolve => require(['../pages/index'], resolve),
            meta: {
                title: '主页'
            }
        }
    ]
});

router.beforeEach((to, from, next) => {
    window.document.title = to.meta.title;
    next();
});
