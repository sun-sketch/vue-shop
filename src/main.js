import Vue from 'vue'
import App from './App.vue'
import router from './router'
import './plugins/element.js'
import './assets/css/global.css'
import axios from 'axios'
//导入富文本编辑器
import VueQuillEditor from 'vue-quill-editor'
import '../node_modules/quill/dist/quill.snow.css'

//配置请求根路径
axios.defaults.baseURL='https://www.liulongbin.top:8888/api/private/v1/'
axios.interceptors.request.use(config=>{
  console.log(config);
  config.headers.Authorization=window.sessionStorage.getItem('token');
  return config;
})
//每个Vue组件可以通过this直接访问$http，从而发送ajax请求
Vue.prototype.$http=axios
Vue.config.productionTip = false
Vue.filter('dateFormat',function(originVal){
  const dt=new Date(originVal);
  const y=dt.getFullYear();
  const m=(dt.getMonth()+1+'').padStart(2,'0');
  const d=(dt.getDate()+'').padStart(2,'0');
  const hh=(dt.getHours()+'').padStart(2,'0');
  const mm=(dt.getMinutes()+'').padStart(2,'0');
  const ss=(dt.getSeconds()+'').padStart(2,'0');
  return `${y}-${m}-${d} ${hh}:${mm}:${ss}`
})
//将富文本编辑器，注册为全局可用的组件
Vue.use(VueQuillEditor)

new Vue({
  router,
  render: h => h(App)
}).$mount('#app')
