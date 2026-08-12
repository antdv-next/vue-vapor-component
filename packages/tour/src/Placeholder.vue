<script setup vapor lang="ts">
  import type { PortalProps } from '@vapor-component/portal'
  import type { Ref } from 'vue'
  import Portal from '@vapor-component/portal'
  import { computed, useTemplateRef } from 'vue'

  defineOptions({ name: 'TourPlaceholder', inheritAttrs: false })

  const props = withDefaults(defineProps<{
    open?: boolean
    autoLock?: boolean
    getContainer?: PortalProps['getContainer']
    fallbackDOM: () => HTMLElement | null
  }>(), {
    open: false,
    autoLock: true,
    fallbackDOM: () => null,
  })

  const domNode = useTemplateRef<HTMLDivElement>('domNode')

  defineExpose({
    getDom: () => domNode.value ?? props.fallbackDOM(),
    __$el: computed(() => domNode.value ?? props.fallbackDOM()),
  })
</script>

<template>
  <Portal :open="open" :auto-lock="autoLock" :get-container="getContainer">
    <div ref="domNode" />
  </Portal>
</template>
