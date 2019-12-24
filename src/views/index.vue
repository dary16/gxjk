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
              v-for="(data, index) in datalist"
              :key="data.value"
              :class="data.class"
              @click="toList(data.value)"
            >
              <div>
                <span class="img"></span>
                <span class="icon">
                  <em>{{ data.newMsg }}</em>
                </span>
                <div class="text">
                  <span class="title1">{{ data.name }}</span><br />
                  <span class="title2">{{ data.title }}</span>
                </div>
              </div>
            </li>
            <li class="kfz">
              <div>
                <span class="img"></span>
                <span class="icon">
                  <em>...</em>
                </span>
                <div class="text">
                  <span class="title1">模块开发中</span><br />
                  <span class="title2">功能开发中，敬请期待</span>
                </div>
              </div>
            </li>
          </ul>
          <!-- <van-grid :column-num="2">
        <van-grid-item
          v-for="data in datalist"
          :key="data.value"
          icon="photo-o"
          :text="data.name"
          @click="toList(data.value)"
        />
      </van-grid> -->
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
        datalist: []
      };
    },
    computed: {},
    created() {
      this.getUserRole();
      for(var i = 0; i < this.datalist.length; i++) {
        this.getNewMsgLength(this.datalist[i]);
      }
      localStorage.setItem('showSetting', false);
      this.showSetting = eval(localStorage.getItem('showSetting'));
    },
    mounted() { },
    beforeDestroy() {
      clearInterval(this.timeout);
    },
    watch: {
      datalist(newValue, oldValue) {
        for(var i = 0; i < newValue.length; i++) {
          this.getNewMsgLength(newValue[i]);
        }
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
        this.getRoles();
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
            console.log(roleArr);
            setLoc('userRoles', roleArr);
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
              this.datalist.push({ num: 1, name: '监控派警', title: '跟踪告警地点结果反馈', value: 'dispatchPolice', newMsg: 0, class: 'jkpj' });
              //角色里显示巡线工
              let role = getLoc('userRoles');
              if(role.indexOf('巡线工') < 0) {
                role.push('巡线工');
              }
              setLoc('userRoles', role);
              var obj = {};
              this.datalist = this.datalist.reduce(function(item, next) {
                obj[next.num] ? '' : (obj[next.num] = true && item.push(next));
                return item;
              }, []);
            }
            //处理巡线工和运维管理员，都可以查看告警
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
              this.datalist.push({ num: 0, name: '系统告警', title: '查看系统实时告警', value: 'systemWarning', newMsg: 0, class: 'xtgj' });
              this.datalist.push({ num: 4, name: '统计图表', title: '查看实时告警图表', value: 'charts', newMsg: '...', class: 'gjtj' });
            }
            var obj = {};
            this.datalist = this.datalist.reduce(function(item, next) {
              obj[next.num] ? '' : (obj[next.num] = true && item.push(next));
              return item;
            }, []);
            this.datalist.sort(this.compare('num'));
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
                this.datalist.push({ num: 3, name: '设备故障(操作)', title: '查看设备故障处理状态', value: 'foundFault', newMsg: 0, class: 'sbgz2' });
              }
              if(str === '传感器故障管理') {
                this.datalist.push({ num: 2, name: '设备故障(运维)', title: '查看设备故障处理状态', value: 'handlingFault', newMsg: 0, class: 'sbgz' });
              }
            }
            var obj = {};
            //排序
            this.datalist = this.datalist.reduce(function(item, next) {
              obj[next.num] ? '' : (obj[next.num] = true && item.push(next));
              return item;
            }, []);
            this.datalist.sort(this.compare('num'));

            this.showLoading = false;
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
        this.$router.push({ name: val, params: { show: false } });
        this._activeIndex(0);
      },
      // 设置
      toSetting() {
        this.showSetting = true;
        localStorage.setItem('showSetting', true);
      },
      //切换账号
      changeUserFn() {
        // 清除获取各个模块未处理消息的条数的接口
        clearInterval(this.timeout);
        setLoc('userInfo', '');
        this.$router.push('/login');
      },
      // 隐藏设置页面
      hideSetting() {
        this.showSetting = false;
        localStorage.setItem('showSetting', false);
      },
      //统计未处理消息数
      getNewMsgLength(obj) {
        let api = '';
        let arr = '';
        if(obj.value == 'systemWarning') {
          api = 'findWarningList';
          arr = [getLoc('userInfo').userID, '未处理', 1, 1];
        } else if(obj.value == 'handlingFault') {
          api = 'findSensorFaultInfo';
          arr = { userID: getLoc('userInfo').userID, statuses: '已上报,已接收', pageNum: 1, pageSize: 1 };
        } else if(obj.value == 'foundFault') {
          api = 'findSensorFaultInfo';
          arr = { userID: getLoc('userInfo').userID, statuses: '已上报,已接收', pageNum: 1, pageSize: 1 };
        } else if(obj.value == 'foundFault') {
        } else if(obj.value == 'dispatchPolice') {
          api = 'findDispatchPolice';
          arr = [getLoc('userInfo').userID, '已派警,处理中', 1, 1];
        } else if(obj.value == 'charts') {
          return;
        }
        const params = getPostData(api, arr);
        this._getInfo({
          ops: params,
          method: 'post',
          api: api,
          callback: res => {
            var div = document.createElement('div');
            div.innerHTML = res;
            let data = JSON.parse(div.querySelector('return').innerHTML);
            obj.newMsg = data.total;
            if(obj.newMsg > 99) {
              obj.newMsg = '99+';
            }
          }
        });
      }
    },
    updated() { }
  };
</script>

<style lang="less" scoped>
  .bg-gray {
    position: absolute;
    top: 0;
    bottom: 0;
    left: 0;
    width: 100%;
    background-color: #f3f3f3;
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
        margin: 0.224rem;
        li {
          width: 43%;
          float: left;
          margin: 0.224rem;
          user-select: none;
          &.xtgj {
            background-color: #72a0fc;
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
            background: #72cafc;
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
          &.sbgz2 {
            background: #67d6cf;
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
            background: #96ceb9;
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
          &.kfz {
            background: #dde1e3;
            border-radius: 0.12rem;
            span.img {
              float: left;
              width: 0.915rem;
              height: 0.842rem;
              background: url("../assets/main/develop.png") 100% 100%;
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
