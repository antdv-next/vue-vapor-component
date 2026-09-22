<script setup vapor lang="ts">
  import { QRCodeCanvas, QRCodeSVG } from '@vapor-component/qrcode'

  import { useQRCode } from '@/composables/useQRCode'

  const { value } = useQRCode()
</script>

<template>
  <div>
    <input v-model="value" placeholder="请输入二维码内容" />
    <label>
      qrcode-canvas:
      <QRCodeCanvas
        :value="value"
        fg-color="green"
        bg-color="white"
        :image-settings="{
          src: 'https://gw.alipayobjects.com/zos/rmsportal/KDpgvguMpGfqaHPjicRK.svg',
          height: 40,
          width: 40,
          excavate: false,
          crossOrigin: 'anonymous',
        }"
      />
    </label>
    <label>
      qrcode-svg:
      <QRCodeSVG
        :value="value"
        fg-color="red"
        bg-color="white"
        :image-settings="{
          src: 'https://gw.alipayobjects.com/zos/rmsportal/KDpgvguMpGfqaHPjicRK.svg',
          height: 40,
          width: 40,
          excavate: false,
          crossOrigin: 'anonymous',
        }"
      />
    </label>
  </div>
</template>
