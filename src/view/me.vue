<template>
  <div @click="push" class="container">
    wode
  </div>
</template>
<script setup lang="ts">
import { useMQTTStore } from '@/store/mqtt';
import { onMounted, onUnmounted } from 'vue';
const mqtt = useMQTTStore()
mqtt.$subscribe((mutate, state) => {
  console.log(state.datamsg);
});
function push() {
  mqtt.pushmsg('','a','hello world')
}
onMounted(() => {
  console.log(111);
})
onUnmounted(() => {
  console.log(121);

})

</script>
<style scoped>
.container{
   height: 100%;
  background-color:aqua;

}
</style>
