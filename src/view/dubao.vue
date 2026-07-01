<template>
  <div class="container">
    <van-nav-bar
      :title="dubao?.dubaoName || '嘟宝'"
      left-text="返回"
      right-text="更多"
      left-arrow
      @click-left="goback"
      @click-right=""
    >
      <template #right>
        <van-icon name="ellipsis" size="18" />
      </template>
    </van-nav-bar>
    <div class="video-container">
      <video id="remoteVideo"  controls controlslist="noremoteplayback fullscreen" ></video>
    </div>
    <div class="video-controls">
      <van-button class="control-btn" @click="call">
        <span class="control-btn-content">
          <van-icon name="phone-o" size="20" />
          <span>呼叫</span>
        </span>
      </van-button>
       <van-button class="control-btn" @click="changecam">
        <span class="control-btn-content">
          <van-icon name="audio" size="20" />
          <span>对讲</span>
        </span>
      </van-button>
      <van-button class="control-btn" @click="changecam">
        <span class="control-btn-content">
          <van-icon name="chat-o" size="20" />
          <span>消息</span>
        </span>
      </van-button>
      <van-button class="control-btn" @click="changescreen">
        <span class="control-btn-content">
          <van-icon name="desktop-o" size="20" />
          <span>桌面</span>
        </span>
      </van-button>
      <van-button class="control-btn" @click="bye">
        <span class="control-btn-content">
          <van-icon name="cross" size="20" />
          <span>再会</span>
        </span>
      </van-button>
    </div>

  </div>
</template>
<script setup lang="ts">
import { onMounted, onUnmounted } from 'vue'
import { c } from '@/myconfig'
import { useMQTTStore } from '@/store/mqtt';
import { useRoute,useRouter } from 'vue-router'
import { useDubaoStore } from '@/store/dubao'
let store = useDubaoStore()


const route = useRoute()
const router = useRouter()
const { dubaoId } = route.params;
const dubao = store.getDuBao(dubaoId as string)
console.log(dubao)
const mqtt = useMQTTStore()
let isMuted = false;
let peerConnection:any
let dataChannel: any = null
mqtt.$subscribe(async (mutate:any, state) => {
  if (typeof mutate.events.newValue === 'boolean') {
    console.log('是布尔类型')
    return;
  }
  let data = JSON.parse(state.datamsg);
  let msg = JSON.parse(data.msg);
  switch (msg.code) {
    case 'answer':
      await peerConnection.setRemoteDescription(new RTCSessionDescription(JSON.parse(msg.data)));
      break;
    case 'ice':
      await peerConnection.addIceCandidate(new RTCIceCandidate(JSON.parse(msg.data)));
      default:
        break;
    }

});

onMounted(() => {
})
onUnmounted(() => {
  bye();
})
function goback() {
  // history.back();
  router.push('/main');
}
async function init() {
  const configuration = {
    iceServers: [
      { urls: c.coturnurl },
    ]
  }
  peerConnection = new RTCPeerConnection(configuration)

  // ✅ 创建数据通道（必须在创建 Offer 之前！）
  dataChannel = peerConnection.createDataChannel('chat', {
    ordered: true,        // 保证顺序
    maxRetransmits: 3,    // 最大重传次数（不设置则可靠传输）
    // 或者使用 maxPacketLifeTime: 1000  // 最大存活时间（毫秒）
  });

  // 监听数据通道事件
  dataChannel.onopen = () => {
    console.log(' 数据通道已打开');
    dataChannel.send('Hello from offerer!');
  };

  dataChannel.onmessage = (event:any) => {
    console.log('收到消息:', event.data);
  };

  dataChannel.onclose = () => {
    console.log('数据通道已关闭');
  };


  peerConnection.addEventListener('icecandidate', async (event:any) => {
    if (event.candidate) {
      await pushmsg('ice', JSON.stringify(event.candidate));;
    }
  });
    try {
      const localStream = await navigator.mediaDevices.getUserMedia({
        video: true,
        audio: true
      });
      localStream.getTracks().forEach(track => {
        // peerConnection.addTrack(track, localStream);
    });

    } catch (error) {
      console.log(error)
    }


  // 2. 创建Offer
  const offer = await peerConnection.createOffer(
    {
      offerToReceiveAudio: true,
      offerToReceiveVideo: true
    });
  await peerConnection.setLocalDescription(offer);
  await pushmsg('offer', JSON.stringify(offer));

  // 监听远程流（视频通话场景）
  peerConnection.addEventListener('track', (event:any) => {
    const remoteVideo: any = document.getElementById('remoteVideo');
    console.log(remoteVideo.srcObject)
    if (remoteVideo.srcObject) {
      const stream: any = remoteVideo.srcObject;
      if (event.track.kind == 'video') {
        try {
          stream.getVideoTracks();
          stream.removeTrack(stream.getVideoTracks()[0]);
        } catch (error) {
          console.log(error)
        }

      }
      remoteVideo.srcObject.addTrack(event.track);
    } else {
      remoteVideo.srcObject = new MediaStream(event.streams[0]);
    }
    remoteVideo.play()
  });

  // 连接状态变化监听
  peerConnection.addEventListener('connectionstatechange', () => {
    console.log('Connection state:', peerConnection.connectionState);
    if (peerConnection.connectionState == 'disconnected') {
      init()
    }
  });
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
  // let msg:any = {};
  // msg.dubaoId='8206aa74-69c5-483e-83b5-16616e3030eb';
  // msg.dumaId = "f1122aeb-f2b0-400d-9919-eddd2eaebaa2";
  // msg.dumaName = "天使嘟妈";
  // msg.code = code;
  // msg.data = d;
  // let s=JSON.stringify(msg)
  // await client.publish('/dubao/8206aa74-69c5-483e-83b5-16616e3030eb', s)
  await mqtt.pushmsg(dubaoId as string,code, d);

}
function call() {
  init();
}
function changecam() {
  pushmsg('changecam', '');
}
function changescreen() {
  pushmsg('changescreen', '');


}
function sendchat() {
  dataChannel.send('Hello from offerer!');
}

function bye() {
  if (peerConnection) {
    // 关闭所有发送器
    peerConnection.getSenders().forEach((sender:any) => {
      if (sender.track) sender.track.stop();
    });
    // 关闭连接
    peerConnection.close();
    peerConnection = null;
  }
}
</script>
<style scoped>
.container{
  height: 100%;
  display: flex;
  flex-direction: column;
}
.video-container{
  flex: 1;
  display: flex;
  justify-content: center;
  align-items: center;
  background-color: #000; /* 设置背景颜色为黑色 */
}
video{
  width: 100%;
  min-height: 300px;
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
  flex: 1;
  min-width: 22px;
  height: 40px;
  border-radius: 10px;
  background: #f7f8fa;
  color: #333;
  border: 1px solid #e5e7eb;
  white-space: nowrap;
}

.control-btn-content {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  line-height: 1.2;
  font-size: 12px;
}

.control-btn :deep(.van-button__content) {
  width: 100%;
  height: 100%;
}

</style>
