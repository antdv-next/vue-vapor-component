<script setup lang="ts">
  import Checkbox from '@vapor-component/checkbox'
  import { QRCodeCanvas, QRCodeSVG } from '@vapor-component/qrcode'
  import Switch from '@vapor-component/switch'
  import { ref } from 'vue'
  import './styles/switch.less'

  defineOptions({ name: 'App' })
  const checked1 = ref(false)
  const checked2 = ref(false)
</script>

<template>
  <fieldset>
    <legend>playground</legend>
    <label>
      qrcode-canvas:
      <QRCodeCanvas value="https://www.baidu.com" color="red" />
    </label>
    <label>
      qrcode-svg:
      <QRCodeSVG value="https://www.baidu.com" />
    </label>
    <hr />
    <label>
      checkbox:
      <Checkbox
        :checked="checked1"
        @change="e => (checked1 = e.target.checked)"
      />
    </label>
    <hr />
    <label>
      switch:
      <Switch
        v-model:checked="checked2"
        checked-children="开"
        un-checked-children="关"
        @change="e => console.log(e)"
      />
    </label>
  </fieldset>
</template>

<style scoped lang="less"></style>
