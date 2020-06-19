<template>
  <div class="container">
    <el-container class="home-container">
      <!-- 头部 -->
      <el-header class="el-header">
        <div>
          <img src="../assets/logo.png" alt />
          <span>电商后台管理系统</span>
        </div>
        <el-button type="info" @click="logout">退出</el-button>
      </el-header>
      <!-- 主体 -->
      <el-container>
        <!-- 侧边栏 -->
        <el-aside :width="isCollapse?'64px':'200px'" class="el-aside">
          <div class="toggle-button" @click="toggleCollapse">|||
          </div>
          <!-- 侧边栏菜单区 -->
          <el-menu unique-opened background-color="#333744" text-color="#fff" 
          active-text-color="#409EFF" :collapse="isCollapse" :collapse-transition="false"
          :router="true" :default-active="activePath">
            <!-- 一级菜单 -->
            <el-submenu :index="item.id+''" v-for="item in menulist" :key="item.id">
              <!-- 一级菜单的模板区 -->
              <template slot="title">
                <!-- 图标 -->
                <i :class="iconsObj[item.id]"></i>
                <span>{{item.authName}}</span>
              </template>
              <el-menu-item
                :index="'/'+subitem.path+''"
                v-for="subitem in item.children"
                :key="subitem.id"
                @click="saveNavState('/'+subitem.path)"
              >
                <i class="el-icon-menu"></i>
                <span>{{subitem.authName}}</span>
              </el-menu-item>
            </el-submenu>
          </el-menu>
        </el-aside>
        <!-- 右侧主体 -->
        <el-main class="el-main">
          <router-view></router-view>
        </el-main>
      </el-container>
    </el-container>
  </div>
</template>
<script>
export default {
  data() {
    // 左侧菜单数据
    return {
      menulist: [],
      iconsObj: {
        '125': 'el-icon-s-custom',
        '103': 'el-icon-s-fold',
        '101': 'el-icon-shopping-bag-1',
        '102': 'el-icon-notebook-2',
        '145': 'el-icon-data-line'
      },
      isCollapse:false,
      //被激活的链接地址
      activePath:'',
    }
  },
  created() {
    this.getMenuList();
    this.activePath=window.sessionStorage.getItem('activePath');
  },
  methods: {
    logout() {
      window.sessionStorage.clear()
      this.$router.push('/login')
    },
    // 获取所有的菜单
    async getMenuList() {
      const { data: res } = await this.$http.get('menus')
      if (res.meta.status !== 200) return this.$message.error(res.meta.msg)
      this.menulist = res.data
      console.log(res)
    },
    // 点击按钮切换菜单的折叠与展开
    toggleCollapse(){
      this.isCollapse=!this.isCollapse;
    },
    // 保存链接的激活状态
    saveNavState(activePath){
      window.sessionStorage.setItem('activePath',activePath);
      this.activePath=activePath;
    }
  }
}
</script>
<style lang="less" scoped>
.container {
  height: 100%;
  width: 100%;
}
.home-container {
  height: 100%;
  width: 100%;
}
.el-header {
  background-color: #373d41;
  display: flex;
  justify-content: space-between;
  padding-left: 0;
  align-items: center;
  color: #fff;
  font-size: 20px;
  img {
    width: 50px;
    height: 50px;
  }
  > div {
    display: flex;
    align-items: center; //纵向居中对齐
    span {
      margin-left: 15px;
    }
  }
}
.el-aside {
  background-color: #333744;
  .el-menu {
    border-right: none;
  }
}
.el-main {
  background-color: #eaedf1;
}
.iconfont{
  margin-left: 10px;
}
.toggle-button{
  background-color: #4a5064;
  font-size: 10px;
  line-height: 24px;
  color: #fff;
  text-align: center;
  letter-spacing: 0.2em;
  cursor: pointer;
}
</style>
