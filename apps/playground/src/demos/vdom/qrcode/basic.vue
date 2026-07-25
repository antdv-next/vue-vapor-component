<script setup lang="ts">
  import { QRCodeCanvas, QRCodeSVG } from '@vapor-component/qrcode'

  import { useQRCode } from '@/composables/useQRCode.ts'

  const { value } = useQRCode()
</script>

<template>
  <div>
    <label>
      qrcode-canvas:
      <QRCodeCanvas :value="value" color="red" />
    </label>
    <label>
      qrcode-svg:
      <QRCodeSVG :value="value" />
    </label>
  </div>
</template>
