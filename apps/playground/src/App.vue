<script setup lang="ts">
  import { QRCodeCanvas, QRCodeSVG } from 'qrcode'
  defineOptions({ name: 'App' })
  console.log(QRCodeCanvas)
</script>

<template>
  <div>playground</div>
  <QRCodeCanvas value="https://www.baidu.com" color="red" />
  <hr>
  <QRCodeSVG value="https://www.baidu.com" />
  <hr>
</template>

<style scoped></style>
