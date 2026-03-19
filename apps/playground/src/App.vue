<script setup lang="ts">
  import Checkbox from '@vapor-component/checkbox'
  import { QRCodeCanvas, QRCodeSVG } from '@vapor-component/qrcode'
  import ResizeObserver from '@vapor-component/resize-observer'
  import Switch from '@vapor-component/switch'
  import { ref } from 'vue'

  import './styles/switch.less'

  defineOptions({ name: 'App' })
  const checked1 = ref(false)
  const checked2 = ref(false)
  const times = ref(0)
  const disabled = ref(false)
  const width = ref(0)
  const height = ref(0)
  function onResize(size: { width: number; height: number }) {
    const { width: w, height: h } = size
    console.log('Resize:', '\n', 'BoundingBox', w, h, '\n', 'Offset')
    times.value += 1
    width.value = w
    height.value = h
  }
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
    <label>
      ResizeObserver:
      <div style="transform: scale(1.1); transform-origin: 0% 0%">
        <Checkbox :checked="disabled" @change="() => (disabled = !disabled)" />
        Disabled Observe >>> Resize times: {{ times }} {{ width }}/{{ height }}
      </div>
      <ResizeObserver :disabled="disabled" @resize="onResize">
        <textarea placeholder="I'm a textarea!" />
      </ResizeObserver>
    </label>
  </fieldset>
</template>

<style scoped lang="less"></style>
