<template>
  <div class="container">
    <input type="file" accept="image/*" @change="scanQrCode">
  </div>
</template>
<script setup lang="ts">
import QrScanner from 'qr-scanner';
  async function scanQrCode(event:any)  {
  const file = event.target.files[0];
  if (!file) return;

  try {
    const result = await QrScanner.scanImage(file, {
      returnDetailedScanResult: true
    });
    console.log(`二维码内容：${result.data}`);
  } catch (error) {
    alert('未检测到二维码');
    console.error(error);
  }
};
</script>
<style scoped>
video{
  width: 400px;
  height: 250px;
}
.container{
   height: 100%;
  background-color:brown;

}
</style>
