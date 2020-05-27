<template>
  <div class="mainList">
    <van-row
      v-for="(item, index) in items"
      :key="index"
      @click="infoFns(item)"
    >
      <van-col span="5"> <span class="list-icon"></span></van-col>
      <van-col span="17">
        <van-cell
          :title="item.title"
          title-class="content-title"
          :value="item.warningStatus"
          :value-class="item.warningStatusClass"
        >
          <template slot="title">
            <span class="custom-title">{{ item.title }}</span>
            <div
              v-show="showIcon"
              class="icon-style"
            >
              <van-icon
                name="warn-o"
                v-if="item.level == 0"
                color="grey"
                style="margin-top:.25rem"
              />
              <van-icon
                name="warn-o"
                v-else-if="item.level == 1"
                color="red"
                style="margin-top:.25rem"
              />
              <van-icon
                name="warn-o"
                v-else-if="item.level == 2"
                color="orange"
                style="margin-top:.25rem"
              />
              <van-icon
                name="warn-o"
                v-else
                color="blue"
                style="margin-top:.25rem"
              />
            </div>
          </template>
        </van-cell>
        <p class="content-time">{{ item.time }}</p>
        <p class="content-info">【描述】 {{ item.content }}</p>
      </van-col>
      <van-col span="2">
        <van-icon name="arrow" />
      </van-col>
    </van-row>
  </div>
</template>

<script>
  export default {
    data() {
      return {};
    },
    props: ['items', 'infoFn', 'showIcon'],
    //方法集合
    methods: {
      infoFns(val) {
        this.$emit('infoIdFn', val);
      }
    }
  };
</script>

<style lang="less" scoped>
  .mainList {
    padding-top: 0.2rem;
    .icon-style {
      float: left;
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
        background: url(../assets/icon-ruqin.png) no-repeat;
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
        line-height: 0.8rem;
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
</style>
<style>
  .mainList .van-cell-group .content::after {
    display: none;
  }
  .btn-sendPolice span {
    color: #1989fa;
    padding: 2px;
    font-size: 0.26rem;
  }
  .btn-receipt span {
    color: #9b19fa;
    padding: 2px;
    font-size: 0.26rem;
  }
  .btn-right span {
    background: url(../assets/icon-right.png) no-repeat center left;
    background-size: 0.26rem;
    padding-left: 0.3rem;
    color: #07c160;
    font-size: 0.26rem;
  }
  .btn-error span {
    background: url(../assets/icon-error.png) no-repeat center left;
    background-size: 0.26rem;
    padding-left: 0.3rem;
    color: #ff976a;
    font-size: 0.26rem;
  }
  .btn-isok span {
    background-size: 0.26rem;
    padding-left: 0.3rem;
    color: #07c160;
    font-size: 0.26rem;
  }
</style>
