<template>
  <div class="bg-gray">
    <v-header
      :title="title"
      :gohome="gohome"
      :isShow="isShow"
    ></v-header>
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
        <van-cell class="rulePass" icon="info-o" title="请按照以下规则修改密码" :label="rulePass" />
      </van-cell-group>
      <div
        class="btns"
        @click="checkPass"
      >
        确认
      </div>
    </div>
  </div>
</template>

<script>
  import { getPostData, getParams, getLoc, setLoc } from '@/utils/common.js';
  import { mapActions, mapMutations, mapState } from 'vuex';
  import { Toast } from 'vant';
  import axios from 'axios';
  export default {
    data() {
      //这里存放数据
      return {
        title: '修改密码',
        gohome: true,
        isShow: '',
        oldPass: '',
        newPass: '',
        newPass1: '',
        ruleData: {},
        rulePass: '密码必须包含', //密码校验规则
      };
    },
    //监听属性 类似于data概念
    computed: {
      ...mapState(['warnId','urlCasWsWeb'])
    },
    created(){
      axios({
        method: 'post',
        //现场
        url: process.env.NODE_ENV == 'development' ? '/loginService/v1/getPasswordRule' : this.urlCasWsWeb.casUrl + '/v1/getPasswordRule',
      }).then(
        res => {
          this.ruleData = res.data;
          let ruleP = this.ruleData;
          if(ruleP.containNum == '是'){
            this.rulePass += '数字，';
          }
          if(ruleP.containLowerCase == '是'){
            this.rulePass += '小写字母，';
          }
          if(ruleP.containUpperCase == '是'){
            this.rulePass += '大写字母，';
          }
          if(ruleP.containSign == '是'){
            this.rulePass += '特殊字符'+ruleP.containSignStr;
          }
          this.rulePass += '，最小长度'+ruleP.minLength;
          this.rulePass += '，最大长度'+ruleP.maxLength;
        }
      );
    },
    //方法集合
    methods: {
      ...mapMutations(['_userInfo']),
      ...mapActions(['_getInfo']),

      checkPass() {
        if(this.oldPass == '') {
          Toast('原密码不能为空');
          return;
        }
        if(this.newPass == '') {
          Toast('新密码不能为空');
          return;
        }

        let ruleP = this.ruleData;
        if(this.newPass.length > ruleP.maxLength) {
          Toast('新密码必须为'+ruleP.minLength+'-'+ruleP.maxLength+'位以内长度');
          return false;
        }
        if(this.newPass.length < ruleP.minLength){
          Toast('新密码必须为'+ruleP.minLength+'-'+ruleP.maxLength+'位以内长度');
          return false;
        }
        if(this.newPass != this.newPass1) {
          Toast('两次密码输入不一致');
          return;
        }

        //校验密码
        let patrn;
        if(ruleP.containNum == '是'){
          patrn = /\d+/g;
          if(!patrn.test(this.newPass)){
            Toast('新密码必须包含数字');
            return false;
          }
        }
        if(ruleP.containLowerCase == '是'){
          patrn = /[a-z]+/g;
          if(!patrn.test(this.newPass)){
            Toast('新密码必须包含小写字母');
            return false;
          }
        }
        if(ruleP.containUpperCase == '是'){
          patrn = /[A-Z]+/g;
          if(!patrn.test(this.newPass)){
            Toast('新密码必须包含大写字母');
            return false;
          }
        }
        if(ruleP.containSign == '是'){
          if(this.newPass.indexOf(ruleP.containSignStr) == -1){
            Toast('新密码必须包含特殊字符'+ruleP.containSignStr);
            return false;
          }
        }

        axios({
          method: 'get',
          //现场
          url: process.env.NODE_ENV == 'development' ? '/loginService/ajaxModifyPassword' : this.urlCasWsWeb.casUrl + '/ajaxModifyPassword',
          headers:{
            'Content-Type': 'application/x-www-form-urlencoded'
          },
          params:{
            account:getLoc('userInfo').userID,
            oldPass:this.oldPass,
            newPass:this.newPass,
          },
        }).then(
          res => {
            if(res.data == 'success'){
              Toast('密码修改成功,请重新登录');
              setLoc('userInfo', '');
              setLoc('currentUser','');
              this.$router.push('/login');
            }else if(res.data == 'badpass'){
              Toast('原密码错误');
            }else if(res.data == 'error'){
              Toast('修改密码出现异常');
            }else if(res.data == 'erroruser'){
              Toast('用户信息不可用，请重新登录');
            }
          }
        ).catch(
          err => {
            console.log(err);
            console.log(error.response.status);
          }
        );
      },
      //判断是否有处理告警权限
      changePass() {
        //提交数据
        const params = getPostData('modifyPassword', [getLoc('userInfo').userID, this.newPass]);
        this._getInfo({
          ops: params,
          method: 'post',
          api: 'modifyPassword',
          callback: res => {
            var div = document.createElement('div');
            div.innerHTML = res;
            let data = JSON.parse(div.querySelector('return').innerHTML);
            if(data.state == 'success') {
              Toast('密码修改成功,请重新登录');
              setLoc('userInfo', '');
              this.$router.push('/login');
            } else {
              Toast(data.stateMessage);
              return;
            }
          }
        });
      }
    }
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
  .group1 {
    .rulePass{
      background-color: #efefef;
      text-align: left;
    }
  }
</style>
