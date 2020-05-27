<template>
  <div class="main">
    <v-header
      :title="title"
      :isShow="isShow"
      :gohome="gohome"
    ></v-header>
    <van-tabs
      v-model="active"
      swipeable
      background="#f0f0f0"
      @click="tabFn"
    >
      <van-tab
        title="未处理"
        class="content"
      >
        <van-pull-refresh
          v-model="unfinished.isDownLoading"
          @refresh="onDownRefresh('unfinished')"
        >
          <van-list
            id="unfinished-list"
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
            <v-list-item
              v-if="unfinished.show"
              :items="unfinished.data"
              :infoFn="infoFn"
              :showIcon="true"
              v-on:infoIdFn="infoIdFn"
            ></v-list-item>
            <div
              v-else
              class="nodata"
            >暂无数据</div>
          </van-list>
        </van-pull-refresh>
      </van-tab>
      <van-tab
        title="已处理"
        class="content"
      >
        <van-pull-refresh
          v-model="finished.isDownLoading"
          @refresh="onDownRefresh('finished')"
        >
          <van-list
            id="finished-list"
            v-model="finished.isUpLoading"
            :finished="finished.upFinished"
            :immediate-check="false"
            :finished-text="finished.text"
            :offset="1"
            @load="onLoad('finished')"
          >
            <!-- 加载的内容-->
            <van-loading
              type="spinner"
              v-if="finished.loading"
            />
            <v-list-item
              v-if="finished.show"
              :items="finished.data"
              v-on:infoIdFn="infoFnFinished"
              :showIcon="true"
            ></v-list-item>
            <div
              v-else
              class="nodata"
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
    props: ['flagRe'],
    data() {
      //这里存放数据
      return {
        title: '系统告警消息',
        id: '',
        infoId: '',
        isShow: 'show',
        gohome: true,
        active: 0,
        unfinished: {
          type: '未处理',
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
        finished: {
          type: '',
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
        }
      };
    },
    watch: {
      flagRe(newval, oldVal) {
        //已处理和未处理标签：1 已处理，0未处理
        if(this.active === 1) {
          //返回顶部
          document.getElementById('finished-list').scrollIntoView();
          this.finished.isDownLoading = true;
          this.onDownRefresh('finished');
        } else if(this.active === 0) {
          //返回顶部
          document.getElementById('unfinished-list').scrollIntoView();
          this.unfinished.isDownLoading = true;
          this.onDownRefresh('unfinished');
        }
      }
    },
    //监听属性 类似于data概念
    computed: {
      ...mapState(['activeIndex', 'getSystemWarningTime', 'newMsgNum'])
    },
    //生命周期 - 创建完成（可以访问当前this实例）
    created() {
      this.active = this.activeIndex;
      //初始化数据
      this.initData('unfinished');
      this.initData('finished');
    },
    //方法集合
    methods: {
      ...mapMutations(['_userInfo', '_warnId', '_disptId', '_activeIndex', '_newMsgNum']),
      ...mapActions(['_getInfo']),
      infoFn() {
        this.$router.push('/systemWarningInfo');
      },
      infoIdFn(val) {
        let warnId = val.id;
        let dispId = val.dispatchId;
        this._warnId(val.id);
        this._disptId(val.dispatchId);
        this.$router.push('/systemWarningInfo');
      },
      //详情
      infoFnFinished(val) {
        let warnId = val.id;
        let dispId = val.dispatchId;
        this._warnId(val.id);
        this._disptId(val.dispatchId);
        this.$router.push({ name: 'systemWarningFinishedDetails', params: { status: val.status } });
      },
      onDownRefresh(val) {
        this.initData(val); //加载数据
        this[val].pageNumber = 1;
        this[val].upFinished = false;
        setTimeout(() => {
          //下拉时显示更新消息数
          this[val].isDownLoading = false;
          if(val == 'unfinished') {
            if(this.newMsgNum > 0) {
              Notify({ type: 'primary', message: '更新了' + this.newMsgNum + '条消息', duration: 1500 });
              //更新后重新修改状态
              const params = getPostData('findNewWarningNum', [getLoc('userInfo').userID, getLoc('getSystemWarningTime')]);
              this._getInfo({
                ops: params,
                method: 'post',
                api: 'findNewWarningNum',
                callback: (res) => {
                  var div = document.createElement('div');
                  div.innerHTML = res;
                  var listInfoData = div.querySelector('return').innerHTML;
                  this._newMsgNum(Number(listInfoData));
                }
              });
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
      //获取数据 参数val  unfinished:未完成 finished:已完成
      initData(val) {
        //提交数据
        const params = getPostData('findWarningList', [getLoc('userInfo').userID, this[val].type, this[val].pageNumber, this[val].pageSize]);
        this._getInfo({
          ops: params,
          method: 'post',
          api: 'findWarningList',
          callback: (res) => {
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
                // console.log(this[val].deviceList[i]);
                let newdata = {
                  id: this[val].deviceList[i].warningID,
                  dispatchId: this[val].deviceList[i].dispatchPoliceID,
                  title: this[val].deviceList[i].warningTypeLabel + '告警',
                  warningStatus: '',
                  warningStatusClass: '',
                  level: this[val].deviceList[i].soundLevel,
                  time: this[val].deviceList[i].warningTimeFormat,
                  info: '检测到' + this[val].deviceList[i].warningTypeLabel + '',
                  content: this[val].deviceList[i].warningAddress + '，标桩号：' + this[val].deviceList[i].stakeNO + '，预置位：' + this[val].deviceList[i].presetNO + '，检测到' + this[val].deviceList[i].warningStatusLabel + this[val].deviceList[i].warningTypeLabel,
                  status: this[val].deviceList[i].status
                };
                // console.log(this[val].deviceList[i]);
                //显示告警状态标识
                if(this[val].deviceList[i].warningStatus == '1') {
                  if(this[val].deviceList[i].isSendPolice == '是') {
                    if(this[val].deviceList[i].status == '已回执') {
                      newdata.warningStatus = '已回执';
                      newdata.warningStatusClass = 'btn-receipt';
                    } else {
                      newdata.warningStatus = '已派警';
                      newdata.warningStatusClass = 'btn-sendPolice';
                    }
                  }
                } else if(this[val].deviceList[i].warningStatus == '3') {
                  newdata.warningStatus = '识别正确';
                  newdata.warningStatusClass = 'btn-right';
                } else if(this[val].deviceList[i].warningStatus == '2') {
                  newdata.warningStatus = '识别错误';
                  newdata.warningStatusClass = 'btn-error';
                }
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
          callback: (res) => {
            var div = document.createElement('div');
            div.innerHTML = res;
            var listInfoData = div.querySelector('return').innerHTML;
            setLoc('getSystemWarningTime', listInfoData);
          }
        });
      },
      tabFn(val) {
        this.active = val;
        this._activeIndex(val);
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
      background-color: #f0f0f0;
      .content {
        position: absolute;
        top: 0.8rem;
        right: 0;
        bottom: 0;
        left: 0;
        overflow-y: auto;
      }
      .nodata {
        margin-top: 2rem;
        text-align: center;
        font-size: 0.42rem;
        color: #999;
        width: 100%;
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
