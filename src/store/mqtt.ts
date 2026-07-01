import { ref } from 'vue';
import { defineStore } from 'pinia';
import mqtt from 'mqtt';
import { getUserData } from '@/api/storge'
import { c } from '@/myconfig'

export const useMQTTStore = defineStore('mqtt', () => {
  let client: any = null;
  let duma:any = null;
  let datamsg = ref('');
  let online = ref(false);
  async function connect() {
    duma = JSON.parse(getUserData() as string);
    if (client != null||duma==null) {
      return;
    }
    let options = {
      keepalive: 30,
      clean: true, // true: 清除会话, false: 保留会话
      connectTimeout: 4000, // 超时时间
      // 认证信息
      clientId: 'duma='+duma.dumaId,
      username: '',
      password: '',
      reconnectPeriod: 1000,
      will: {
        topic: '/law/will/device',
        payload: '嘟妈掉线了'+duma.dumaId
      }
    };
  client = mqtt.connect(c.mqtthttpurl, options)

  client.on('connect', () => {
    console.log('MQTT 已连接')
    online.value = true;
    client.subscribe('/duma/'+duma.dumaId);
  })
    client.on('reconnect', () => {
      console.log('MQTT 正在重连...');
      online.value = false;
    });
    client.on('error', (error:any) => {
      console.error('MQTT 连接错误:', error);
      online.value = false;
    });;

  client.on('message', async (t:any, msg:any) => {
    let o:any = {
      topic:t,
      msg:msg.toString(),
      timestamp:Date.now()
    }
    datamsg.value = JSON.stringify(o);
  })

  }

  async function disconnect() {
    client.end();
    client = null;
  }

  async function pushmsg(dubaoId:string,code: any, d: any) {
    let msg:any = {};
    msg.dubaoId=dubaoId;
    msg.dumaId = duma.dumaId;
    msg.dumaName = "天使嘟妈";
    msg.code = code;
    msg.data = d;
    let s=JSON.stringify(msg)
    await client.publish('/dubao/'+dubaoId, s)

  };
  return { online, datamsg, duma, connect, disconnect, pushmsg }

})
