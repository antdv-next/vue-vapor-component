<script setup lang="ts">
  import ColorPicker, { Color } from '@vapor-component/color-picker'
  import { ref } from 'vue'

  import '@/styles/color-picker.less'

  const colorValue = ref(new Color('rgba(255,0,0,0)'))

  function onChange(v: string | any) {
    console.log('change:', v)
  }

  function onChangeComplete(v: string | any) {
    console.log('change-complete:', v)
  }
</script>

<template>
  <label>
    ColorPicker:
    <ColorPicker
      v-model:value="colorValue"
      @change="onChange"
      @change-complete="onChangeComplete"
    />
    <br />
    <div style="width: 258px; display: flex; flex-direction: column; gap: 8px">
      <span> hex: {{ colorValue.toHexString() }}</span>
      <span> rgb: {{ colorValue.toRgbString() }}</span>
      <span> hsb: {{ colorValue.toHsbString() }}</span>
    </div>
  </label>
  <label>
    ColorPicker (rgb):
    <ColorPicker
      :value="'rgb(255, 85, 61)'"
      :value-format="'rgb'"
      @change="onChange"
      @update:value="v => console.log('update:value (rgb)', v)"
    />
  </label>
  <label>
    ColorPicker (hsb):
    <ColorPicker
      :value="'hsb(180, 100, 50)'"
      :value-format="'hsb'"
      @change="onChange"
      @update:value="v => console.log('update:value (hsb)', v)"
    />
  </label>
  <label>
    ColorPicker (disabled):
    <ColorPicker :value="'#f5222d'" :disabled="true" />
  </label>
  <label>
    ColorPicker (disabled alpha):
    <ColorPicker
      :value="'rgba(0, 128, 255, 0.5)'"
      :disabled-alpha="true"
      @change="onChange"
      @update:value="v => console.log('update:value (no alpha)', v)"
    />
  </label>
</template>
