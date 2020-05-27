<template>
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
          @click="toMap()"
        >
          <div class="left fl">
            <img src="../../assets/warn/warn.png" alt="" />
                </div>
            <div class="right fl">
              <h3>{{ objData.warningTypeLabel }}告警地点</h3>
              <h5>{{ objData.address }}，标桩号：{{ objData.num }}，预置位：{{ objData.preAdd }}</h5>
            </div>
          </div>
          <div
            class="all-btn"
            v-show="isViewDispatchPolice"
            @click="viewDispatchPolice(dispatchId)"
          >
            查看回执
          </div>
        </div>
      </div>
</template>

<script>
  import { getPostData, getParams, getLoc, setLoc } from '@/utils/common.js';
  import { mapActions, mapMutations, mapState } from 'vuex';
  import { ImagePreview, Toast } from 'vant';
  export default {
    data() {
      return {
        title: '告警详情',
        length: 0,
        warningID: '',
        showLoading: true,
        dispatchId: '',
        status: '',
        isRightText: '识别正确不派警',
        isSendPolice: false,
        isViewDispatchPolice: false,
        objData: {
          address: '',
          num: '',
          sensorNO: '',
          preAdd: ''
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
      this.status = this.$route.params.status;
      if(this.status == '已回执') {
        this.isViewDispatchPolice = true;
      } else {
        this.isViewDispatchPolice = false;
      }
      //获取数据
      this.getListdata();
    },
    methods: {
      ...mapMutations(['_warningid']),
      ...mapActions(['_getInfo']),
      getListdata() {
        this.images = [];

        const params = getPostData('getWarningInfoByID', [this.warningID]);
        this._getInfo({
          ops: params,
          method: 'post',
          api: 'getWarningInfoByID',
          callback: res => {
            var div = document.createElement('div');
            div.innerHTML = res;
            var curUserinfo = JSON.parse(div.querySelector('return').innerHTML);
            if(curUserinfo.warningDTO.warningStatus == '3') {
              this.title += '(识别正确)';
            } else if(curUserinfo.warningDTO.warningStatus == '2') {
              this.title += '(识别错误)';
            }
            this.mapData = curUserinfo.warningDTO;
            this.objData.address = curUserinfo.warningDTO.warningAddress;
            this.objData.sensorNO = curUserinfo.warningDTO.sensorNO;
            this.objData.num = curUserinfo.warningDTO.stakeNO;
            this.objData.preAdd = curUserinfo.warningDTO.presetNO;
            this.objData.warningTypeLabel = curUserinfo.warningDTO.warningTypeLabel;
            this.length = curUserinfo.warningImgList.length;
            //请求图片
            if(curUserinfo.warningImgList.length > 0) {
              curUserinfo.warningImgList.forEach(item => {
                let params2 = getPostData('getImageInfo', [false, item.warningRefID]);
                this._getInfo({
                  ops: params2,
                  methods: 'post',
                  api: 'getImageInfo',
                  callback: res => {
                    var div = document.createElement('div');
                    div.innerHTML = res;
                    let imgItem = JSON.parse(div.querySelector('return').innerHTML);
                    this.images.push(imgItem.imgPath);

                    this.showLoading = false;
                  }
                });
              });
            } else if(curUserinfo.warningImgList.length === 1) {
              this.images.push(curUserinfo.imgPath);
              this.showLoading = false;
            } else {
              this.images = [];
              this.showLoading = false;
            }
          }
        });
      },
      //点击查看图片
      swiperImgClick() {
        const img = ImagePreview(this.images);
        setLoc("imagePreviewNow",true);
        plus.key.addEventListener("backbutton", onBack => {
          img.close();
          plus.key.removeEventListener("backbutton", onPlusReady);
        });
      },
      toMap() {
        this.$router.push({ name: 'map', params: { mapData: this.mapData } });
      },
      //查看回执
      viewDispatchPolice() {
        this.$router.push({ name: 'finishedDetails', params: { dispatchId: this.dispatchId, val: this.$route.params.obj } });
      },
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
      .all-btn {
        margin: 0.2rem 0;
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
</style>
