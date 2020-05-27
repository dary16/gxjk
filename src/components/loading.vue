<template>
  <div class='loading'>
    <ul class="loading-box">
      <van-loading
        size="60px"
        color="grey"
        vertical
      >上传中...</van-loading>
    </ul>
  </div>
</template>

<script>

  export default {
    data() {
      //这里存放数据
      return {

      };
    },
    props: ['visible'],
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
<style lang='less' scoped>
  .loading {
    position: absolute;
    left: 0;
    right: 0;
    top: 0;
    bottom: 0;
    background: rgba(0, 0, 0, 0.2);
    .loading-box {
      position: absolute;
      left: 50%;
      top: 50%;
      height: 2rem;
      width: 2rem;
      margin-top: -1rem;
      margin-left: -1rem;
      font-size: 0.4rem;
      background: rgba(0, 0, 0, 0.6);
    }
  }
</style>