<script setup lang="ts">
  import type { ResizeObserverProps } from './interface'

  import { filterEmpty } from '@v-c/util/dist/props-util'
  import { computed, useSlots } from 'vue'

  import SingleObserver from './SingleObserver/index.vue'

  defineOptions({ name: 'ResizeObserver' })
  const props = defineProps<ResizeObserverProps>()
  const emit = defineEmits(['resize'])
  const slots = useSlots()
  const childNodes = computed(() => {
    const rawNodes = slots.default ? slots.default() : []
    return filterEmpty(rawNodes).filter(Boolean)
  })
</script>

<template>
  <template
    v-for="(child, index) in childNodes"
    :key="child.key || `vc-observer-key-${index}`"
  >
    <SingleObserver v-bind="props" @resize="e => emit('resize', e)">
      <component :is="child" />
    </SingleObserver>
  </template>
</template>

<style scoped></style>
