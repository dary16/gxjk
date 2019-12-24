<template>
  <div class="faultInfo">
    <div class="info-left">
      <img :src="url" alt="">
    </div>
      <div class="info-right">
        <h3>{{title}}</h3>
        <span>{{content}}</span>
      </div>
    </div>
</template>

<script>
  export default {
    data() {
      //这里存放数据
      return {

      };
    },
    props: ['content', 'title', 'url'],
    //监听属性 类似于data概念
    computed: {},
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

    },
    updated() { }, //生命周期 - 更新之后
    activated() { }, //如果页面有keep-alive缓存功能，这个函数会触发
  }
</script>
<style lang='less'scoped>
  .faultInfo {
    display: flex;
    padding: 0.5rem 0.24rem;
    text-align: left;
    background: #fff;
    .info-left {
      width: 1.33rem;
      margin-right: 0.24rem;
      display: flex;
      align-items: center;
      img {
        width: 0.82rem;
      }
    }
    .info-right {
      float: right;
      h3 {
        font-size: 0.32rem;
      }
      span {
        font-size: 0.3rem;
        color: #8e8e93;
      }
    }
  }
</style>