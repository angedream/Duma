<template>
  <div class="scan-container">
    <!-- 顶部标题 -->
    <van-nav-bar
      title="扫一扫"
      left-text="返回"
      left-arrow
      @click-left="onBack"
    />

    <!-- 二维码扫描区域 -->
    <div class="scan-area">
      <div class="scan-box">
        <!-- 扫描框 -->
        <div class="scan-frame">
          <!-- 四个角 -->
          <div class="corner tl"></div>
          <div class="corner tr"></div>
          <div class="corner bl"></div>
          <div class="corner br"></div>

          <!-- 扫描线动画 -->
          <div class="scan-line"></div>

          <!-- 中间图标 -->
          <van-icon name="scan" size="40" color="#fff" />
        </div>

        <!-- 提示文字 -->
        <p class="scan-tip">将二维码放入框内，即可自动识别</p>
      </div>
    </div>

    <!-- 底部操作区域 -->
    <div class="bottom-actions">
      <!-- 手动输入 -->
      <div class="manual-input">
        <van-field
          v-model="number"
          placeholder="请输入数字号码"
          clearable
          maxlength="20"
          @focus="onInputFocus"
          @blur="onInputBlur"
        >
          <template #left-icon>
            <van-icon name="edit" />
          </template>
          <template #button>
            <van-button
              type="primary"
              size="small"
              round
              :disabled="!number.trim()"
              @click="onAdd"
            >
              添加
            </van-button>
          </template>
        </van-field>
      </div>

      <!-- 底部按钮 -->
      <div class="bottom-buttons">
        <van-button
          round
          block
          type="primary"
          icon="photograph"
          @click="onSelectImage"
        >
          从相册选择二维码
        </van-button>

        <van-button
          round
          block
          plain
          type="primary"
          icon="flash"
          @click="toggleFlash"
        >
          {{ flashOn ? '关闭手电筒' : '开启手电筒' }}
        </van-button>
      </div>
    </div>

    <!-- 相册选择 -->
    <van-uploader
      v-model="fileList"
      :after-read="onAfterRead"
      accept="image/*"
      max-count="1"
      style="display: none"
    />
  </div>
</template>

<script setup>
import { ref, onMounted, onBeforeUnmount } from 'vue'
import { useRouter } from 'vue-router'
import { showToast, showDialog } from 'vant'

const router = useRouter()

// 数据
const number = ref('')
const fileList = ref([])
const flashOn = ref(false)
const isScanning = ref(false)

// 扫码相关
let scanner = null
let stream = null

// 返回
const onBack = () => {
  router.back()
}

// 添加号码
const onAdd = () => {
  if (!number.value.trim()) {
    showToast('请输入数字号码')
    return
  }

  showDialog({
    title: '确认添加',
    message: `确定要添加号码 "${number.value.trim()}" 吗？`,
    confirmButtonText: '确认添加',
    cancelButtonText: '取消'
  }).then((res) => {
    if (res === 'confirm') {
      handleAddNumber(number.value.trim())
    }
  })
}

// 处理添加
const handleAddNumber = (num) => {
  console.log('添加号码:', num)
  showToast({
    message: '添加成功',
    icon: 'success'
  })
  number.value = ''
  // 执行添加逻辑...
}

// 从相册选择
const onSelectImage = () => {
  // 触发文件选择
  const input = document.querySelector('.van-uploader input[type="file"]')
  if (input) {
    input.click()
  }
}

// 选择图片后处理
const onAfterRead = (file) => {
  console.log('选择的图片:', file)
  // 这里可以调用二维码识别 API
  showToast('识别中...')

  // 模拟识别结果
  setTimeout(() => {
    showDialog({
      title: '识别结果',
      message: '识别到二维码内容：https://example.com',
      confirmButtonText: '确定',
      showCancelButton: false
    })
  }, 1500)

  // 清空 fileList
  setTimeout(() => {
    fileList.value = []
  }, 100)
}

// 切换手电筒
const toggleFlash = async () => {
  try {
    if (!stream) {
      showToast('摄像头未打开')
      return
    }

    const track = stream.getVideoTracks()[0]
    if (!track) {
      showToast('无法获取摄像头')
      return
    }

    // 获取摄像头能力
    const capabilities = track.getCapabilities()

    if (!capabilities.torch) {
      showToast('设备不支持手电筒')
      return
    }

    // 切换手电筒状态
    await track.applyConstraints({
      advanced: [{ torch: !flashOn.value }]
    })

    flashOn.value = !flashOn.value
    showToast(flashOn.value ? '手电筒已开启' : '手电筒已关闭')

  } catch (error) {
    console.error('切换手电筒失败:', error)
    showToast('手电筒操作失败')
  }
}

// 输入框获得焦点
const onInputFocus = () => {
  // 暂停扫描
  pauseScan()
}

// 输入框失去焦点
const onInputBlur = () => {
  // 恢复扫描
  resumeScan()
}

// 初始化摄像头
const initCamera = async () => {
  try {
    stream = await navigator.mediaDevices.getUserMedia({
      video: {
        facingMode: 'environment',
        width: { ideal: 1280 },
        height: { ideal: 720 }
      }
    })

    // 这里可以使用第三方库如 @zxing/library 进行二维码识别
    // 或者使用 html5-qrcode 等库

    isScanning.value = true
    console.log('摄像头已启动')

  } catch (error) {
    console.error('摄像头启动失败:', error)
    showToast('无法访问摄像头，请检查权限设置')
  }
}

// 暂停扫描
const pauseScan = () => {
  if (stream) {
    stream.getTracks().forEach(track => track.enabled = false)
  }
}

// 恢复扫描
const resumeScan = () => {
  if (stream) {
    stream.getTracks().forEach(track => track.enabled = true)
  }
}

// 组件挂载
onMounted(() => {
  initCamera()
})

// 组件卸载
onBeforeUnmount(() => {
  // 关闭摄像头
  if (stream) {
    stream.getTracks().forEach(track => track.stop())
  }
  // 清除定时器
  if (scanLineTimer) {
    clearInterval(scanLineTimer)
  }
})

// 扫描线动画
let scanLineTimer = null

// 启动扫描线动画
const startScanLine = () => {
  const scanLine = document.querySelector('.scan-line')
  if (!scanLine) return

  let position = 0
  const step = 2

  scanLineTimer = setInterval(() => {
    position += step
    if (position > 200) {
      position = 0
    }
    scanLine.style.top = position + 'px'
  }, 50)
}

// 停止扫描线动画
const stopScanLine = () => {
  if (scanLineTimer) {
    clearInterval(scanLineTimer)
    scanLineTimer = null
  }
}
</script>

<style scoped>
.scan-container {
  min-height: 100vh;
  background: #000;
  display: flex;
  flex-direction: column;
}

/* 导航栏样式覆盖 */
:deep(.van-nav-bar) {
  background: transparent;
}

:deep(.van-nav-bar__title) {
  color: #fff;
  font-size: 18px;
  font-weight: 500;
}

:deep(.van-nav-bar .van-icon) {
  color: #fff;
}

/* 扫描区域 */
.scan-area {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 20px;
}

.scan-box {
  position: relative;
  width: 280px;
  height: 280px;
}

.scan-frame {
  position: relative;
  width: 100%;
  height: 100%;
  background: rgba(0, 0, 0, 0.4);
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
}

/* 四个角 */
.corner {
  position: absolute;
  width: 30px;
  height: 30px;
  border-color: #fff;
  border-style: solid;
  border-width: 0;
}

.corner.tl {
  top: 8px;
  left: 8px;
  border-top-width: 3px;
  border-left-width: 3px;
  border-radius: 4px 0 0 0;
}

.corner.tr {
  top: 8px;
  right: 8px;
  border-top-width: 3px;
  border-right-width: 3px;
  border-radius: 0 4px 0 0;
}

.corner.bl {
  bottom: 8px;
  left: 8px;
  border-bottom-width: 3px;
  border-left-width: 3px;
  border-radius: 0 0 0 4px;
}

.corner.br {
  bottom: 8px;
  right: 8px;
  border-bottom-width: 3px;
  border-right-width: 3px;
  border-radius: 0 0 4px 0;
}

/* 扫描线 */
.scan-line {
  position: absolute;
  left: 20px;
  right: 20px;
  height: 2px;
  background: linear-gradient(90deg, transparent, #07c160, transparent);
  top: 0;
  animation: scanMove 2.5s ease-in-out infinite;
  box-shadow: 0 0 10px rgba(7, 193, 96, 0.5);
}

@keyframes scanMove {
  0% {
    top: 10px;
  }
  50% {
    top: calc(100% - 10px);
  }
  100% {
    top: 10px;
  }
}

.scan-tip {
  position: absolute;
  bottom: -40px;
  left: 0;
  right: 0;
  text-align: center;
  color: rgba(255, 255, 255, 0.7);
  font-size: 14px;
  margin: 0;
}

/* 底部操作区域 */
.bottom-actions {
  padding: 20px 24px 40px;
  background: #1a1a1a;
  border-radius: 20px 20px 0 0;
}

/* 手动输入 */
.manual-input {
  margin-bottom: 20px;
}

:deep(.van-field) {
  background: rgba(255, 255, 255, 0.08);
  border-radius: 24px;
  padding: 8px 16px;
}

:deep(.van-field__body) {
  align-items: center;
}

:deep(.van-field__control) {
  color: #fff;
  font-size: 15px;
}

:deep(.van-field__control::placeholder) {
  color: rgba(255, 255, 255, 0.4);
}

:deep(.van-field .van-icon) {
  color: rgba(255, 255, 255, 0.5);
  font-size: 18px;
}

:deep(.van-field .van-button) {
  padding: 6px 18px;
  font-size: 14px;
  background: linear-gradient(135deg, #07c160, #06ad56);
  border: none;
}

:deep(.van-field .van-button:disabled) {
  background: rgba(255, 255, 255, 0.1);
  color: rgba(255, 255, 255, 0.3);
}

/* 底部按钮 */
.bottom-buttons {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

:deep(.van-button--primary) {
  background: linear-gradient(135deg, #07c160, #06ad56);
  border: none;
  height: 44px;
  font-size: 15px;
  font-weight: 500;
}

:deep(.van-button--plain.van-button--primary) {
  background: transparent;
  border: 1px solid rgba(7, 193, 96, 0.5);
  color: #07c160;
}

:deep(.van-button .van-icon) {
  font-size: 18px;
  margin-right: 6px;
}

/* 扫描区域占位 */
.scan-placeholder {
  display: none;
}
</style>
