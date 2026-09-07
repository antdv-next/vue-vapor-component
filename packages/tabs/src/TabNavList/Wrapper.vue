<script setup vapor lang="ts">
  import type { TabNavListWrapperProps } from '../interface'

  import TabNavList from './index.vue'

  defineOptions({ name: 'VcTabNavListWrapper', inheritAttrs: false })

  const props = defineProps<TabNavListWrapperProps>()

  const emit = defineEmits<{
    'tab-click': [key: string, e: MouseEvent | KeyboardEvent]
    'tab-scroll': [info: { direction: 'left' | 'right' | 'top' | 'bottom' }]
    edit: [
      type: 'add' | 'remove',
      info: { key?: string; event: MouseEvent | KeyboardEvent },
    ]
  }>()
</script>

<template>
  <TabNavList
    v-bind="props"
    @tab-click="
      (key: string, e: MouseEvent | KeyboardEvent) => emit('tab-click', key, e)
    "
    @tab-scroll="
      (info: { direction: 'left' | 'right' | 'top' | 'bottom' }) =>
        emit('tab-scroll', info)
    "
    @edit="
      (
        type: 'add' | 'remove',
        info: { key?: string; event: MouseEvent | KeyboardEvent },
      ) => emit('edit', type, info)
    "
  >
    <slot />
  </TabNavList>
</template>
