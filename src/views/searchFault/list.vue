<template>
  <div class="main searchFaulut">
    <v-header
      :title="title"
      :isShow="isShow"
      :gohome="gohome"
    ></v-header>
    <van-tabs
      swipeable
      background="#f0f0f0"
    >
      <van-tab
        title="故障列表"
        class="content"
      >
        <van-pull-refresh
          v-model="unfinished.isDownLoading"
          @refresh="onDownRefresh('unfinished')"
        >
          <van-list
            id='unfinished-list'
            v-model="unfinished.isUpLoading"
            :finished="unfinished.upFinished"
            :immediate-check="false"
            :finished-text="unfinished.text"
            :offset="1"
            @load="onLoad('unfinished')"
          >
            <!-- 加载的内容-->
            <van-loading
              type="spinner"
              v-if="unfinished.loading"
            />
            <div v-if="unfinished.data.length > 0">
              <van-row
                v-for="item in unfinished.data"
                :key="item.faultID"
                @click="infoIdFn(item)"
              >
                <van-col span="5"> <span class="list-icon"></span></van-col>
                <van-col span="17">
                  <van-cell
                    :title="item.title"
                    title-class="content-title"
                    :value="item.status"
                    value-class="btn-sendPolice"
                  ></van-cell>
                  <p class="content-time">{{ item.time }}</p>
                  <p class="content-info">【详情】 {{ item.content }}</p>
                </van-col>
                <van-col span="2">
                  <van-icon name="arrow" />
                </van-col>
              </van-row>
            </div>
            <div
              class="nodata"
              v-else
            >暂无数据</div>
          </van-list>
        </van-pull-refresh>
      </van-tab>
    </van-tabs>
  </div>
</template>

<script>
  import { getPostData, getParams, getLoc, setLoc } from '@/utils/common.js';
  import { mapActions, mapMutations, mapState } from 'vuex';
  import { Notify } from 'vant';
  export default {
    props:['flagRe'],
    data() {
      //这里存放数据
      return {
        title: '故障通知',
        isShow: 'show',
        gohome: true,
        unfinished: {
          statuses: '',
          text: '已经拉到最底了',
          data: [],
          loading: true,
          show: true,
          pageNumber: 1, //页数
          pageSize: 10, //每页条数
          isUpLoading: false, //控制上拉加载的加载动画
          upFinished: false, //上拉加载完毕
          isDownLoading: false, //控制下拉刷新的加载动画
          deviceList: [], //用于存放加载的数据
          isLastPage: false
        },
      };
    },
    //生命周期 - 创建完成（可以访问当前this实例）
    created() {
      //初始化数据
      this.initData('unfinished');
    },
    watch:{
      flagRe(){
        document.getElementById('unfinished-list').scrollIntoView();
        this.unfinished.isDownLoading = true;
        this.onDownRefresh('unfinished');
      }
    },
    computed:{
      ...mapState(['newMsgNum']),
    },
    //生命周期 - 挂载完成（可以访问DOM元素）
    mounted() { },
    //方法集合
    methods: {
      ...mapMutations(['_userInfo', '_warnId','_newMsgNum']),
      ...mapActions(['_getInfo']),
      //详情
      infoIdFn(val) {
        this._warnId(val.faultID);
        this.$router.push({ name: 'searchFaultMessage', params: { status: val.status } });
      },
      onDownRefresh(val) {
        this[val].pageNumber = 1;
        this[val].upFinished = false;
        setTimeout(() => {
          this[val].isDownLoading = false;
          //下拉时显示更新消息数
          if(val == 'unfinished') {
            if(this.newMsgNum > 0) {
              Notify({ type: 'primary', message: '更新了' + this.newMsgNum + '条消息', duration: 1500 });
              const params = getPostData("findSensorFaultInfoNotViewNum", {"userID": getLoc('userInfo').userID,"statuses": "","clickTime": getLoc('getSearchFaultTime')});
              this._getInfo({
                ops: params,
                method: "post",
                api: "findSensorFaultInfoNotViewNum",
                callback: res => {
                  var div = document.createElement("div");
                  div.innerHTML = res;
                  var listInfoData = div.querySelector("return").innerHTML;
                  this._newMsgNum(Number(listInfoData));
                }
              })
            } else {
              Notify({ type: 'primary', message: '暂无更多新消息', duration: 1500 });
            }
          }
        }, 500);
        this.initData(val); //加载数据
      },
      onLoad(val) {
        if(!this[val].isLastPage) {
          this[val].pageNumber++;
          this.initData(val);
        }
        this[val].isUpLoading = false;
      },
      //获取数据
      initData(val) {
        //提交数据
        const params = getPostData('findSensorFaultInfo', {
          userID: getLoc('userInfo').userID,
          statuses: this[val].statuses,
          pageNum: this[val].pageNumber,
          pageSize: this[val].pageSize
        });

        this._getInfo({
          ops: params,
          method: 'post',
          api: 'findSensorFaultInfo',
          callback: res => {
            if(val == 'unfinished' && this[val].pageNumber === 1) {
              this.getServerTime();
            }
            this[val].loading = false;
            var div = document.createElement('div');
            div.innerHTML = res;
            var listInfoData = div.querySelector('return').innerHTML;
            if(JSON.parse(listInfoData).isLastPage) {
              this[val].isLastPage = true;
            }
            //判断是否有下一页
            let hasNextPage = JSON.parse(listInfoData).hasNextPage;
            listInfoData = JSON.parse(listInfoData).list;
            //如果只有一条数据时，上拉的最低文字不显示
            if(this[val].pageNumber === 1 && listInfoData.length < 2) {
              this[val].text = '';
            } else {
              this[val].text = '已经拉到最底了';
            }
            if(listInfoData.length > 0) {
              this[val].show = true;
              this[val].data = [];
              //已加载完所有数据
              if(!hasNextPage) {
                this[val].upFinished = true;
              }
              //处理数据
              if(this[val].pageNumber === 1) {
                this[val].deviceList = listInfoData;
              } else {
                this[val].deviceList = this[val].deviceList.concat(listInfoData);
              }
              for(var i = 0; i < this[val].deviceList.length; i++) {
                var newdata = {
                  faultID: this[val].deviceList[i].faultID,
                  title: this[val].deviceList[i].detailedAddress + '设备故障',
                  status: this[val].deviceList[i].status,
                  time: this[val].deviceList[i].faultStartTimeFormat,
                  content: this[val].deviceList[i].faultCause
                };
                this[val].data.push(newdata);
              }
            } else {
              this[val].show = false;
              return;
            }
          }
        });
      },
      //获取服务器时间
      getServerTime() {
        const params = getPostData('getSystemTime', []);
        this._getInfo({
          ops: params,
          method: 'post',
          api: 'getSystemTime',
          callback: res => {
            var div = document.createElement('div');
            div.innerHTML = res;
            var listInfoData = div.querySelector('return').innerHTML;
            setLoc('getSearchFaultTime', listInfoData);
          }
        });
      }
    }
  };
</script>
<style lang="less" scoped>
  .main {
    position: absolute;
    top: 0;
    right: 0;
    bottom: 0;
    left: 0;
    .van-pull-refresh {
      min-height: calc(100vh - 3.6rem);
    }
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
          color: #000;
          display: inline;
          flex: none;
          -webkit-flex: none;
          -webkit-box-flex: none;
          width: 75%;
          span {
            white-space: pre-wrap;
          }
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
  .searchFaulut .van-tab:nth-child(1) {
    border-radius: 0.1rem 0.1rem 0.1rem 0.1rem;
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
  .btn-sendPolice span {
    color: #1989fa;
    padding: 2px;
    font-size: 0.26rem;
  }
  .btn-isok span {
    background-size: 0.26rem;
    padding-left: 0.3rem;
    color: #07c160;
    font-size: 0.26rem;
  }
</style>
