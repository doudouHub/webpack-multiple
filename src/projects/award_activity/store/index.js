import Vue from 'vue'
import Vuex from 'vuex'
import {state} from './states'
import * as getters from './getters'
import * as actions from './actions'
import * as mutations from './mutations'

Vue.use(Vuex);

const store = new Vuex.Store({
    state,
    getters,
    actions,
    mutations
});

if (module.hot) {
    module.hot.accept([
        './getters',
        './actions',
        './mutations'
    ], () => {
        store.hotUpdate({
            getters: require('./getters'),
            actions: require('./actions'),
            mutations: require('./mutations').mutations
        })
    })
}

export default store
