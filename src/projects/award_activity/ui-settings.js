import Vue from 'vue';
import {
    // Tabs,
    // TabPane,
    // Row,
    // Col,
    // Dialog,
    Tag,
    Checkbox,
    Button,
    Input,

    Message
} from 'element-ui'

// Vue.use(Tabs);
// Vue.use(TabPane);
// Vue.use(Row);
// Vue.use(Col);
// Vue.use(Dialog);
Vue.use(Tag);
Vue.use(Button);
Vue.use(Input);
Vue.use(Checkbox);

Vue.prototype.$message = Message;
Vue.prototype.confirm = confirm;
