<template>
  <div class="login">
    <div class="user">
      <van-cell-group>
        <van-field
          v-model="user.username"
          size="0.16rem"
          clearable
          placeholder="用户名"
          :right-icon="rightIcon"
          @click-right-icon="showSelctUser()"
        />
        <ul
          class="selectBox"
          v-show="isShowSelctUser"
        >
          <li
            v-for="item in userList"
            class="van-hairline--bottom"
          >
            <p @click="selectUser(item)">{{ item }}</p>
            <van-icon
              slot="right-icon"
              name="cross"
              style="line-height: inherit;"
              @click="clearUser(item)"
            />
          </li>
        </ul>
        <van-field
          v-model="user.password"
          type="password"
          placeholder="密码"
        />
      </van-cell-group>
      <van-button
        slot="button"
        size="normal"
        type="info"
        color="#6BAFFC"
        @click="loginFn"
        :disabled="isDisable"
      >登录{{ stoptime }}</van-button>
    </div>
    <van-popup
      v-model="isShowSelctUser"
      overlay-class="overlayClass"
      @click-overlay="showSelctUser()"
    />
  </div>

</template>

<script>
  import { getPostData, getParams, getLoc, setLoc } from '../utils/common.js';
  import { Toast, Dialog } from 'vant';
  import { mapActions, mapMutations, mapState } from 'vuex';
  import axios from 'axios';
  export default {
    data() {
      //这里存放数据
      return {
        title: '油气管线智慧监控平台',
        user: {
          username: '',
          password: ''
        },
        userList: [],
        rightIcon: 'arrow-down',
        isShowSelctUser: false,
        showDownload: false,
        downloadUrl: '',
        //android下载地址
        androidUrl: '',
        //ios下载地址
        iosUrl: '',
        isDisable: false,
        stoptime: '',
        updateContent: '1.优化部分样式' + '</br>' + '2.提升了一些用户体验',
        downloadFinish: false,
        version: ''
      };
    },
    //监听属性 类似于data概念
    computed: {
      ...mapState(['urlCasWsWeb', 'userInfo', 'saveName', 'usernameList', 'userRole', 'getSystemWarningTime', 'getHandlingFaultTime', 'getFoundFaultTime', 'getDispatchPoliceTime', 'warningNum'])
    },
    //生命周期 - 创建完成（可以访问当前this实例）
    created() {
      //安卓下载地址
      this.androidUrl = this.urlCasWsWeb.webUrl + '/download/downloadAPP?appType=Android',
        //ios下载地址
        this.iosUrl = 'itms-services://?action=download-manifest&url=' + this.urlCasWsWeb.webUrl + '/app/webGis_app.plist',
        this.version = localStorage.getItem('version');
      //   this.checkVersion();
      this.getUser();
      this.getServerTimeFn();
    },
    //方法集合
    methods: {
      ...mapMutations(['_userInfo', '_saveName', '_usernameList', '_userRole', '_warningNum', '_dispatchpoliceNum', '_handlingFaultNum', '_foundFaultNum']),
      ...mapActions(['_getInfo']),
      //获取未处理数
      getUndoneNum() {
        const apiData = [
          { api: 'findWarningList', arr: [getLoc('userInfo').userID, '未处理', 1, 1] },
          { api: 'findSensorFaultInfo', arr: { userID: getLoc('userInfo').userID, statuses: '已上报,已接收', pageNum: 1, pageSize: 1 } },
          { api: 'findSensorFaultInfo', arr: { userID: getLoc('userInfo').userID, statuses: '已处理', pageNum: 1, pageSize: 1 } },
          { api: 'findDispatchPolice', arr: [getLoc('userInfo').userID, '已派警,处理中', 1, 1] },
        ];
        for(let i = 0; i < apiData.length; i++) {
          const params = getPostData(apiData[i].api, apiData[i].arr);
          this._getInfo({
            ops: params,
            method: 'post',
            api: apiData[i].api,
            callback: res => {
              var div = document.createElement('div');
              div.innerHTML = res;
              let data = JSON.parse(div.querySelector('return').innerHTML);
              if(apiData[i].api == 'findWarningList') {
                this._warningNum(data.total);
              } else if(apiData[i].api == 'findSensorFaultInfo' && apiData[i].arr.statuses == '已上报,已接收') {
                this._handlingFaultNum(data.total);
              } else if(apiData[i].api == 'findSensorFaultInfo' && apiData[i].arr.statuses == '已处理') {
                this._foundFaultNum(data.total);
              } else if(apiData[i].api == 'findDispatchPolice') {
                this._dispatchpoliceNum(data.total);
              }
            }
          });
        }
      },
      //连接websocket
      getWS(clientID) {
        if("WebSocket" in window) {
          console.log("您的浏览器支持 WebSocket!!!!!");
          this.ws = new WebSocket(this.urlCasWsWeb.wsUrl + `/webSocketService?clientID=` + clientID);
          this.getNoticeWS.setWs(this.ws);
        } else {
          console.log("您的浏览器不支持 WebSocket!");
        }
      },
      //获取缓存用户信息
      getUser() {
        if(getLoc('currentUser')) {
          this.currentLoginFn();
        }
        if(getLoc('saveName')) {
          this.user.username = getLoc('saveName');
        }
        if(getLoc('usernameList')) {
          this.userList = getLoc('usernameList');
        }
      },
      //显示登陆过的用户列表
      showSelctUser() {
        if(this.rightIcon == 'arrow-up') {
          this.rightIcon = 'arrow-down';
          this.isShowSelctUser = false;
        } else {
          this.rightIcon = 'arrow-up';
          if(this.userList.length > 0) {
            this.isShowSelctUser = true;
          }
        }
      },
      selectUser(item) {
        this.user.username = item;
        this.showSelctUser();
      },
      clearUser(item) {
        var namelist = getLoc('usernameList');
        var index = namelist.indexOf(item);
        if(index > -1) {
          namelist.splice(index, 1);
        }
        this._usernameList(namelist);
        this.userList = namelist;
        if(getLoc('saveName') == item) {
          this._saveName('');
        }
        this.rightIcon = 'arrow-down';
        this.isShowSelctUser = false;
      },
      //获取服务器时间
      getServerTimeFn() {
        if(!getLoc('getSystemWarningTime') || getLoc('getSystemWarningTime') == null) {
          this.getServerTime('getSystemWarningTime');
        }
        if(!getLoc('getHandlingFaultTime') || getLoc('getHandlingFaultTime') == null) {
          this.getServerTime('getHandlingFaultTime');
        }
        if(!getLoc('getFoundFaultTime') || getLoc('getFoundFaultTime') == null) {
          this.getServerTime('getFoundFaultTime');
        }
        if(!getLoc('getDispatchPoliceTime') || getLoc('getDispatchPoliceTime') == null) {
          this.getServerTime('getDispatchPoliceTime');
        }
      },
      //获取服务器时间
      getServerTime(val) {
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
            if(val == 'getSystemWarningTime') {
              setLoc('getSystemWarningTime', this.serverTime);
            } else if(val == 'getHandlingFaultTime') {
              setLoc('getHandlingFaultTime', this.serverTime);
            } else if(val == 'getFoundFaultTime') {
              setLoc('getFoundFaultTime', this.serverTime);
            } else if(val == 'getDispatchPoliceTime') {
              setLoc('getDispatchPoliceTime', this.serverTime);
            }
          }
        });
      },
      //检测版本
      checkVersion() {
        let u = navigator.userAgent,
          app = navigator.appVersion;
        let isAndroid = u.indexOf('Android') > -1 || u.indexOf('Linux') > -1; //g
        let isIOS = !!u.match(/\(i[^;]+;( U;)? CPU.+Mac OS X/); //ios终端
        let systemType = '';
        if(isAndroid) {
          systemType = 'Android';
          this.downloadUrl = this.androidUrl;
        } else if(isIOS) {
          systemType = 'IOS';
          this.downloadUrl = this.iosUrl;
        }
        if(systemType != '') {
          const params = getPostData('getAPPLatestEdition', [systemType]);
          this.showDownload = true;
          this._getInfo({
            ops: params,
            method: 'post',
            api: 'getAPPLatestEdition',
            callback: res => {
              var div = document.createElement('div');
              div.innerHTML = res;
              var listInfoData = div.querySelector('return').innerHTML;
              let result = JSON.parse(listInfoData);
              if(localStorage.getItem('version') != result.stateMessage) {
                if(result.state !== 'success') {
                  return;
                }
                //手机上提示下载
                if(this.version) {
                  Dialog.confirm({
                    message: '发现新版本，请更新后使用。' + '<span style="display: block;text-align: left;font-size: 0.28rem;padding: 0.1rem;">当前版本：' + this.version + '</span>'
                  })
                    .then(() => {
                      if(systemType == 'Android') {
                        var dtask = plus.downloader.createDownload(this.downloadUrl, {}, function(d, status) {
                          if(status == 200) {
                            var path = d.filename;
                            this.downloadFinish = true;

                            plus.runtime.install(path);
                            plus.runtime.quit();
                            setLoc('updateState', true);
                          } else {
                            //下载失败
                            alert('下载失败: ' + status);
                          }
                        });
                        dtask.addEventListener('statechanged', (task, status) => {
                          if(!dtask) {
                            return;
                          }
                          switch(task.state) {
                            case 1:
                              //开始
                              Toast.loading({
                                message: '开始下载...',
                                forbidClick: true,
                                loadingType: 'spinner'
                              });
                              break;
                            case 2:
                              //已连接到服务器
                              Toast('连接到服务器...');
                              break;
                            case 3:
                              //已接收到数据
                              Toast.loading({
                                message: '正在下载...',
                                forbidClick: true,
                                loadingType: 'spinner'
                              });
                              var nowdata = Math.floor((task.downloadedSize * 100) / task.totalSize);
                              // alert(nowdata);
                              if(nowdata % 10 === 0) {
                                Toast('已下载：' + nowdata + '%');
                                if(nowdata === 100) {
                                  Toast('正在准备环境，请稍后!');
                                }
                              }
                              break;
                            case 4:
                              //下载完成
                              Toast.success('下载完成！');
                              break;
                          }
                        });
                        dtask.start();
                      } else {
                        plus.runtime.openURL(this.downloadUrl);
                      }
                    })
                    .catch(() => {
                      plus.runtime.quit();
                    });
                }
              } else {
                //版本号相同，则更新成功，提示更新内容
                if(getLoc('updateState')) {
                  //已下载提示更新内容
                  Dialog.alert({
                    title: '更新内容',
                    message: '<span style="display: block;text-align: left;font-size: 0.28rem;padding: 0.1rem;">当前版本：' + this.version + '</span>' + '<span style="display: block;text-align: left;font-size: 0.3rem;padding: 0.1rem;">' + this.updateContent + '</span>'
                  }).then(() => {
                    //修改缓存里的值
                    setLoc('updateState', false);
                  });
                }
              }
            }
          });
        }
      },
      currentLoginFn() {
        console.log(process.env.NODE_ENV);
        axios({
          method: 'post',
          //现场
          url: process.env.NODE_ENV == 'development' ? '/loginService/v1/tickets' : this.urlCasWsWeb.casUrl + '/v1/tickets',
          data: { username: getLoc('currentUser').username, password: getLoc('currentUser').password },
        }).then(
          res => {
            //判断是否通过cas登录
            if(res.status == '201') {
              this.getUndoneNum();
              //连接websocket
              this.getWS(getLoc('userInfo').userID);
              this.$router.push('/index');
            }
          }
        ).catch(
          err => {
            console.log(err);
          }
        );
      },
      loginFn() {
        //验证数据
        if(this.user.username == '' || this.user.password == '') {
          Toast({ position: 'bottom', message: '账号密码不能为空' });
          return false;
        }

        //通过cas登录
        axios({
          method: 'post',
          //现场
          url: process.env.NODE_ENV == 'development' ? '/loginService/v1/tickets' : this.urlCasWsWeb.casUrl + '/v1/tickets',
          data: { username: this.user.username, password: this.user.password },
        }).then(
          res => {
            if(res.status == '201') {
              const params = getPostData('getUserInfo', [this.user.username]);
              this._getInfo({
                ops: params,
                method: 'post',
                api: 'getUserInfo',
                callback: res => {
                  var div = document.createElement('div');
                  div.innerHTML = res;
                  var curUserinfo = JSON.parse(div.querySelector('return').innerHTML);
                  this._userInfo(curUserinfo);
                  //缓存当前用户名
                  this._saveName(this.user.username);
                  //缓存当前用户名和密码
                  setLoc('currentUser', { 'username': this.user.username, 'password': this.user.password });
                  //缓存历史用户
                  var namelist = [];
                  if(getLoc('usernameList') != null) {
                    namelist = getLoc('usernameList');
                  }
                  namelist.push(this.user.username);
                  //去掉缓存里的firstNum
                  if(getLoc('firstNum')) {
                    localStorage.removeItem('firstNum');
                  }
                  //去重后缓存
                  this._usernameList(Array.from(new Set(namelist)));
                  //连接websocket
                  this.getWS(getLoc('userInfo').userID);
                  //获取各个模块数据
                  this.getUndoneNum();
                  //跳转到首页
                  this.$router.push('/index');
                  this.getRoles();
                }
              });
            }
          }
        ).catch(
          error => {
            let statu = error.response.status;
            if(statu == '410') {
              Toast({ position: 'bottom', message: '用户名或密码不正确' });
            } else if(statu == '402') {
              Toast({ position: 'bottom', message: '该账号为弱密码，请立即修改密码' });
              const params = getPostData('getUserInfo', [this.user.username]);
              this._getInfo({
                ops: params,
                method: 'post',
                api: 'getUserInfo',
                callback: res => {
                  var div = document.createElement('div');
                  div.innerHTML = res;
                  var curUserinfo = JSON.parse(div.querySelector('return').innerHTML);
                  this._userInfo(curUserinfo);
                }
              })
              this.$router.push('/changePassword');
            } else if(statu == '403') {
              Toast({ position: 'bottom', message: '账号冻结' });
            } else if(statu == '404') {
              Toast({ position: 'bottom', message: '账号不存在' });
            } else if(statu == '423') {
              Toast({ position: 'bottom', message: '账号闲置锁定，请联系管理员激活账号' });
            } else if(statu == '500') {
              Toast({ position: 'bottom', message: '系统异常（获取系统参数时出错）' });
            } else {
              Toast(error);
            }
            this.user.password = '';
            this.isDisable = true;
            var num = 3;
            var loop = () => {
              this.stoptime = '(' + num + ')';
              if(num > 0) {
                num--;
                setTimeout(loop, 1000);
              } else {
                this.stoptime = '';
                this.isDisable = false;
              }
            };
            setTimeout(loop, 1);
          }
        )
      },
      //获取角色
      getRoles() {
        const params = getPostData('findUserRole', [getLoc('userInfo').userID]);
        this._getInfo({
          ops: params,
          method: 'post',
          api: 'findUserRole',
          callback: res => {
            var div = document.createElement('div');
            div.innerHTML = res;
            var roleArr = div.querySelector('return').innerHTML;
            setLoc('userRoles', roleArr);
          }
        });
      }
    }
  };
</script>
<style lang="less" scoped>
  .login {
    position: absolute;
    top: 0;
    right: 0;
    min-height: 100%;
    left: 0;
    bottom: 0;
    background: url(../assets/bg.png) no-repeat top;
    background-size: cover;
    .head {
      padding: 2.4rem 0 1rem;
      text-align: center;
      .logo {
        margin: 0 auto;
        background: url(../assets/logo.png) no-repeat;
        background-size: 100% auto;
        width: 3.7rem;
        height: 1.2rem;
        margin-bottom: 0.4rem;
      }

      h1 {
        font-size: 0.44rem;
        color: #fff;
        margin-bottom: 0.4rem;
      }
    }

    .user {
      width: 5rem;
      margin: 0 auto;
      position: absolute;
      left: 50%;
      top: 7rem;
      transform: translateX(-50%) translateY(-50%);
      z-index: 22;
      .van-hairline--top-bottom::after,
      .van-hairline-unset--top-bottom::after {
        display: none !important;
      }

      .van-cell-group {
        background-color: transparent;
        .van-cell {
          padding: 0.166667rem 0.05rem 0.16667rem 0.426667rem;
          border-radius: 0.05rem;
          font-size: 0.26rem;
        }
        .van-field {
          margin-bottom: 0.3rem;
        }
      }
    }

    .van-button {
      margin-top: 0.5rem;
      width: 5rem;
      letter-spacing: 0.2rem;
      height: 0.7rem;
      line-height: 0.7rem;
      background-color: #638bfa !important;
      font-size: 0.3rem;
    }
    .van-field__right-icon {
      padding: 0;
    }
    .selectBox {
      width: 100%;
      background-color: #fff;
      position: absolute;
      top: 0.62rem;
      border: 1px solid #ccc;
      z-index: 2211;
      border-radius: 0 0 3px 3px;
      li {
        height: 0.6rem;
        line-height: 0.6rem;
        p {
          float: left;
          width: 90%;
          text-align: left;
          padding-left: 15px;
          font-size: 10px;
        }
        .van-icon-cross {
          bottom: 0;
          height: 0.6rem;
          color: #999;
        }
      }
    }
  }
  .updateList {
    display: block;
    text-align: left;
    padding: 0.1rem;
    font-size: 0.3rem;
  }
</style>

<style>
  .overlayClass {
    background-color: rgba(0, 0, 0, 0);
    z-index: 11 !important;
  }
  .user .van-icon {
    position: relative;
    bottom: 0.25rem;
    height: 0.26rem;
  }
  .user .van-icon::before {
    font-size: 0.3rem;
  }
</style>
