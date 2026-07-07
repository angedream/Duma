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
const client = new dubaoclient({
  dubaoId: '8206aa74-69c5-483e-83b5-16616e3030eb',
  dumaId: 'f1122aeb-f2b0-400d-9919-eddd2eaebaa2'},pushmsg)
client.test();
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
let isMuted = false
let peerConnection: any
let dataChannel: any = null
mqtt.$subscribe(async (mutate: any, state) => {
  if (typeof mutate.events.newValue === 'boolean') {
    console.log('是布尔类型')
    return
  }
  let data = JSON.parse(state.datamsg)
  let msg = JSON.parse(data.msg)
  switch (msg.code) {
    case 'answer':
      await peerConnection.setRemoteDescription(new RTCSessionDescription(JSON.parse(msg.data)))
      break
    case 'ice':
      await peerConnection.addIceCandidate(new RTCIceCandidate(JSON.parse(msg.data)))
    default:
      break
  }
})

onMounted(() => {})
onUnmounted(() => {
  bye()
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
async function init() {
  const configuration = {
    iceServers: [{ urls: c.coturnurl }],
  }
  peerConnection = new RTCPeerConnection(configuration)

  // ✅ 创建数据通道（必须在创建 Offer 之前！）
  dataChannel = peerConnection.createDataChannel('chat', {
    ordered: true, // 保证顺序
    maxRetransmits: 3, // 最大重传次数（不设置则可靠传输）
    // 或者使用 maxPacketLifeTime: 1000  // 最大存活时间（毫秒）
  })

  // 监听数据通道事件
  dataChannel.onopen = () => {
    console.log(' 数据通道已打开')
    dataChannel.send('Hello from offerer!')
  }

  dataChannel.onmessage = (event: any) => {
    console.log('收到消息:', event.data)
  }

  dataChannel.onclose = () => {
    console.log('数据通道已关闭')
  }

  peerConnection.addEventListener('icecandidate', async (event: any) => {
    if (event.candidate) {
      await pushmsg('ice', JSON.stringify(event.candidate))
    }
  })
  try {
    const localStream = await navigator.mediaDevices.getUserMedia({
      video: true,
      audio: true,
    })
    localStream.getTracks().forEach((track) => {
      // peerConnection.addTrack(track, localStream);
    })
  } catch (error) {
    console.log(error)
  }

  // 2. 创建Offer
  const offer = await peerConnection.createOffer({
    offerToReceiveAudio: true,
    offerToReceiveVideo: true,
  })
  await peerConnection.setLocalDescription(offer)
  await pushmsg('offer', JSON.stringify(offer))

  // 监听远程流（视频通话场景）
  peerConnection.addEventListener('track', (event: any) => {
    const remoteVideo: any = document.getElementById('remoteVideo')
    console.log(remoteVideo.srcObject)
    if (remoteVideo.srcObject) {
      const stream: any = remoteVideo.srcObject
      if (event.track.kind == 'video') {
        try {
          stream.getVideoTracks()
          stream.removeTrack(stream.getVideoTracks()[0])
        } catch (error) {
          console.log(error)
        }
      }
      remoteVideo.srcObject.addTrack(event.track)
    } else {
      remoteVideo.srcObject = new MediaStream(event.streams[0])
    }
    remoteVideo.play()
  })

  // 连接状态变化监听
  peerConnection.addEventListener('connectionstatechange', () => {
    console.log('Connection state:', peerConnection.connectionState)
    if (peerConnection.connectionState == 'disconnected') {
      init()
    }
  })
}

// async function connectMQTT() {
//   let options = {
//     clean: true, // true: 清除会话, false: 保留会话
//     connectTimeout: 4000, // 超时时间
//     // 认证信息
//     clientId: 'duma=f1122aeb-f2b0-400d-9919-eddd2eaebaa2',
//     username: '',
//     password: '',
//     reconnectPeriod: 1000,
//     will: {
//       topic: '/law/will/device',
//       payload: '嘟妈掉线了f1122aeb-f2b0-400d-9919-eddd2eaebaa2'
//     }
//   };
//   client = mqtt.connect('ws://fly.angerdream21.top:8083/mqtt',options)

//   client.on('connect', () => {
//     console.log('MQTT connected')
//     client.subscribe('/duma/f1122aeb-f2b0-400d-9919-eddd2eaebaa2');
//   })

//   client.on('message', async (t:any, msg:any) => {
//     let data = JSON.parse(msg.toString());
//     // console.log(data)
//     switch (data.code) {
//       case 'answer':
//         await peerConnection.setRemoteDescription(new RTCSessionDescription(JSON.parse(data.data)));
//         break;
//       case 'ice':
//             await peerConnection.addIceCandidate(new RTCIceCandidate(JSON.parse(data.data)));
//       default:
//         break;
//     }
//   })

// }
async function pushmsg(code: any, d: any) {
  console.log('pushmsg', code, d)
  // let msg:any = {};
  // msg.dubaoId='8206aa74-69c5-483e-83b5-16616e3030eb';
  // msg.dumaId = "f1122aeb-f2b0-400d-9919-eddd2eaebaa2";
  // msg.dumaName = "天使嘟妈";
  // msg.code = code;
  // msg.data = d;
  // let s=JSON.stringify(msg)
  // await client.publish('/dubao/8206aa74-69c5-483e-83b5-16616e3030eb', s)
  await mqtt.pushmsg(dubaoId as string, code, d)
}
function call() {
  init()
}
function changecam() {
  pushmsg('changecam', '')
}
function changescreen() {
  pushmsg('changescreen', '')
}
function sendchat() {
  dataChannel.send('Hello from offerer!')
}

function bye() {
  if (peerConnection) {
    // 关闭所有发送器
    peerConnection.getSenders().forEach((sender: any) => {
      if (sender.track) sender.track.stop()
    })
    // 关闭连接
    peerConnection.close()
    peerConnection = null
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
