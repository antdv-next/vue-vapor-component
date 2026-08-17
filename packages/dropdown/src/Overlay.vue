<script setup vapor lang="ts">
  import type { OverlayProps } from './interface'

  defineOptions({ name: 'VcDropdownOverlay' })

  const props = defineProps<OverlayProps>()
  const emit = defineEmits<{
    'overlay-click': [e: Event]
  }>()

  const onOverlayClick = (e: Event) => {
    emit('overlay-click', e)
  }
</script>

<template>
  <div :class="`${prefixCls}-overlay`" @click="onOverlayClick">
    <div v-if="arrow" :class="`${prefixCls}-arrow`" />
    <slot />
  </div>
</template>
