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
          v-show="status == '已处理'"
          label="故障接收人"
          style="text-align:left"
          disabled
          v-model="faultReceiverName"
        />
        <van-field
          v-show="status == '已处理'"
          label="接收时间"
          style="text-align:left"
          disabled
          v-model="faultReceptionTime"
        />
        <van-field
          label="恢复时间"
          disabled
          v-model="faultRecoveryTime"
          style="text-align:left"
          v-show="faultRecoveryTime != ''"
        />
        <van-field
          label="确认时间"
          disabled
          v-model="confirmRepairedTime"
          style="text-align:left"
          v-show="confirmRepairedTime != ''"
        />
        <van-field
          label="故障地址"
          style="text-align:left"
          disabled
          v-model="detailedAddress"
        />
      </div>
    </div>
  </div>
</template>

<script>
  import { getPostData, getParams, getLoc, setLoc } from "@/utils/common.js";
  import { mapActions, mapMutations, mapState } from "vuex";
  import { Toast } from 'vant';
  export default {
    data() {
      //这里存放数据
      return {
        title: "故障信息",
        isShow: "",
        showLoading: true,
        detailedAddress: "",
        faultStartTime: "",
        faultReceptionTime: "",
        remark: "",
        faultRecoveryTime: "",
        confirmRepairedTime: "",
        faultID: "",
        showBtn: false,
        title2: "反馈信息",
        url: require('../../assets/fault/info.png'),
        submitterName: '',//故障提交人
        faultReceiverName: '',//故障接收人
        status: ''
      };
    },
    //监听属性 类似于data概念
    computed: {
      ...mapState(['warnId'])
    },
    //生命周期 - 创建完成（可以访问当前this实例）
    created() {
      this.faultID = this.warnId;
      this.status = this.$route.params.status;
      this.init();
    },
    //方法集合
    methods: {
      ...mapMutations(['_userInfo']),
      ...mapActions(['_getInfo']),
      init() {
        const params = getPostData("getSensorFaultInfoByfaultID", [this.faultID]);
        this._getInfo({
          ops: params,
          method: "post",
          api: "getSensorFaultInfoByfaultID",
          callback: res => {
            var div = document.createElement("div");
            div.innerHTML = res;
            var curUserinfo = JSON.parse(div.querySelector("return").innerHTML);
            this.title += "(" + curUserinfo.status + ")";
            var statusText = '';
            if(curUserinfo.status === "已接收") {
              statusText = '故障信息已被接收，故障正在处理中，请耐心等待';
            } else if(curUserinfo.status === "已处理") {
              statusText = '故障信息已被处理';
            }
            console.log(curUserinfo);
            this.detailedAddress = curUserinfo.detailedAddress;
            this.faultCause = curUserinfo.faultCause;
            this.faultStartTime = curUserinfo.faultStartTime;
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
            if(curUserinfo.status === "已处理") {
              this.showBtn = true;
            } else {
              this.showBtn = false;
            }
            this.showLoading = false;
          }
        });
      }
    },
  }
</script>
<style lang='less' scoped>
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
      font-size: 0.3rem;
      background: #fff;
      user-select: none;
    }
    .btns:active {
      background-color: #eaeaea;
    }
  }
  .content {
    line-height: 0.54rem;
    font-size: 0.3rem;
    color: #8e8e93;
    padding: 0 0.1rem;
  }
</style>