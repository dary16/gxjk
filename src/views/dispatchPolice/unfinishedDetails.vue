<template>
  <keep-alive>
    <div class="about">
      <v-header :title="title"></v-header>
      <van-loading
        size="30px"
        text-size="16px"
        type="spinner"
        style="margin-top:2rem;"
        vertical
        v-if="showLoading"
      >加载中...</van-loading>
      <div
        class="content"
        v-else
      >
        <div class="img">
          <div
            class="noImg"
            v-if="length === 0"
          >
            <img src="../../assets/noimg.jpg" />
          </div>
            <van-swipe
              :autoplay="3000"
              indicator-color="black"
            >
              <van-swipe-item
                v-for="(image, index) in images"
                :key="index"
              >
                <van-image
                  :src="image"
                  v-lazy="image"
                  @click="swiperImgClick()"
                />
              </van-swipe-item>
            </van-swipe>
          </div>
          <div
            class="address clearfix"
            @click="toMap"
          >
            <div class="left fl">
              <img src="../../assets/warn/warn.png" alt="" />
          </div>
              <div class="right fl">
                <h3>{{ objData.warningTypeLabel }}告警地点</h3>
                <h5>
                  {{ objData.address }}，标桩号：{{ objData.num }}，预置位：{{
                objData.preAdd
              }}
                </h5>
              </div>
            </div>
            <div
              class="btns"
              v-show="isShowBtn"
            >
              <div
                class="all-btn"
                style="color:#2d92fd"
                @click="toMap"
              >
                导航至报警点
              </div>
              <div
                class="all-btn"
                style="color:#F69434;"
                @click="commitFn"
              >
                结果反馈
              </div>
            </div>
          </div>
        </div>
  </keep-alive>
</template>

<script>
  import { getPostData, getParams, getLoc, setLoc } from '@/utils/common.js';
  import { mapActions, mapMutations, mapState } from 'vuex';
  import { ImagePreview } from 'vant';
  export default {
    data() {
      return {
        title: '图集',
        length: 0,
        warningID: '',
        dispatchId: '',
        isShowBtn: false,
        showLoading: true,
        objData: {
          address: '',
          num: '',
          preAdd: '',
          warningTypeLabel: ''
        },
        mapData: {},
        images: []
      };
    },
    computed: {
      ...mapState(['disptId', 'warnId'])
    },
    created() {
      //保存所需id
      this.warningID = this.warnId;
      this.dispatchId = this.disptId;
      //获取数据
      this.getListdata();
    },
    methods: {
      ...mapMutations(['_warningid']),
      ...mapActions(['_getInfo']),
      getListdata() {
        this.images = [];

        const params = getPostData('getWarningInfoByID', [this.warningID, getLoc('userInfo').userID]);
        this._getInfo({
          ops: params,
          method: 'post',
          api: 'getWarningInfoByID',
          callback: res => {
            var div = document.createElement('div');
            div.innerHTML = res;
            var curUserinfo = JSON.parse(div.querySelector('return').innerHTML);
            console.log(curUserinfo);
            this.mapData = curUserinfo.warningDTO;
            this.objData.address = curUserinfo.warningDTO.warningAddress;
            this.objData.num = curUserinfo.warningDTO.stakeNO;
            this.objData.preAdd = curUserinfo.warningDTO.presetno;
            this.objData.warningTypeLabel = curUserinfo.warningDTO.warningTypeLabel;
            this.length = curUserinfo.warningImgList.length;

            if(curUserinfo.warningImgList.length > 1) {
              curUserinfo.warningImgList.forEach(item => {
                let params2 = getPostData('getImageInfo', [true, item.warningRefID]);
                this._getInfo({
                  ops: params2,
                  methods: 'post',
                  api: 'getImageInfo',
                  callback: res => {
                    var div = document.createElement('div');
                    div.innerHTML = res;
                    let imgItem = JSON.parse(div.querySelector('return').innerHTML);
                    this.images.push(imgItem.imgPath);
                  }
                });
              });
            } else if(curUserinfo.warningImgList.length === 1) {
              this.images.push(curUserinfo.imgPath);
            } else {
              this.images = [];
            }
            //判断是否有操作权限
            this.checkIsPermission();
            this.checkIsPatrolman();
          }
        });
      },
      //巡线工判断
      checkIsPatrolman() {
        const params = getPostData('checkIsPatrolman', [getLoc('userInfo').userID]);

        this._getInfo({
          ops: params,
          method: 'post',
          api: 'checkIsPatrolman',
          callback: res => {
            var div = document.createElement('div');
            div.innerHTML = res;
            var bool = div.querySelector('return').innerHTML;
            if(bool == 'true') {
              this.isShowBtn = true;
            }
          }
        });
      },
      //判断是否有处理告警权限
      checkIsPermission() {
        //提交数据
        const params = getPostData('isPermission', [getLoc('userInfo').userID, '智慧监控平台', '告警信息管理', '处理告警信息']);
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
      },
      toMap() {
        this.$router.push({ name: 'map', params: { mapData: this.mapData } });
      },
      commitFn() {
        this.checkFn();
      },
      //点击查看图片
      swiperImgClick() {
        ImagePreview(this.images);
      },
      checkFn() {
        //检查是否已经被回执
        let params = getPostData('checkIsReceipt', [this.warningID]);
        this._getInfo({
          ops: params,
          method: 'post',
          api: 'checkIsReceipt',
          callback: res => {
            var div = document.createElement('div');
            div.innerHTML = res;
            var result = div.querySelector('return').innerHTML;
            if(result === 'true') {
              //已回执，去查看
              this.$router.push({ name: 'finishedDetails', params: { dispatchId: this.dispatchId } });
            } else if(result === 'false') {
              //未回执，去回执
              //准备添加数据
              //   this.prepareAddData();
              this.$router.push({ name: 'result', params: { dispatchId: this.dispatchId, warningID: this.warningID } });
            }
          }
        });
      },
      prepareAddData() {
        let params = getPostData('checkIsReceipt', [this.dispatchId]);
        this._getInfo({
          ops: params,
          method: 'post',
          api: 'preAddDispatchPolice ',
          callback: res => {
            var div = document.createElement('div');
            div.innerHTML = res;
            var result = div.querySelector('return').innerHTML;
          }
        });
      }
    }
  };
</script>

<style lang="less" scoped>
  .about {
    background: #f3f3f3;
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    .content {
      .img {
        height: 5rem;
      }
      .address {
        position: relative;
        padding: 0.4rem 0.1rem;
        display: flex;
        background: #fff;
        .left {
          width: 1.2rem;
          text-align: center;
          img {
            width: 0.8rem;
            height: 0.8rem;
          }
        }
        .right {
          flex: 1;
          padding-top: 0.12rem;
          h3 {
            font-size: 0.3rem;
            color: #000;
            font-weight: bold;
            text-align: left;
          }
          h5 {
            text-align: left;
            font-size: 0.26rem;
            color: #929292;
            line-height: 0.5rem;
          }
        }
      }
      .address::before {
        background-color: #ebedf0;
        content: " ";
        position: absolute;
        top: 0;
        left: 0;
        width: 100%;
        height: 0.02rem;
      }
      .address::after {
        background-color: #ebedf0;
        content: " ";
        position: absolute;
        left: 0;
        bottom: 0;
        width: 100%;
        height: 0.02rem;
      }
      .btns {
        margin-top: 0.3rem;
        .all-btn {
          margin-bottom: 0.2rem;
          height: 1rem;
          line-height: 1rem;
          font-size: 0.32rem;
          background: #fff;
          user-select: none;
        }
        .all-btn:active {
          background-color: #eaeaea;
        }
      }
    }
  }
</style>
