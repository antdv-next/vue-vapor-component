<script setup vapor lang="ts">
  import type { ColorBlockProps } from '../interface'

  defineOptions({ name: 'ColorPickerColorBlock' })

  const { color, prefixCls } = defineProps<ColorBlockProps>()
</script>

<template>
  <div :class="`${prefixCls}-color-block`">
    <div
      :class="`${prefixCls}-color-block-inner`"
      :style="{ background: color }"
    />
  </div>
</template>
