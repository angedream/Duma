<template>
  <div class="container">
    <van-nav-bar title="家庭" left-text="" right-text="">
      <!-- 但是 Vant 的 left-arrow 默认是个返回箭头 (类似 <)，
            所以想要头像必须用插槽，如下简写只能达到类似效果 -->
      <template #left>
        <van-icon @click="gome" color="#000000" name="user-circle-o" size="28" />
      </template>
      <template #right>
        <van-icon @click="scan" color="#000000" name="scan" size="26" />
      </template>
    </van-nav-bar>
    <van-grid :border="false" :column-num="1">
      <van-grid-item v-for="item in dubaoId as any" :key="item.id" @click="handleVideoClick(item)">
        <div class="my-video-wrapper">
          <van-icon name="ellipsis" size="22" class="menu-button" @click.stop="showMenu(item)" />
          <van-image :src="dubaobg" width="100%" height="180px" radius="6" fit="cover" />
          <van-icon name="play-circle-o" size="30" class="play-center" />
          <div class="video-info">
            <span>{{ item.dubaoName != '' ? item.dubaoName : item.dubaoId }}</span>
          </div>
        </div>
      </van-grid-item>
    </van-grid>

    <van-action-sheet v-model:show="showActionSheet" :actions="menuActions" cancel-text="取消" @select="onMenuSelect" />
    <van-empty v-if="dubaoId.length == 0" image="network" description="列表为空">
      <van-button @click="scan" type="primary" style="width: 200px" class="bottom-button">扫描</van-button>
    </van-empty>
  </div>
</template>
<script setup lang="ts">
import { ref } from 'vue'
import dubaobg from '@/assets/dubao.png'
import { useRouter } from 'vue-router'
import { useDubaoStore } from '@/store/dubao'
import { storeToRefs } from 'pinia'
const router = useRouter()
let store = useDubaoStore()
let { dubaoId } = storeToRefs(store)
const showActionSheet = ref(false)
const currentItem = ref<any>(null)
const menuActions = [
  { name: '删除', color: '#ee0a24' },
  { name: '查看位置', color: '#1989fa' },
]

function handleVideoClick(item: any) {
  console.log('点击了视频项:', item)
  router.push({
    name: 'Dubao',
    params: {
      dubaoId: item.dubaoId,
    },
  })
}
function gome() {
  router.push('/me')
}
function scan() {
  router.push('/code')
}

function showMenu(item: any) {
  currentItem.value = item
  showActionSheet.value = true
}

function onMenuSelect(action: { name: string }) {
  console.log('选择的操作:', action.name)
  if (!currentItem.value) return

  if (action.name === '删除') {
    store.remove(currentItem.value.dubaoId)
  }

  if (action.name === '查看位置') {
    router.push({
      name: 'gaode',
      params: {
        dubaoId: currentItem.value.dubaoId,
      },
    })
  }

  showActionSheet.value = false
  currentItem.value = null
}
</script>
<style scoped>
.container {
  padding-top: 5px;
}

.my-video-wrapper {
  position: relative;
  width: 90%;
  /* 宽度 80% */
  margin: 0 auto;
  /* 水平居中 */
}

.play-center {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  color: white;
}

.menu-button {
  position: absolute;
  top: 8px;
  right: 8px;
  z-index: 2;
  color: white;
  background: rgba(0, 0, 0, 0.4);
  border-radius: 50%;
  padding: 4px;
}

.video-info {
  position: absolute;
  bottom: 0%;
  right: 0%;
  transform: translate(0%, 0%);
  padding: 5px;
  color: white;
  font-size: 15px;
  animation: colorCycle 60s infinite;
  text-align: right;
}

/* 定义颜色循环动画 */
@keyframes colorCycle {
  0% {
    color: #000000;
    /* 黑色 */
  }

  20% {
    color: #ffffff;
    /* 白色 */
  }

  40% {
    color: red;
  }

  80% {
    color: blue;
  }

  100% {
    color: #000000;
    /* 回到黑色 */
  }
}
</style>
