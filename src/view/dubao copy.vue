<template>
  <div class="home">
    <video id="remoteVideo"  controls controlslist="noremoteplayback fullscreen" ></video>
    <br>
    <van-button @click="call">呼叫嘟宝</van-button>
    <van-button @click="changecam">切换嘟宝摄像头</van-button>
    <van-button @click="changescreen">查看嘟宝桌面</van-button>
    <van-button @click="sendchat">聊天</van-button>
    <van-button @click="bye">拜拜</van-button>
  </div>
</template>
<script setup lang="ts">
import mqtt from 'mqtt'
import { onMounted,ref } from 'vue'
import { c } from '@/myconfig'

let peerConnection:any
let client: any = null
let dataChannel: any = null

onMounted(() => {
  connectMQTT();

})
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

async function connectMQTT() {
  let options = {
    clean: true, // true: 清除会话, false: 保留会话
    connectTimeout: 4000, // 超时时间
    // 认证信息
    clientId: 'duma=f1122aeb-f2b0-400d-9919-eddd2eaebaa2',
    username: '',
    password: '',
    reconnectPeriod: 1000,
    will: {
      topic: '/law/will/device',
      payload: '嘟妈掉线了f1122aeb-f2b0-400d-9919-eddd2eaebaa2'
    }
  };
  client = mqtt.connect('ws://fly.angerdream21.top:8083/mqtt',options)

  client.on('connect', () => {
    console.log('MQTT connected')
    client.subscribe('/duma/f1122aeb-f2b0-400d-9919-eddd2eaebaa2');
  })

  client.on('message', async (t:any, msg:any) => {
    let data = JSON.parse(msg.toString());
    // console.log(data)
    switch (data.code) {
      case 'answer':
        await peerConnection.setRemoteDescription(new RTCSessionDescription(JSON.parse(data.data)));
        break;
      case 'ice':
            await peerConnection.addIceCandidate(new RTCIceCandidate(JSON.parse(data.data)));
      default:
        break;
    }
  })

}
async function pushmsg(code: any, d: any) {
  let msg:any = {};
  msg.dubaoId='8206aa74-69c5-483e-83b5-16616e3030eb';
  msg.dumaId = "f1122aeb-f2b0-400d-9919-eddd2eaebaa2";
  msg.dumaName = "天使嘟妈";
  msg.code = code;
  msg.data = d;
  let s=JSON.stringify(msg)
  await client.publish('/dubao/8206aa74-69c5-483e-83b5-16616e3030eb', s)

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
    console.log(111)
  }
}
</script>
<style scoped>
video{
  width: 300px;
  height: 300px;
}
.home{
  height: 100%;
  background-color:skyblue;
}
</style>
