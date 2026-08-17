<script setup vapor lang="ts">
  import type { HandlerProps } from '../interface'

  defineOptions({ name: 'ColorPickerHandler' })

  const { size = 'default', color, prefixCls } = defineProps<HandlerProps>()
</script>

<template>
  <div
    :class="[
      `${prefixCls}-handler`,
      size === 'small' ? `${prefixCls}-handler-sm` : '',
    ]"
    :style="{ backgroundColor: color }"
  />
</template>
