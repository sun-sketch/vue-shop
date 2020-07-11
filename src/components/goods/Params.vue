<template>
  <div>
    <!-- 面包屑导航区 -->
    <el-breadcrumb separator-class="el-icon-arrow-right">
      <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>商品管理</el-breadcrumb-item>
      <el-breadcrumb-item>分类参数</el-breadcrumb-item>
    </el-breadcrumb>
    <el-card>
      <!-- 头部警告区 -->
      <el-alert title="注意：只允许为第三级分类设置相关参数！" type="warning" :closable="false" show-icon></el-alert>
      <!-- 选择商品分类区域 -->
      <el-row class="cat_opt">
        <el-col>
          <span>选择商品分类：</span>
          <!-- 选择商品分类的级联选择框 -->
          <el-cascader
            v-model="selectedCateKeys"
            :options="catelist"
            :props="{ expandTrigger: 'hover',
                    value:'cat_id',
                    label:'cat_name',
                    children:'children' }"
            @change="handleChange"
          ></el-cascader>
        </el-col>
      </el-row>
      <el-tabs v-model="activeName" @tab-click="handleTabClick">
        <el-tab-pane label="动态参数" name="many">
          <el-button
            type="primary"
            size="mini"
            :disabled="isBtnDisabled"
            @click="addDialogVisible=true"
          >添加参数</el-button>
          <!-- 动态参数表格 -->
          <el-table :data="manyTableData" border stripe>
            <!-- 展开行 -->
            <el-table-column type="expand">
              <template v-slot="scope">
                <el-tag v-for="(item,i) in scope.row.attr_vals" :key="i" closable>
                  {{item}}</el-tag>
              </template>
            </el-table-column>
            <!-- 索引列 -->
            <el-table-column type="index"></el-table-column>
            <el-table-column label="参数名称" prop="attr_name"></el-table-column>
            <el-table-column label="操作">
              <template v-slot="scope">
                <el-button
                  size="mini"
                  type="primary"
                  icon="el-icon-edit"
                  @click="showEditDialog(scope.row.attr_id)"
                >编辑</el-button>
                <el-button
                  size="mini"
                  type="danger"
                  icon="el-icon-delete"
                  @click="deleteParams(scope.row.attr_id)"
                >删除</el-button>
              </template>
            </el-table-column>
          </el-table>
        </el-tab-pane>
        <el-tab-pane label="静态属性" name="only">
          <el-button
            type="primary"
            size="mini"
            :disabled="isBtnDisabled"
            @click="addDialogVisible=true"
          >添加属性</el-button>
          <!-- 静态参数表格 -->
          <el-table :data="onlyTableData" border stripe>
            <!-- 展开行 -->
            <el-table-column type="expand"></el-table-column>
            <!-- 索引列 -->
            <el-table-column type="index"></el-table-column>
            <el-table-column label="属性名称" prop="attr_name"></el-table-column>
            <el-table-column label="操作">
              <template v-slot="scope">
                <el-button
                  size="mini"
                  type="primary"
                  icon="el-icon-edit"
                  @click="showEditDialog(scope.row.attr_id)"
                >编辑</el-button>
                <el-button
                  size="mini"
                  type="danger"
                  icon="el-icon-delete"
                  @click="deleteParams(scope.row.attr_id)"
                >删除</el-button>
              </template>
            </el-table-column>
          </el-table>
        </el-tab-pane>
      </el-tabs>
    </el-card>
    <!-- 添加参数对话框 -->
    <el-dialog
      :title="'添加'+titleText"
      :visible.sync="addDialogVisible"
      width="50%"
      @close="addDialogClosed"
    >
      <!-- 内容主体区 -->
      <el-form :model="addForm" :rules="addFormRules" ref="addFormRef" label-width="90px">
        <el-form-item :label="titleText" prop="attr_name">
          <el-input v-model="addForm.attr_name"></el-input>
        </el-form-item>
      </el-form>
      <span slot="footer" class="dialog-footer">
        <el-button @click="addDialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="addParams">确 定</el-button>
      </span>
    </el-dialog>
    <!--修改参数对话框-->
    <el-dialog title="修改参数" :visible.sync="editDialogVisible" width="50%" @close="editDialogClosed">
      <!-- 内容主体区 -->
      <el-form :model="editForm" :rules="editFormRules" ref="editFormRef" label-width="90px">
        <el-form-item :label="titleText" prop="attr_name">
          <el-input v-model="addForm.attr_name"></el-input>
        </el-form-item>
      </el-form>
      <span slot="footer" class="dialog-footer">
        <el-button @click="editDialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="editParams">确 定</el-button>
      </span>
    </el-dialog>
  </div>
</template>
<script>
export default {
    data(){
        return{
            catelist:[],
            //级联选择框双向绑定到的数组
            selectedCateKeys:[513,526,543],
            activeName:'many',
            //动态属性的数据
            manyTableData:[],
            //静态属性的数据
            onlyTableData:[],
            //控制添加对话框的显示和隐藏
            addDialogVisible:false,
            addForm:{},
            addFormRules:{
                attr_name:[
                    { required: true, message: '请输入参数名称', trigger: 'blur' },
                ],
            },
            //控制修改对话框的显示和隐藏
            editDialogVisible:false,
            editForm:{},
            editFormRules:{
                attr_name:[
                    { required: true, message: '请输入参数名称', trigger: 'blur' },
                ],
            },
        }
    },
    created(){
        this.getCateList();
    },
    methods:{
        //获取所有的商品分类列表
        async getCateList(){
            const{data:res}= await this.$http.get('categories');
            if(res.meta.status!=200){
                return this.$message.error('获取商品分类失败！');
            }
            res.data.forEach(item=>{
              item.attr_vals=item.attr_vals?item.attr_vals.split(' '):[];
            })
            this.catelist=res.data;
        },
        //级联选择框选中项变化，触发的函数
        handleChange(){
            this.getParamsData();
        },
        //这是Tab页签点击事件的处理函数
        handleTabClick(){
            console.log(this.activeName);
        },
        //获得参数的列表数据
        async getParamsData(){
            if(this.selectedCateKeys.length!==3){
                this.selectedCateKeys=[]
                return
            }
            //根据所选分类id和当前所处的面板，获取对应的参数
            const{data:res}= await this.$http.get(`categories/${this.cateId}/attributes`,
            {params:{sel:this.activeName}})
            if(res.meta.status!=200){
                return this.$message.error('获取参数列表失败！');
            }
            if(this.activeName==='many'){
                this.manyTableData=res.data;
            }else{
                this.onlyTableData=res.data;
            }
        },
        addDialogClosed(){
          this.$refs.addFormRef.resetFields();
        },
        //点击按钮添加参数
        addParams(){
            this.$refs.addFormRef.validate(async valid=>{
                if(!valid)return;
                const{data:res}= await this.$http.post(`categories/${this.cateId}/attributes`,
                {attr_name:this.addForm.attr_name,
                attr_sel:this.activeName});
                if(res.meta.status!==201){
                  this.$message.error('添加参数失败');
                }
                this.$message.success('添加参数成功');
                this.addDialogVisible=false;
                //重新参数列表数据
                this.getParamsData();
            })
        },
        //点击按钮，显示修改的对话框
        async showEditDialog(attr_id){
            const{data:res}= await this.$http.post(`categories/${this.cateId}/attributes/${attr_id}`,{
              params:{attr_sel:this.activeName}
            })
            if(res.meta.status!==200){
              this.$message.error('获取参数信息失败');
            }
            this.editForm=res.data;
            this.editDialogVisible=true;
        },
        editDialogClosed(){
          this.$refs.editFormRef.resetFields();
        },
        //点击按钮，修改参数信息
        editParams(){
          this.$refs.editFormRef.validate(async valid=>{
                if(!valid)return;
                const{data:res}= await this.$http.put(`categories/${this.cateId}/attributes/${this.editForm.attr_id}`,
                {attr_name:this.editForm.attr_name,
                attr_sel:this.activeName});
                if(res.meta.status!==200){
                  this.$message.error('修复参数失败');
                }
                this.$message.success('修改参数成功');
                this.addDialogVisible=false;
                //重新参数列表数据
                this.getParamsData();
            })
        },
        //根据id删除对应的参数项
        async deleteParams(attr_id){
          const confirmResult=await this.$confirm('此操作将永久删除该角色, 是否继续?', '提示', {
                confirmButtonText: '确定',
                cancelButtonText: '取消',
                type: 'warning'
            }).catch(err=>err)
            if(confirmResult!=='confirm'){
                return this.$message.info('已取消删除');
            }
            const{data:res}= await this.$http.delete(`categories/${this.cateId}/attributes/${attr_id}`);
            if(res.meta.status!==200){
              this.$message.error('删除参数失败');
            }
            this.$message.success('删除参数成功');
            this.getParamsData();
        },
    },
    computed:{
        //如过按钮需要被禁用返回true，否则返回false
        isBtnDisabled(){
            if(this.selectedCateKeys.length!==3){
                return true;
            }
            return false;
        },
        //当前选中的三级分类的id
        cateId(){
            if(this.selectedCateKeys.length===3){
                return this.selectedCateKeys[2];
            }
            return null;
        },
        //动态计算标题的文本
        titleText(){
            if(this.activeName==='many'){
                return '动态参数'
            }
            return '静态属性'
        }
    }
}
</script>
<style lang="less" scoped>
.cat_opt {
  margin: 15px 0;
}
</style>
