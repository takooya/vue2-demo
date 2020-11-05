<template>
    <div>
        <div class="quartz-title">定时调度程序状态监控</div>
        <el-row class="table-info-row">
            <el-col :span="12" class="table-info-row-left">最后刷新日期：{{statisticsDate}}</el-col>
            <el-col :span="12" class="table-info-row-right">
                <el-button type="primary" @click="getJobList" size="small" class="table-info-row-right-button">刷新
                </el-button>
                <el-button type="primary" @click="addJobHandle" size="small" class="table-info-row-right-button">addJob
                </el-button>
                <el-button type="primary" @click="startJobs" size="small" class="table-info-row-right-button">startJobs
                </el-button>
                <el-button type="primary" @click="standbyJobs" size="small" class="table-info-row-right-button">
                    standbyJobs
                </el-button>
            </el-col>
        </el-row>
        <el-table :data="jobList" align="cneter" width="100%">
            <el-table-column type="index"/>
            <el-table-column label="任务分组" prop="jobGroupName" width="120"/>
            <el-table-column label="描述" width="180" :formatter="descriptionFormatter"/>
            <el-table-column label="任务开始时间" prop="previousFireTime" :formatter="timeFormatter" width="110"/>
            <el-table-column label="下次执行时间" prop="nextFireTime" :formatter="timeFormatter" width="110"/>
            <el-table-column label="下次执行还剩" prop="During" width="110"/>
            <el-table-column label="状态" prop="triggerState" :formatter="triggerStateFormatter" width="70"/>
            <el-table-column label="操作" align="left" width="360">
                <template slot-scope="scope">
                    <el-button-group>
                        <el-button size="mini"
                                   @click="resumeJob(scope.$index, scope.row)">立即开始
                        </el-button>
                        <el-button size="mini" @click="pauseJob(scope.row)">暂停</el-button>
                        <el-button size="mini" @click="resumeJob(scope.$index, scope.row)">恢复</el-button>
                    </el-button-group>
                    <el-dropdown size="mini" split-button type="primary" trigger="click"
                                 @command="moreOperate($event,scope.row)">
                        更多操作
                        <el-dropdown-menu slot="dropdown">
                            <!--                            // submitControl(this,'moreoneJob')-->
                            <!--                            // submitControl(this,'deleteJob')-->
                            <!--                            // onclick="reSetRuleModelShow(this)-->
                            <el-dropdown-item command="temp">立即执行一次</el-dropdown-item>
                            <el-dropdown-item command="removeJob">删除</el-dropdown-item>
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

        <el-dialog title="重新设置调度规则" width="50%" :visible.sync="dialogVisible">
            <div>
                <el-row class="rule-row">
                    <el-col :span="ruleTitleSpan" class="rule-title">任务分组：</el-col>
                    <el-col :span="ruleContentSpan" class="rule-content">
                        {{curItem.triggerGroupName}}.{{curItem.triggerName}}
                    </el-col>
                </el-row>
                <el-row class="rule-row">
                    <el-col :span="ruleTitleSpan" class="rule-title">任务描述：</el-col>
                    <el-col :span="ruleContentSpan" class="rule-content"></el-col>
                </el-row>
                <el-row class="rule-row">
                    <el-col :span="ruleTitleSpan" class="rule-title">当前调度规则：</el-col>
                    <el-col :span="ruleContentSpan" class="rule-content"></el-col>
                </el-row>
                <el-row class="rule-row">
                    <el-col :span="ruleTitleSpan" class="rule-title">当前调度Cron：</el-col>
                    <el-col :span="ruleContentSpan" class="rule-content">{{curItem.cronExpression}}</el-col>
                </el-row>
                <el-row class="rule-row">
                    <el-col :span="ruleTitleSpan" class="rule-title">调整后的调度规则：</el-col>
                    <el-col :span="ruleContentSpan" class="rule-content">
                        <el-select v-model="curItem.cronSelect" class="rule-select" size="small">
                            <el-option
                                v-for="item in cronOptions"
                                :key="item.value"
                                :label="item.label"
                                :value="item.value">
                            </el-option>
                        </el-select>
                    </el-col>
                </el-row>
                <el-row class="rule-row" v-show="curItem.cronSelect&&curItem.cronSelect==='0'">
                    <el-col :span="ruleTitleSpan" class="rule-title">调整后Cron表达式：</el-col>
                    <el-col :span="ruleContentSpan" class="rule-content">
                        <el-input class="rule-input" size="small"></el-input>
                    </el-col>
                </el-row>
                <el-row class="rule-row" v-show="curItem.cronSelect&&curItem.cronSelect==='0'">
                    <el-col :span="ruleTitleSpan" class="rule-title">调整后Cron表达式说明 ：</el-col>
                    <el-col :span="ruleContentSpan" class="rule-content">
                        <el-input class="rule-input" size="small"></el-input>
                    </el-col>
                </el-row>
                <el-row class="rule-row rule-row-button">
                    <el-button @click="dialogVisible = false">取 消</el-button>
                    <el-button type="primary" @click="dialogVisible = false">确 定</el-button>
                </el-row>
            </div>
        </el-dialog>

        <el-dialog title="添加任务" width="50%" :visible.sync="addjobVisible">
            <el-form ref="form" :model="addjobItem" label-width="150px">
                <el-form-item label="jobName">
                    <el-input v-model="addjobItem.jobName"></el-input>
                </el-form-item>
                <el-form-item label="jobGroupName">
                    <el-input v-model="addjobItem.jobGroupName"></el-input>
                </el-form-item>
                <el-form-item label="triggerName">
                    <el-input v-model="addjobItem.triggerName"></el-input>
                </el-form-item>
                <el-form-item label="triggerGroupName">
                    <el-input v-model="addjobItem.triggerGroupName"></el-input>
                </el-form-item>
                <el-form-item label="clsName">
                    <el-input v-model="addjobItem.clsName"></el-input>
                </el-form-item>
                <el-form-item label="cronExpression">
                    <el-input v-model="addjobItem.cronExpression"></el-input>
                </el-form-item>
                <el-form-item label="parameter">
                    <el-input v-model="addjobItem.parameter"></el-input>
                </el-form-item>
                <el-form-item>
                    <el-button type="primary" @click="addJob">创建并启动</el-button>
                    <el-button @click="addjobVisible=false">取消</el-button>
                </el-form-item>
            </el-form>
        </el-dialog>
    </div>
</template>

<script>
import myfetch from '@/config/myfetch'
import constants from "@/page/my/util/constants";
import StringUtil from "@/page/my/util/StringUtil";
import {MessageBox, Message} from 'element-ui';

export default {
    name: 'quartz',
    computed: {
        ruleContentSpan: () => {
            return 24 - this.ruleContentSpan
        }
    },
    data () {
        return {
            curItem: {},
            addjobItem: {},
            dialogVisible: false,
            addjobVisible: false,
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
            ruleTitleSpan: 7
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
        addJobHandle () {
            this.addjobItem = {
                jobGroupName: 'DEFAULT',
                triggerGroupName: 'DEFAULT',
                clsName: 'com.takooya.quartz.PrintCronJob',
                cronExpression: '0 0/1 * * * ?'
            };
            this.addjobVisible = true;
        },
        async addJob () {
            console.log('quartz addJob this.addjobItem', this.addjobItem);
            this.addjobVisible = false;
            let aaa = await myfetch('quartz/addJob', this.addjobItem, 'POST');
            console.log('quartz addJob aaa', aaa)
        },
        async startJobs () {
            let aaa = await myfetch('quartz/startJobs', {}, 'GET');
            await this.getJobList()
        },
        async standbyJobs () {
            let aaa = await myfetch('quartz/standbyJobs', {}, 'GET');
            await this.getJobList()
        },
        async pauseJob (obj) {
            console.log('quartz pauseJob obj', obj)
            let aaa = await myfetch('/quartz/pauseJob', obj, 'POST');
            await this.getJobList()
        },
        async resumeJob (rowIndex, obj) {
            console.log('quartz resumeJob rowIndex,obj', rowIndex, obj)
            let aaa = await myfetch('/quartz/resumeJob', obj, 'POST');
            await this.getJobList()
        },
        moreOperate (commond, val) {
            this.$options.methods[commond](val, this)
        },
        removeJob (val, vueObj) {
            console.info(val);
            MessageBox.confirm('此操作将永久删除该Job, 是否继续?', '提示', {
                confirmButtonText: '确定',
                cancelButtonText: '取消',
                type: 'warning'
            }).then(() => {
                let promise = myfetch('/quartz/removeJob', obj, 'POST');
                promise.then(value => {
                    console.log('quartz value ', value);
                    Message.success('删除成功!');
                }).catch(error => {
                    Message.error('删除失败!');
                })
            }).catch(() => {
                Message({
                    type: 'info',
                    message: '已取消删除'
                });
            });
        },
        operateSelectChange (val, vueObj) {
            console.info(val);
            vueObj.curItem = val;
            vueObj.dialogVisible = true
        },
        temp () {
            alert('临时方法')
        },
        timeFormatter (obj, col, value) {
            let date = new Date(value);
            return date.toLocaleDateString() + " - " + date.toLocaleTimeString();
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
.quartz-title {
    text-align: center;
    font-size: 20px;
    font-weight: bolder;
    margin: 20px;
}

.table-info-row {
    margin: 0 20px;

    .table-info-row-left {
    }

    .table-info-row-right {
        text-align: right;

        .table-info-row-right-button {

        }
    }
}

.rule-row {
    line-height: 40px;

    .rule-title {
        text-align: right;
    }

    .rule-content {
        .rule-input {
            width: 300px;
        }

        .rule-select {

        }
    }
}

.rule-row-button {

}
</style>
