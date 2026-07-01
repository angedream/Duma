<template>
  <div class="me-page">
    <div class="profile-banner">
      <div class="profile-avatar">
        <van-icon name="user-circle-o" size="42" />
      </div>
      <div class="profile-info">
        <div class="profile-name">{{ userName }}</div>
        <div class="profile-subtitle">设备ID：{{ deviceId || '暂无' }}</div>
        <div class="profile-status">{{ connectionStatus }}</div>
      </div>
    </div>

    <van-cell-group>
      <van-cell title="账号" :value="user.account || '未绑定'" icon="contact" />
      <van-cell title="登录状态" :value="connectionStatus" icon="info-o" />
      <van-cell title="最新消息" :value="messagePreview" icon="chat-o" />
    </van-cell-group>

    <div class="menu-list">
      <van-cell title="扫一扫" is-link icon="scan" @click="goToCode" />
      <van-cell title="我的收藏" is-link icon="star-o" @click="showNotReady('我的收藏')" />
      <van-cell title="设置" is-link icon="setting-o" @click="showNotReady('设置')" />
      <van-cell title="关于我们" is-link icon="info-o" @click="showNotReady('关于我们')" />
    </div>

    <div class="action-area">
      <van-button block round type="primary" @click="handleLogout">退出登录</van-button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, reactive, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { showToast } from 'vant'
import { useMQTTStore } from '@/store/mqtt'
import { getUserData, removeUserData,removedubaoID } from '@/api/storge'

const router = useRouter()
const mqtt = useMQTTStore()
mqtt.$subscribe((mutate, state) => {
  console.log(state.datamsg);
  console.log(state.online);
});

const user = reactive({ account: '', dumaId: '' })
const userName = computed(() => (user.account ? user.account : '嘟妈用户'))
const deviceId = computed(() => (user.dumaId ? user.dumaId.slice(0, 12) : ''))
const messagePreview = computed(() => mqtt.datamsg || '暂无消息')
const connectionStatus = computed(() => (mqtt.online ? '已连接' : '未连接'))

function loadUser() {
  const raw = getUserData()
  if (!raw) {
    router.replace('/login')
    return
  }
  try {
    const parsed = JSON.parse(raw)
    user.account = parsed.account || ''
    user.dumaId = parsed.dumaId || ''
  } catch (error) {
    console.warn('解析用户信息失败', error)
  }
}

function handleLogout() {
  removeUserData()
  removedubaoID()
  showToast('已退出登录')
  router.replace('/login')
}

function goToCode() {
  router.push('/code')
}

function showNotReady(title: string) {
  showToast(`${title} 功能正在开发中`)
}

onMounted(() => {
  loadUser()
})
</script>

<style scoped>
.me-page {
  min-height: 100vh;
  background-color: #f5f7fb;
}

.profile-banner {
  display: flex;
  align-items: center;
  gap: 16px;
  padding: 30px 22px 28px;
  background: linear-gradient(135deg, #409eff 0%, #6f96ff 100%);
  color: #fff;
  border-bottom-left-radius: 20px;
  border-bottom-right-radius: 20px;
}

.profile-avatar {
  width: 72px;
  height: 72px;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.18);
  display: flex;
  align-items: center;
  justify-content: center;
}

.profile-info {
  flex: 1;
}

.profile-name {
  font-size: 20px;
  font-weight: 700;
  margin-bottom: 6px;
}

.profile-subtitle,
.profile-status {
  font-size: 14px;
  color: rgba(255, 255, 255, 0.84);
  line-height: 1.5;
}

.menu-list {
  margin-top: 18px;
}

.action-area {
  padding: 18px 22px;
}

:deep(.van-cell) {
  background-color: #fff;
}

:deep(.van-cell__title) {
  font-weight: 500;
}

:deep(.van-button) {
  margin-top: 10px;
}
</style>
