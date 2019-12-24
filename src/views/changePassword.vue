<template>
  <div class="bg-gray">
    <v-header :title="title" :gohome="gohome" :isShow="isShow"></v-header>
    <div class="group1">
      <van-cell-group>
        <van-field
          v-model="oldPass"
          type="password"
          label="原密码"
          label-align="left"
          placeholder="填写原密码"
        />

        <van-field
          v-model="newPass"
          type="password"
          label="新密码"
          label-align="left"
          placeholder="填写新密码"
        />
        <van-field
          v-model="newPass1"
          type="password"
          label="确认密码"
          label-align="left"
          placeholder="再次填写确认"
        />
      </van-cell-group>
      <div class="btns" @click="checkPass">
        确认
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
        title: "修改密码",
        gohome: true,
        isShow: "",
        oldPass: '',
        newPass: '',
        newPass1: '',
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
    },
    //生命周期 - 挂载完成（可以访问DOM元素）
    mounted() {
    },
    //方法集合
    methods: {
      ...mapMutations(['_userInfo']),
      ...mapActions(['_getInfo']),

      checkPass() {
        if (this.oldPass == "") {
          Toast("原密码不能为空");
          return
        }
        //校验密码：只能输入6-20个字母、数字、下划线  

        var patrn = /^(\w){1,20}$/;
        if (!patrn.exec(this.newPass)) {
          Toast("只能输入20位以内的字母、数字、下划线 ");
          return false
        }
        if (this.newPass == "") {
          Toast("新密码不能为空");
          return
        }
        if (this.newPass != this.newPass1) {
          Toast("两次密码输入不一致");
          return
        }
        const params = getPostData("checkPassword", [getLoc('userInfo').phone, this.oldPass]);
        this._getInfo({
          ops: params,
          method: "post",
          api: "checkPassword",
          callback: res => {
            var div = document.createElement("div");
            div.innerHTML = res;
            let data = JSON.parse(div.querySelector("return").innerHTML);
            if (data.state == "success") {
              this.changePass();
            } else {
              Toast(data.stateMessage);
              return
            }
          }
        });
      },
      //判断是否有处理告警权限
      changePass() {
        //提交数据
        const params = getPostData("modifyPassword", [getLoc('userInfo').userID, this.newPass]);
        this._getInfo({
          ops: params,
          method: "post",
          api: "modifyPassword",
          callback: res => {
            var div = document.createElement("div");
            div.innerHTML = res;
            let data = JSON.parse(div.querySelector("return").innerHTML);
            if (data.state == "success") {
              Toast("密码修改成功,请重新登录");
              setLoc('userInfo', '');
              this.$router.push('/login');
            } else {
              Toast(data.stateMessage);
              return
            }

          }
        });
      },
    },
    updated() { }, //生命周期 - 更新之后
    activated() { }, //如果页面有keep-alive缓存功能，这个函数会触发
  }
</script>
<style lang='less' scoped>
  .bg-gray {
    position: absolute;
    top: 0;
    bottom: 0;
    left: 0;
    width: 100%;
    background-color: #f3f3f3;
  }
  .btns {
    padding: 0.2rem 0.35rem;
    overflow: hidden;
    color: #2d92fd;
    margin-top: 0.3rem;
    font-size: 0.32rem;
    background: #fff;
  }
  .btns:active {
    background-color: #eaeaea;
  }
</style>