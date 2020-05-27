<template>
  <div>
    <v-header
      :title="title"
      :isShow="isShow"
      :gohome="gohome"
    ></v-header>
    <van-loading
      size="30px"
      text-size="16px"
      type="spinner"
      style="margin-top:2rem;"
      vertical
      v-show="showLoading"
    >加载中...</van-loading>
    <ul class="gj_btn">
      <li v-if="normal">
        <div
          @click="startFn"
          class="layBtn"
        >开始巡线</div>
      </li>
      <li v-if="!normal">
        <div
          @click="endFn"
          class="layBtn"
        >停止巡线</div>
      </li>
    </ul>
    <div
      class='allMap'
      v-show="!showLoading"
    >
      <baidu-map
        class="map"
        :zoom="zoom"
        :center="center"
        :scroll-wheel-zoom="true"
        @ready="handler"
        @moving="syncCenterAndZoom"
        @moveend="syncCenterAndZoom"
        @zoomend="syncCenterAndZoom"
      >
        <bm-view style="width: 1000px; height:1600px; position:absolute;"></bm-view>
        <bm-marker
          :position="markerPoint"
          :dragging="false"
          animation="BMAP_ANIMATION_DROP"
          v-if="normal"
          :icon="{url: normalUrl, size: {width: 60, height: 60}}"
        ></bm-marker>
        <bm-marker
          :position="polylinePath[0]"
          :dragging="false"
          v-if="isStart"
          :icon="{url: startUrl, size: {width: 60, height: 60}}"
        ></bm-marker>
        <bm-marker
          :position="polylinePath[polylinePath.length-1]"
          :dragging="false"
          v-if="isFinish"
          :icon="{url: endUrl, size: {width: 30, height: 30}}"
        ></bm-marker>
        <!-- <bm-overlay
          pane="labelPane"
          @draw="draw"
        >
          <div
            @click="removeFn"
            class="removeBtn"
          >移除定时器</div>
        </bm-overlay>
        <bm-overlay
          pane="labelPane"
          @draw="draw"
        >
          <div
            @click="watchLinesFn"
            class="watchBtn"
          >查看轨迹</div>
        </bm-overlay> -->
        <div>
          <bm-polyline
            :path="polylinePath"
            stroke-color="red"
            :stroke-opacity="0.5"
            :stroke-weight="1"
            :editing="false"
            v-show="isFinish"
          ></bm-polyline>
        </div>

        <bm-geolocation
          anchor="BMAP_ANCHOR_BOTTOM_RIGHT"
          :showAddressBar="true"
          :autoLocation="true"
        ></bm-geolocation>
      </baidu-map>
      <div style="position: absolute;bottom: 100px;left: 0;right: 0;">地址：{{address}}-{{zoom}}</div>
      <div style="position: absolute;bottom: 50px;left: 0;right: 0;">经纬度（原始）：{{markerPoint.lng}}-{{markerPoint.lat}}</div>
    </div>
  </div>

</template>

<script>
  /**
   * @param normal 正常时图标
   * @param isStart 开始巡线
   * 
   * @param polylinePath 巡线工轨迹
   * @param clockParams一分钟向接口传递的数据
   * @param timer 获取定位的定时器
   * @param minTimer 提交数据的定时器
   * 10s获取一次定位，1min向接口请求一次数据
   */
  import { mapActions, mapMutations, mapState } from 'vuex';
  import { getLoc, setLoc, formatDate, getPostData, getParams } from '@/utils/common.js';
  export default {
    data() {
      //这里存放数据
      return {
        zoom: 14,//必须写上
        normal: true,
        center: { lng: 108.822717, lat: 34.177645 },
        markerPoint: { lng: 108.822717, lat: 34.177645 },
        address: 'ghfhgf',
        title: '巡线打卡',
        isShow: true,
        gohome: true,
        showLoading: true,
        BMap: null,
        map: null,
        normalUrl: require('../../assets/map/marker.png'),
        startUrl: require('../../assets/map/start.png'),
        endUrl: require('../../assets/map/end.png'),
        polylinePath: [],
        clockParams: [],
        suijiPath: [
          { lng: 108.822717, lat: 34.177645 },
          { lng: 108.824424, lat: 34.175629 },
          { lng: 108.827909, lat: 34.179138 },
          { lng: 108.818998, lat: 34.175196 },
          { lng: 108.823717, lat: 34.177645 },
          { lng: 108.824424, lat: 34.175629 },
          { lng: 108.825909, lat: 34.179138 },
          { lng: 108.819998, lat: 34.175196 },
          { lng: 108.824424, lat: 34.175629 },
          { lng: 108.827909, lat: 34.179138 },
        ],
        //默认定位图标
        status: 1,
        isStart: false,
        isFinish: false,
        timer: null,
        minTimer: null,
        startIcon: {
          url: require('../../assets/marker.png'),
          size: 36,
          opts: {
            anchor: 10,
            imageOffset: 10,
            imageSize: 10,
            infoWindowAnchor: 40,
            printImageUrl: require('../../assets/point.png')
          }
        },
        point: { lng: 0, lat: 0 }
      };
    },
    props: [],
    //监听属性 类似于data概念
    computed: {
      ...mapState(['pointArr', 'xxgStatus'])
    },
    //生命周期 - 创建完成（可以访问当前this实例）
    created() {
      if(this.xxgStatus == 'normal') {
        this.normal = true;
        this.isStart = false;
        this.isFinish = false;
        this.polylinePath = [];
      } else if(this.xxgStatus == 'start') {
        //开始巡线 但没有结束
        this.normal = false;
        this.isStart = true;

      }
    },
    //生命周期 - 挂载完成（可以访问DOM元素）
    mounted() { },
    //方法集合
    methods: {
      ...mapMutations(['_pointArr', '_xxgStatus']),
      ...mapActions(['_getInfo']),
      handler({ BMap, map }) {
        this.BMap = BMap;
        this.map = map;
        const that = this;
        var geolocation = new BMap.Geolocation();
        geolocation.getCurrentPosition((r) => {
          console.log(r);
          that.center = { lng: r.point.lng, lat: r.point.lat };
          that.markerPoint = { lng: r.point.lng, lat: r.point.lat };//108.822814 34.177281

          that.zoom = 11;
          that.map.setCenter(r.address.city);
          //   console.log(that.center);
          // that.address = r.address.province + r.address.city;
          that.getAddress(that.markerPoint);
          that.showLoading = false;
          console.log(that.center, r.address);
        }, { enableHighAccuracy: true });
        // map.addEventListener('touchmove', () => {
        //   map.enableDragging();
        // });
        //触摸结束时触发此次事件 此时开启禁止拖动
        // map.addEventListener('touchend', () => {
        //   map.disableDragging();
        // });
        // map.disableDragging();
      },
      // 根据经纬度获取地址
      getAddress(marker) {
        let geocoder = new BMap.Geocoder(); //创建地址解析器的实例
        geocoder.getLocation(new BMap.Point(marker.lng, marker.lat), rs => {
          this.address = rs.address;
          //   this.zoom = 18;
          console.log(rs.address);
        })
      },
      //开始巡线
      startFn() {
        console.log("开始巡线");

        this.polylinePath = [];
        this._pointArr([]);
        console.log(this.pointArr);
        this.zoom = 19;
        this.center = this.markerPoint;
        // 获取起点坐标
        // this.getPointTest();
        this.getPoint();
        // 巡线状态变为开始
        this._xxgStatus('start');

        //更换图标
        this.normal = false;
        this.isStart = true;
        this.isFinish = false;
        let that = this;
        //启动定时器
        that.timer = setInterval(() => {
          //模拟随机坐标
          //   that.getPointTest();
          //   let n = Math.floor(Math.random() * 10);
          //   console.log(that.suijiPath[n], n);
          //   let lng = that.suijiPath[n].lng;
          //   let lat = that.suijiPath[n].lat;
          //   this.clockParams.push({ "clockCoordinate": (lng, lat), "clockTime": formatDate(new Date().getTime() - 6 * 24 * 3600 * 1000, 1) });
          //   that.polylinePath.push({ lng: lng, lat: lat });
          //   console.log(that.polylinePath);

          //   that.center.lng = that.polylinePath[0];
          //   that.center.lat = that.polylinePath[0];
          this.getPoint();
        }, 10000);
        //一分钟向服务端发送一次数据
        that.minTimer = setInterval(() => {
          that.uploadPoints();
        }, 60000);
      },
      //上传数据
      uploadPoints() {
        console.log(this.clockParams);
        // const params = getPostData("insertClockInfo", [getLoc('userInfo').userID, JSON.stringify(this.clockParams)]);
        // this._getInfo({
        //   ops: params,
        //   method: "post",
        //   api: "insertClockInfo",
        //   callback: res => {
        //     var div = document.createElement("div");
        //     div.innerHTML = res;
        //     var listInfoData = div.querySelector("return").innerHTML;
        //     console.log(listInfoData);
        //     debugger;
        //     return listInfoData;
        //     //清空数据
        //     this.clockParams = [];
        //   }
        // });

        this.clockParams = []; //后面删除，测试时用
      },
      //结束巡线
      endFn() {
        this.isFinish = true;
        this.normal = true;
        console.log(this.normal, this.polylinePath);
        clearInterval(this.timer);
        clearInterval(this.minTimer);
        this._pointArr([]);
        // 巡线状态变为结束
        this._xxgStatus('normal');
        console.log(this.timer, this.minTimer);
      },
      //获取坐标
      getPoint() {
        let that = this;
        var geolocation = new BMap.Geolocation();
        geolocation.getCurrentPosition((r) => {
          if(this.getStatus() == BMAP_STATUS_SUCCESS) {
            let lng = r.longitude;
            let lat = r.latitude;
            //clockParams为需要上传至服务器的坐标点数据
            this.clockParams.push({ "clockCoordinate": (lng, lat), "clockTime": formatDate(new Date().getTime() - 6 * 24 * 3600 * 1000, 1) });
            //polylinePath为轨迹的所有坐标点
            that.polylinePath.push({ lng: lng, lat: lat });
            console.log(that.polylinePath);

            // 巡线工轨迹 pointArr
            let pointObj = Object.assign({}, that.polylinePath);
            this._pointArr(pointObj);

            that.center.lng = that.polylinePath[0];
            that.center.lat = that.polylinePath[0];
          } else {
            alert("failed" + this.getStatus());
          }
        });
      },
      // 测试坐标
      getPointTest() {
        let n = Math.floor(Math.random() * 10);
        console.log(this.suijiPath[n], n);
        let lng = this.suijiPath[n].lng;
        let lat = this.suijiPath[n].lat;
        this.clockParams.push({ "clockCoordinate": (lng, lat), "clockTime": formatDate(new Date().getTime() - 6 * 24 * 3600 * 1000, 1) });
        this.polylinePath.push({ lng: lng, lat: lat });

        this.center.lng = lng;
        this.center.lat = lat;
        console.log(this.polylinePath.length);
        let pointObj = Object.assign({}, this.polylinePath);
        this._pointArr(pointObj);

        console.log(this.polylinePath.length, pointObj);
        debugger;
      },
      draw({ el, BMap, map }) {
        const pixel = map.pointToOverlayPixel(new BMap.Point(108.953, 34.267))
        el.style.left = pixel.x - 60 + 'px'
        el.style.top = pixel.y - 20 + 'px'
      },
      //移除图标
      removeFn() {
        clearInterval(this.timer);
        clearInterval(this.minTimer);
        this.clockParams = [];
        this.polylinePath = [];
      },
      syncCenterAndZoom(e) {
        const { lng, lat } = e.target.getCenter();
        this.center.lng = lng;
        this.center.lat = lat;
        this.zoom = e.target.getZoom();
      },
      //查看轨迹
      watchLinesFn() {
        this.isFinish = true;
      }
    },
  }
</script>
<style lang='less' scoped>
  .map {
    width: 100%;
  }
  .gj_btn {
    position: fixed;
    top: 2rem;
    left: 0;
    right: 0;
    z-index: 99;
    li {
      list-style: none;
      height: 1rem;
      line-height: 1rem;
    }
  }
  .layBtn {
    width: 2rem;
    height: 0.5rem;
    line-height: 0.5rem;
    background: #007bfd;
    overflow: hidden;
    color: #fff;
    text-align: center;
    position: fixed;
    top: 1.5rem;
    left: 0.5rem;
  }
  .watchBtn {
    width: 2rem;
    height: 0.5rem;
    line-height: 0.5rem;
    background: #007bfd;
    overflow: hidden;
    color: #fff;
    text-align: center;
    position: fixed;
    top: 1.5rem;
    left: 4.5rem;
  }
  .removeBtn {
    // width: 2rem;
    height: 0.5rem;
    line-height: 0.5rem;
    background: #007bfd;
    overflow: hidden;
    color: #fff;
    text-align: center;
    position: fixed;
    top: 1.5rem;
    left: 3.5rem;
  }
</style>