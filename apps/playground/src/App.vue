<script setup lang="ts">
  import { ref } from 'vue'
  import { QRCodeCanvas, QRCodeSVG } from 'qrcode'
  import Checkbox from 'checkbox'

  defineOptions({ name: 'App' })
  const checked = ref(false)
</script>

<template>
  <div>playground</div>
  <QRCodeCanvas value="https://www.baidu.com" color="red" />
  <hr>
  <QRCodeSVG value="https://www.baidu.com" />
  <hr>
  <Checkbox v-model:checked="checked" @change="(e) => console.log(e)" />
</template>

<style scoped></style>
