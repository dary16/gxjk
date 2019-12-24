<template>
  <div class="fault">
    <v-header :title="title" :isShow="isShow"></v-header>
    <van-loading
      size="30px"
      text-size="16px"
      type="spinner"
      style="margin-top:2rem;"
      vertical
      v-if="showLoading"
      >加载中...</van-loading
    >
    <div v-else>
      <div class="group2">
        <v-fault-info
          :title="title2"
          :content="detailedAddress"
          :url="url"
        ></v-fault-info>
        <van-divider />
        <div v-show="isShowBtn">
          <van-panel
            title="恢复备注"
            style="text-align:left"
            v-show="remark != ''"
          >
            <div class="content">{{ remark }}</div>
          </van-panel>
        </div>
        <van-divider />
      </div>
      <div class="group1">
        <van-field
          label="接收时间"
          style="text-align:left"
          disabled
          v-model="faultReceptionTime"
        />
        <van-field
          label="处理时间"
          disabled
          v-model="handlingTime"
          style="text-align:left"
          v-show="handlingTime != ''"
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
      </div>
      <div v-show="isShowBtn">
        <div class="btns" v-if="showBtn" @click="confirmFault()">
          确认
        </div>
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
        isShowBtn: false,
        showLoading: true,
        detailedAddress: "",
        faultCause: "",
        faultStartTime: "",
        faultReceptionTime: "",
        handlingTime: "",
        remark: "",
        faultRecoveryTime: "",
        confirmRepairedTime: "",
        faultID: "",
        showBtn: false,
        title2: "反馈信息",
        url: require('../../assets/fault/info.png')
      };
    },
    props: [],
    //监听属性 类似于data概念
    computed: {
      ...mapState(['warnId'])
    },
    //监控data中的数据变化
    watch: {},
    //生命周期 - 创建完成（可以访问当前this实例）
    created() {
      this.faultID = this.warnId;
      this.init();
    },
    //生命周期 - 挂载完成（可以访问DOM元素）
    mounted() {

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
            if (curUserinfo.status === "已接收") {
              statusText = '故障信息已被接收，故障正在处理中，请耐心等待';
            } else if (curUserinfo.status === "已处理") {
              statusText = '故障信息已被处理，请确认';
            }
            this.detailedAddress = curUserinfo.detailedAddress + statusText;
            this.faultCause = curUserinfo.faultCause;
            this.faultStartTime = curUserinfo.faultStartTime;
            this.submitTime = curUserinfo.submitTime;
            this.faultID = curUserinfo.faultID;
            if (curUserinfo.faultReceptionTime) {
              this.faultReceptionTime = curUserinfo.faultReceptionTime;
            }
            if (curUserinfo.remark) {
              this.remark = curUserinfo.remark;
            }
            if (curUserinfo.faultRecoveryTime) {
              this.faultRecoveryTime = curUserinfo.faultRecoveryTime;
            }
            if (curUserinfo.confirmRepairedTime) {
              this.confirmRepairedTime = curUserinfo.confirmRepairedTime;
            }
            if (curUserinfo.status === "已处理") {
              this.showBtn = true;
            } else {
              this.showBtn = false;
            }
            this.checkIsPermission();
          }
        });
      },
      confirmFault() {
        const params = getPostData("confirmSensorFaultInfo", { "faultID": this.faultID, "affirmant": getLoc('userInfo').userID });
        this._getInfo({
          ops: params,
          method: "post",
          api: "confirmSensorFaultInfo",
          callback: res => {
            var div = document.createElement("div");
            div.innerHTML = res;
            var curUserinfo = JSON.parse(div.querySelector("return").innerHTML);
            if (curUserinfo.status == "faile") {
              Toast("信息处理失败");
            } else if (curUserinfo.result != "") {
              Toast("该信息已被处理完成");
            }
            this.$router.push('/foundFault');
          }
        });
      },
      //判断是否有处理告警权限
      checkIsPermission() {
        //提交数据
        const params = getPostData("isPermission", [getLoc('userInfo').userID, "智慧监控平台", "故障信息管理", "上报故障并确认修复"]);

        this._getInfo({
          ops: params,
          method: "post",
          api: "isPermission",
          callback: res => {
            var div = document.createElement("div");
            div.innerHTML = res;
            var bool = div.querySelector("return").innerHTML;
            if (bool == "true") {
              this.isShowBtn = true;
            }
            this.showLoading = false;
          }
        });
      },
    },
    updated() { }, //生命周期 - 更新之后
    activated() { }, //如果页面有keep-alive缓存功能，这个函数会触发
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