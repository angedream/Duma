<template>
  <div class="app">
     <router-view v-slot="{ Component }">
        <transition name="fade" mode="out-in">
          <component :is="Component" />
        </transition>
      </router-view>
  </div>
</template>
<script setup lang="ts">
import '@/assets/font/iconfont.js' // 引入本地CSS文件
// import '//at.alicdn.com/t/c/font_5203834_y4bp340sjrr.js' // 引入本地CSS文件

import { onMounted,onUnmounted } from 'vue'
import { useMQTTStore } from './store/mqtt';
const mqtt = useMQTTStore()
mqtt.$subscribe(async (mutate:any, state) => {
    if (typeof mutate.events.newValue === 'boolean') {
    return;
  }
  let data = JSON.parse(state.datamsg);
  let msg = JSON.parse(data.msg);
  switch (msg.code) {
    case 'answer':
      break;
    case 'ice':
      default:
        break;
    }

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

