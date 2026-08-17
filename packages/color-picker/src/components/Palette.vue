<script setup vapor lang="ts">
  defineOptions({ name: 'ColorPickerPalette' })
  const { prefixCls } = defineProps<{
    prefixCls?: string
  }>()
</script>

<template>
  <div
    :class="`${prefixCls}-palette`"
    :style="{ position: 'relative', width: '100%' }"
  >
    <slot />
  </div>
</template>
