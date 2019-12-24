<template>
  <div class="header">
    <van-nav-bar :title="title">
      <van-icon
        name="cross"
        slot="left"
        color="#323233"
        v-show="show"
        @click="onClickLeft"
      />
      <!-- <van-icon
        name="wap-home"
        slot="right"
        @click="goHome"
      /> -->
    </van-nav-bar>
  </div>
</template>

<script>
  import { setLoc, getLoc } from "@/utils/common.js";
  import { mapMutations, mapState } from 'vuex';
  export default {
    data() {
      //这里存放数据
      return {
        show: true
      };
    },
    props: ['title', 'isShow', 'gohome'],
    //监听属性 类似于data概念
    computed: {},
    //监控data中的数据变化
    watch: {},
    //生命周期 - 创建完成（可以访问当前this实例）
    created() {
      this.init();
    },
    //生命周期 - 挂载完成（可以访问DOM元素）
    mounted() {

    },
    //方法集合
    methods: {
      ...mapMutations(['_userRole']),
      onClickLeft() {
        if (this.gohome) {
          if (this.isShow == "index") {
            this.$emit('hideSetting')
          } else {
            this.$router.push('/index');
          }
        } else {
          this.$router.push('/' + getLoc('userRole').type);
        }
      },
      init() {
        if (this.isShow == "hide") {
          this.show = false;
        }
      },
      goHome() {
        this.$router.push('/index');
      }
    },
    updated() { }, //生命周期 - 更新之后
    activated() { }, //如果页面有keep-alive缓存功能，这个函数会触发
  }
</script>
<style lang='less' scoped>
</style>