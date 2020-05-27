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
      <van-loading
        color="#1989fa"
        v-show="notFinish"
      />
      <div class="img">
        <div
          class="noImg"
          v-if="length === 0"
        >
          <img src="../../assets/noimg.jpg" />
        </div>
          <van-swipe
            :autoplay="3000"
            indicator-color="black"
          >
            <van-swipe-item
              v-for="(image, index) in objData.images"
              :key="index"
            >
              <van-image
                :src="image"
                fit="contain"
                v-lazy="image"
                class="fixedHeight"
                @click="swiperImgClick()"
              />
            </van-swipe-item>
          </van-swipe>
        </div>
        <div class="address clearfix">

          <van-cell-group>
            <van-field
              v-model="objData.content"
              class="textarea"
              label="现场情况:"
              type="text"
              label-width="100%"
              label-align="left"
              readonly
              autosize
            />
          </van-cell-group>
          <ul>
            <li>
              <span class="left">派警时间:</span>
              <span class="right">{{time}}</span>
            </li>
            <van-divider />
            <li>
              <span class="left">反馈人:</span>
              <span class="right">{{persons}}</span>
            </li>
            <van-divider />
          </ul>
        </div>
      </div>
    </div>
</template>

<script>
  import { getPostData, getParams, getLoc, setLoc } from '@/utils/common.js';
  import { mapActions, mapState } from 'vuex';
  import { ImagePreview } from 'vant';

  export default {
    data() {
      //这里存放数据
      return {
        title: '派警回执（已处理）',
        dispatchId: '',
        photoName: '',
        chooseTime: false,
        showLoading: false,
        length: 2,
        objData: {
          content: '',
          images: [],
        },
        time: '',
        persons: '',
        notFinish: false
      };
    },
    //监听属性 类似于data概念
    computed: {
      ...mapState(['disptId'])
    },
    //生命周期 - 创建完成（可以访问当前this实例）
    created() {
      this.notFinish = true;
      if(this.$route.params.dispatchId) {
        this.dispatchId = this.$route.params.dispatchId;
      } else {
        this.dispatchId = this.disptId;
      }
      this.init();
    },
    //方法集合
    methods: {
      ...mapActions(['_getInfo']),
      init() {
        const params = getPostData('viewDispatchPolice', [this.dispatchId]);
        this._getInfo({
          ops: params,
          method: 'post',
          api: 'viewDispatchPolice',
          callback: res => {
            var div = document.createElement("div");
            div.innerHTML = res;
            let data = JSON.parse(div.querySelector("return").innerHTML);
            // console.table(data);
            this.objData.content = data.dispatchPoliceDTO.verifyContent;
            this.time = data.dispatchPoliceDTO.dispatchTime;
            this.persons = data.dispatchPoliceDTO.verifyPersonName;

            this.length = data.dispatchPolicePhotoList.length;
            this.objData.images.push(data.imgPath);
            this.showLoading = false;
            this.notFinish = false;

            if(this.length > 0) {
              data.dispatchPolicePhotoList.forEach((item, index) => {
                if(index > 0) {
                  let params2 = getPostData("viewDispatchPolicePhoto", [item]);
                  this._getInfo({
                    ops: params2,
                    methods: "post",
                    api: "viewDispatchPolicePhoto",
                    callback: res => {
                      var div = document.createElement("div");
                      div.innerHTML = res;
                      let imgItem = JSON.parse(div.querySelector("return").innerHTML);
                      this.objData.images.push(imgItem.imgPath);
                    }
                  })
                }
              });
            } else {
              this.images = [];
              this.showLoading = false;
            }
          }
        });
      },
      swiperImgClick() {
        const img = ImagePreview(this.objData.images);
        setLoc("imagePreviewNow",true);
        plus.key.addEventListener("backbutton", onBack => {
          img.close();
          plus.key.removeEventListener("backbutton", onPlusReady);
        });
      }
    }
  }
</script>
<style lang='less' scoped>
  .content {
    margin: 0.3rem 0.44rem;
    .van-cell-group {
      .van-cell {
        &:last-child {
          display: block !important;
          &.van-cell__value {
            .textarea {
              width: 100% !important;
            }
          }
        }
      }
    }
    .img {
      height: 5rem;
    }
    .address {
      padding: 0.4rem 0 0;
      .left {
        width: 1.2rem;
        text-align: center;
        img {
          width: 0.8rem;
          height: 0.8rem;
        }
      }
      .van-cell {
        padding: 0.266667rem 0;
      }
      ul {
        li {
          height: 0.65rem;
          line-height: 0.65rem;
          span {
            display: inline-block;
            font-size: 0.32rem;
            &.left {
              text-align: left;
              width: 30%;
            }
            &.right {
              text-align: right;
              width: 70%;
            }
          }
        }
      }
    }
    #textarea {
      color: #969799;
    }
  }
</style>