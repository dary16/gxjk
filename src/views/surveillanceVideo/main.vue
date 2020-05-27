<template>
  <div class="main">
    <v-header
      :title="title"
      :isShow="isShow"
      :gohome="gohome"
    ></v-header>
    <router-view :flag='flag' />

    <v-setting
      v-if="showSetting"
      v-on:changeUserFn="changeUserFn"
    ></v-setting>
    <van-tabbar v-model="active">
      <van-tabbar-item @click="homeFn">
        <span>视频监控</span>
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
        title: '',
        showSetting: false,
        active: 0,
        isShow: 'show',
        gohome: true,
        icon: {
          normal: require('../../assets/video01.png'),
          active: require('../../assets/video02.png')
        },
        myicon: {
          normal: require('../../assets/my01.png'),
          active: require('../../assets/my02.png')
        },
        flag: 0,
      };
    },
    //生命周期 - 创建完成（可以访问当前this实例）
    created() {
      if(this.$route.params.show) {
        this.setFn();
      } else {
        this.homeFn();
      }
    },
    //方法集合
    methods: {
      ...mapActions(['_getInfo']),
      setFn() {
        this.title = '个人中心';
        this.showSetting = true;
        this.$router.push('/surveillanceVideo');
      },
      homeFn() {
        this.title = '监控列表';
        this.showSetting = false;
        this.flag++;
        this.$router.push('/surveillanceVideoList');
      },
      changeUserFn() {
        setLoc('userInfo', '');
        setLoc('currentUser', '');
        this.$router.push('/login');
      },
    }
  };
</script>
<style lang='less' scoped>
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