<script setup vapor lang="ts">
  import type { ResizeObserverProps, SizeInfo } from './interface'

  import SingleObserver from './SingleObserver/index.vue'

  defineOptions({ name: 'ResizeObserver', inheritAttrs: false })
  const props = defineProps<ResizeObserverProps>()
  const emit = defineEmits<{
    resize: [size: SizeInfo, element: HTMLElement]
  }>()
</script>

<template>
  <SingleObserver v-bind="props" @resize="e => emit('resize', e)">
    <slot />
  </SingleObserver>
</template>
