<template>
  <div class="container">
    <!-- 扫一扫头部 - 调整布局使图标和标题水平对齐 -->
    <div class="scan-header">
      <div class="scan-icon-wrapper">
         <div @click="scan" class="icon-wrapper">
          <van-icon name="scan" size="80px" color="#fff" />
        </div>
      </div>
      <span  class="scan-title">扫一扫</span>
    </div>
    <!-- 输入区域 - 完全按照图片设计 -->
    <div class="input-wrapper">
        <van-field
          v-model="dubaoId"
          placeholder="请输入或者点击上面按钮扫描"
          clearable
          class="input-field"
        />
        <br>
        <van-field
          v-model="dubaoName"
          placeholder="昵称"
          clearable
          class="input-field"
        />
        <van-button
          type="primary"
          size="large"
          class="add-btn"
          @click="handleAdd"
        >
          添加
        </van-button>
          <!-- 底部装饰 - 与图片风格保持一致 -->
          <div class="footer-decoration">
            <span class="footer-text">扫一扫,请输入嘟宝ID</span>
          </div>
    </div>
    <scanner @scan-success="handleScanSuccess" @close="showscanner=!showscanner" class="scanner" v-if="showscanner"/>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { showToast  } from 'vant'
import Scanner from '@/components/scanner .vue'
import { validate as uuidValidate } from 'uuid'
import { useDubaoStore } from '@/store/dubao'
let store = useDubaoStore()

// 输入框绑定值
const dubaoName = ref('')
const dubaoId = ref('')
let showscanner = ref(false)

// 添加按钮点击处理
const handleAdd = () => {
  console.log(1212)
  if (!uuidValidate(dubaoId.value)) {
    showToast("请扫描或者输入正确的嘟宝ID")
    return
  }
  let d = {
    dubaoId: dubaoId.value,
    dubaoName: dubaoName.value,
    cover:'https://img.yzcdn.cn/vant/cat.jpeg'
  }
  store.add(d);
  dubaoId.value = '';
  dubaoName.value = '';
  showToast("添加完成")

}
function scan() {
  showscanner.value = true;

}
function handleScanSuccess(uuid:string) {
  dubaoId.value = uuid;
  showscanner.value = false;
}
</script>

<style scoped>
.container{
  padding-top: 100px;

}
.scan-header{
  height: 30%;
  text-align: center;
}
.scan-title{
  font-size: 20px;
}
.input-wrapper{
  font-size: 15px;
  text-align: center;
  padding: 50px;
}
.input-field{
  border: 2px solid #1989fa; border-radius: 4px;
}
.add-btn{
  margin-top: 30px;
  width: 100%;
}
.footer-decoration{
  margin: 10px;
  font-size: 15x;
  text-align: right;

}
.icon-wrapper {
  display: inline-flex;
  justify-content: center;
  align-items: center;
  background: #1989fa;
  border-radius: 50%;
  padding: 10px;
}
.scanner{
  position: fixed;
  left: 0;
  top: 0;
  bottom: 0;
  right: 0;
}

</style>
