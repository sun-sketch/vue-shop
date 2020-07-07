import Vue from 'vue'
import VueRouter from 'vue-router'
import Login from "../components/Login.vue"
import Home from '../components/Home.vue'
import Welcome from '../components/Welcome'
import Users from '../components/user/users.vue'
import Rights from '../components/power/Rights.vue'
import Roles from '../components/power/Roles.vue'
import Cate from '../components/goods/Cate.vue'
import Params from '../components/goods/Params.vue'

Vue.use(VueRouter)

const routes = [
  {path:'/',redirect:'/login'},
  {path:'/login',component:Login},
  {
    path:'/home',
    component:Home,
    redirect:'/welcome',
    children:[
    {path:'/welcome',component:Welcome},
    {path:'/users',component:Users},
    {path:'/rights',component:Rights},
    {path:'/roles',component:Roles},
    {path:'/categories',component:Cate},
    {path:'/params',component:Params}
  ]},
]

const router = new VueRouter({
  routes
})
//挂载路由守卫
router.beforeEach((to,from,next)=>{
  //to将要访问的路径
  //from代表从哪个路径跳转而来
  //next是一个函数，表示放行
  //next()放行 next('/login')强制跳转
  if(to.path==='/login')return next();
  const tokenStr=window.sessionStorage.getItem('token');
  if(!tokenStr)return next('/login');
  next()
})
// 解决ElementUI导航栏中的vue-router在3.0版本以上重复点菜单报错问题
const originalPush = VueRouter.prototype.push
VueRouter.prototype.push = function push(location) {
  return originalPush.call(this, location).catch(err => err)
}
export default router
