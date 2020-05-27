<template>
  <div class="center">
    <baidu-map
      id="map"
      class="bm-view"
      :center="location"
      :zoom="zoom"
    >
      <bm-view style="width: 100%; height:300px; flex: 1"></bm-view>
      <bm-marker
        :position="location"
        :dragging="true"
        :title="markerName"
        :zIndex="999999999"
      >
      </bm-marker>
    </baidu-map>

  </div>
</template>

<script>
  export default {
    data() {
      //这里存放数据
      return {
        location: {
          lng: 116.404,
          lat: 39.915
        },
        zoom: 12.8,
        markerName: '张三'
      };
    },
    props: [],
    //监听属性 类似于data概念
    computed: {},
    //监控data中的数据变化
    watch: {},
    //生命周期 - 创建完成（可以访问当前this实例）
    created() {
    },
    //生命周期 - 挂载完成（可以访问DOM元素）
    mounted() {
      // this.getLocation();
    },
    //方法集合
    methods: {
      //初始化地图
      getLocation() {
        const geolocation = new BMap.Geolocation();
        var _this = this;
        _this.LocationCity = '正在定位';
        geolocation.getCurrentPosition(
          function getinfo(position) {
            let city = position.address.city; //获取城市信息
            let province = position.address.province; //获取省份信息
            _this.LocationCity = city;
            _this.success = true;
          },
          function(e) {
            _this.LocationCity = '定位失败, 请点击重试';
            this.success = false;
          },
          { provider: 'baidu' }
        );
      }
    },
    updated() { }, //生命周期 - 更新之后
    activated() { } //如果页面有keep-alive缓存功能，这个函数会触发
  };
</script>
<style lang="less" scoped>
  .center {
    width: 100%;
    height: 300px;
    #map {
      width: 100%;
      height: 100%;
    }
  }
</style>
