<template>
  <div class='title'>
    {{content}}
  </div>
</template>

<script>

  export default {
    data() {
      //这里存放数据
      return {

      };
    },
    props: ['content'],
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
  .title {
    height: 1rem;
    line-height: 1rem;
    font-size: 0.4rem;
    background: #0ab5bd;
    color: #fff;
  }
</style>