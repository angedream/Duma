<template>
  <div class="app">
    <!-- 路由视图 -->
     <div class="main">
       <router-view v-slot="{ Component }">
        <transition name="fade" mode="out-in">
          <component :is="Component" />
        </transition>
      </router-view>
     </div>

    <!-- 底部 Tabbar（使用 Vant 4 语法） -->
    <van-tabbar route fixed placeholder>
      <van-tabbar-item replace to="/home" icon="home-o">首页</van-tabbar-item>
      <van-tabbar-item replace to="/code" icon="scan">扫一扫</van-tabbar-item>
      <van-tabbar-item replace to="/me" icon="friends-o">我的</van-tabbar-item>
    </van-tabbar>
  </div>
</template>
<script setup lang="ts">
import { onMounted,onUnmounted } from 'vue'
import { useMQTTStore } from './store/mqtt';
const mqtt = useMQTTStore()
mqtt.$subscribe((mutate, state) => {
  // console.log(state.datamsg);
});
onMounted(() => {
  mqtt.connect();
})
onUnmounted(() => {
  mqtt.disconnect();
});
</script>
<style scoped>
.app {
  height: 100vh;
  display: flex;
  flex-direction: column;
}

/* 让 router-view 占据剩余空间，Tabbar 固定在底部 */
.main {
  flex: 1;
  overflow-y: auto;
  padding-bottom: 0px; /* 防止内容被 Tabbar 遮挡 */
}
/* Vant Tabbar 默认固定在底部，无需额外样式 */
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.3s ease;
}

.fade-enter-from{
  opacity: 0;
  transform: translateY(10px);
}
.fade-leave-to {
  opacity: 0;
  transform: translateY(-10px);
}

</style>

