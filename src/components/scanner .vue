<template>
  <div class="scanbox">
    <video
      ref="videoRef"
      class="scanner-video"
      muted
      playsinline
    ></video>
 <van-icon
      name="arrow-left"
      class="back-btn"
      size="24"
      @click="goBack"
    />
    <div class="result">
      {{ qrResult || '请将二维码放入镜头中' }}
    </div>

  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'
import QrScanner from 'qr-scanner'
import { validate as uuidValidate } from 'uuid'

// 定义 emits
const emit = defineEmits<{
  (e: 'scan-success', data: string): void
  (e: 'scan-error', error: string): void
  (e: 'close'): void
}>()

// 校验是否为有效的UUID
const isValidUUID = (str: string): boolean => {
  return uuidValidate(str)
}

const videoRef = ref(null)
const qrResult = ref('')
let scanner:any = null

const startScan = async () => {
  if (!scanner && videoRef.value) {
    scanner = new QrScanner(
      videoRef.value,
      result => {
        qrResult.value = result.data
        if (isValidUUID(result.data)) {
          emit('scan-success', result.data)
        }

      },
      {
        returnDetailedScanResult: true,
        highlightScanRegion: true,
        highlightCodeOutline: true,
      }
    )
  }

  await scanner?.start()
}

const stopScan = () => {
  scanner?.stop()
}

onMounted(() => {
  startScan()
})

onUnmounted(() => {
  scanner?.destroy()
})
const goBack = () => {
   stopScan()
  // 向父组件传递关闭事件
  emit('close')
}
</script>

<style scoped>
.scanbox {
  width: 100%;
  height: 100%;
  background-color: black;
  display: flex;
  justify-content: center;
  align-items: center;
}

.scanner-video {
  width: 100%;
}
/* 返回按钮样式 */
.back-btn {
  position: fixed;
  top: 20px;
  left: 20px;
  z-index: 1000;
  width: 34px;
  height: 34px;
  border-radius: 50%;
  background: rgba(0, 0, 0, 0.6);
  backdrop-filter: blur(10px);
  color: #ffffff;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.3s ease;
  border: 1px solid rgba(255, 255, 255, 0.1);
}

.back-btn:hover {
  background: rgba(255, 255, 255, 0.2);
  transform: scale(1.05);
}

.back-btn:active {
  transform: scale(0.95);
}

.result {
  position: fixed;
  bottom: 80px;
  z-index: 1000;
  padding: 12px 20px;
  background: rgba(0, 0, 0, 0.7);
  backdrop-filter: blur(10px);
  color: #ffffff;
  border-radius: 12px;
  font-size: 16px;
  max-width: 300px;
  word-wrap: break-word;
  border: 1px solid rgba(255, 255, 255, 0.1);
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.5);
  transition: all 0.3s ease;
}
</style>
