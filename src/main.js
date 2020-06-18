import Vue from 'vue'
import App from './App.vue'
import router from './router'
import './plugins/element.js'
import './assets/css/global.css'
import axios from 'axios'

//配置请求根路径
axios.defaults.baseURL='https://www.liulongbin.top:8888/api/private/v1/'
axios.interceptors.request.use(config=>{
  console.log(config);
  config.header.Authorization=window.sessionStorage.getItem('token');
  return config;
})
//每个Vue组件可以通过this直接访问$http，从而发送ajax请求
Vue.prototype.$http=axios
Vue.config.productionTip = false

new Vue({
  router,
  render: h => h(App)
}).$mount('#app')
