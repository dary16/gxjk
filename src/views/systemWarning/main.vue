<template>
  <div class="main">
    <v-header
      :title="title"
      :isShow="isShow"
      :gohome="gohome"
    ></v-header>
    <router-view :flagRe='flagRe' />

    <v-setting
      v-if="showSetting"
      v-on:changeUserFn="changeUserFn"
    ></v-setting>
    <van-tabbar v-model="active">
      <van-tabbar-item
        @click="homeFn"
        :dot="newMsgNum ? true : false"
      >
        <span>系统告警</span>
        <img slot="icon" slot-scope="props" :src="props.active ? icon.active : icon.normal" />
     </van-tabbar-item>
        <van-tabbar-item @click="setFn">
          <span>我的</span>
          <img slot="icon" slot-scope="props" :src="props.active ? myicon.active : myicon.normal" />
     </van-tabbar-item>
    </van-tabbar>
  </div>
</template>

<script>
  import { getPostData, getParams, getLoc, setLoc } from '@/utils/common.js';
  import { mapActions, mapMutations, mapState } from 'vuex';
  export default {
    data() {
      //这里存放数据
      return {
        title: '告警列表',
        showSetting: false,
        active: 0,
        isShow: 'show',
        gohome: true,
        timeout: null,
        newMsg: 0, //新消息条数提醒
        icon: {
          normal: require('../../assets/warning01.png'),
          active: require('../../assets/warning02.png')
        },
        myicon: {
          normal: require('../../assets/my01.png'),
          active: require('../../assets/my02.png')
        },
        flagRe: 0,
      };
    },
    props: [],
    //监听属性 类似于data概念
    computed: {
      ...mapState(['newMsgNum','warningNum'])
    },
    //监控data中的数据变化
    watch: {
      warningNum(){
        this.getNewMsgLength();
      },
    },
    //生命周期 - 创建完成（可以访问当前this实例）
    created() {
      this.getNewMsgLength();

      if(this.$route.params.show) {
        this.setFn();
        this.active = 1;
      } else {
        this.homeFn();
      }
    },
    beforeDestroy() {
      this._newMsgNum(0);
    },
    //生命周期 - 挂载完成（可以访问DOM元素）
    mounted() { },
    //方法集合
    methods: {
      ...mapMutations(['_userInfo','_newMsgNum']),
      ...mapActions(['_getInfo']),
      setFn() {
        this.title = '个人中心';
        this.showSetting = true;
        this.$router.push('/systemWarning');
      },
      homeFn() {
        this.title = '系统告警';
        this.showSetting = false;
        this.flagRe++;
        this.$router.push('/systemWarningList');
      },
      changeUserFn() {
        setLoc('userInfo', '');
        setLoc('currentUser', '');
        this.$router.push('/login');
      },
      getNewMsgLength() {
        const params = getPostData('findNewWarningNum', [getLoc('userInfo').userID, getLoc('getSystemWarningTime')]);
        this._getInfo({
          ops: params,
          method: 'post',
          api: 'findNewWarningNum',
          callback: res => {
            var div = document.createElement('div');
            div.innerHTML = res;
            var listInfoData = div.querySelector('return').innerHTML;
            this._newMsgNum(Number(listInfoData));
          }
        });
      }
    }
  };
</script>
<style lang="less" scoped>
  .main {
    position: absolute;
    top: 0;
    right: 0;
    bottom: 1.333rem;
    left: 0;
    background-color: #f3f3f3;
    .van-tabs {
      position: absolute;
      top: 46px;
      right: 0;
      bottom: 0;
      left: 0;
      background-color: #f0f0f0;
      .nodata {
        position: absolute;
        bottom: 1rem;
        text-align: center;
        color: #999;
        left: 50%;
        width: 1rem;
        margin-left: -0.5rem;
      }
    }
  }
</style>
