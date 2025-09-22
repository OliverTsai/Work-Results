import App from './App.vue';
import { createApp } from 'vue';
import { createPinia } from 'pinia'
import router from './router';
import piniaPluginPersistedstate from 'pinia-plugin-persistedstate';

import 'bootstrap/dist/css/bootstrap.css'
import 'bootstrap/dist/js/bootstrap.bundle.min.js'
import 'bootstrap-vue-3/dist/bootstrap-vue-3.css'

import BootstrapVue3 from 'bootstrap-vue-3'

const app = createApp(App);
const pinia = createPinia();
pinia.use(piniaPluginPersistedstate); // 註冊持久化插件

app.use(pinia);
app.use(router);
app.use(BootstrapVue3);
app.mount('#app');

