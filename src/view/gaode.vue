<template>
  <div class="map-page">
    <button class="back-btn" type="button" @click="goBack">
      <van-icon name="arrow-left" size="18" />
    </button>
    <button class="more-btn" type="button" @click="goMore">
      <van-icon name="ellipsis" size="25" />
    </button>
    <div id="container"></div>
    <van-action-sheet
      v-model:show="showMenu"
      :actions="menuActions"
      cancel-text="取消"
      @select="onMenuSelect"
    />
    <van-popup v-model:show="showHistoryPicker" round position="bottom">
      <div class="history-picker">
        <div class="history-picker-title">选择历史时间</div>
        <div class="history-picker-row">
          <label class="history-picker-label">开始时间</label>
          <input
            class="history-picker-input"
            type="datetime-local"
            v-model="historyStart"
          />
        </div>
        <div class="history-picker-row">
          <label class="history-picker-label">结束时间</label>
          <input
            class="history-picker-input"
            type="datetime-local"
            v-model="historyEnd"
          />
        </div>
        <div class="history-picker-actions">
          <van-button size="small" plain type="default" @click="showHistoryPicker = false">
            取消
          </van-button>
          <van-button size="small" type="primary" @click="onHistoryQuery">
            查询
          </van-button>
        </div>
      </div>
    </van-popup>
  </div>
</template>

<script setup lang="ts">
import { onMounted, onUnmounted, shallowRef, ref } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import AMapLoader from '@amap/amap-jsapi-loader'
import { showToast } from 'vant'
import { c } from '@/myconfig'
import { useMQTTStore } from '@/store/mqtt'
import { useDubaoStore } from '@/store/dubao'
import 'vant/es/toast/style'

const mqtt = useMQTTStore()
const dubao = useDubaoStore()
const showMenu = ref(false)
const showHistoryPicker = ref(false)
const historyStart = ref(formatDateTimeLocal(new Date(Date.now() - 1000 * 60 * 60*24*2)))
const historyEnd = ref(formatDateTimeLocal(new Date()))
const menuActions = [
  { name: '定位', icon: 'aim', action: 'site' },
  { name: '运动轨迹', icon: 'guide-o', action: 'sport' },
  { name: '历史位置', icon: 'underway-o', action: 'his' },
  { name: '电子围栏', icon: 'notes-o', action: 'fence' },
]
function onMenuSelect(action: any) {
  showMenu.value = false
  switch (action.action) {
    case 'site':
      mqtt.pushmsg(dubaoId as string, 'gps', JSON.stringify({ page: 1, rows: 1 }))
      break
    case 'sport':
      let stop = Date.now()
      let start = stop - 1000 * 60 * 60 * 24 * 1
      mqtt.pushmsg(dubaoId as string, 'gpssport', JSON.stringify({ page: 1, rows: 100 , start: start, stop: stop }))
      break
    case 'his':
      showHistoryPicker.value = true
      break
    case 'fence':
      break
    default:
      break
  }
}

function formatDateTimeLocal(date: Date) {
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  const hour = String(date.getHours()).padStart(2, '0')
  const minute = String(date.getMinutes()).padStart(2, '0')
  return `${year}-${month}-${day}T${hour}:${minute}`
}

function onHistoryQuery() {
  if (!historyStart.value || !historyEnd.value) {
    showToast('请选择开始和结束时间')
    return
  }
  const start = new Date(historyStart.value).getTime()
  const stop = new Date(historyEnd.value).getTime()
  if (Number.isNaN(start) || Number.isNaN(stop)) {
    showToast('时间格式不正确')
    return
  }
  if (start >= stop) {
    showToast('结束时间必须晚于开始时间')
    return
  }
  showHistoryPicker.value = false
  console.log('查询历史轨迹:', start, stop)
  mqtt.pushmsg(dubaoId as string, 'gpssport', JSON.stringify({ page: 1, rows: 100000, start, stop }))
}
mqtt.$subscribe(async (mutate: any, state) => {
  if (typeof mutate.events.newValue === 'boolean') {
    return
  }
  let data = JSON.parse(state.datamsg)
  let msg = JSON.parse(data.msg)
  switch (msg.code) {
    case 'gps':
      const gpsData = JSON.parse(msg.data)
      maker(gpsData[0])
      break
    case 'gpssport':
      console.log('gpssport', msg.data)
      if (!msg.data || msg.data === '[]') {
        showToast('没有运动轨迹数据')
        console.log('没有运动轨迹数据')
        return
      }
      const gpssportData = JSON.parse(msg.data)
      polylinesport(gpssportData)
      break
    default:
      break
  }
})
;(window as any)._AMapSecurityConfig = {
  securityJsCode: c.gaodesavekey,
}
let AMap: any
const map = shallowRef<any>(null) // 方式1：使用 any

const router = useRouter()
const route = useRoute()
const dubaoId = route.params.dubaoId

const goBack = () => {
  router.back()
}

const goMore = () => {
  showMenu.value = true
}

onMounted(() => {
  AMapLoader.load({
    key: c.gaodekey,
    version: '2.0',
    plugins: ['AMap.ToolBar', 'AMap.Scale'],
  })
    .then((AMap2) => {
      AMap = AMap2
      map.value = new AMap.Map('container', {
        viewMode: '2D',
        zoom: 14,
        center: [116.397428, 39.90923],
      })

      map?.value.addControl(new AMap.ToolBar())
      map?.value.addControl(new AMap.Scale())
      let stop = Date.now()
      let start = stop - 1000 * 60 * 60 * 24 * 7
      mqtt.pushmsg(
        dubaoId as string,
        'gps',
        JSON.stringify({ page: 1, rows: 1, start: start, stop: stop }),
      )
      // maker({ lng: 117.397428, lat: 39.90923, name: '嘟宝' })
    })
    .catch((e) => {
      console.error('地图加载失败:', e)
    })
})

onUnmounted(() => {
  map.value?.destroy()
})
function maker(gps: any) {
  if (!map.value) return
  let name = dubao.getDuBao(dubaoId as string)?.dubaoName || '嘟宝'
  const marker = new AMap.Marker({
    position: new AMap.LngLat(gps.lng, gps.lat),
    title: name,
    animation: 'AMAP_ANIMATION_DROP', // 落点动画
  })
  marker.on('click', (e: any) => {
    const infoWindow = new AMap.InfoWindow({
      content: `<div style="padding: 5px;">${name}</div>`,
      offset: new AMap.Pixel(0, -30),
    })
    infoWindow.open(map.value, marker.getPosition())
    console.log('Marker clicked:', name, e)
  })
  // 添加到地图

  map.value.add(marker)
  map.value.setCenter(marker.getPosition())
}
function polyline(gpsData: any) {
  gpsData = [
    [116.397428, 39.90923], // 起点：天安门
    [116.401234, 39.912345],
    [116.403322, 39.915119], // 故宫
    [116.407654, 39.91789],
    [116.410691, 39.902737], // 王府井
    [116.413456, 39.905678],
    [116.416789, 39.908901], // 终点
  ]
  const polyline = new AMap.Polyline({
    path: gpsData,
    strokeColor: '#3366FF',
    strokeWidth: 6,
    strokeOpacity: 0.8,
  })
  map.value.add(polyline)
  map.value.setFitView([polyline]);

   const startMarker = new AMap.Marker({
      position: gpsData[0],
      title: '起点',
      label: {
        content: '<div style="background:#4CAF50;color:#fff;padding:2px 10px;border-radius:12px;">起点</div>',
        direction: 'top'
      }
    });
    map.value.add(startMarker);
    const endMarker = new AMap.Marker({
      position: gpsData[gpsData.length - 1],
      title: '终点',
      label: {
        content: '<div style="background:#F44336;color:#fff;padding:2px 10px;border-radius:12px;">终点</div>',
        direction: 'top'
      }
    });
    map.value.add(endMarker);

}
function polylinesport(gpsData: any) {
  console.log('polylinesport', gpsData)
  let gpsDataArray: any[] = [];
  for (let i = 0; i < gpsData.length; i++) {
    gpsDataArray[i] = [gpsData[i].lng, gpsData[i].lat]
  }
  const polyline = new AMap.Polyline({
    path: gpsDataArray,
    strokeColor: '#3366FF',
    strokeWidth: 6,
    strokeOpacity: 0.8,
  })
  map.value.add(polyline)
  map.value.setFitView([polyline]);

   const startMarker = new AMap.Marker({
      position: gpsDataArray[gpsDataArray.length - 1],
      title: '起点',
      label: {
        content: '<div style="background:#4CAF50;color:#fff;padding:2px 10px;border-radius:12px;">起点</div>',
        direction: 'top'
      }
    });
    map.value.add(startMarker);
    const endMarker = new AMap.Marker({
      position: gpsDataArray[0],
      title: '终点',
      label: {
        content: '<div style="background:#F44336;color:#fff;padding:2px 10px;border-radius:12px;">终点</div>',
        direction: 'top'
      }
    });
    map.value.add(endMarker);

}
</script>

<style scoped>
.map-page {
  position: relative;
  width: 100%;
  height: 100%;
}

#container {
  width: 100%;
  height: 100%;
}

.back-btn {
  position: absolute;
  top: 12px;
  left: 12px;
  z-index: 10;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 40px;
  height: 40px;
  border: none;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.95);
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
  color: #333;
}
.more-btn {
  position: absolute;
  top: 12px;
  right: 12px;
  z-index: 10;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 40px;
  height: 40px;
  border: none;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.95);
  /* background: transparent; */
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
  color: #333;
}
.history-picker {
  padding: 16px 16px 20px;
}
.history-picker-title {
  font-size: 16px;
  font-weight: 600;
  margin-bottom: 12px;
}
.history-picker-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 12px;
}
.history-picker-label {
  font-size: 14px;
  color: #333;
}
.history-picker-input {
  width: 60%;
  border: 1px solid #e5e5e5;
  border-radius: 8px;
  padding: 10px 12px;
  font-size: 14px;
}
.history-picker-actions {
  display: flex;
  justify-content: flex-end;
  gap: 10px;
  margin-top: 16px;
}
</style>
