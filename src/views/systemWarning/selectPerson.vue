<template>
  <div class="list">
    <v-header :title="title"></v-header>
    <van-loading
      size="30px"
      text-size="16px"
      type="spinner"
      style="margin-top:2rem;"
      vertical
      v-if="showLoading"
    >加载中...</van-loading>
    <div
      class="content"
      v-else
    >
      <div class="group2">
        <van-checkbox-group v-model="result">
          <van-cell-group title="请选择人员">
            <van-cell
              v-for="(item, index) in list"
              clickable
              :key="item.patrolmanID"
              :title="`${item.realname}`"
              @click="toggle(index)"
            >
              <van-checkbox
                :name="item"
                ref="checkboxes"
                slot="right-icon"
              />
            </van-cell>
          </van-cell-group>
        </van-checkbox-group>
        <div
          class="btns"
          @click="submit"
        >
          确定
        </div>
      </div>
    </div>
  </div>
</template>

<script>
  import { mapActions, mapMutations } from 'vuex';
  import { getPostData, getParams, getLoc } from '@/utils/common.js';
  import { Toast } from 'vant';
  export default {
    data() {
      //这里存放数据
      return {
        title: '智能监控终端',
        list: [],
        showLoading: true,
        result: []
      };
    },
    props: [],
    //监听属性 类似于data概念
    computed: {},
    //监控data中的数据变化
    watch: {},
    //生命周期 - 创建完成（可以访问当前this实例）
    created() {
      this.init();
    },
    //生命周期 - 挂载完成（可以访问DOM元素）
    mounted() { },
    //方法集合
    methods: {
      ...mapMutations(['_userInfo']),
      ...mapActions(['_getInfo']),
      //获取巡线工列表
      init() {
        const params = getPostData('findPatrolmans', [this.$route.params.warningID]);
        this.list = [];
        this._getInfo({
          ops: params,
          method: 'post',
          api: 'findPatrolmans',
          callback: res => {
            var div = document.createElement('div');
            div.innerHTML = res;
            var curUserinfo = JSON.parse(div.querySelector('return').innerHTML);
            if(curUserinfo.length > 0) {
              for(let i = 0; i < curUserinfo.length; i++) {
                this.list.push({
                  realname: curUserinfo[i].patrolmanName,
                  groupID: curUserinfo[i].groupID,
                  patrolmanID: curUserinfo[i].patrolmanID
                });
              }
            }
            this.showLoading = false;
          }
        });
      },
      toggle(index) {
        this.$refs.checkboxes[index].toggle();
      },
      submit() {
        if(this.result.length > 0) {
          let arr = [];
          for(let i = 0; i < this.result.length; i++) {
            arr.push(this.result[i].patrolmanID);
          }
          let arrString = arr.toString();
          const params = getPostData('dealWarning', { warningID: this.$route.params.warningID, dealTypeFlag: 'pj', toPersonIDs: arrString, dealWithUser: getLoc('userInfo').userID });
          this._getInfo({
            ops: params,
            method: 'post',
            api: 'dealWarning',
            callback: res => {
              var div = document.createElement('div');
              div.innerHTML = res;
              var info = div.querySelector('return').innerHTML;
              if(info == 'success') {
                Toast('派警成功！');
                this.$router.push('/systemWarning');
              } else {
                Toast('派警失败！');
                this.$router.push('/systemWarning');
              }
            }
          });
        } else {
          Toast('请选择巡线工！');
        }
      }
    }
  };
</script>
<style lang="less" scoped>
  .content {
    position: absolute;
    top: 1.226667rem;
    right: 0;
    bottom: 0;
    left: 0;
    background-color: #f3f3f3;
    text-align: left;
    .btns {
      height: 1rem;
      line-height: 1rem;
      overflow: hidden;
      color: #2d92fd;
      margin-top: 0.3rem;
      font-size: 0.32rem;
      background: #fff;
      text-align: center;
    }
    .btns:active {
      background-color: #eaeaea;
    }
  }
</style>
