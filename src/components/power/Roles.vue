<template>
  <div>
    <!-- 面包屑导航区 -->
    <el-breadcrumb separator-class="el-icon-arrow-right">
      <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>权限管理</el-breadcrumb-item>
      <el-breadcrumb-item>角色列表</el-breadcrumb-item>
    </el-breadcrumb>
    <el-card>
      <el-row>
        <el-col>
          <el-button type="primary" @click="addDialogVisible = true">添加角色</el-button>
        </el-col>
      </el-row>
      <!-- 角色列表区 -->
      <el-table :data="roleList" border stripe>
        <el-table-column type="expand">
          <template v-slot="scope">
            <el-row
              :class="['bdbottom','vcenter',i1===0?'bdtop':'']"
              v-for="(item1,i1) in scope.row.children"
              :key="item1.id"
            >
              <!-- 渲染一级权限 -->
              <el-col :span="5">
                <el-tag closable @close="removeRightById(scope.row,item1.id)">{{item1.authName}}</el-tag>
                <i class="el-icon-caret-right"></i>
              </el-col>
              <!-- 渲染二级三级权限 -->
              <el-col :span="19">
                <!-- 通过for循环嵌套渲染二级权限 -->
                <el-row
                  :class="[i2===0?'':'bdtop','vcenter']"
                  v-for="(item2,i2) in item1.children"
                  :key="item2.id"
                >
                  <el-col :span="6">
                    <el-tag
                      type="success"
                      closable
                      @close="removeRightById(scope.row,item2.id)"
                    >{{item2.authName}}</el-tag>
                    <i class="el-icon-caret-right"></i>
                  </el-col>
                  <el-col :span="18">
                    <el-tag
                      type="warning"
                      v-for="(item3) in item2.children"
                      :key="item3.id"
                      closable
                      @close="removeRightById(scope.row,item3.id)"
                    >{{item3.authName}}</el-tag>
                  </el-col>
                </el-row>
              </el-col>
            </el-row>
          </template>
        </el-table-column>
        <!-- 索引列 -->
        <el-table-column type="index" label="#"></el-table-column>
        <el-table-column label="角色名称" prop="roleName"></el-table-column>
        <el-table-column label="角色描述" prop="roleDesc"></el-table-column>
        <el-table-column label="操作" width="300px">
          <template v-slot="scope">
            <el-button
              size="mini"
              type="primary"
              icon="el-icon-edit"
              @click="showEditDialog(scope.row.id)"
            >编辑</el-button>
            <el-button
              size="mini"
              type="danger"
              icon="el-icon-delete"
              @click="deleteRole(scope.row.id)"
            >删除</el-button>
            <el-button
              size="mini"
              type="warning"
              icon="el-icon-setting"
              @click="showSetRightDialog(scope.row)"
            >分配权限</el-button>
          </template>
        </el-table-column>
      </el-table>
    </el-card>
    <!-- 添加角色 -->
    <el-dialog title="添加角色" :visible.sync="addDialogVisible" width="50%" @close="addDialogClosed">
      <!-- 内容主体区 -->
      <el-form :model="addForm" :rules="addFormRules" ref="addFormRef" label-width="90px">
        <el-form-item label="角色名称" prop="roleName">
          <el-input v-model="addForm.roleName"></el-input>
        </el-form-item>
        <el-form-item label="角色描述" prop="roleDesc">
          <el-input v-model="addForm.roleDesc"></el-input>
        </el-form-item>
      </el-form>
      <span slot="footer" class="dialog-footer">
        <el-button @click="addDialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="addRole">确 定</el-button>
      </span>
    </el-dialog>
    <!--修改角色 -->
    <el-dialog title="修改角色" :visible.sync="editDialogVisible" width="50%" @close="editDialogClosed">
      <!-- 内容主体区 -->
      <el-form :model="editForm" :rules="editFormRules" ref="editFormRef" label-width="90px">
        <el-form-item label="角色名称" prop="roleName">
          <el-input v-model="editForm.roleName"></el-input>
        </el-form-item>
        <el-form-item label="角色描述" prop="roleDesc">
          <el-input v-model="editForm.roleDesc"></el-input>
        </el-form-item>
      </el-form>
      <span slot="footer" class="dialog-footer">
        <el-button @click="editDialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="editRole">确 定</el-button>
      </span>
    </el-dialog>
    <!-- 分配权限 -->
    <el-dialog
      title="分配权限"
      :visible.sync="setRightDialogVisible"
      width="50%"
      @close="setRightDialogClosed"
    >
      <el-tree
        :data="rightslist"
        :props="treeProps"
        show-checkbox
        node-key="id"
        default-expand-all
        :default-checked-keys="defKeys"
        ref="treeRef"
      ></el-tree>
      <span slot="footer" class="dialog-footer">
        <el-button @click="setRightDialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="allotRights">确 定</el-button>
      </span>
    </el-dialog>
  </div>
</template>
<script>
export default {
    data(){
        return{
            //所有角色数据列表
            roleList:[],
            addForm:{
                roleName:'',
                roleDesc:''
            },
            editForm:{
                roleId:'',
                roleName:'',
                roleDesc:''
            },
            //树形控件的属性绑定对象
            treeProps:{
                label:'authName',
                children:'children'
            },
            rightslist:[],
            addDialogVisible:false,
            editDialogVisible:false,
            setRightDialogVisible:false,
            //默认选中d节点id值数组
            defKeys:[],
            //添加角色表单的验证规则对象
            addFormRules:{
                roleName:[
                    { required: true, message: '请输入角色名称', trigger: 'blur' },
                    { min: 3, max: 10, message: '长度在 3 到 10 个字符', trigger: 'blur' }
                ],
                roleDesc: [
                    { required: true, message: '请输入角色描述', trigger: 'blur' },
                    { min: 2, max: 15, message: '长度在 2 到 15 个字符', trigger: 'blur' }
                ],
            },
            editFormRules:{
                roleName:[
                    { required: true, message: '请输入角色名称', trigger: 'blur' },
                    { min: 3, max: 10, message: '长度在 3 到 10 个字符', trigger: 'blur' }
                ],
                roleDesc: [
                    { required: true, message: '请输入角色描述', trigger: 'blur' },
                    { min: 2, max: 15, message: '长度在 2 到 15 个字符', trigger: 'blur' }
                ],
            },
            //即将分配权限的角色id
            roleId:'',
        }
    },
    created(){
        this.getRolesList();
    },
    methods:{
        //获得所有角色列表
        async getRolesList(){
            const{data:res}=await this.$http.get('roles');
            if(res.meta.status!==200){
                this.$message.error('获取角色列表失败');
            }
            this.roleList=res.data;
        },
        //根据id删除对应权限
        async removeRightById(role,rightId){
            const confirmResult=await this.$confirm('此操作将永久删除该用户, 是否继续?', '提示', {
                confirmButtonText: '确定',
                cancelButtonText: '取消',
                type: 'warning'
            }).catch(err=>err)
            console.log(confirmResult);
            if(confirmResult!=='confirm'){
                return this.$message.info('已取消删除');
            }
            const{data:res}=await this.$http.delete(`roles/${role.id}/rights/${rightId}`);
            if(res.meta.status!==200){
                this.$message.error('删除角色权限失败');
            }
            role.children=res.data;
            
        },
        addRole(){
             this.$refs.addFormRef.validate(async valid=>{
                if(!valid)return;
                const{data:res}= await this.$http.post('roles',this.addForm);
                if(res.meta.status!==201){
                  this.$message.error('添加角色失败');
                }
                this.$message.success('添加角色成功');
                this.addDialogVisible=false;
                console.log(this.addFrom);
                //重新获取角色列表数据
                this.getRolesList();
            })
        },
        // 监听修改用户对话框的关闭事件
        addDialogClosed(){
          this.$refs.addFormRef.resetFields();
        },
        editDialogClosed(){
          this.$refs.editFormRef.resetFields();
        },
        setRightDialogClosed(){
            this.defKeys=[];
        },
        async deleteRole(id){
            const confirmResult=await this.$confirm('此操作将永久删除该角色, 是否继续?', '提示', {
                confirmButtonText: '确定',
                cancelButtonText: '取消',
                type: 'warning'
            }).catch(err=>err)
            if(confirmResult!=='confirm'){
                return this.$message.info('已取消删除');
            }
            const{data:res}=await this.$http.delete('roles/'+id);
                if(res.meta.status!==200){
                return this.$message.error('删除角色失败');
            }
            this.getRolesList();
            this.$message.success('删除角色成功');
        },
        async showEditDialog(id){
            const{data:res}=await this.$http.get('roles/'+id);
            if(res.meta.status!==200){
                return this.$message.error('查询角色信息失败');
            }
            this.editForm=res.data;
            this.editDialogVisible=true;
        },
        async editRole(){
            this.$refs.editFormRef.validate(async valid=>{
                if(!valid)return;
                const{data:res}=await this.$http.put('roles/'+this.editForm.roleId,{
                roleName:this.editForm.roleName,
                roleDesc:this.editForm.roleDesc
                });
                if(res.meta.status!==200){
                    return this.$message.error('编辑角色信息失败');
                }
                this.$message.success('编辑角色信息成功');
                this.editDialogVisible=false;
                this.getRolesList();
            })
            
        },
        //展示分配权限的对话框
        async showSetRightDialog(role){
            this.roleId=role.id;
            //获取所有权限数据
            const{data:res}=await this.$http.get('rights/tree');
            if(res.meta.status!==200){
                return this.$message.error('获取权限数据失败');
            }
            //获取到的权限数据保存到data中
            this.rightslist=res.data;
            this.getLeafKeys(role,this.defKeys);
            this.setRightDialogVisible=true;
        },
        //通过递归，获取角色所有三级权限的id，并赋值到defKeys数组中
        getLeafKeys(node,arr){
            //node中不包含children是三级节点
            if(!node.children){
                return arr.push(node.id);
            }
            node.children.forEach(item=>{
                this.getLeafKeys(item,arr);
            })
        },
        //点击为用户分配权限
        async allotRights(){
            const checkedNodes=[
                ...this.$refs.treeRef.getCheckedNodes(),
            ]
            const halfCheckedNodes=[...this.$refs.treeRef.getHalfCheckedNodes()];
            const keyarr=[];
            for(var i=0;i<checkedNodes.length;i++){
                keyarr.push(checkedNodes[i].id);
            }
            for(var i=0;i<halfCheckedNodes.length;i++){
                keyarr.push(halfCheckedNodes[i].id);
            }
            const idStr=keyarr.join(',');
            const{data:res}=await this.$http.post(`roles/${this.roleId}/rights`,{rids:idStr});
            if(res.meta.status!==200){
                return this.$message.error('分配权限失败')
            }
            this.$message.success('分配权限成功')
            this.getRolesList();
            this.setRightDialogVisible=false;
        },
    }
}
</script>
<style lang="less" scoped>
.el-tag {
  margin: 7px;
}
.bdtop {
  border-top: 1px solid #eee;
}
.bdbottom {
  border-bottom: 1px solid #eee;
}
.vcenter {
  display: flex;
  align-items: center;
}
</style>