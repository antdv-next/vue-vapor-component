<script setup vapor lang="ts">
  import type { ResizeObserverProps } from './interface'

  import SingleObserver from './SingleObserver/index.vue'

  defineOptions({ name: 'ResizeObserver' })
  const props = defineProps<ResizeObserverProps>()
  const emit = defineEmits(['resize'])
</script>

<template>
  <SingleObserver v-bind="props" @resize="e => emit('resize', e)">
    <slot />
  </SingleObserver>
</template>
