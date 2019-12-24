<template>
  <div class="list">
    <v-header
      :title="title"
      v-on:refrash="refrashFn"
    ></v-header>
    <div class="cell-wrap">
      <div class="group2">
        <van-cell-group>
          <div class="t-textarea">
            现场情况
          </div>
          <van-divider />
          <van-field
            v-model="objData.verifyContent"
            id="textarea"
            type="textarea"
            class="textarea"
            placeholder="（必填）核实情况"
            label-width="100%"
            label-align="left"
            autosize
          />
        </van-cell-group>
        <van-divider />
      </div>

      <div class="loader-wrap">
        <div class="group2">
          <div class="t-textarea">
            现场照片（最多9张）
          </div>
        </div>
        <div class="load-pic">
          <van-uploader
            v-model="imgList"
            :max-count="9"
            :after-read="afterRead"
            :before-read="beforeRead"
            @delete="deleteFn"
            multiple
          />
        </div>
      </div>
      <div class="footer-btn">
        <div
          class="btns"
          @click="commitFn"
        >
          提交
        </div>
      </div>
    </div>
  </div>
</template>

<script>
  import { mapActions } from 'vuex';
  import { getPostData, getParams, getLoc } from "@/utils/common.js";
  import { Toast, Dialog } from "vant";
  export default {
    data() {
      //这里存放数据
      return {
        title: '结果反馈（处理中）',
        objData: {
          dispatchPoliceID: '',
          warningID: '',
          verifyPersonID: '',
          verifyContent: '',
          ImageNameList: []
        },
        fileList: [],
        imgList: []
      };
    },
    //生命周期 - 创建完成（可以访问当前this实例）
    created() {
      this.objData.dispatchPoliceID = this.$route.params.dispatchId;
      this.objData.warningID = this.$route.params.warningID;
      this.objData.verifyPersonID = getLoc('userInfo').userID;
    },
    //方法集合
    methods: {
      ...mapActions(['_getInfo']),
      //提交
      commitFn() {
        if(!this.objData.verifyContent) {
          Toast({ position: "bottom", message: "内容不能为空" });
          return false;
        }
        if(this.objData.ImageNameList.length === 0) {
          Toast({ position: "bottom", message: "请上传照片" });
          return false;
        }
        let params = getPostData("addDispatchPolice", {
          "warningID": this.objData.warningID,
          "verifyPersonID": this.objData.verifyPersonID,
          "verifyContent": this.objData.verifyContent,
          "ImageNameList": this.objData.ImageNameList
        });
        this._getInfo({
          ops: params,
          method: "post",
          api: "addDispatchPolice",
          callback: res => {
            var div = document.createElement("div");
            div.innerHTML = res;

            var resData = JSON.parse(div.querySelector("return").innerHTML);
            if(resData.result === '' && resData.status === 'success') {
              this.$router.push('/dispatchPolice');
            } else {
              Toast({ position: "bottom", message: "上传失败" });
              this.$router.push('/dispatchPolice');
            }
          }
        })
      },
      //关闭
      cancelFn() {
        this.$router.push('/dispatchPolice');
      },
      //上传前进行校验
      beforeRead(file) {
        if(file.type !== "image/jpeg") {
          Toast('请上传 jpg 格式图片');
          return false;
        }
        return true;
      },
      afterRead(file) {
        // 此时可以自行将文件上传至服务器
        this.fileList.push(file);

        var base64Img = file.content;
        let params = getPostData("uploadDispatchVerifyImage", [base64Img]);

        this._getInfo({
          ops: params,
          method: "post",
          api: "uploadDispatchVerifyImage",
          callback: res => {
            var div = document.createElement("div");
            div.innerHTML = res;
            var imgSrc = div.querySelector("return").innerHTML;
            this.objData.ImageNameList.push(imgSrc);
          }
        })

      },
      deleteFn(delFile) {
        this.fileList.forEach((item, index) => {
          if(item.file.name === delFile.file.name) {
            this.fileList.splice(index, 1);
            this.objData.ImageNameList.splice(index, 1);
          }
        })
      },
      refrashFn() {
        // this.objData.dispatchPoliceID = this.$route.params.dispatchId;
        // this.objData.verifyPersonID = getLoc('userInfo').userID;
      }
    }
  }
</script>
<style lang='less' scoped>
  .list {
    background: #f3f3f3;
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    .cell-wrap {
      .van-cell-group {
        .van-cell {
          &:last-child {
            display: block !important;
            &.van-cell__value {
              textarea {
                width: 100% !important;
              }
            }
          }
        }
      }
      .loader-wrap {
        text-align: left;
        margin-top: 0.3rem;
        h3 {
          color: #323233;
          font-size: 14px;
          height: 0.6rem;
          line-height: 0.6rem;
        }
      }
      .footer-btn {
        margin-top: 0.3rem;
        .btns {
          padding: 0.2rem 0.35rem;
          overflow: hidden;
          color: #2d92fd;
          margin-top: 0.3rem;
          font-size: 0.3rem;
          background: #fff;
        }
        .btns:active {
          background-color: #eaeaea;
        }
      }
      .load-pic {
        margin-top: 0.1rem;
      }
    }
  }
</style>
<style>
  #textarea {
    color: #969799;
  }
</style>