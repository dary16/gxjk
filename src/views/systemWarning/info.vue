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
          <div>
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
        </div>
        <div
          class="address clearfix"
          @click="toMap()"
        >
          <div class="left fl">
            <img src="../../assets/warn/warn.png" alt="" />
            </div>
            <div class="right fl">
              <h3>{{ objData.warningTypeLabel }}告警地点
                <template>
                  <van-icon
                    v-if='objData.level == 0'
                    name="warn-o"
                    size="0.36rem"
                    color="grey"
                    style="vertical-align: bottom;"
                  />
                  <van-icon
                    v-else-if='objData.level == 1'
                    name="warn-o"
                    size="0.36rem"
                    color="red"
                    style="vertical-align: bottom;"
                  />
                  <van-icon
                    v-else-if='objData.level == 2'
                    name="warn-o"
                    size="0.36rem"
                    color="orange"
                    style="vertical-align: bottom;"
                  />
                  <van-icon
                    v-else
                    name="warn-o"
                    size="0.36rem"
                    color="blue"
                    style="vertical-align: bottom;"
                  />
                </template>
              </h3>
              <h5>{{ objData.address }}，标桩号：{{ objData.num }}，预置位：{{ objData.preAdd }}</h5>
            </div>
          </div>
          <div class="objData">
            <div>
              <span class="objTitle">识别对象：</span>
              <b>{{objData.identifyObject}}</b>
            </div>
            <!-- <van-divider v-show='showObj' /> -->
            <ul v-show='showObj'>
              <li>
                <span class="objTitle">屏蔽对象：</span>
                <b>{{objData.accessData.identifyObjectNames}}</b>
              </li>
              <!-- <van-divider /> -->
              <li>
                <span class="objTitle">屏蔽时间段：</span>
                <b>{{objData.accessData.shieldingStartDay}} {{objData.accessData.shieldingStartTime}}至{{objData.accessData.shieldingEndDay}} {{objData.accessData.shieldingEndTime}}</b>
              </li>
            </ul>

          </div>
          <div
            class="btns"
            v-show="isShowBtn"
          >
            <div
              class="all-btn"
              v-if="isSendPolice"
              @click="watchDispatchInfo"
            >
              已派警
            </div>
            <div
              class="all-btn"
              v-else
              @click="toPolice"
            >
              派警
            </div>
            <div
              class="all-btn"
              v-show="isViewDispatchPolice"
              @click="viewDispatchPolice(dispatchId)"
            >
              查看回执
            </div>
            <div
              class="all-btn"
              @click="toRight"
            >
              {{ isRightText }}
            </div>
            <div
              class="all-btn"
              @click="toError"
              style="color:#f00;"
            >
              识别错误
            </div>
          </div>
        </div>
        <van-dialog
          id="popDialog"
          v-model="isShow"
          :show-cancel-button="false"
        >
          <van-field
            label="派警时间"
            v-model="dispatchTime"
            readonly
          />
          <van-field
            v-if="dispatchPersons.toString().length < 17"
            label="巡线工"
            v-model="dispatchPersons"
            readonly
          />
          <van-field
            v-else
            label="巡线工"
            type="textarea"
            v-model="dispatchPersons"
            readonly
          />

        </van-dialog>
      </div>
</template>

<script>
  import { getPostData, getParams, getObjParams, getLoc, setLoc } from '@/utils/common.js';
  import { mapActions, mapMutations, mapState } from 'vuex';
  import { ImagePreview, Toast, Dialog } from 'vant';
  export default {
    data() {
      return {
        title: '告警详情',
        length: 0,
        warningID: '',
        isShowBtn: false,
        showLoading: true,
        isViewDispatchPolice: false,
        dispatchId: '',
        dispatchTime: '',
        dispatchPersons: '',
        isRightText: '识别正确不派警',
        isSendPolice: false,
        showObj: false,
        personNum: 0,
        objData: {
          address: '',
          num: '',
          sensorNO: '',
          preAdd: '',
          identifyObject: '',
          level: '',
          accessData: {
            identifyObjectNames: '',
            shieldingStartDay: '',
            shieldingStartTime: '',
            shieldingEndDay: '',
            shieldingEndTime: ''
          }
        },
        mapData: {},
        images: [],
        isShow: false
      };
    },
    computed: {
      ...mapState(['disptId', 'warnId'])
    },
    created() {
      //保存所需id
      this.warningID = this.warnId;
      //获取数据
      this.getListdata();
    },
    mounted() { },
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
            // console.log(curUserinfo);
            if(curUserinfo.warningDTO.isSendPolice == '是') {
              this.isRightText = '确认告警';
              this.isSendPolice = true;
            }

            if(curUserinfo.warningDTO.status == '已回执') {
              this.isViewDispatchPolice = true;
              this.dispatchId = curUserinfo.warningDTO.dispatchPoliceID;
            } else if(curUserinfo.warningDTO.status == '已派警') {
              this.dispatchId = curUserinfo.warningDTO.dispatchPoliceID;
              this.dispatchTime = curUserinfo.warningDTO.dispatchTime;
            }

            this.mapData = curUserinfo.warningDTO;
            this.objData.address = curUserinfo.warningDTO.warningAddress;
            this.objData.sensorNO = curUserinfo.warningDTO.sensorNO;
            this.objData.num = curUserinfo.warningDTO.stakeNO;
            this.objData.preAdd = curUserinfo.warningDTO.presetNO;
            this.objData.warningTypeLabel = curUserinfo.warningDTO.warningTypeLabel;
            this.objData.identifyObject = curUserinfo.identifyObject;
            this.objData.level = curUserinfo.warningDTO.soundLevel;
            // console.log(curUserinfo);
            if(curUserinfo.shieldingTimeDTO !== undefined) {
              //有屏蔽对象
              this.objData.accessData = JSON.parse(JSON.stringify(curUserinfo.shieldingTimeDTO))
              this.showObj = true;
            };

            this.length = curUserinfo.warningImgList.length;
            //请求每一张图片
            if(curUserinfo.warningImgList.length > 0) {
              //   alert(curUserinfo.warningImgList);
              curUserinfo.warningImgList.forEach((item, index) => {
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
            } else {
              this.images = [];
              this.showLoading = false;
            }
            // //判断是否有操作权限
            this.checkIsPermission();
          }
        });
      },
      toPolice() {
        this.$router.push({ name: 'selectPerson', params: { sensorNO: this.objData.sensorNO, warningID: this.warningID } });
      },
      //点击查看图片
      swiperImgClick() {
        const img = ImagePreview(this.images);
        setLoc("imagePreviewNow", true);
        plus.key.addEventListener("backbutton", onBack => {
          img.close();
          plus.key.removeEventListener("backbutton", onPlusReady);
        });
      },
      toRight() {
        this.updateWarning('qr');
      },
      toError() {
        this.updateWarning('wb');
      },
      toMap() {
        this.$router.push({ name: 'map', params: { mapData: this.mapData } });
      },
      //查看回执
      viewDispatchPolice() {
        this.$router.push({ name: 'finishedDetails', params: { dispatchId: this.dispatchId } });
      },
      updateWarning(val) {
        const params = getPostData('dealWarning', { warningID: this.warningID, dealTypeFlag: val, toPersonIDs: '', dealWithUser: getLoc('userInfo').userID });
        this._getInfo({
          ops: params,
          method: 'post',
          api: 'dealWarning',
          callback: res => {
            var div = document.createElement('div');
            div.innerHTML = res;
            var data = div.querySelector('return').innerHTML;
            if(data == 'notNeedHandle') {
              Toast('告警信息已被处理！');
            }
            this.$router.push('/systemWarningList');
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
      watchDispatchInfo() {
        this.isShow = !this.isShow;
        const params = getPostData('findDispatchPersonListByDispatchPoliceID', [this.dispatchId]);
        this._getInfo({
          ops: params,
          method: 'post',
          api: 'findDispatchPersonListByDispatchPoliceID',
          callback: res => {
            var div = document.createElement('div');
            div.innerHTML = res;
            let result = div.querySelector('return').innerHTML;
            let persons = [];
            // console.log(JSON.parse(result));
            this.personNum = JSON.parse(result).length;
            if(this.personNum > 0) {
              JSON.parse(result).forEach(item => {
                persons.push(item.personName);
              })
              this.dispatchPersons = persons.join(',');
            };
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
      //   padding: 0.3rem 0.44rem;
      .img {
        height: 5rem;
      }
      .address {
        position: relative;
        padding: 0.3rem 0.1rem;
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
            line-height: 0.4rem;
            padding-top: 0.05rem;
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
      .objData {
        div {
          padding: 0.1rem;
          background: #fff;
          display: flex;
          text-align: left;
          color: #929292;
          span {
            float: left;
            // width: 47%;
            font-size: 0.28rem;
          }
          b {
            font-weight: normal;
            font-size: 0.26rem;
          }
        }
        ul {
          li {
            background: #fff;
            margin-top: 0.015rem;
            text-align: left;
            line-height: 0.5rem;
            padding: 0.1rem;
            color: #929292;
            span {
              font-size: 0.28rem;
            }
            b {
              font-weight: normal;
              font-size: 0.26rem;
            }
          }
        }
      }
    }
  }
</style>
<style>
  #popDialog .van-dialog__content .van-cell__value {
    font-size: 0.32rem !important;
  }
  #popDialog .van-dialog__content .van-cell__value .van-field__body input {
    line-height: 0.65rem !important;
    height: 0.65rem !important;
  }
  #popDialog .van-dialog__content .van-cell__value .van-field__body textarea {
    line-height: 0.65rem !important;
  }
  .content .van-divider {
    margin: 0 !important;
    padding: 0 !important;
  }
</style>
