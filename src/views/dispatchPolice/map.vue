<template>
  <div class="map">
    <v-header :title="title"></v-header>
    <div id="container" :class="active"></div>
    <div class="info" v-show="isShowPointInfo">
      <span class="i-name">{{ name }}</span>
      <van-button type="primary" @click="showMapAppList"></van-button>
    </div>
    <div class="mapAppList" v-show="isShowMapApp">
      <ul v-if="hasMap">
        <li
          v-for="(i, index) in mapAppList"
          :key="index"
          @click="navFn(i.name)"
          v-if="i.status"
        >
          {{ i.title }}
        </li>
      </ul>
      <ul v-else>
        <li @click="navFn(recommendMapApp.name)">
          {{ recommendMapApp.title }}
        </li>
      </ul>
    </div>
    <van-overlay :show="isShowMapApp" @click="isShowMapApp = false" />
  </div>
</template>

<script>
  import {
    openMapApp
  } from '@/utils/browser.js';
  import { TMap } from '@/utils/qqmap.js'
  import { Toast } from 'vant';
  export default {
    data() {
      //这里存放数据
      return {
        title: '地图',
        name: '',
        active: '',
        index: '0',
        isShowPointInfo: true,
        isShowMapApp: false,
        hasMap: true,//本地是否安装地图APP
        list: {},
        markerIcon: require('../../assets/marker.png'),
        mapAppList: [{
          name: 'com.baidu.BaiduMap',
          title: "百度地图",
          action: "baidumap://",
          status: false
        }, {
          name: 'com.autonavi.minimap',
          title: "高德地图",
          action: "iosamap://",
          status: false
        }, {
          name: 'com.tencent.map',
          title: "腾讯地图",
          action: "qqmap://",
          status: false
        }],
        recommendMapApp: {
          name: 'com.tencent.map.download',
          title: "腾讯地图（推荐安装）",
        }
      }
    },
    props: [],
    //监听属性 类似于data概念
    computed: {
    },
    //监控data中的数据变化
    watch: {
    },
    //生命周期 - 创建完成（可以访问当前this实例）
    created() {
      this.list.lat = this.$route.params.mapData.latitude;
      this.list.lon = this.$route.params.mapData.longitude;
      this.list.name = this.$route.params.mapData.warningAddress;
    },
    //生命周期 - 挂载完成（可以访问DOM元素）
    mounted() {
      TMap().then(qq => {
        this.init();
      });
    },
    //方法集合
    methods: {
      init() {
        //步骤：定义map变量 调用 qq.maps.Map() 构造函数   获取地图显示容器
        //设置地图中心点
        var myLatlng = new qq.maps.LatLng(this.list.lat, this.list.lon);
        //定义工厂模式函数
        var myOptions = {
          zoom: 16,               //设置地图缩放级别
          center: myLatlng,      //设置中心点样式
          mapTypeId: qq.maps.MapTypeId.ROADMAP  //设置地图样式详情参见MapType
        };
        //获取dom元素添加地图信息
        var map = new qq.maps.Map(document.getElementById("container"), myOptions);

        var myLatlng = new qq.maps.LatLng(this.list.lat, this.list.lon);
        var curName = this.list.name;
        var marker = new qq.maps.Marker({
          position: myLatlng,
          map: map
        });
        var anchor = new qq.maps.Point(0, 39),
          size = new qq.maps.Size(40, 40),
          origin = new qq.maps.Point(0, 0),
          icon = new qq.maps.MarkerImage(
            this.markerIcon,
            size,
            origin,
            anchor
          );
        //marker.setIcon(icon);
        this.name = this.list.name;
        this.active = "active";
        this.isShowPointInfo = true;
        qq.maps.event.addListener(marker, 'click', () => {
          this.name = curName;
          this.active = "active";
          this.isShowPointInfo = true;
        })
      },
      showMapAppList() {
        this.isShowMapApp = true;
        var num = 0;
        var u = navigator.userAgent, app = navigator.appVersion;
        var isAndroid = u.indexOf('Android') > -1 || u.indexOf('Linux') > -1; //g
        var isIOS = !!u.match(/\(i[^;]+;( U;)? CPU.+Mac OS X/); //ios终端
        if (isAndroid) {
          for (var i = 0; i < this.mapAppList.length; i++) {
            try {
              //'com.baidu.BaiduMap'地图的包名
              let packageName = this.mapAppList[i].name;
              let main = plus.android.runtimeMainActivity();
              let packageManager = main.getPackageManager();
              let PackageManager = plus.android.importClass(packageManager);
              let packageInfo = packageManager.getPackageInfo(packageName, PackageManager.GET_ACTIVITIES);

              if (packageInfo) {
                this.mapAppList[i].status = true;
                num++;
              } else {
              }
            } catch (e) {
            }
          }
        } else if (isIOS) {
          for (var i = 0; i < this.mapAppList.length; i++) {
            try {
              //'com.baidu.BaiduMap'地图的包名
              var UIApplication = plus.ios.importClass("UIApplication");
              var NSURL = plus.ios.importClass("NSURL");

              var app = UIApplication.sharedApplication();
              if (app.canOpenURL(NSURL.URLWithString(this.mapAppList[i].action))) {
                this.mapAppList[i].status = true;
                num++;
              }
            } catch (e) {
            }
          }
          try {
            var UIApplication = plus.ios.importClass("UIApplication");
            var NSURL = plus.ios.importClass("NSURL");

            var app = UIApplication.sharedApplication();
            var bdScheme = NSURL.URLWithString("iosamap://");
            var install = app.canOpenURL(bdScheme);
            Toast(install);
            plus.ios.deleteObject(bdScheme);
            plus.ios.deleteObject(app);

          } catch (e) {
          }
        }
        if (num == 0) {
          this.hasMap = false;
        }
      },
      navFn(name) {
        openMapApp(this.list.lat, this.list.lon, "", name);
        this.isShowMapApp = false;
      }
    },
    updated() {
      //this.init();
    }, //生命周期 - 更新之后
    activated() { }, //如果页面有keep-alive缓存功能，这个函数会触发
  }
</script>
<style lang='less' scoped>
  .map {
    position: absolute;
    top: 0;
    bottom: 0;
    left: 0;
    width: 100%;
    overflow: hidden;
    font-size: 0.3rem;
    .mapAppList {
      position: absolute;
      top: 45%;
      left: 50%;
      width: 85%;
      background-color: #fff;
      border-radius: 4px;
      -webkit-transform: translate3d(-50%, -50%, 0);
      transform: translate3d(-50%, -50%, 0);
      backface-visibility: hidden;
      -webkit-transition: 0.3s;
      transition: 0.3s;
      z-index: 2042;
      ul {
        li {
          text-align: left;
          line-height: 0.8rem;
          margin: 0 0.1rem;
          padding: 0 0.1rem;
          border-bottom: 1px solid #e2e2e2;
        }
        li:last-child {
          border-bottom: none;
        }
        li:active {
          background-color: #eee;
        }
      }
    }
  }
  #container {
    position: absolute;
    top: 0;
    right: 0;
    bottom: 1.1rem;
    width: 100%;
  }
  #container.active {
    bottom: 1.1rem;
  }
  .info {
    position: absolute;
    right: 0;
    bottom: 0;
    left: 0;
    background-color: #fff;
    border-top: 1px solid #eee;
    line-height: 0.5rem;
    text-align: left;
    padding: 0.2rem;
    .i-name {
      white-space: pre-wrap;
      width: 70%;
      float: left;
    }
  }
  .van-button {
    float: right;
    height: 0.7rem;
    width: 0.7rem;
    border-radius: 50%;
    padding: 0;
    border: none;
    background: url(../../assets/nav.png) no-repeat;
    background-size: 100% auto;
  }
</style>