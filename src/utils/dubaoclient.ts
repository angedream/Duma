export class dubaoclient {
  // dubaoId!: string;
  // dumaId!: string;
  coturnurl: string = ''
  private peerConnection!: any
  private dataChannel!: any
  private pushmsg!: (type: string, msg: string) => Promise<void>
  private audioTransceiver!: RTCRtpTransceiver
  private videoTransceiver!: RTCRtpTransceiver
  constructor(data: Partial<dubaoclient>, pushmsg: (type: string, msg: string) => Promise<void>) {
    Object.assign(this, data)
    this.pushmsg = pushmsg
    console.log('dubao constructor')
  }
  async start() {
    const configuration = {
      iceServers: [{ urls: this.coturnurl }],
    }
    let peerConnection = new RTCPeerConnection(configuration)
    this.peerConnection = peerConnection

    // ✅ 创建数据通道（必须在创建 Offer 之前！）
    let dataChannel = peerConnection.createDataChannel('chat', {
      ordered: true, // 保证顺序
      maxRetransmits: 3, // 最大重传次数（不设置则可靠传输）
      // 或者使用 maxPacketLifeTime: 1000  // 最大存活时间（毫秒）
    })
    this.dataChannel = dataChannel
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
        await this.pushmsg('ice', JSON.stringify(event.candidate))
      }
    })
    // try {
    //   const localStream = await navigator.mediaDevices.getUserMedia({
    //     video: true,
    //     audio: true,
    //   })
    //   localStream.getTracks().forEach((track) => {
    //     console.log('添加本地轨道:', track)
    //     peerConnection.addTrack(track, localStream);
    //   })
    // } catch (error) {
    //   console.log(error)
    // }

    // 明确声明：我要发送音频（sendonly）或 既发又收（sendrecv）
    this.audioTransceiver = peerConnection.addTransceiver('audio', { direction: 'sendrecv' })
    this.videoTransceiver = peerConnection.addTransceiver('video', { direction: 'sendrecv' })
    // 2. 创建Offer
    const offer = await peerConnection.createOffer()

    await peerConnection.setLocalDescription(offer)
    await this.pushmsg('offer', JSON.stringify(offer))

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
        this.start()
      }
    })
  }
  async setRemoteDescription(data: any) {
    await this.peerConnection.setRemoteDescription(new RTCSessionDescription(JSON.parse(data)))
  }
  async addIceCandidate(data: any) {
    await this.peerConnection.addIceCandidate(new RTCIceCandidate(JSON.parse(data)))
  }
  async changecam() {
    this.pushmsg('changecam', '')
  }
  async changescreen() {
    this.pushmsg('changescreen', '')
  }
  async sendchat(str: string) {
    this.dataChannel.send(str)
  }
  bye() {
    if (this.peerConnection) {
      // 关闭所有发送器
      this.peerConnection.getSenders().forEach((sender: any) => {
        if (sender.track) sender.track.stop()
      })
      // 关闭连接
      this.peerConnection.close()
      this.peerConnection = null
      this.pushmsg('bye', '')
    }
  }
  async enbleMic() {
    try {
      const localStream = await navigator.mediaDevices.getUserMedia({
        video: false,
        audio: true, // 只获取音频
      })
      localStream.getTracks().forEach(async (track: any) => {
        console.log('添加本地轨道:', track)
        if (track.kind === 'audio') {
          this.audioTransceiver.sender.replaceTrack(track)
        }
        if (track.kind === 'video') {
          this.videoTransceiver.sender.replaceTrack(track)
        }
      })
    } catch (error) {
      console.log(error)
    }
  }
  disableMic() {
    const senders = this.peerConnection.getSenders()
    senders.forEach((sender: any) => {
      if (sender.track && sender.track.kind === 'audio') {
        sender.track.stop() // 停止音频轨道
        this.peerConnection.removeTrack(sender) // 从连接中移除发送器
      }
    })
  }
}
