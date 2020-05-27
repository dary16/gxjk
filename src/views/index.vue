<template>
  <div class="bg-gray">
    <v-header
      :title="title"
      :isShow="isShow"
      :gohome="gohome"
      v-show="showSetting"
      v-on:hideSetting="hideSetting"
    ></v-header>
    <router-view />

    <v-setting
      v-if="showSetting"
      v-on:changeUserFn="changeUserFn"
    ></v-setting>
    <div
      class="about"
      v-else
    >
      <div class="main_header">
        <img src="../assets/main/user.png" alt="" @click="toSetting()" />
            </div>
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
          <ul class="clearfix">
            <li
              v-for="data in datalist"
              :key="data.value"
              :class="data.class"
              @click="toList(data.value)"
            >
              <div>
                <span class="img"></span>
                <span
                  class="icon"
                  v-if="data.isVisible"
                >
                  <em v-if="data.isVisible && data.newMsg>99">99+</em>
                  <em v-else-if="data.isVisible">{{ data.newMsg }}</em>
                  <em v-else></em>
                </span>
                <span
                  class="icon-no"
                  v-else
                >
                  <em></em>
                </span>
              </div>
              <div class="text">
                <span class="title1">{{ data.name }}</span><br />
                <span class="title2">{{ data.title }}</span>
              </div>
            </li>
          </ul>
          <span style="display:none;">{{totalMsg}}</span>
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
      return {
        title: '个人中心',
        showSetting: false,
        isShow: 'index',
        showLoading: true,
        gohome: true,
        serverTime: '',
        datalist: [],
        searchFaultNum: 0 //暂时测试用
      };
    },
    created() {
      this.getUserRole();
      localStorage.setItem('showSetting', false);
      this.showSetting = eval(localStorage.getItem('showSetting'));
    },
    updated() {
      let modeo = []
      this.datalist.forEach(item => {
        modeo.push(item.name)
      });
      setLoc('moduleAu', modeo);
    },
    beforeDestroy() {
      clearInterval(this.timeout);
    },
    watch: {
      //监听告警未处理数
      warningNum(newValue, oldValue) {
        this.datalist.forEach(item => {
          if(item.value === 'systemWarning') {
            item.newMsg = newValue
          }
        });
      },
      //监听派警未处理数
      dispatchpoliceNum(newValue, oldValue) {
        this.datalist.forEach(item => {
          if(item.value === 'dispatchPolice') {
            item.newMsg = newValue
          }
        });
      },
      //监听设备故障（运维）未处理数
      handlingFaultNum(newValue, oldValue) {
        this.datalist.forEach(item => {
          if(item.value === 'handlingFault') {
            item.newMsg = newValue
          }
        });
      },
      //监听设备故障（操作）未处理数
      foundFaultNum(newValue, oldValue) {
        this.datalist.forEach(item => {
          if(item.value === 'foundFault') {
            item.newMsg = newValue
          }
        });
      },
      //监听总数
      totalMsg(newValue, oldValue) {
        this.getNewMsg();
      },
    },
    computed: {
      ...mapState(['warningNum', 'dispatchpoliceNum', 'handlingFaultNum', 'foundFaultNum']),
      totalMsg() {
        return this.warningNum + this.dispatchpoliceNum + this.handlingFaultNum + this.foundFaultNum;
      }
    },
    methods: {
      ...mapMutations(['_userInfo', '_userRole', '_activeIndex', '_isRefresh']),
      ...mapActions(['_getInfo']),
      //获取角色权限模块
      getUserRole() {
        this.datalist = [];
        this.checkIsPatrolman();
        this.checkIsPermission([getLoc('userInfo').userID, '智慧监控平台', '故障信息管理', '上报故障并确认修复'], '上报故障并确认修复');
        this.checkIsPermission([getLoc('userInfo').userID, '基础数据平台', '基础数据', '传感器故障管理'], '传感器故障管理');
        this.checkIsPermission([getLoc('userInfo').userID, '智慧监控平台', '故障信息管理', '查询全部故障信息'], '查询全部故障信息');
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
              this.datalist.push({ num: 2, name: '监控派警', title: '跟踪告警地点结果反馈', value: 'dispatchPolice', newMsg: this.dispatchpoliceNum, class: 'jkpj', isVisible: true });
              this.datalist.push({ num: 7, name: '巡线打卡', title: '巡线轨迹记录', value: 'patrolPunch', newMsg: null, class: 'xxdk', isVisible: false });
              //角色里显示巡线工
              let role = getLoc('userRoles');
              if(role.indexOf('巡线工') < 0) {
                role.push('巡线工');
              }
              setLoc('userRoles', role);
              var obj = {};
              this.datalist = this.datalist.reduce((item, next) => {
                obj[next.num] ? '' : (obj[next.num] = true && item.push(next));
                return item;
              }, []);
            }
            //处理巡线工和运维管理员，不可以查看告警
            let rolename = getLoc('userRoles');
            let isShowWarning = 0;
            for(let i = 0; i < rolename.length; i++) {
              if(rolename.length == 1) {
                if(rolename[i] == '运维管理员' || rolename[i] == '巡线工') {
                  isShowWarning = 2;
                }
              } else if(rolename.length == 2) {
                if(rolename[i] == '运维管理员' || rolename[i] == '巡线工') {
                  isShowWarning++;
                }
              }
            }

            if(isShowWarning != 2) {
              //是否有处理告警权限
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
                    //视频监控
                    this.datalist.push({ num: 0, name: '视频监控', title: '查看视频监控', value: 'surveillanceVideo', newMsg: 0, class: 'spjk', isVisible: false });
                    this.datalist.push({ num: 1, name: '系统告警', title: '查看系统实时告警', value: 'systemWarning', newMsg: this.warningNum, class: 'xtgj', isVisible: true });
                    this.datalist.push({ num: 5, name: '统计图表', title: '查看实时告警图表', value: 'charts', newMsg: '...', class: 'gjtj', isVisible: false });
                  } else {
                    //视频监控
                    this.datalist.push({ num: 0, name: '视频监控', title: '查看视频监控', value: 'surveillanceVideo', newMsg: 0, class: 'spjk', isVisible: false });
                    this.datalist.push({ num: 1, name: '系统告警', title: '查看系统实时告警', value: 'systemWarning', newMsg: this.warningNum, class: 'xtgj', isVisible: false });
                    this.datalist.push({ num: 5, name: '统计图表', title: '查看实时告警图表', value: 'charts', newMsg: '...', class: 'gjtj', isVisible: false });
                  }
                  var obj = {};
                  this.datalist = this.datalist.reduce((item, next) => {
                    obj[next.num] ? '' : (obj[next.num] = true && item.push(next));
                    return item;
                  }, []);
                  this.datalist.sort(this.compare('num'));
                  this.datalist.forEach(item => {
                    this.getVideoNum(item);
                  });
                }
              })
            }
          }
        });
      },
      //资源权限判断
      checkIsPermission(arr, str) {
        //提交数据
        const params = getPostData('isPermission', arr);
        this._getInfo({
          ops: params,
          method: 'post',
          api: 'isPermission',
          callback: res => {
            var div = document.createElement('div');
            div.innerHTML = res;
            var bool = div.querySelector('return').innerHTML;
            if(bool == 'true') {
              if(str === '上报故障并确认修复') {
                this.datalist.push({ num: 4, name: '设备故障(操作)', title: '查看设备故障处理状态', value: 'foundFault', newMsg: this.foundFaultNum, class: 'sbgz2', isVisible: true });
              }
              if(str === '传感器故障管理') {
                this.datalist.push({ num: 3, name: '设备故障(运维)', title: '查看设备故障处理状态', value: 'handlingFault', newMsg: this.handlingFaultNum, class: 'sbgz', isVisible: true });
              }
              if(str === '查询全部故障信息') {
                this.datalist.push({ num: 6, name: '故障查询', title: '查看设备故障列表', value: 'searchFault', newMsg: 0, class: 'cxgz', isVisible: false });
              }
            }
            var obj = {};
            //排序
            this.datalist = this.datalist.reduce((item, next) => {
              obj[next.num] ? '' : (obj[next.num] = true && item.push(next));
              return item;
            }, []);
            this.datalist.sort(this.compare('num'));

            this.showLoading = false;
          }
        });
      },
      //获取新消息
      getNewMsg() {
        let id = getLoc('userInfo').userID;
        const params = getPostData('getAllUntreatedInfoNum', [id]);

        this._getInfo({
          ops: params,
          method: 'post',
          api: 'getAllUntreatedInfoNum',
          callback: res => {
            var div = document.createElement('div');
            div.innerHTML = res;
            var listInfoData = div.querySelector('return').innerHTML;
            let result = JSON.parse(listInfoData);

            //判断缓存里是否是第一次登录
            if(getLoc('firstNum')) {
              let firstNum = getLoc('firstNum');
              //判断数量是否有变化
              if(result == firstNum) {
                setLoc('firstNum', result);
                if(window.plus) {
                  plus.runtime.setBadgeNumber(result, {
                    title: '新消息',
                    content: '您有' + result + '条未读消息'
                  });
                }
                // plus.push.createMessage('您有' + result + '条未读消息', 'test', {
                //   title: '新消息',
                //   sound: 'system',
                //   cover: true
                // });
              } else {
                //判断返回值是否大于0
                if(result > 0) {
                  //变则替换新数据
                  setLoc('firstNum', result);
                  if(window.plus) {
                    if(result > 99) {
                      plus.runtime.setBadgeNumber(99, {
                        title: '新消息',
                        content: '您有' + result + '条未读消息'
                      });
                    } else {
                      plus.runtime.setBadgeNumber(result, {
                        title: '新消息',
                        content: '您有' + result + '条未读消息'
                      });
                    }
                    // plus.push.createMessage('您有' + result + '条未读消息', 'test', {
                    //   title: '新消息',
                    //   sound: 'system',
                    //   cover: true
                    // });
                  }
                }
              }
            } else {
              //第一次登录
              setLoc('firstNum', result);
              if(window.plus) {
                plus.runtime.setBadgeNumber(result, {
                  title: '新消息',
                  content: '您有' + result + '条未读消息'
                });
                // plus.push.createMessage('您有' + result + '条未读消息', 'test', {
                //   title: '新消息',
                //   sound: 'system',
                //   cover: true
                // });
              }
            }
          }
        });
      },
      //排序
      compare(property) {
        return function(a, b) {
          var value1 = a[property];
          var value2 = b[property];
          return value1 - value2;
        };
      },
      //跳转列表
      toList(val) {
        this._userRole({ type: val });
        // console.log(val);
        this.$router.push({ name: val, params: { show: false } });
        this._activeIndex(0);
      },
      // 设置
      toSetting() {
        this.showSetting = true;
        localStorage.setItem('showSetting', true);
        plus.key.addEventListener("backbutton", onBack => {
          if(this.showSetting) {
            this.showSetting = false;//关闭设置
            plus.key.removeEventListener("backbutton", onPlusReady);
          }
        });
      },
      //切换账号
      changeUserFn() {
        // 清除获取各个模块未处理消息的条数的接口
        clearInterval(this.timeout);
        setLoc('userInfo', '');
        setLoc('dispatchId', '');
        setLoc('currentUser', '');
        setLoc('firstNum', 0);
        this.$router.push('/login');
      },
      // 隐藏设置页面
      hideSetting() {
        this.showSetting = false;
        localStorage.setItem('showSetting', false);
      },
      //统计视频列表数
      getVideoNum(obj) {
        let api = '';
        let arr = '';
        if(obj.value == 'surveillanceVideo') {
          api = 'findSensorList';
          arr = [];
          const params = getPostData(api, arr);
          this._getInfo({
            ops: params,
            method: 'post',
            api: api,
            callback: res => {
              var div = document.createElement('div');
              div.innerHTML = res;
              let data = JSON.parse(div.querySelector('return').innerHTML);
              obj.newMsg = data.length;
            }
          });
        }
      }
    },
  };
</script>

<style lang="less" scoped>
  .bg-gray {
    // position: absolute;
    // top: 0;
    // bottom: 0;
    // left: 0;
    width: 100%;
    background-color: #f3f3f3;
    min-height: 100vh;
  }
  .about {
    .main_header {
      background: url("../assets/main/header_bg.png") 100% 100%;
      width: 100%;
      height: 3.4rem;
      background-size: 100% 100%;
      position: relative;
      img {
        position: absolute;
        top: 0.11rem;
        right: 0.21rem;
        width: 0.6rem;
      }
    }
    .content {
      ul {
        padding: 0.224rem;
        li {
          width: 43%;
          float: left;
          margin: 0.224rem;
          user-select: none;
          height: 2.56rem;
          &.xtgj {
            background-color: #73cbfd;
            border-radius: 0.12rem;
            span.img {
              float: left;
              width: 0.915rem;
              height: 0.842rem;
              background: url("../assets/main/role1.png") 100% 100%;
              background-size: 100% 100%;
              margin: 0.23rem 0.32rem;
            }
          }
          &.sbgz {
            background: #67d6cf;
            border-radius: 0.12rem;
            span.img {
              float: left;
              width: 0.915rem;
              height: 0.842rem;
              background: url("../assets/main/role2.png") 100% 100%;
              background-size: 100% 100%;
              margin: 0.23rem 0.32rem;
            }
          }
          &.cxgz {
            background: #4aa7dc;
            border-radius: 0.12rem;
            span.img {
              float: left;
              width: 0.915rem;
              height: 0.842rem;
              background: url("../assets/main/checkFault.png") 100% 100%;
              background-size: 100% 100%;
              margin: 0.23rem 0.32rem;
            }
          }
          &.sbgz2 {
            background: #65b1ff;
            border-radius: 0.12rem;
            span.img {
              float: left;
              width: 0.915rem;
              height: 0.842rem;
              background: url("../assets/main/foundFault01.png") 100% 100%;
              background-size: 100% 100%;
              margin: 0.23rem 0.32rem;
            }
          }
          &.jkpj {
            background: #66d6a0;
            border-radius: 0.12rem;
            span.img {
              float: left;
              width: 0.915rem;
              height: 0.842rem;
              background: url("../assets/main/role3.png") 100% 100%;
              background-size: 100% 100%;
              margin: 0.23rem 0.32rem;
            }
          }
          &.gjtj {
            background: #f0bf85;
            border-radius: 0.12rem;
            span.img {
              float: left;
              width: 0.915rem;
              height: 0.842rem;
              background: url("../assets/main/role4.png") 100% 100%;
              background-size: 100% 100%;
              margin: 0.23rem 0.32rem;
            }
          }
          &.spjk {
            background: #73a0fd;
            border-radius: 0.12rem;
            span.img {
              float: left;
              width: 0.915rem;
              height: 0.842rem;
              background: url("../assets/main/role5.png") 100% 100%;
              background-size: 100% 100%;
              margin: 0.23rem 0.32rem;
            }
          }
          &.xxdk {
            background-color: #34a08b;
            border-radius: 0.12rem;
            span.img {
              float: left;
              width: 0.915rem;
              height: 0.842rem;
              background: url("../assets/main/addressMarker.png") 100% 100%;
              background-size: 100% 100%;
              margin: 0.23rem 0.32rem;
            }
          }

          .icon {
            width: 0.66rem;
            height: 0.66rem;
            background: rgba(255, 255, 255, 0.3);
            display: inline-block;
            border-radius: 0.33rem;
            margin: 0.21rem;
            em {
              font-size: 0.4rem;
              font-style: normal;
              height: 0.66rem;
              line-height: 0.66rem;
              color: #fff;
            }
          }
          .icon-no {
            width: 0.66rem;
            height: 0.6rem;
            background: rgba(255, 255, 255, 0);
            display: inline-block;
            border-radius: 0.33rem;
            margin: 0.21rem;
            em {
              font-size: 0.4rem;
              font-style: normal;
              height: 0.66rem;
              line-height: 0.66rem;
              color: #fff;
            }
          }
          .text {
            margin: 0.33rem 0.3rem;
            text-align: left;
            .title1 {
              font-size: 0.363rem;
              color: #fff;
            }
            .title2 {
              font-size: 0.236rem;
              color: #f0f3f2;
            }
          }
        }
        li:active {
          box-shadow: 1px 1px 2px 1px #d6d6d6;
        }
      }
    }
  }
</style>
