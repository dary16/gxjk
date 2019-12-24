<template>
  <div class="van-cell" style="padding:0">
    <van-field
      v-model="result"
      v-bind="$attrs"
      readonly
      is-link
      @click="show = !show"
    />
    <van-popup v-model="show" position="bottom">
      <van-picker
        :columns="columns"
        show-toolbar
        :title="$attrs.label"
        @cancel="show = !show"
        @confirm="onConfirm"
      />
    </van-popup>
  </div>
</template>

<script>
  export default {
    model: {
      prop: "selectValue"
    },
    props: {
      columns: {
        type: Array
      },
      selectValue: {
        type: String
      }
    },
    data() {
      return {
        show: false,
        result: this.selectValue
      };
    },
    created() {
    },
    methods: {
      onConfirm(value) {
        this.result = value;
        this.show = !this.show;
      }
    },
    watch: {
      selectValue: function (newVal) {
        this.result = newVal;
      },
      result(newVal) {
        this.$emit("input", newVal);
      }
    }
  }
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>
  h3 {
    margin: 40px 0 0;
  }
  ul {
    list-style-type: none;
    padding: 0;
  }
  li {
    display: inline-block;
    margin: 0 10px;
  }
  a {
    color: #42b983;
  }
</style>
