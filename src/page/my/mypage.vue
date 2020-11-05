<template>
    <div class="fillcontain">
        <el-row style="height: 100%;">
            <el-col :span="4" style="min-height: 100%; background-color: #324057;">
                <el-menu :default-active="defaultActive" style="min-height: 100%;" theme="dark" router>
                    <el-menu-item index="quartz"><i class="el-icon-menu"></i>首页</el-menu-item>
                    <el-menu-item index="manage1">首页2</el-menu-item>
                    <el-menu-item index="manage2">首页3</el-menu-item>
                    <el-menu-item index="manage3">首页4</el-menu-item>
                </el-menu>
            </el-col>
            <el-col :span="20" style="height: 100%;overflow: auto;">
                <keep-alive>
                    <router-view></router-view>
                </keep-alive>
            </el-col>
        </el-row>
    </div>
</template>

<script>
import headTop from '../../components/headTop'

export default {
    name: 'mypage',
    data () {
        return {
            defaultActive: 'quartz'
        }
    },
    components: {headTop}
}
</script>

<style lang="less" scoped>
@import '../../style/mixin';
</style>
