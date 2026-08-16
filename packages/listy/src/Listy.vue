<script setup vapor lang="ts">
  import type { ListyRef, ListyScrollToConfig } from './interface'
  import type { ListyProps } from './interface'

  import { computed, ref } from 'vue'

  import RawList from './RawList.vue'
  import VirtualList from './VirtualList.vue'

  defineOptions({ name: 'Listy', inheritAttrs: false })

  const props = withDefaults(defineProps<ListyProps>(), {
    prefixCls: 'vc-listy',
    virtual: true,
  })

  const data = computed(() => props.items || [])
  const emit = defineEmits<{
    scroll: [e: Event]
  }>()

  const listRef = ref<{ scrollTo: ListyRef['scrollTo'] }>()

  function scrollTo(config?: ListyScrollToConfig) {
    listRef.value?.scrollTo(config)
  }

  defineExpose({ scrollTo })
</script>

<template>
  <VirtualList
    v-if="virtual"
    ref="listRef"
    :data="data"
    :row-key="rowKey"
    :prefix-cls="prefixCls"
    :height="height"
    :item-height="itemHeight"
    :group="group"
    :sticky="sticky"
    :direction="direction"
    :class-names="classNames"
    :styles="styles"
    @scroll="(e: Event) => emit('scroll', e)"
  >
    <template #default="slotProps">
      <slot v-bind="slotProps" />
    </template>
  </VirtualList>
  <RawList
    v-else
    ref="listRef"
    :data="data"
    :row-key="rowKey"
    :prefix-cls="prefixCls"
    :height="height"
    :item-height="itemHeight"
    :group="group"
    :sticky="sticky"
    :direction="direction"
    :class-names="classNames"
    :styles="styles"
    @scroll="(e: Event) => emit('scroll', e)"
  >
    <template #default="slotProps">
      <slot v-bind="slotProps" />
    </template>
  </RawList>
</template>
