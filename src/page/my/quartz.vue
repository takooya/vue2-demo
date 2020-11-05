<template>
    <div>
        <p style="text-align: center;font-size: 20px;">定时调度程序状态监控</p>
        <el-row>
            <el-col :span="12">最后刷新日期：{{statisticsDate}}</el-col>
            <el-col :span="12" align="right" style="padding-right: 20px">
                <el-button type="primary" @click="getJobList">刷新</el-button>
            </el-col>
        </el-row>
        <el-table :data="jobList" align="cneter" width="100%">
            <el-table-column type="index"/>
            <el-table-column label="任务分组" prop="jobGroupName" width="120"/>
            <el-table-column label="描述" width="180" :formatter="descriptionFormatter"/>
            <el-table-column label="任务开始时间" prop="previousFireTime" :formatter="timeFormatter" width="120"/>
            <el-table-column label="下次执行时间" prop="nextFireTime" :formatter="timeFormatter" width="120"/>
            <el-table-column label="下次执行还剩" prop="During" width="90"/>
            <el-table-column label="状态" prop="triggerState" :formatter="triggerStateFormatter" width="70"/>
            <el-table-column label="操作" align="left" width="360">
                <template slot-scope="scope">
                    <el-button-group>
                        <el-button size="mini"
                                   @click="resumeJob(scope.$index, scope.row)">立即开始
                        </el-button>
                        <el-button size="mini" @click="pauseJob">暂停</el-button>
                        <el-button size="mini" @click="resumeJob">恢复</el-button>
                    </el-button-group>
                    <el-dropdown size="mini" split-button type="primary" trigger="click"
                                 @command="moreOperate($event,scope.row)">
                        更多操作
                        <el-dropdown-menu slot="dropdown">
                            <!--                            // submitControl(this,'moreoneJob')-->
                            <!--                            // submitControl(this,'deleteJob')-->
                            <!--                            // onclick="reSetRuleModelShow(this)-->
                            <el-dropdown-item command="temp">立即执行一次</el-dropdown-item>
                            <el-dropdown-item command="temp">删除</el-dropdown-item>
                            <el-dropdown-item command="operateSelectChange">重新设置调度规则</el-dropdown-item>
                        </el-dropdown-menu>
                    </el-dropdown>
                </template>
            </el-table-column>
        </el-table>

        <div>
            <div>补充说明</div>
            <div>
                <p>基于Quartz RAMJobStore 作业调度，不依赖数据库<br></p>
                <p>1："立即开始"，将暂未开始执行的调度计划立即执行，马上开始调度，若原有计划已开始执行，则放弃以前的时间调度，重新开始调度</p>
                <p>2："立即执行一次"，立即执行一次任务，不影响原有调度计划</p>
                <p>3："删除"，删除整个任务调度，正在执行的任务也会被撤销</p>
                <p>4："重新设置调度规则"，设置后调度立即生效，并且马上开始执行首次任务</p>
                <p>5："刷新"，仅刷新页面，等同于浏览器刷新</p>
                <p>6："重新载入"，仅载入新的任务，可支持热部署，不停机即可自动加载，注意：已被删除的任务也会重新加载</p>
            </div>
        </div>

        <el-button type="text" @click="testDialogVisible = true">点击打开 Dialog</el-button>

        <el-dialog
            title="提示"
            :visible="testDialogVisible"
            append-to-boddy
            width="30%"
            :before-close="temp">
            <span>这是一段信息</span>
            <span slot="footer" class="dialog-footer">
    <el-button @click="testDialogVisible = false">取 消</el-button>
    <el-button type="primary" @click="testDialogVisible = false">确 定</el-button>
  </span>
        </el-dialog>


        <el-dialog title="重新设置调度规则" width=50%"
                   :visible.sync="dialogVisible">
            <div>
                <el-row>
                    <el-col :span="12">任务分组：</el-col>
                    <el-col :span="12">{{curItem.triggerGroupName}}.{{curItem.triggerName}}</el-col>
                </el-row>
                <el-row>
                    <el-col :span="12">任务描述：</el-col>
                    <el-col :span="12"></el-col>
                </el-row>
                <el-row>
                    <el-col :span="12">当前调度规则：</el-col>
                    <el-col :span="12"></el-col>
                </el-row>
                <el-row>
                    <el-col :span="12">当前调度Cron:</el-col>
                    <el-col :span="12">{{curItem.cronExpression}}}</el-col>
                </el-row>
                <el-row>
                    <el-col :span="12">调整后的调度规则：</el-col>
                    <el-col :span="12">
                        <el-select :value="cronSelect">
                            <el-option
                                v-for="item in cronOptions"
                                :key="item.value"
                                :label="item.label"
                                :value="item.value">
                            </el-option>
                        </el-select>
                    </el-col>
                </el-row>
                <el-row>
                    <el-col :span="12">调整后Cron表达式：</el-col>
                    <!-- id="cronExpression"-->
                    <el-col :span="12">
                        <el-input></el-input>
                    </el-col>
                </el-row>
                <el-row>
                    <el-col :span="12">调整后Cron表达式说明 ：</el-col>
                    <!-- cronDescription -->
                    <el-col :span="12">
                        <el-input></el-input>
                    </el-col>
                </el-row>
                <el-button @click="dialogVisible = false">取 消</el-button>
                <el-button type="primary" @click="dialogVisible = false">确 定</el-button>
            </div>
        </el-dialog>
    </div>
</template>

<script>
import myfetch from '@/config/myfetch'
import constants from "@/page/my/util/constants";
import StringUtil from "@/page/my/util/StringUtil";

export default {
    name: 'quartz',
    data () {
        return {
            curItem: {},
            dialogVisible: false,
            testDialogVisible: false,
            statisticsDate: new Date().toLocaleDateString() + " " + new Date().toLocaleTimeString(),
            jobList: [],
            // id="ruleSetOpt"
            cronOptions: [
                {
                    value: '1',
                    label: '每分钟执行一次'
                }, {
                    value: '2',
                    label: '每小时执行一次'
                }, {
                    value: '3',
                    label: '每天执行一次'
                }, {
                    value: '0',
                    label: '自定义Corn执行'
                }
            ],
            cronSelect: '1',
        }
    },
    mounted () {
        this.getJobList();
    },
    methods: {
        async getJobList () {
            let aaa = await myfetch('quartz/getInfo', {}, 'GET');
            this.jobList = aaa.data;
        },
        async pauseJob (rowIndex, obj) {
            let aaa = await myfetch('/quartz/pauseJob', obj, 'POST');
            await this.getJobList()
        },
        async resumeJob (rowIndex, obj) {
            let aaa = await myfetch('/quartz/resumeJob', obj, 'POST');
            await this.getJobList()
        },
        moreOperate (commond, val) {
            this.$options.methods[commond](val, this)
        },
        operateSelectChange (val, vueObj) {
            console.info(val);
            vueObj.curItem = val;
            // vueObj.$set(vueObj, 'dialogVisible', true);
            vueObj.dialogVisible = true
        },
        temp () {
            alert('临时方法')
        },
        timeFormatter (obj, col, value) {
            let date = new Date(value);
            return date.toLocaleDateString() + " " + date.toLocaleTimeString();
        },
        triggerStateFormatter (obj, col, value) {
            return constants.triggerStateMap.get(value);
        },
        descriptionFormatter (obj, col, value) {
            let result = obj.jobName;
            if (!StringUtil.isBlank(obj.description)) {
                result = result + '\n' + obj.description;
            }
            if (!StringUtil.isBlank(obj.cronExpression)) {
                result = result + '\n[' + obj.cronExpression + ']';
            }
            return result
        }
    }
}
</script>

<style lang="less" scoped>

</style>
