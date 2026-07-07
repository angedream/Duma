<template>
  <div class="container">
    <van-nav-bar
      :title="dubao?.dubaoName || '嘟宝'"
      left-text="返回"
      left-arrow
      @click-left="goback"
    >
      <template #right>
        <div class="nav-right" @click="showMenu = true">
          <van-icon name="ellipsis" size="18" />
        </div>
      </template>
    </van-nav-bar>
    <van-action-sheet
      v-model:show="showMenu"
      :actions="menuActions"
      cancel-text="取消"
      @select="onMenuSelect"
    />
    <div class="video-container">
      <video id="remoteVideo" controls controlslist="noremoteplayback fullscreen"></video>
    </div>
    <div class="video-controls">
       <span class="control-btn"  >
             <svg class="icon" aria-hidden="true">
              <use xlink:href="#icon-ziyuan" ></use>
            </svg>
          </span>
        <span class="control-btn">
             <svg class="icon" aria-hidden="true">
              <use xlink:href="#icon-guanbishengyin"></use>
            </svg>
          </span>

          <span class="control-btn">
            <svg class="icon" aria-hidden="true" >
              <use xlink:href="#icon-xiaoxi" ></use>
            </svg>
        </span>
        <span class="control-btn">
           <svg class="icon" aria-hidden="true" >
              <use xlink:href="#icon-dingwei" ></use>
            </svg>
        </span>

    </div>
  </div>
</template>
<script setup lang="ts">
import { onMounted, onUnmounted, ref } from 'vue'
import { c } from '@/myconfig'
import { useMQTTStore } from '@/store/mqtt'
import { useRoute, useRouter } from 'vue-router'
import { useDubaoStore } from '@/store/dubao'
import { dubaoclient } from '@/utils/dubao'
const client = new dubaoclient({coturnurl: c.coturnurl},pushmsg)
let store = useDubaoStore()
const route = useRoute()
const router = useRouter()
const { dubaoId } = route.params
const dubao = store.getDuBao(dubaoId as string)
const mqtt = useMQTTStore()
const showMenu = ref(false)
const menuActions = [
  { name: '呼叫', icon: 'phone-o', action: 'call' },
  { name: '切换相机', icon: 'replay', action: 'changecam' },
  { name: '远程桌面', icon: 'desktop-o', action: 'changescreen' },
  { name: '挂断', icon: 'cross', action: 'bye', color: '#ee0a24' },
]
mqtt.$subscribe(async (mutate: any, state) => {
  if (typeof mutate.events.newValue === 'boolean') {
    console.log('是布尔类型')
    return
  }
  let data = JSON.parse(state.datamsg)
  let msg = JSON.parse(data.msg)
  switch (msg.code) {
    case 'answer':
      // await peerConnection.setRemoteDescription(new RTCSessionDescription(JSON.parse(msg.data)))
      client.setRemoteDescription(msg.data);
      break
    case 'ice':
      // await peerConnection.addIceCandidate(new RTCIceCandidate(JSON.parse(msg.data)))
      client.addIceCandidate(msg.data);
    default:
      break
  }
})

onMounted(() => {
  client.start()
})
onUnmounted(() => {
  client.bye()
})
function goback() {
  // history.back();
  router.push('/main')
}
function onMenuSelect(action: any) {
  showMenu.value = false
  switch (action.action) {
    case 'call':
      call()
      break
    case 'changecam':
      changecam()
      break
    case 'changescreen':
      changescreen()
      break
    case 'bye':
      bye()
      break
    default:
      break
  }
}


async function pushmsg(code: any, d: any) {
  await mqtt.pushmsg(dubaoId as string, code, d)
}
function call() {
  client.start();
}
function changecam() {
  client.changecam();
}
function changescreen() {
  client.changescreen();
}
function sendchat() {
  client.sendchat('Hello from offerer!')
}

function bye() {
  if (client) {
    client.bye()
  }
}
</script>
<style scoped>
.container {
  height: 100%;
  display: flex;
  flex-direction: column;
}
.video-container {
  flex: 1;
  display: flex;
  justify-content: center;
  align-items: center;
  background-color: #000; /* 设置背景颜色为黑色 */
}
video {
  width: 100%;
  min-height: 300px;
}

.nav-right {
  display: flex;
  align-items: center;
  padding: 0 6px;
}

.video-controls {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 6px;
  padding: 12px 8px;
  flex-wrap: nowrap;
  overflow-x: auto;
  background-color: black;
}

.control-btn {
  display: flex;
  flex: 1;
  height: 40px;
  border-radius: 10px;
  background: #f7f8fa;
  color: #606266;
  border: 1px solid #e5e7eb;
  white-space: nowrap;
  font-size: 20px;
  align-items: center;
  justify-content: center;
}

.control-btn-content {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  /* line-height:1.5;
  font-size: 16px; */
}

.control-btn :deep(.van-button__content) {
  width: 100%;
  height: 100%;
}
.icon {
  width: 1em;
  height: 1em;
  vertical-align: -0.15em;
  fill: currentColor;
  overflow: hidden;
}
</style>
