<template>
  <div class="setting">
    <div class="admin">
      <img src="../assets/user/user.png" alt="" />
      <div class="userInfo">
        <span class="realName">{{ userInfo.realName }}</span>
        <br />
        <span class="number">账号:{{ userInfo.phone }}</span>
      </div>
    </div>
    <div class="content">
      <div class="user">
        <ul>
          <li>
            <span class="icon">
              <img src="../assets/user/name.png" alt="" />
            </span>
              <span class="t-left">公司名称</span>
              <span class="t-right">{{ userInfo.departmentName }}</span>
          </li>
          <van-divider />
          <li>
            <span class="icon">
              <img src="../assets/user/role.png" alt="" />
            </span>
              <span class="t-left">角色</span>
              <span
                v-if="roles.toString().length < 17"
                class="t-right"
                style="width:69%;float: none;display: inline-block;"
              >{{ roles.toString() }}</span>
              <span
                class="line"
                v-else
              >{{ roles.toString() }}</span>
          </li>
          <van-divider />
          <li>
            <span class="icon">
              <img src="../assets/user/version.png" alt="" />
            </span>
              <span class="t-left">版本号</span>
              <span class="t-right">{{ version }}</span>
          </li>
          <van-divider />
          <li @click="toChangePassword">
            <span class="icon">
              <img src="../assets/changePassword.png" alt="" />
            </span>
              <span class="t-left">修改密码</span>
              <span class="t-right">
                <van-icon
                  name="arrow"
                  style="top:0;"
                />
              </span>
          </li>
          <van-divider />
        </ul>
      </div>
    </div>
    <div
      class="footer"
      @click="changeUserFn"
    >
      退出
    </div>
  </div>
</template>

<script>
  import { getParams, setLoc, getLoc } from "@/utils/common.js";
  import { Toast, Dialog } from "vant";
  import { mapMutations, mapState } from 'vuex';
  export default {
    data() {
      //这里存放数据
      return {
        title: "设置",
        show: false,
        version: '',
        roles: []
      };
    },
    props: [],
    //监听属性 类似于data概念
    computed: {
      ...mapState(['userInfo', 'xxgStatus'])
    },
    //监控data中的数据变化
    watch: {},
    //生命周期 - 创建完成（可以访问当前this实例）
    created() {
      this.version = localStorage.getItem('version');
      this.roles = getLoc('userRoles');
    },
    //生命周期 - 挂载完成（可以访问DOM元素）
    mounted() { },
    //方法集合
    methods: {
      ...mapMutations(['_warningNum', '_dispatchpoliceNum', '_handlingFaultNum', '_foundFaultNum']),
      changeUserFn() {
        //判断角色里是否有巡线工并且有巡线任务在执行，则给出提示
        if(this.roles.includes('巡线工') && this.xxgStatus == 'start') {
          Dialog.confirm({
            title: '提示',
            message: '有巡线任务未完成，确认退出吗？',
          })
            .then(() => {
              // on confirm
              console.log('确认');
              this.$emit("changeUserFn");
              this._warningNum(null);
              this._dispatchpoliceNum(null);
              this._handlingFaultNum(null);
              this._foundFaultNum(null);
              setLoc('moduleAu', []);
              this.getNoticeWS.ws.send('注销登录');//断开websocket连接
              plus.push.clear();//清空所有推送消息
            })
            .catch(() => {
              // on cancel
              console.log('取消');
              return false;
            })
        } else {
          this.$emit("changeUserFn");
          this._warningNum(null);
          this._dispatchpoliceNum(null);
          this._handlingFaultNum(null);
          this._foundFaultNum(null);
          this.getNoticeWS.ws.send('注销登录');//断开websocket连接
          plus.push.clear();//清空所有推送消息
          setLoc('moduleAu', []);
        }
      },
      toChangePassword() {
        this.$router.push("/changePassword");
      }
    }
  }
</script>
<style lang='less' scoped>
  .admin {
    background: #fff;
    padding: 0.454rem 0.206rem;
    display: flex;
    align-items: center;
    img {
      width: 1rem;
      margin-right: 0.206rem;
    }
    .userInfo {
      text-align: left;
      .realName {
        font-size: 0.32rem;
        line-height: 0.45rem;
      }
      .number {
        color: #8e8e93;
        font-size: 0.26rem;
        line-height: 0.5rem;
      }
    }
  }
  .setting {
    .content {
      width: 100%;
      height: 100%;
      background: #fff;
      margin-top: 0.3rem;
      .user {
        font-size: 0.3rem;
        li {
          height: 1rem;
          line-height: 1rem;
          padding: 0 0.2rem;
          .line {
            line-height: 0.5rem !important;
            float: right;
            width: 69%;
            font-size: 0.28rem;
            color: #9a9a9c;
            text-align: left;
          }
          .icon {
            width: 10%;
            float: left;
            img {
              vertical-align: baseline;
              width: 0.27rem;
            }
          }
          .t-left {
            width: 21%;
            float: left;
            text-align: left;
            font-size: 0.32rem;
            padding-left: 0.2rem;
          }
          .t-right {
            width: 69%;
            float: right;
            text-align: right;
            font-size: 0.28rem;
            color: #9a9a9c;
            overflow: hidden;
            text-overflow: ellipsis;
            white-space: nowrap;
          }
        }
      }
    }
    .footer {
      margin-top: 0.3rem;
      height: 1rem;
      line-height: 1rem;
      font-size: 0.32rem;
      background: #fff;
    }
    .footer:active {
      background-color: #eaeaea;
    }
  }
</style>
<style>
  .setting .van-divider {
    line-height: auto !important;
    margin: 0 !important;
  }
</style>