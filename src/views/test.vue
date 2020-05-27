<template>
  <div class="test">
    原数据：<input
      type="text"
      v-model="data1"
    />
    <van-button
      type="primary"
      @click="jiami"
    >加密</van-button>
    <van-button
      type="primary"
      @click="jiemi"
    >解密</van-button>
    加密数据：<input
      type="text"
      v-model="data2"
    />
  </div>
</template>

<script>
  import { encrypt, decrypt } from '../utils/secret.js';
  export default {
    data() {
      //这里存放数据
      return {
        data1: '',
        data2: 'AynZxfZ0HtQ1JZK41EVJl4ANR+qmwbEMInsIUZ4JlZNfpxzIwyGVK8YatxWgqRy5SLNbiGpB3ZlCDmuq0vJ4IonQJDwzVdpqu0Pc87uiZ3Y='
      };
    },
    props: [],
    //监听属性 类似于data概念
    computed: {},
    //监控data中的数据变化
    watch: {},
    //生命周期 - 创建完成（可以访问当前this实例）
    created() { },
    //生命周期 - 挂载完成（可以访问DOM元素）
    mounted() { },
    //方法集合
    methods: {
      jiami() {
        console.log('加密----', this.data1);
        let dd = Encrypt(this.data1);
        console.log(dd);
        this.data2 = dd;
      },
      jiemi() {
        var regex3 = /\{(.+?)\}/g;
        this.data1 = decrypt(this.data2);
        console.log('解密----:', this.data1.match(regex3)[0]);
      }
    },
    updated() { }, //生命周期 - 更新之后
    activated() { } //如果页面有keep-alive缓存功能，这个函数会触发
  };
</script>
<style lang="less" scoped></style>
