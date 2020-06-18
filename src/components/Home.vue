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
        <el-aside width="200px" class="el-aside">
          <!-- 侧边栏菜单区 -->
          <el-menu background-color="#333744" text-color="#fff" active-text-color="#ffd04b">
            <!-- 一级菜单 -->
            <el-submenu index="1">
              <!-- 一级菜单的模板区 -->
              <template slot="title">
                <!-- 图标 -->
                <i class="el-icon-location"></i>
                <span>导航一</span>
              </template>
              <el-menu-item index="1-4-1">
                <i class="el-icon-location"></i>
                <span>导航一</span>
              </el-menu-item>
            </el-submenu>
          </el-menu>
        </el-aside>
        <!-- 右侧主体 -->
        <el-main class="el-main">Main</el-main>
      </el-container>
    </el-container>
  </div>
</template>
<script>
export default {
  created(){
    this.getMenuList();
  },
  methods: {
    logout() {
      window.sessionStorage.clear()
      this.$router.push('/login')
    },
    // 获取所有的菜单
    getMenuList(){
      const{data:res}= await this.$http.get('menus')
      console.log(res);
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
    border-right: solid 1px #333744;
  }
}
.el-main {
  background-color: #eaedf1;
}
</style>
