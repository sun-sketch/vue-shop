<template>
    <div>
        <!-- 面包屑导航区 -->
        <el-breadcrumb separator-class="el-icon-arrow-right">
        <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
        <el-breadcrumb-item>商品管理</el-breadcrumb-item>
        <el-breadcrumb-item>商品分类</el-breadcrumb-item>
        </el-breadcrumb>
        <el-card>
            <el-row>
                <el-col>
                    <el-button type="primary" @click="showAddCateDialog">添加分类</el-button>
                </el-col>
            </el-row>
            <!-- 表格 -->
            <el-table
            :data="catelist"
            style="width: 100%;margin-bottom: 20px;"
            row-key="cat_id"
            border
            :tree-props="{children: 'children', hasChildren: 'hasChildren'}">
                <el-table-column
                prop="cat_name"
                label="分类名称"
                width="300px">
                </el-table-column> 
                <!-- 是否有效 -->
                <el-table-column label="是否有效">
                    <template v-slot="scope">
                        <i class="el-icon-success" v-if="scope.row.cat_deleted===false"
                        style="color:lightgreen"></i>
                        <i class="el-icon-error" v-else style="color:lightgreen"></i>
                    </template>
                </el-table-column>
                <!-- 排序 -->
                <el-table-column label="排序">
                    <template v-slot="scope">
                        <el-tag size="mini" v-if="scope.row.cat_level===0">一级</el-tag>
                        <el-tag type="success" size="mini"
                        v-else-if="scope.row.cat_level===1">二级</el-tag>
                        <el-tag type="warning" size="mini" v-else>三级</el-tag>
                    </template>
                </el-table-column>
                <!-- 操作 -->
                <el-table-column label="操作">
                    <template v-slot="scope">
                        <el-button
                        size="mini"
                        type="primary"
                        icon="el-icon-edit"
                        @click="showEditDialog(scope.row.cat_id,scope.row.cat_name)"
                        >编辑</el-button>
                        <el-button
                        size="mini"
                        type="danger"
                        icon="el-icon-delete"
                        @click="deleteCate(scope.row.cat_id)"
                        >删除</el-button>
                    </template>
                </el-table-column>
                
            </el-table>
            <!-- 分页区域 -->
            <el-pagination
            @size-change="handleSizeChange"
            @current-change="handleCurrentChange"
            :current-page="queryInfo.pagenum"
            :page-sizes="[3,5,10,15]"
            :page-size="queryInfo.pagesize"
            layout="total, sizes, prev, pager, next, jumper"
            :total="total">
            </el-pagination>
        </el-card>
        <!-- 添加分类的对话框 -->
        <el-dialog
        title="添加分类"
        :visible.sync="addCateDialogVisible"
        width="50%"
        @close="addCateDialogCloaed">
        <el-form :model="addCateForm" :rules="addCateFormRules" ref="addCateFormRef" label-width="100px">
            <el-form-item label="分类名称" prop="cat_name">
                <el-input v-model="addCateForm.cat_name"></el-input>
            </el-form-item>
            <!-- options用来指定数据源 -->
            <el-form-item label="父级分类">
                <el-cascader
                v-model="selectedKeys"
                :options="parentCateList"
                :props="{ expandTrigger: 'hover',
                value:'cat_id',
                label:'cat_name',
                children:'children' }"
                @change="parentCateChanged" clearable change-on-select></el-cascader>
            </el-form-item>
        </el-form>
        <span slot="footer" class="dialog-footer">
            <el-button @click="addCateDialogVisible = false">取 消</el-button>
            <el-button type="primary" @click="addCate">确 定</el-button>
        </span>
        </el-dialog>
        <el-dialog
        title="添加分类"
        :visible.sync="editCateDialogVisible"
        width="50%"
        @close="editCateDialogCloaed">
        <el-form :model="editCateForm" :rules="editCateFormRules" ref="editCateFormRef" label-width="100px">
            <el-form-item label="分类名称" prop="cat_name">
                <el-input v-model="editCateForm.cat_name"></el-input>
            </el-form-item>
        </el-form>
        <span slot="footer" class="dialog-footer">
            <el-button @click="editCateDialogVisible = false">取 消</el-button>
            <el-button type="primary" @click="editCate">确 定</el-button>
        </span>
        </el-dialog>
    </div> 
</template>
<script>
export default {
    data(){
        return{
            queryInfo:{
                type:3,
                pagenum:1,
                pagesize:5,
            },
            //商品分类的数据列表，默认为空
            catelist:[],
            total:0,//总数据条数
            defaultProps: {
                children: 'children',
                label: 'cat_name'
            },
            //控制添加分类对话框的显示和隐藏
            addCateDialogVisible:false,
            //添加分类的表单数据对象
            addCateForm:{
                //将要添加的分类的名称
                cat_name:'',
                //父级分类的id
                cat_pid:0,
                //父类的等级默认要添加的是一级分类
                cat_level:0
            },
            //添加分类表单的验证规则对象
            addCateFormRules:{
                cat_name: [
                    { required: true, message: '请输入分类名称', trigger: 'blur' },
                ],
            },
            //父级分类的列表
            parentCateList:[],
            //选中的父级分类的id数组
            selectedKeys:[],
            //编辑商品分类的表单
            editCateForm:{
                cat_id:0,
                cat_name:''
            },
            editCateDialogVisible:false,
            //编辑分类表单的验证规则对象
            editCateFormRules:{
                cat_name: [
                    { required: true, message: '请输入分类名称', trigger: 'blur' },
                ],
            },
        }
    },
    created(){
        this.getCateList();
    },
    methods:{
        //获取商品分类数据
        async getCateList(){
            const{data:res}= await this.$http.get('categories',{params:this.queryInfo});
            if(res.meta.status!=200){
                return this.$message.error('获取商品分类失败！');
            }
            console.log(res.data);
            this.catelist=res.data.result;
            this.total=res.data.total;
        },
        //监听pagesize改变的事件
        handleSizeChange(newSize){
            this.queryInfo.pagesize=newSize;
            this.getCateList();
        },
        handleCurrentChange(newPage){
            this.queryInfo.pagenum=newPage;
            this.getCateList();
        },
        showAddCateDialog(){
            this.getParentCateList();
            this.addCateDialogVisible=true;
        },
        //获取父级分类数据列表
        async getParentCateList(){
             const{data:res}= await this.$http.get('categories',{params:{type:2}});
             if(res.meta.status!=200){
                return this.$message.error('获取父级分类数据失败！');
            }
            this.parentCateList=res.data;
        },
        parentCateChanged(){
            if(this.selectedKeys.length>0){
                //父级分类的id
                this.addCateForm.cat_pid=this.selectedKeys[this.selectedKeys.length-1];
                //当前分类的等级赋值
                this.addCateForm.cat_level=this.selectedKeys.length;
                return;
            }
            //父级分类的id
            this.addCateForm.cat_pid=0;
            //当前分类的等级赋值
            this.addCateForm.cat_level=0;
        },
        addCate(){
            this.$refs.addCateFormRef.validate(async valid=>{
                if(!valid)return;
                const{data:res}= await this.$http.post('categories',this.addCateForm);
                if(res.meta.status!=201){
                    return this.$message.error('添加分类失败！');
                }
                this.$message.success('添加分类成功');
                this.getCateList();
                this.addCateDialogVisible=false;
            })
        },
        //关闭对话框时重置表单
        addCateDialogCloaed(){
            this.$refs.addCateFormRef.resetFields();
            this.selectedKeys=[];
            this.addCateForm.cat_level=0;
            this.addCateForm.cat_pid=0;
        },
        showEditDialog(id,name){
            this.editCateForm.cat_name=name;
            this.editCateDialogVisible=true;
            this.editCateForm.cat_id=id;
        },
        editCate(){
            this.$refs.editCateFormRef.validate(async valid=>{
                if(!valid)return;
                const{data:res}= await this.$http.put('categories/'+this.editCateForm.cat_id,
                {cat_name:this.editCateForm.cat_name});
                if(res.meta.status!=200){
                    return this.$message.error('编辑分类失败！');
                }
                this.$message.success('编辑分类成功');
                this.getCateList();
                this.editCateDialogVisible=false;
            })
        },
        editCateDialogCloaed(){
            this.$refs.editCateFormRef.resetFields();
            this.editCateForm.cat_name='';
            this.editCateForm.cat_id=0;
        },
        async deleteCate(id){
            const confirmResult=await this.$confirm('此操作将永久删除该分类, 是否继续?', '提示', {
                confirmButtonText: '确定',
                cancelButtonText: '取消',
                type: 'warning'
            }).catch(err=>err)
            if(confirmResult!=='confirm'){
                return this.$message.info('已取消删除');
            }
            const{data:res}= await this.$http.delete('categories/'+id);
            if(res.meta.status!=200){
                return this.$message.error('删除分类失败！');
            }
            this.$message.success('删除分类成功');
            this.getCateList();
        }
    }
}
</script>
<style lang="less" scoped>
.el-cascader{
    width: 100%;
}

</style>