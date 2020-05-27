<template>
  <div class="fault">
    <v-header
      :title="title"
      :isShow="isShow"
    ></v-header>
    <van-loading
      size="30px"
      text-size="16px"
      type="spinner"
      style="margin-top:2rem;"
      vertical
      v-if="showLoading"
    >加载中...</van-loading>
    <div v-else>
      <div class="group1">
        <van-cell-group>
          <v-fault-info
            :title="title2"
            :content="faultCause"
            :url="url"
          ></v-fault-info>
          <van-divider />
          <van-field
            label="故障提交人"
            style="text-align:left"
            disabled
            v-model="submitterName"
          />
          <van-field
            label="故障时间"
            style="text-align:left"
            disabled
            v-model="faultStartTime"
          />
          <van-field
            label="接收时间"
            style="text-align:left"
            disabled
            v-model="faultReceptionTime"
            v-show="faultReceptionTime != ''"
          />
          <van-field
            label="故障接收人"
            style="text-align:left"
            disabled
            v-model="faultReceiverName"
            v-show="faultReceiverName != ''"
          />
          <van-field
            label="处理时间"
            style="text-align:left"
            disabled
            v-model="handlingTime"
            v-show="handlingTime != ''"
          />
        </van-cell-group>
      </div>
      <div class="group1">
        <van-cell-group>
          <van-field
            label="恢复时间"
            style="text-align:left"
            disabled
            v-model="faultRecoveryTime"
            v-show="faultRecoveryTime != ''"
          />
          <van-field
            label="确认时间"
            style="text-align:left"
            disabled
            v-model="confirmRepairedTime"
            v-show="confirmRepairedTime != ''"
          />
        </van-cell-group>
      </div>
      <div v-show="isShowBtn">
        <div
          class="group2"
          v-show="showBtn == '1'"
        >
          <div class="t-textarea">
            恢复备注
          </div>
          <van-field
            v-model="submitremark"
            type="textarea"
            class="textarea"
            placeholder="请填写备注信息"
          />
          <van-divider />
        </div>
      </div>
      <div
        class="group2"
        v-show="remark != ''"
      >
        <div class="t-textarea">
          恢复备注
        </div>
        <div class="content">{{ remark }}</div>
      </div>

      <div v-show="isShowBtn">
        <div
          class="btns"
          v-if="showBtn == '0'"
          @click="receiveFault()"
        >
          确认接收
        </div>
        <div
          class="btns"
          v-else-if="showBtn == '1'"
          @click="getServerTime()"
        >
          处理并提交
        </div>
      </div>
    </div>
  </div>
</template>

<script>
  import { getPostData, getParams, getLoc, setLoc } from '@/utils/common.js';
  import { mapActions, mapMutations, mapState } from 'vuex';
  import { Toast } from 'vant';
  export default {
    data() {
      //这里存放数据
      return {
        title: '故障信息',
        isShow: '',
        showLoading: true,
        isShowBtn: false,
        faultCause: '',
        faultStartTime: '',
        faultReceptionTime: '',
        handlingTime: '',
        submitremark: '',
        remark: '',
        faultRecoveryTime: '',
        confirmRepairedTime: '',
        faultID: '',
        showBtn: '0',
        title2: '故障详情',
        url: require('../../assets/fault/fault.png'),
        submitterName: '',//故障提交人
        faultReceiverName: ''//故障接收人
      };
    },
    //监听属性 类似于data概念
    computed: {
      ...mapState(['warnId'])
    },
    //生命周期 - 创建完成（可以访问当前this实例）
    created() {
      this.faultID = this.warnId;
      this.init();
    },
    //方法集合
    methods: {
      ...mapMutations(['_userInfo']),
      ...mapActions(['_getInfo']),
      init() {
        const params = getPostData('getSensorFaultInfoByfaultID', [this.faultID]);
        this._getInfo({
          ops: params,
          method: 'post',
          api: 'getSensorFaultInfoByfaultID',
          callback: res => {
            var div = document.createElement('div');
            div.innerHTML = res;
            var curUserinfo = JSON.parse(div.querySelector('return').innerHTML);
            console.log(curUserinfo);
            this.title += '(' + curUserinfo.status + ')';
            this.faultCause = curUserinfo.faultCause;
            this.faultStartTime = curUserinfo.faultStartTimeFormat;
            this.submitTime = curUserinfo.submitTime;
            this.faultID = curUserinfo.faultID;
            this.submitterName = curUserinfo.submitterName;
            if(curUserinfo.faultReceptionTime) {
              this.faultReceptionTime = curUserinfo.faultReceptionTimeFormat;
            }
            if(curUserinfo.remark) {
              this.remark = curUserinfo.remark;
            }
            if(curUserinfo.faultRecoveryTime) {
              this.faultRecoveryTime = curUserinfo.faultRecoveryTimeFormat;
            }
            if(curUserinfo.confirmRepairedTime) {
              this.confirmRepairedTime = curUserinfo.confirmRepairedTime;
            }
            if(curUserinfo.faultReceiverName) {
              this.faultReceiverName = curUserinfo.faultReceiverName;
            }
            if(curUserinfo.status === '已上报') {
              this.showBtn = '0';
            } else if(curUserinfo.status === '已接收') {
              this.showBtn = '1';
            } else {
              this.showBtn = '2';
            }
            this.checkIsPermission();
          }
        });
      },
      receiveFault() {
        const params = getPostData('receiveSensorFaultInfo', { faultID: this.faultID, faultReceiver: getLoc('userInfo').userID });
        this._getInfo({
          ops: params,
          method: 'post',
          api: 'receiveSensorFaultInfo',
          callback: res => {
            var div = document.createElement('div');
            div.innerHTML = res;
            var curUserinfo = JSON.parse(div.querySelector('return').innerHTML);
            if(curUserinfo.status == 'faile') {
              Toast('信息处理失败');
            } else if(curUserinfo.result != '') {
              Toast('该信息已被接收');
            }
            this.$router.push('/handlingFault');
          }
        });
      },
      handlingFault() {
        const params = getPostData('handleSensorFaultInfo', {
          faultID: this.faultID,
          handler: getLoc('userInfo').userID,
          faultRecoveryTime: this.serverTime,
          remark: this.submitremark
        });
        this._getInfo({
          ops: params,
          method: 'post',
          api: 'handleSensorFaultInfo',
          callback: res => {
            var div = document.createElement('div');
            div.innerHTML = res;
            var curUserinfo = JSON.parse(div.querySelector('return').innerHTML);
            if(curUserinfo.status == 'faile') {
              Toast('信息处理失败');
            } else if(curUserinfo.result != '') {
              Toast('该信息已被处理');
            }
            this.$router.push('/handlingFault');
          }
        });
      },
      //获取服务器时间
      getServerTime() {
        const params = getPostData('getSystemTime', []);
        this._getInfo({
          ops: params,
          method: 'post',
          api: 'getSystemTime',
          callback: res => {
            var div = document.createElement('div');
            div.innerHTML = res;
            var listInfoData = div.querySelector('return').innerHTML;
            this.serverTime = listInfoData;
            //处理信息
            this.handlingFault();
          }
        });
      },
      //判断是否有处理告警权限
      checkIsPermission() {
        //提交数据
        const params = getPostData('isPermission', [getLoc('userInfo').userID, '基础数据平台', '基础数据', '传感器故障管理']);
        this._getInfo({
          ops: params,
          method: 'post',
          api: 'isPermission',
          callback: res => {
            var div = document.createElement('div');
            div.innerHTML = res;
            var bool = div.querySelector('return').innerHTML;
            if(bool == 'true') {
              this.isShowBtn = true;
            }
            this.showLoading = false;
          }
        });
      }
    },
  };
</script>
<style lang="less" scoped>
  .fault {
    background: #f3f3f3;
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    .van-cell-group {
      .van-cell-group {
        border-bottom: 1px solid #efefef;
        margin: 0 0.426667rem;
        .van-cell {
          display: block !important;
          padding: 0.266667rem 0;
          &.van-cell__value {
            textarea {
              width: 100% !important;
            }
          }
        }
        .van-cell::after {
          display: none;
        }
      }
    }
    .van-cell-group::after {
      display: none;
    }
    .btns {
      padding: 0.2rem 0.35rem;
      overflow: hidden;
      color: #2d92fd;
      margin-top: 0.3rem;
      font-size: 0.32rem;
      background: #fff;
      user-select: none;
    }
    .btns:active {
      background-color: #eaeaea;
    }
    .van-divider {
      margin: 0 !important;
    }
  }
  .content {
    line-height: 0.54rem;
    font-size: 0.3rem;
    color: #8e8e93;
    padding: 0 0.1rem;
  }
</style>
