import Vue from 'vue';
import App from './App.vue';
import router from './router';
import store from './store/index.js';
import Vant from 'vant';
import axios from 'axios';
import 'vant/lib/index.css';
import components from './components';
import * as util from './utils/common.js';
// import './utils/websocket';
import './styles/reset.css';
import './styles/common.css';
import {
    Dialog,
    PullRefresh,
    List,
    Toast
} from 'vant';
import VueLazyLoad from 'vue-lazyload';
import Mui from 'vue-awesome-mui';
// import './utils/getNewMeg.js';

Vue.use(Vant);
Vue.use(PullRefresh).use(List);
Vue.use(VueLazyLoad);
Vue.use(Mui);
Vue.config.productionTip = false;

Vue.prototype.util = util;
Vue.prototype.dialog = Dialog;
Vue.prototype.$http = axios;
Vue.prototype.mui = Mui;

// 自定义组件格式，全局可用
Object.keys(components).forEach(key => {
    // 首字母大写
    var name = key.replace(/(\w)/, v => v.toUpperCase());

    //使用标签时前缀需要加 g- 以示区别
    Vue.component(`v${name}`, components[key]);
});

new Vue({
    router,
    store,
    render: h => h(App)
}).$mount('#app')