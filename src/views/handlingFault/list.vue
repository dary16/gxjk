<template>
  <div class="main">
    <v-header :title="title" :isShow="isShow" :gohome="gohome"></v-header>
    <van-tabs v-model="active" swipeable background="#f0f0f0" @click="tabFn">
      <van-tab title="待处理" class="content">
        <van-pull-refresh
          v-model="unfinished.isDownLoading"
          @refresh="onDownRefresh('unfinished')"
        >
          <van-list
            v-model="unfinished.isUpLoading"
            :finished="unfinished.upFinished"
            :immediate-check="false"
            :finished-text="unfinished.text"
            :offset="1"
            @load="onLoad('unfinished')"
          >
            <!-- 加载的内容-->
            <van-loading type="spinner" v-if="unfinished.loading" />
            <div v-if="unfinished.data.length > 0">
              <van-row
                v-for="item in unfinished.data"
                :key="item.id"
                @click="infoIdFn(item)"
              >
                <van-col span="5"> <span class="list-icon"></span></van-col>
                <van-col span="17">
                  <van-cell
                    :title="item.title"
                    title-class="content-title"
                    :value="item.status"
                    value-class="btn-isok"
                  ></van-cell>
                  <p class="content-time">{{ item.time }}</p>
                  <p class="content-info">【详情】 {{ item.content }}</p>
                </van-col>
                <van-col span="2">
                  <van-icon name="arrow" />
                </van-col>
              </van-row>
            </div>
            <div class="nodata" v-else>暂无数据</div>
          </van-list>
        </van-pull-refresh>
      </van-tab>
      <van-tab title="已完成" class="content">
        <van-pull-refresh
          v-model="finished.isDownLoading"
          @refresh="onDownRefresh('finished')"
        >
          <van-list
            v-model="finished.isUpLoading"
            :finished="finished.upFinished"
            :immediate-check="false"
            :finished-text="finished.text"
            :offset="1"
            @="onLoad('finished')"
          >
            <!-- 加载的内容-->
            <van-loading type="spinner" v-if="finished.loading" />
            <div v-if="finished.data.length > 0">
              <van-row
                v-for="item in finished.data"
                :key="item.id"
                @click="infoIdFn(item)"
              >
                <van-col span="5"> <span class="list-icon"></span></van-col>
                <van-col span="17">
                  <van-cell
                    :title="item.title"
                    title-class="content-title"
                    :value="item.status"
                    value-class="btn-isok"
                  ></van-cell>
                  <p class="content-time">{{ item.time }}</p>
                  <p class="content-info">【详情】 {{ item.content }}</p>
                </van-col>
                <van-col span="2">
                  <van-icon name="arrow" />
                </van-col>
              </van-row>
            </div>
            <div class="nodata" v-else>暂无数据</div>
          </van-list>
        </van-pull-refresh>
      </van-tab>
    </van-tabs>
  </div>
</template>

<script>
  import { getPostData, getParams, getLoc, setLoc } from "@/utils/common.js";
  import { mapActions, mapMutations, mapState } from "vuex";
  import { Notify } from 'vant';
  export default {
    data() {
      //这里存放数据
      return {
        title: "故障通知",
        id: '',
        infoId: '',
        isShow: "show",
        gohome: true,
        serverTime: "",
        active: 0,
        newMsgRow: 0,
        unfinished: {
          statuses: "已上报,已接收",
          text: '已经拉到最底了',
          data: [],
          loading: true,
          show: true,
          pageNumber: 1,//页数
          pageSize: 10,//每页条数
          isUpLoading: false,//控制上拉加载的加载动画
          upFinished: false,//上拉加载完毕
          isDownLoading: false,//控制下拉刷新的加载动画
          deviceList: [],//用于存放加载的数据
          isLastPage: false
        },
        finished: {
          statuses: "已确认",
          text: '已经拉到最底了',
          data: [],
          loading: true,
          show: true,
          pageNumber: 1,//页数
          pageSize: 10,//每页条数
          isUpLoading: false,//控制上拉加载的加载动画
          upFinished: false,//上拉加载完毕
          isDownLoading: false,//控制下拉刷新的加载动画
          deviceList: [],//用于存放加载的数据
          isLastPage: false
        }
      };
    },
    props: [],
    //监听属性 类似于data概念
    computed: {
      ...mapState(['activeIndex', 'getHandlingFaultTime'])
    },
    //监控data中的数据变化
    watch: {},
    //生命周期 - 创建完成（可以访问当前this实例） 
    created() {
      this.active = this.activeIndex;
      if (this.$route.params.newMsgRow) {
        this.newMsgRow = this.$route.params.newMsgRow;
      }
      //初始化数据
      this.initData('unfinished');
      this.initData('finished');
    },
    //生命周期 - 挂载完成（可以访问DOM元素）
    mounted() { },
    //方法集合
    methods: {
      ...mapMutations(['_userInfo', '_getHandlingFaultTime', '_isRefresh', '_warnId', '_activeIndex']),
      ...mapActions(['_getInfo']),
      //详情
      infoIdFn(val) {
        this._warnId(val.faultID);
        this.$router.push('/handlingfaultMessage');
      },
      onDownRefresh(val) {
        this[val].pageNumber = 1;
        this[val].upFinished = false;
        this[val].isDownLoading = false;
        //下拉时显示更新消息数
        if (val == "unfinished") {
          if (this.newMsgRow > 0) {
            Notify({ type: 'primary', message: '更新了' + this.newMsgRow + '条消息', duration: 1500 });
          } else {
            Notify({ type: 'primary', message: '暂无更多新消息', duration: 1500 });
          }
        }
        this.initData(val); //加载数据        
      },
      onLoad(val) {
        if (!this[val].isLastPage) {
          this[val].pageNumber++;
          this.initData(val);
        }
      },
      //获取数据 
      initData(val) {
        //提交数据
        let datalist = {
          "userID": getLoc('userInfo').userID,
          "statuses": this[val].statuses,
          "pageNum": this[val].pageNumber,
          "pageSize": this[val].pageSize
        }
        const params = getPostData("findSensorFaultInfo", datalist);

        this._getInfo({
          ops: params,
          method: "post",
          api: "findSensorFaultInfo",
          callback: res => {

            if (val == 'unfinished' && this[val].pageNumber === 1) {
              this.getServerTime();
              this._isRefresh(true);
            }
            this[val].loading = false;
            var div = document.createElement("div");
            div.innerHTML = res;
            var listInfoData = div.querySelector("return").innerHTML;
            if (JSON.parse(listInfoData).isLastPage) {
              this[val].isLastPage = true;
            }
            listInfoData = JSON.parse(listInfoData).list;
            //如果只有一条数据时，上拉的最低文字不显示
            if (this[val].pageNumber === 1 && listInfoData.length < 2) {
              this[val].text = "";
            } else {
              this[val].text = "已经拉到最底了";
            }

            if (listInfoData.length > 0) {
              this[val].show = true;
              this[val].data = [];
              if (listInfoData.length < this[val].pageSize) {
                this[val].upFinished = true;
              }
              //处理数据
              if (this[val].pageNumber === 1) {
                this[val].deviceList = listInfoData
              } else {
                this[val].deviceList = this[val].deviceList.concat(listInfoData)
              }
              for (var i = 0; i < this[val].deviceList.length; i++) {
                var newdata = {
                  faultID: this[val].deviceList[i].faultID,
                  title: this[val].deviceList[i].detailedAddress + "发现故障",
                  status: this[val].deviceList[i].status,
                  time: this[val].deviceList[i].faultStartTime,
                  content: this[val].deviceList[i].faultCause
                }
                this[val].data.push(newdata);
              }
              this[val].isUpLoading = false;
              this[val].isDownLoading = false;
            } else {
              this[val].text = "";
              this[val].upFinished = false;
              this[val].show = false;
              this[val].isDownLoading = false;
              return
            }
          }
        });
        this[val].isUpLoading = false;
      },
      tabFn(val) {
        this.active = val;
        this._activeIndex(val);
      },
      //获取服务器时间
      getServerTime() {
        const params = getPostData("getSystemTime", []);
        this._getInfo({
          ops: params,
          method: "post",
          api: "getSystemTime",
          callback: res => {
            var div = document.createElement("div");
            div.innerHTML = res;
            var listInfoData = div.querySelector("return").innerHTML;
            this.serverTime = listInfoData;
            this._getHandlingFaultTime(this.serverTime);
          }
        })
      },
    },
  }
</script>
<style lang='less' scoped>
  .main {
    position: absolute;
    top: 0;
    right: 0;
    bottom: 0;
    left: 0;
    .van-tabs {
      position: absolute;
      top: 46px;
      right: 0;
      bottom: 0;
      left: 0;
      background-color: #f5f5f5;
      .content {
        position: absolute;
        top: 0.8rem;
        right: 0;
        bottom: 0;
        left: 0;
        overflow-y: auto;
        padding-top: 0.2rem;
      }
      .nodata {
        margin-top: 2rem;
        text-align: center;
        font-size: 0.42rem;
        color: #999;
        width: 100%;
      }
      .van-row {
        margin: 0 0.35rem 0.2rem;
        padding: 0.15rem 0;
        border-radius: 4px;
        overflow: hidden;
        text-align: left;
        border: 0.02333rem solid #e5e5e5;
        background-color: #fff;
        .list-icon {
          width: 0.815rem;
          height: 0.815rem;
          display: block;
          margin: 0 auto;
          background: url(../../assets/icon-fault.png) no-repeat;
          background-size: cover;
          margin-top: 0.8rem;
        }
        .van-icon-arrow {
          margin-top: 1rem;
          font-size: 0.4rem;
          color: #8e8e93;
        }
        .van-cell {
          padding: 0;
        }
        .content-title {
          font-size: 0.36rem;
          width: 75%;
          color: #000;
          display: inline;
          flex: none;
          -webkit-flex: none;
          -webkit-box-flex: none;
        }
        .content-time {
          font-size: 0.28rem;
          line-height: 0.5rem;
          color: #000;
        }
        .content-info {
          font-size: 0.26rem;
          line-height: 0.5rem;
          color: #8e8e93;
        }
      }
    }
  }
</style>
<style>
  .van-tabs--line .van-tabs__wrap {
    height: 0.8rem;
  }
  .van-tabs__nav {
    padding: 0 0.15rem;
  }
  .van-tab {
    border: 0.03rem solid #007bfd;
    color: #007bfd;
    padding: 0;
    line-height: 0.8rem;
    font-size: 0.32rem;
  }
  .van-tab:nth-child(1) {
    border-radius: 0.1rem 0 0 0.1rem;
  }
  .van-tab.van-tab--active {
    background-color: #007bfd;
    color: #fff;
  }
  .van-tabs__line {
    display: none;
  }
  .van-tab:nth-child(2) {
    border-radius: 0 0.1rem 0.1rem 0;
  }
</style>
<style>
  .btn-isok span {
    background-size: 0.26rem;
    padding-left: 0.3rem;
    color: #1989fa;
    font-size: 0.26rem;
  }
</style>
