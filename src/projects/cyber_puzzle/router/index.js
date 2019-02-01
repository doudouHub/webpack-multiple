import Vue from 'vue';
import Router from 'vue-router';

Vue.use(Router);
export const router = new Router({
    routes: [
        {
            path: '/',
            redirect: '/choice_question/edit'
        },
        {
            path: '/choice_question/edit',
            component: resolve => require(['../pages/editBox'], resolve),
            meta: {
                title: '选择题 - 编辑'
            }
        },
        {
            path: '/choice_question/play',
            component: resolve => require(['../pages/playBox'], resolve),
            meta: {
                title: '选择题 - 播放'
            }
        },
        {
            path: '/TF_question',
            redirect: '/TF_question/edit'
        },
        {
            path: '/choice_question/edit',
            component: resolve => require(['../pages/editBox'], resolve),
            meta: {
                title: '判断题 - 编辑'
            }
        },
        {
            path: '/choice_question/play',
            component: resolve => require(['../pages/playBox'], resolve),
            meta: {
                title: '判断题 - 播放'
            }
        }
    ]
});

router.beforeEach((to, from, next) => {
    if (Number(location.search.indexOf('isplay')) !== -1 && to.path !== '/play') {
        router.push('/play');
    }
    next();
});
