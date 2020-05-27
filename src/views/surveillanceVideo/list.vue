<template>
  <div class="video-main">
    <v-header
      :title="title"
      :isShow="isShow"
      :gohome="gohome"
    ></v-header>
    <van-pull-refresh
      v-model="isLoading"
      @refresh="onRefresh"
    >
      <van-list
        id='video-list'
        v-model="loding"
        :finished="upFinished"
        :finished-text="text"
      >
        <van-cell
          v-for="(item,index) in videoData"
          :key="item.sensorNO"
        >
          <!-- 红外热成像+ 可见光传感器-01
                激光夜视仪传感器-02
                红外热成像传感器-03
                    可见光传感器-04 

                红外: 2 ,可见光：1
        -->
          <div v-if="item.sensorStatus === 'NORMAL'">
            <div v-if="item.sensorParameterList.length == 2">
              <img src="../../assets/playVideo1.png" @click="playVideo('1',index,'double')">
              <img src="../../assets/playVideo2.png" @click="playVideo('2',index,'double')">
            </div>
            <img v-else-if="item.sensorParameterList.length == 1 && item.sensorParameterList[0].connectionType == '1'" src="../../assets/playVideo1.png" @click="playVideo('1',index,'single')">
            <img v-else-if="item.sensorParameterList.length == 1 && item.sensorParameterList[0].connectionType == '2'" src="../../assets/playVideo2.png" @click="playVideo('2',index,'single')">
              <!-- <img v-else-if="item.sensorType === '02'" src="../../assets/playVideo1.png" @click="playVideo('2',index,item.sensorType)">
              <img v-else-if="item.sensorType === '03'" src="../../assets/playVideo2.png" @click="playVideo('1',index,item.sensorType)">
              <img v-else-if="item.sensorType === '04'" src="../../assets/playVideo1.png" @click="playVideo('2',index,item.sensorType)"> -->
          </div>
          <div v-else>
            <img src="../../assets/playVideoErr1.png" @click="onToast('摄像头故障')">
          </div>
                <template slot="title">
                  <van-tag
                    plain
                    size="medium"
                    color="#7e9e4b"
                  >{{item.sensorNO}}号摄像头</van-tag>
                  <van-divider />
                  <span class="video-text">{{item.detailedAddress}}</span>
                </template>
        </van-cell>
      </van-list>
    </van-pull-refresh>
    <van-popup
      v-model="videoShow"
      position="bottom"
      :style="{ height: '70%' }"
      closeable
      close-icon="close"
    >
      <div class="arrow-divider">
        <img src="../../assets/control/camera-icon.png" alt="">
        <span>{{addressNo}}</span>
      </div>
      <div class="arrow-Arr">
        <img class="zoom" src="../../assets/control/zoom-add.png" @touchstart="controlZoomBeg('zoomIn')" @touchend="controlZoomEnd('zoomIn')">
        <img class="zoom" src="../../assets/control/zoom-less.png" @touchstart="controlZoomBeg('zoomOut')" @touchend="controlZoomEnd('zoomOut')"><br>
        <div class="controlAll">
          <img class="left-up" src="../../assets/control/left-up.png" @touchstart="controlDBeg('leftUp')" @touchend="controlDEnd('leftUp')">
          <img class="up" src="../../assets/control/up.png" @touchstart="controlDBeg('up')" @touchend="controlDEnd('up')">
          <img class="right-up" src="../../assets/control/right-up.png" @touchstart="controlDBeg('rightUp')" @touchend="controlDEnd('rightUp')">
          <br>
          <img class="left" src="../../assets/control/left.png" @touchstart="controlDBeg('left')" @touchend="controlDEnd('left')">
          <img class="center" src="../../assets/control/center.png" >
          <img class="right" src="../../assets/control/right.png" @touchstart="controlDBeg('right')" @touchend="controlDEnd('right')">
          <br>
          <img class="left-down" src="../../assets/control/left-down.png" @touchstart="controlDBeg('leftDown')" @touchend="controlDEnd('leftDown')">
          <img class="down" src="../../assets/control/down.png" @touchstart="controlDBeg('down')" @touchend="controlDEnd('down')">
          <img class="right-down" src="../../assets/control/right-down.png" @touchstart="controlDBeg('rightDown')" @touchend="controlDEnd('rightDown')">
          <br>
        </div>
          <img v-show="focusyype == '02'" class="zoom" src="../../assets/control/focus-add.png" @touchstart="controlFocusBeg('focusFar')" @touchend="controlFocusEnd('focusFar')">
          <img v-show="focusyype == '02'" class="zoom" src="../../assets/control/focus-less.png" @touchstart="controlFocusBeg('focusNear')" @touchend="controlFocusEnd('focusNear')">
      </div>
    </van-popup>
  </div>

</template>

<script>
  import { getPostData, getParams, getLoc, setLoc, getPostObjData } from '@/utils/common.js';
  import { mapActions, mapMutations, mapState } from 'vuex';
  import { decrypt } from '@/utils/secret.js';
  export default {
    props: ['flag'],
    data() {
      //这里存放数据
      return {
        title: '视频监控列表',
        isShow: 'show',
        gohome: true,
        videoData: [],//视屏播放列表
        loding: false,//上划向下加载数据
        upFinished: false,//数据全部加载完
        isLoading: false,//下拉刷新
        text: '',//拉到最底数据全部加载完提示语句
        videoShow: false,//显示视频播放时的遮罩
        player: {},//视频控件对象
        addressNo: '',//摄像头编号
        address: '',//摄像头地址
        sensorip: '',//所要操作的摄像头ip地址（退出，控制，变焦，变倍）
        focusyype: '', //摄像头是否为变焦--是否展示变焦按钮（定焦：01，变焦：02）
        sensorParameterList: [], //摄像头rtsp接口数据数组
      };
    },
    computed: {
      ...mapState(['appSensorError'])
    },
    watch: {
      flag(newval, oldVal) {
        //返回顶部
        document.getElementById('video-list').scrollIntoView();
        this.isLoading = true;
        this.onRefresh();
      },
      videoShow(newVal, oldVal) {
        if(!newVal) {
          this.player.close();//关闭视频播放控件
          /**退出所要控制的摄像头 --开始-- */
          const paramSensorOut = getPostObjData('logOutSensor', { 'sensorIp': this.sensorip });
          this._getInfo({
            ops: paramSensorOut,
            method: 'post',
            api: 'logOutSensor',
            callback: res => {
              var div = document.createElement('div');
              div.innerHTML = res;
              var rtspData = JSON.parse(div.querySelector('return').innerHTML);
            }
          });
          /**退出所要控制的摄像头 --结束-- */
        }
      },
      appSensorError(newVal, oldVal) {
        if(newVal) {
          //获取初始化数据
          this.findVideoList();
          this._appSensorError(false);
        }
      }
    },
    //生命周期 - 创建完成（可以访问当前this实例）
    created() {
      //获取初始化数据
      this.findVideoList();
    },
    //页面销毁前
    beforeDestroy() {
      if(this.videoShow) {
        this.videoShow = false;
      }
    },
    //方法集合
    methods: {
      ...mapActions(['_getInfo']),
      ...mapMutations(['_appSensorError']),
      //提示
      onToast(val) {
        mui.toast(val);
      },
      //获取视频监控数据
      findVideoList() {
        const userid = getLoc('userInfo').userID
        const params = getPostData('findSensorList', [userid]);
        this._getInfo({
          ops: params,
          method: 'post',
          api: 'findSensorList',
          callback: res => {
            var div = document.createElement('div');
            div.innerHTML = res;
            var videoList = div.querySelector('return').innerHTML;
            this.videoData = JSON.parse(videoList);
            this.upFinished = true;
            this.text = '已经拉到最底了';
          }
        })
      },
      //paramType：调取接口传入的参数，sensorType:通道类型(单双通道)用于rtsp拼接使用,indexNo:点击的摄像头列表下标
      playVideo(paramType, indexNo, sensorType) {
        this.sensorParameterList = this.videoData[indexNo].sensorParameterList;
        this.addressNo = this.videoData[indexNo].sensorNO;
        this.address = this.videoData[indexNo].detailedAddress;
        const webPort = this.videoData[indexNo].webPort; //摄像头web端口号
        const vendor = this.videoData[indexNo].vendor; //摄像头厂商类型
        let username; //摄像头账号
        let userpass; //摄像头密码
        /** 判断点击的是单双通道的哪种摄像头的哪种通道 获取其账号，密码，ip，是否定焦 ------开始------ */
        //单通道
        if(sensorType == 'single'){
          username = this.videoData[indexNo].sensorParameterList[0].userName;
          userpass = this.videoData[indexNo].sensorParameterList[0].userPass;
          this.sensorip = this.videoData[indexNo].sensorParameterList[0].sensorIP;
          this.focusyype = this.videoData[indexNo].sensorParameterList[0].focusType //是否定焦
        //双通道点击可见光
        }else if(sensorType == 'double' && paramType == '1'){ 
          this.sensorParameterList.forEach((item,i) => {
            if(item.connectionType == '1'){
              username = this.videoData[indexNo].sensorParameterList[i].userName;
              userpass = this.videoData[indexNo].sensorParameterList[i].userPass;
              this.sensorip = this.videoData[indexNo].sensorParameterList[i].sensorIP;
              this.focusyype = this.videoData[indexNo].sensorParameterList[i].focusType //是否定焦
            }else{
              return false;
            }
          });
        //双通道点击红外光
        }else if(sensorType == 'double' && paramType == '2'){ 
          this.sensorParameterList.forEach((item,i) => {
            if(item.connectionType == '2'){
              username = this.videoData[indexNo].sensorParameterList[i].userName;
              userpass = this.videoData[indexNo].sensorParameterList[i].userPass;
              this.sensorip = this.videoData[indexNo].sensorParameterList[i].sensorIP;
              this.focusyype = this.videoData[indexNo].sensorParameterList[i].focusType //是否定焦
            }else{
              return false;
            }
          });
        }else{
          return false;
        }
        /** 判断点击的是单双通道的哪种摄像头的哪种通道 获取其账号，密码，ip，是否定焦 ------结束------ */

        /**登录所要控制的摄像头 --开始-- */
        const paramSensor = getPostObjData('loginSensor', { 'sensorIp': this.sensorip, 'airPot': 8000, 'userName': username, 'password': userpass, 'webPort': webPort, 'manufacturer': vendor });
        this._getInfo({
          ops: paramSensor,
          method: 'post',
          api: 'loginSensor',
          callback: res => {
            var div = document.createElement('div');
            div.innerHTML = res;
            var rtspData = JSON.parse(div.querySelector('return').innerHTML);
          }
        });
        /**登录所要控制的摄像头 --结束-- */

        /**拼接rtsp播放地址 --开始--*/
        let rtsp = '';
        if(sensorType === 'double' && paramType =='1') { //可见光通道的rtsp
          rtsp = 'rtsp://' + username + ':' + userpass + '@' + this.sensorip + ':554/h264/ch1/main/av_stream'
        } else if(sensorType === 'double' && paramType =='2') { //红外通道的rtsp
          rtsp = 'rtsp://' + username + ':' + userpass + '@' + this.sensorip + ':554/h264/ch2/main/av_stream'
        } else {
          //单独 红外 或 可见光 或 激光 摄像头
          rtsp = 'rtsp://' + username + ':' + userpass + '@' + this.sensorip
        }
        /**拼接rtsp播放地址 --结束--*/

        //打开视频播放时的遮罩
        this.videoShow = true;
        //创建视频播放控件
        this.player = plus.video.createVideoPlayer('videoplayer', {
          src: rtsp,
          top: '0',
          left: '0px',
          width: '100%',
          height: '30%',
          position: 'absolute',
          showProgress: false,
          autoplay: true,//是否自动播放
          controls: true,//是否显示默认控件（暂停，播放，全屏）
        });
        setLoc('videoplayer', true);
        plus.webview.currentWebview().append(this.player);
        plus.key.addEventListener("backbutton", onBack => {
          if(!getLoc('videoplayer')) {
            this.videoShow = false;//关闭遮罩
            localStorage.removeItem('videoplayer');
            plus.key.removeEventListener("backbutton", onPlusReady);
          }
        });
      },

      //下拉刷新
      onRefresh() {
        setTimeout(() => {
          this.findVideoList();//重新刷新请求数据
          this.$toast('刷新成功');
          this.isLoading = false;
        }, 500);
      },

      /**控制摄像头转动 --开始-- */
      controlDBeg(val) {
        const paramControl = getPostObjData('eightDirectionTurn', { 'sensorIp': this.sensorip, 'direction': val, startOrStop: '0' });
        this._getInfo({
          ops: paramControl,
          method: 'post',
          api: 'eightDirectionTurn',
          callback: res => {
            var div = document.createElement('div');
            div.innerHTML = res;
            var rtspData = JSON.parse(div.querySelector('return').innerHTML);
          }
        });
      },
      /**控制摄像头转动 --结束-- */

      /**控制摄像头停止转动 --开始-- */
      controlDEnd(val) {
        const paramControl = getPostObjData('eightDirectionTurn', { 'sensorIp': this.sensorip, 'direction': val, startOrStop: '1' });
        this._getInfo({
          ops: paramControl,
          method: 'post',
          api: 'eightDirectionTurn',
          callback: res => {
            var div = document.createElement('div');
            div.innerHTML = res;
            var rtspData = JSON.parse(div.querySelector('return').innerHTML);
          }
        });
      },
      /**控制摄像头停止转动 --结束-- */

      /**控制摄像头变倍 --开始-- */
      controlZoomBeg(val) {
        const paramZoom = getPostObjData('zoom', { 'sensorIp': this.sensorip, 'zoomCommand': val, startOrStop: '0' });
        this._getInfo({
          ops: paramZoom,
          method: 'post',
          api: 'zoom',
          callback: res => {
            var div = document.createElement('div');
            div.innerHTML = res;
            var rtspData = JSON.parse(div.querySelector('return').innerHTML);
          }
        });
      },
      /**控制摄像头变倍 --结束-- */

      /**控制摄像头停止变倍 --开始-- */
      controlZoomEnd(val) {
        const paramZoom = getPostObjData('zoom', { 'sensorIp': this.sensorip, 'zoomCommand': val, startOrStop: '1' });
        this._getInfo({
          ops: paramZoom,
          method: 'post',
          api: 'zoom',
          callback: res => {
            var div = document.createElement('div');
            div.innerHTML = res;
            var rtspData = JSON.parse(div.querySelector('return').innerHTML);
          }
        });
      },
      /**控制摄像头停止变倍 --结束-- */

      /**控制摄像头变焦 --开始-- */
      controlFocusBeg(val) {
        const paramFocus = getPostObjData('focus', { 'sensorIp': this.sensorip, 'focusCommand': val, startOrStop: '0' });
        this._getInfo({
          ops: paramFocus,
          method: 'post',
          api: 'focus',
          callback: res => {
            var div = document.createElement('div');
            div.innerHTML = res;
            var rtspData = JSON.parse(div.querySelector('return').innerHTML);
          }
        });
      },
      /**控制摄像头变焦 --结束-- */

      /**控制摄像头退出变焦 --开始-- */
      controlFocusEnd(val) {
        const paramFocus = getPostObjData('focus', { 'sensorIp': this.sensorip, 'focusCommand': val, startOrStop: '1' });
        this._getInfo({
          ops: paramFocus,
          method: 'post',
          api: 'focus',
          callback: res => {
            var div = document.createElement('div');
            div.innerHTML = res;
            var rtspData = JSON.parse(div.querySelector('return').innerHTML);
          }
        });
      }
      /**控制摄像头退出变焦 --结束-- */
    }
  };
</script>
<style lang="less">
  .video-main {
    background-color: #f0f0f0;
    .header {
      .van-nav-bar {
        position: fixed;
        top: 0;
        left: 0;
        right: 0;
      }
    }
    .van-popup--bottom {
      background-color: rgb(237, 237, 237);
      .arrow-divider {
        margin: 0.25rem 0.3rem;
        padding-right: 1rem;
        text-align: center;
        border: 1px solid #999;
        border-radius: 5px;
        box-shadow: 0 0 1px 0.3px rgb(237, 237, 237);
        img {
          width: 0.6rem;
          height: 0.6rem;
          margin: 0.15rem;
        }
        span {
          line-height: 0.9rem;
          font-size: 0.5rem;
        }
      }
      .arrow-Arr {
        width: 100%;
        padding: 5px;
        border-radius: 25px 25px 0 0;
        .zoom {
          height: 1.2rem;
        }
        .controlAll {
          margin: 0 auto;
          background-image: url("../../assets/control/controlAll.png");
          background-repeat: no-repeat;
          background-size: cover;
          height: 4rem;
          width: 4rem;
          img {
            height: 0.5rem;
            width: 0.5rem;
          }
          .left-up {
            position: relative;
            top: 0.8rem;
            right: 0.5rem;
          }
          .up {
            position: relative;
            top: 0.4rem;
          }
          .right-up {
            position: relative;
            top: 0.8rem;
            left: 0.5rem;
          }
          .left {
            position: relative;
            top: 1.25rem;
            right: 0.8rem;
          }
          .center {
            position: relative;
            top: 1.25rem;
          }
          .right {
            position: relative;
            top: 1.25rem;
            left: 0.8rem;
          }
          .left-down {
            position: relative;
            top: 1.7rem;
            right: 0.5rem;
          }
          .down {
            position: relative;
            top: 2.1rem;
          }
          .right-down {
            position: relative;
            top: 1.7rem;
            left: 0.5rem;
          }
        }
      }
    }
    .van-pull-refresh {
      min-height: calc(100vh - 2.6rem);
      .van-list {
        margin-bottom: 46px;
        overflow-y: auto;
        .van-cell {
          border: 0.02333rem solid #e5e5e5;
          border-radius: 4px;
          margin: 0.2rem 0.35rem;
          width: 90%;
          .van-cell__title {
            max-width: 70%;
            min-width: 70%;
            text-align: left;
            .van-divider {
              margin: 0.1rem;
            }
            span {
              display: inline-block;
              vertical-align: top;
              text-align: left;
              max-width: 100%;
              word-wrap: break-word;
            }
            .video-text {
              font-size: 0.26rem;
              line-height: 0.5rem;
              color: #8e8e93;
            }
          }
          .van-cell__value {
            display: flex;
            align-items: center; //垂直居中
            justify-content: flex-end; //水平居尾
            img {
              width: 0.7rem;
              margin-left: 0.1rem;
            }
          }
        }
      }
    }
  }
</style>