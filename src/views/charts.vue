<template>
  <div class="bg-gray">
    <v-header
      :title="title"
      :gohome="gohome"
      :isShow="isShow"
    ></v-header>
    <div class="search_box">
      <van-cell-group>
        <van-cell
          title="站点"
          title-style="text-align:left;flex:0.5;"
          :value="sitename"
          is-link
          @click="showSite"
          :icon="iconSite"
        />
        <van-cell
          title="摄像头"
          title-style="text-align:left"
          :value="cameraname"
          is-link
          @click="showCamera"
          :icon="iconCamera"
        />
        <van-cell
          title="开始时间"
          title-style="text-align:left"
          :value="startTime"
          is-link
          @click="showTimePicker('startTime')"
          :icon="iconStarttime"
        />
        <van-cell
          title="结束时间"
          title-style="text-align:left"
          :value="endTime"
          is-link
          @click="showTimePicker('endTime')"
          :icon="iconEndtime"
        />
      </van-cell-group>
      <van-action-sheet
        v-model="isShowSite"
        :actions="siteList"
        @select="onSite"
        @cancel="closeSite()"
      />
      <van-action-sheet
        v-model="isShowCamera"
        :actions="cameraList"
        @select="onCamera"
        @cancel="closeCamera()"
      />
      <van-datetime-picker
        v-show="isShowTimePicker"
        v-model="showTime"
        style="position:absolute;bottom:0;left:0;width:100%;z-index:2200;"
        type="date"
        :min-date="minDate"
        :max-date="maxDate"
        @confirm="getTimeFn(showTime)"
        @cancel="closeTime()"
      />
      <van-popup v-model="isShowTimePicker" />
    </div>
    <div class="main">
      <div
        id="echarts1"
        style="height:320px;"
      ></div>
      <div
        id="echarts2"
        style="height:520px;"
      ></div>
      <div
        id="echarts3"
        style="height:320px;"
      ></div>
      <div
        id="echarts4"
        style="height:320px;"
      ></div>
    </div>
  </div>
</template>

<script>
  import { getPostData, getParams, getLoc, setLoc, formatDate } from '@/utils/common.js';
  import { mapActions, mapMutations, mapState } from 'vuex';
  import { DropdownMenu, DropdownItem, Toast, ActionSheet } from 'vant';
  import echarts from 'echarts';
  export default {
    data() {
      //这里存放数据
      return {
        title: '系统告警统计图表',
        active: 0,
        isShow: 'show',
        gohome: true,
        isShowSite: false,
        isShowCamera: false,
        camera: 0,
        cameraname: '',
        chart: {},
        site: '',
        sitename: '',
        siteList: [],
        startTime: '',
        endTime: formatDate(new Date().getTime(), 2),
        showTime: new Date(),
        minDate: new Date(2000, 1, 1),
        maxDate: new Date(),
        currentDateType: '',
        isShowTimePicker: false,
        cameraList: [
          {
            text: '全部',
            value: '0'
          }
        ],
        iconSite: require('../assets/chart/icon-site.png'),
        iconCamera: require('../assets/chart/icon-camera.png'),
        iconStarttime: require('../assets/chart/icon-starttime.png'),
        iconEndtime: require('../assets/chart/icon-endtime.png')
      };
    },
    //生命周期 - 创建完成（可以访问当前this实例）
    created() {
      this.getSite();
      this.startTime = formatDate(new Date().getTime() - 6 * 24 * 3600 * 1000, 2);
    },
    //生命周期 - 挂载完成（可以访问DOM元素）
    mounted() {
      this.$nextTick(() => {
        this.initEcharts();
      });
    },
    //方法集合
    methods: {
      ...mapMutations(['_userInfo', '_isRefresh']),
      ...mapActions(['_getInfo']),
      showSite(item) {
        this.isShowSite = true;
      },
      showCamera(item) {
        this.isShowCamera = true;
      },
      closeSite() {
        this.isShowSite = false;
      },
      closeCamera() {
        this.isShowCamera = false;
      },
      onSite(item) {
        this.site = item.value;
        this.sitename = item.name;
        this.isShowSite = false;
        this.initEcharts();
      },
      onCamera(item) {
        this.camera = item.value;
        this.cameraname = item.name;
        this.isShowCamera = false;
        this.initEcharts();
      },
      initEcharts() {
        //dayNightCountData
        var myChart1 = echarts.init(document.getElementById('echarts1'));
        var myChart2 = echarts.init(document.getElementById('echarts2'));
        var myChart3 = echarts.init(document.getElementById('echarts3'));
        var myChart4 = echarts.init(document.getElementById('echarts4'));
        var sensorID = this.camera;
        if(this.camera == '0') {
          sensorID = '';
        }
        //白天晚上告警统计
        const params = getPostData('dayNightCountData', [getLoc('userInfo').userID, this.site, sensorID, this.startTime, this.endTime]);
        this._getInfo({
          ops: params,
          method: 'post',
          api: 'dayNightCountData',
          callback: (res) => {
            var div = document.createElement('div');
            div.innerHTML = res;
            var data = JSON.parse(div.querySelector('return').innerHTML);
            let xData = [],
              data1 = [],
              data2 = [];
            for(let i = 0; i < data['白天'].length; i++) {
              xData.push(data['白天'][i].statTime);
              data1.push(data['白天'][i].statValue);
              data2.push(data['夜间'][i].statValue);
            }

            // 指定图表的配置项和数据
            var dayAndNightOption = {
              title: {
                text: '白天晚上告警统计图',
                textStyle: {
                  color: '#333',
                  fontWeight: 'normal'
                },
                top: '10px',
                left: '5px'
              },
              color: ['#56A3F5', '#9E53D2', '#74D8D8'],
              tooltip: {
                trigger: 'axis',
                axisPointer: {
                  type: 'cross',
                  label: {
                    backgroundColor: '#6a7985'
                  }
                }
              },
              legend: {
                data: ['白天', '夜间'],
                right: '10px',
                top: '10px',
                textStyle: {
                  color: '#969799'
                }
              },
              grid: {
                left: '3%',
                right: '7%',
                bottom: '5%',
                containLabel: true
              },
              xAxis: [
                {
                  type: 'category',
                  boundaryGap: false,
                  data: xData,
                  axisLine: {
                    lineStyle: {
                      color: '#969799'
                    }
                  }
                }
              ],
              yAxis: [
                {
                  type: 'value',
                  axisLine: {
                    lineStyle: {
                      color: '#969799'
                    }
                  }
                }
              ],
              series: [
                {
                  name: '白天',
                  type: 'line',
                  stack: '总量',
                  areaStyle: {},
                  data: data1
                },
                {
                  name: '夜间',
                  type: 'line',
                  stack: '总量',
                  areaStyle: {},
                  data: data2
                }
              ]
            };
            myChart1.setOption(dayAndNightOption);
          }
        });

        //识别对象告警数量统计
        const params2 = getPostData('perCarCountData', [getLoc('userInfo').userID, this.site, sensorID, this.startTime, this.endTime]);
        this._getInfo({
          ops: params2,
          method: 'post',
          api: 'perCarCountData',
          callback: (res) => {
            var div = document.createElement('div');
            div.innerHTML = res;
            var data = JSON.parse(div.querySelector('return').innerHTML);
            // console.log(data);
            let xData = [],
              data1 = [],
              dataName = [];
            let series = [];
            for(var a in data) {
              dataName.push(a);
              let arr = [];
              data[a].forEach((v, i) => {
                if(xData.length < data[a].length) {
                  xData.push(v.statTime);
                }
                arr.push(v.statValue);
              });
              //   console.log(data1);
              series.push({
                name: a,
                type: 'bar',
                data: arr,
                markPoint: {
                  data: [
                    {
                      type: 'max',
                      name: '最大值'
                    },
                    {
                      type: 'min',
                      name: '最小值'
                    }
                  ]
                },
              });
            }

            // 指定图表的配置项和数据
            var perAndCarOption = {
              title: {
                text: '识别对象告警数量统计图',
                textStyle: {
                  color: '#333',
                  fontWeight: 'normal'
                },
                x: 'left',
                top: '10px'
              },
              color: ['#56A3F5', '#9E53D2', '#74D8D8'],
              tooltip: {
                trigger: 'axis'
              },
              legend: {
                left: '20px',
                top: '40px',
                data: dataName,
                textStyle: {
                  color: '#969799'
                }
              },
              grid: {
                top: '30%',
                left: '3%',
                right: '10%',
                bottom: '3%',
                containLabel: true
              },
              calculable: true,
              xAxis: [
                {
                  type: 'category',
                  data: xData,
                  axisLine: {
                    lineStyle: {
                      color: '#969799'
                    }
                  }
                }
              ],
              yAxis: [
                {
                  type: 'value',
                  axisLine: {
                    lineStyle: {
                      color: '#969799'
                    }
                  }
                }
              ],
              series: series
            };

            myChart2.setOption(perAndCarOption);
          }
        });
        //地区告警统计
        const params3 = getPostData('regionTypeCountData', [getLoc('userInfo').userID, this.site, sensorID, this.startTime, this.endTime]);
        this._getInfo({
          ops: params3,
          method: 'post',
          api: 'regionTypeCountData',
          callback: (res) => {
            var div = document.createElement('div');
            div.innerHTML = res;
            var data = JSON.parse(div.querySelector('return').innerHTML);

            let xData = [],
              data1 = [];
            for(let i = 0; i < data.length; i++) {
              xData.push(data[i].statName);
              data1.push({ name: data[i].statName, value: data[i].statValue });
            }
            // 指定图表的配置项和数据
            var option = {
              title: {
                text: '地区告警统计图',
                textStyle: {
                  color: '#333',
                  fontWeight: 'normal'
                },
                top: '10px',
                left: '5px'
              },
              color: ['#56A3F5', '#9E53D2', '#74D8D8'],
              tooltip: {
                trigger: 'item',
                formatter: '{a} <br/>{b} : {c} ({d}%)'
              },
              legend: {
                top: '40%',
                x: 'left',
                orient: 'vertical',
                data: xData,
                textStyle: {
                  color: '#51b3f2'
                }
              },
              series: [
                {
                  name: '地区告警占比',
                  type: 'pie',
                  radius: '55%',
                  center: ['50%', '60%'],
                  data: data1,
                  itemStyle: {
                    emphasis: {
                      shadowBlur: 10,
                      shadowOffsetX: 0,
                      shadowColor: 'rgba(0, 0, 0, 0.5)'
                    }
                  }
                }
              ]
            };
            myChart3.setOption(option);
          }
        });
        //埋管深度告警数量统计
        const params4 = getPostData('depthOfBuriedPipeCountData', [getLoc('userInfo').userID, this.site, sensorID, this.startTime, this.endTime]);
        this._getInfo({
          ops: params4,
          method: 'post',
          api: 'depthOfBuriedPipeCountData',
          callback: (res) => {
            var div = document.createElement('div');
            div.innerHTML = res;
            var data = JSON.parse(div.querySelector('return').innerHTML);

            let xData = [],
              data1 = [];
            for(let i = 0; i < data.length; i++) {
              xData.push(data[i].statName);
              data1.push({ name: data[i].statName, value: data[i].statValue });
            }
            // 指定图表的配置项和数据
            var conduitOption = {
              title: {
                text: '埋管深度告警数量统计图',
                textStyle: {
                  color: '#333',
                  fontWeight: 'normal'
                },
                top: '10px',
                left: '5px'
              },
              color: ['#56A3F5', '#9E53D2', '#74D8D8'],
              tooltip: {
                trigger: 'item',
                formatter: '{a} <br/>{b}: {c} ({d}%)'
              },
              grid: {
                top: '30%',
                left: '3%',
                right: '4%',
                bottom: '3%',
                containLabel: true
              },
              legend: {
                orient: 'vertical',
                top: '30%',
                x: 'left',
                data: xData,
                textStyle: {
                  color: '#51b3f2'
                }
              },
              series: [
                {
                  name: '告警数量',
                  type: 'pie',
                  radius: ['50%', '70%'],
                  avoidLabelOverlap: false,
                  label: {
                    normal: {
                      show: false,
                      position: 'center'
                    },
                    emphasis: {
                      show: true,
                      textStyle: {
                        fontSize: '30',
                        fontWeight: 'bold'
                      }
                    }
                  },
                  labelLine: {
                    normal: {
                      show: false
                    }
                  },
                  data: data1
                }
              ]
            };

            myChart4.setOption(conduitOption);
          }
        });
      },
      //获取站点
      getSite() {
        const params = getPostData('getSiteInfoByUserID', [getLoc('userInfo').userID]);
        this._getInfo({
          ops: params,
          method: 'post',
          api: 'getSiteInfoByUserID',
          callback: (res) => {
            var div = document.createElement('div');
            div.innerHTML = res;
            var data = JSON.parse(div.querySelector('return').innerHTML);

            if(data.state == 'success') {
              if(data.resultValue.length > 0) {
                for(var i = 0; i < data.resultValue.length; i++) {
                  //   console.log(data.resultValue[i]);
                  this.siteList.push({ name: data.resultValue[i].siteName, value: data.resultValue[i].siteID });
                }
                this.site = data.resultValue[0].siteID;
                this.sitename = data.resultValue[0].siteName;
              }
              this.getSensor(this.site);
            } else {
              Toast(data.stateMessage);
            }
          }
        });
      },
      //获取摄像头
      getSensor(siteID) {
        const params = getPostData('getSensorBySiteID', [siteID]);
        this._getInfo({
          ops: params,
          method: 'post',
          api: 'getSensorBySiteID',
          callback: (res) => {
            var div = document.createElement('div');
            div.innerHTML = res;
            var data = JSON.parse(div.querySelector('return').innerHTML);
            this.cameraList = [];
            if(data.state == 'success') {
              this.cameraList.push({ name: '全部', value: 0 });
              for(var i = 0; i < data.resultValue.length; i++) {
                this.cameraList.push({ name: data.resultValue[i].sensorNO, value: data.resultValue[i].sensorNO });
              }
              this.camera = 0;
              this.cameraname = '全部';
              this.initEcharts();
            } else {
              Toast(data.stateMessage);
            }
          }
        });
      },
      showTimePicker(t) {
        this.currentDateType = t;
        this.isShowTimePicker = true;
        if(t == 'startTime') {
          this.showTime = new Date(this.startTime);
          this.maxDate = new Date(this.endTime);
          this.minDate = new Date(2000, 1, 1);
        } else {
          this.showTime = new Date(this.endTime);
          this.minDate = new Date(this.startTime);
          this.maxDate = new Date();
        }
      },
      getTimeFn(times) {
        this.isShowTimePicker = false;
        if(this.currentDateType == 'startTime') {
          this.startTime = formatDate(times.getTime(), 2);
        } else {
          this.endTime = formatDate(times.getTime(), 2);
        }
        this.initEcharts();
      },
      closeTime() {
        this.isShowTimePicker = false;
      }
    }
  };
</script>
<style lang="less" scoped>
  .bg-gray {
    position: absolute;
    top: 0;
    bottom: 0;
    left: 0;
    width: 100%;
    background-color: #f3f3f3;
  }
  .search_box {
    font-size: 0.32rem;
  }
  .main {
    position: absolute;
    top: 185px;
    bottom: 3px;
    left: 3px;
    right: 3px;
    overflow-x: hidden;
    overflow-y: auto;
    div {
      background-color: #fff;
      box-shadow: 0 1px 2px 1px #f0f0f0;
      position: relative;
      border-radius: 8px;
      margin: 0 auto 3px;
      border: 1px solid #e5e5e5;
    }
  }
</style>
<style>
  .van-dropdown-menu__title {
    font-size: 0.32rem;
  }
  .van-cell {
    font-size: 0.32rem;
    padding: 5px 10px;
  }
</style>
