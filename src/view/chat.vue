<template>
  <div class="chat-page">
    <header class="chat-header">
      <div class="header-left">
        <button class="back-btn" @click="goBack"><</button>
        <div class="contact-info">
          <div class="contact-avatar">{{ dubaoName }}</div>
        </div>
      </div>
      <div class="header-right">
        <button class="icon-btn">⋯</button>
      </div>
    </header>

    <main ref="chatBody" class="chat-body">
      <div v-for="(msg, index) in messages" :key="index" :class="['message-row', msg.type]">
        <div v-if="msg.type !== 'me'" class="avatar">Ta</div>
        <div class="message-bubble">{{ msg.content }}</div>
        <div v-if="msg.type === 'me'" class="avatar me-avatar">我</div>
      </div>
    </main>

    <footer class="chat-footer">
      <input v-model="inputText" placeholder="请输入消息..." @keyup.enter="sendMessage" />
      <button @click="sendMessage">发送</button>
    </footer>
  </div>
</template>

<script setup lang="ts">
import { nextTick, onMounted, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useDubaoStore } from '@/store/dubao'
import { useMQTTStore } from '@/store/mqtt';
const mqtt = useMQTTStore();
const dubaoStore = useDubaoStore()

mqtt.$subscribe(async (mutate:any, state) => {
    if (typeof mutate.events.newValue === 'boolean') {
    return;
  }
  let data = JSON.parse(state.datamsg);
  let msg = JSON.parse(data.msg);
  switch (msg.code) {
    case 'chat':
      messages.value.push({ type: 'other', content: '收到:'+msg.data })
      scrollToBottom()
      break;
    case 'ice':
      default:
        break;
    }

});
const route = useRoute()
const router = useRouter()

const dubaoName = dubaoStore.getDuBao(route.params.dubaoId as string)?.dubaoName || '嘟宝'
const inputText = ref('')
const chatBody = ref<HTMLElement | null>(null)
const messages = ref([
  { type: 'other', content: '你好，我收到会自动回复' },
  { type: 'me', content: '好的，明白了。' },
])

function scrollToBottom() {
  nextTick(() => {
    chatBody.value?.scrollTo({ top: chatBody.value.scrollHeight, behavior: 'smooth' })
  })
}

function sendMessage() {
  const text = inputText.value.trim()
  if (!text) return

  messages.value.push({ type: 'me', content: text })
  inputText.value = ''
  scrollToBottom()
  mqtt.pushmsg(route.params.dubaoId as string, 'chat', text)
}

function goBack() {
  router.back()
}

onMounted(() => {
  scrollToBottom()
})
</script>

<style scoped>
.chat-page {
  height: 100vh;
  display: flex;
  flex-direction: column;
  background: #f5f7fb;
  font-family: Arial, sans-serif;
}

.chat-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px 16px;
  background: linear-gradient(90deg, #ffffff 0%, #f7fbff 100%);
  border-bottom: 1px solid #e5e7eb;
}

.header-left {
  display: flex;
  align-items: center;
  gap: 10px;
}

.back-btn,
.icon-btn {
  border: none;
  background: none;
  font-size: 20px;
  cursor: pointer;
  color: #1677ff;
}

.contact-info {
  display: flex;
  align-items: center;
  gap: 10px;
}

.contact-avatar {
  font-size: 14px;
  width: 45px;
  height: 45px;
  border-radius: 50%;
  background: linear-gradient(135deg, #4a90e2, #38bdf8);
  color: #fff;
  display: flex;
  align-items: center;
  justify-content: center;
}

.header-left h3 {
  margin: 0;
  font-size: 16px;
  color: #1f2937;
}

.header-left p {
  margin: 2px 0 0;
  font-size: 12px;
  color: #4caf50;
}

.header-right {
  display: flex;
  align-items: center;
}

.chat-body {
  flex: 1;
  padding: 16px;
  overflow-y: auto;
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.message-row {
  display: flex;
  align-items: flex-end;
  gap: 8px;
}

.message-row.me {
  justify-content: flex-end;
}

.message-row.other {
  justify-content: flex-start;
}

.avatar {
  width: 34px;
  height: 34px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #fff;
  font-size: 12px;
  background: #4a90e2;
  flex-shrink: 0;
}

.message-row.me .avatar {
  background: #38bdf8;
}

.message-row.me .message-bubble {
  margin-right: 6px;
}

.message-row.other .message-bubble {
  margin-left: 6px;
}

.message-bubble {
  max-width: 70%;
  padding: 10px 12px;
  border-radius: 12px;
  line-height: 1.4;
  background: #fff;
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.06);
}

.message-row.me .message-bubble {
  background: #dff6ff;
}

.chat-footer {
  display: flex;
  gap: 8px;
  padding: 12px 16px;
  background: #fff;
  border-top: 1px solid #e5e7eb;
}

.chat-footer input {
  flex: 1;
  border: 1px solid #d9d9d9;
  border-radius: 999px;
  padding: 10px 14px;
  outline: none;
}

.chat-footer button {
  border: none;
  border-radius: 999px;
  padding: 0 16px;
  background: #1677ff;
  color: #fff;
  cursor: pointer;
}
</style>
