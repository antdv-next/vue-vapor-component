<script setup vapor lang="ts">
import type { ListyRef, ListyScrollToConfig } from './interface'
import { computed, ref } from 'vue'
import RawList from './RawList.vue'
import VirtualList from './VirtualList.vue'
import type { ListyProps } from './interface'

defineOptions({ name: 'Listy', inheritAttrs: false })

const props = withDefaults(defineProps<ListyProps>(), {
  prefixCls: 'vc-listy',
  virtual: true,
})

const data = computed(() => props.items || [])

const listRef = ref<{ scrollTo: ListyRef['scrollTo'] }>()

function scrollTo(config?: ListyScrollToConfig) {
  listRef.value?.scrollTo(config)
}

defineExpose({ scrollTo })
</script>

<template>
  <VirtualList
    v-if="props.virtual"
    ref="listRef"
    :data="data"
    :row-key="props.rowKey"
    :prefix-cls="props.prefixCls"
    :height="props.height"
    :item-height="props.itemHeight"
    :group="props.group"
    :sticky="props.sticky"
    :direction="props.direction"
    :class-names="props.classNames"
    :styles="props.styles"
    @scroll="props.onScroll"
  >
    <template #default="slotProps">
      <slot v-bind="slotProps" />
    </template>
  </VirtualList>
  <RawList
    v-else
    ref="listRef"
    :data="data"
    :row-key="props.rowKey"
    :prefix-cls="props.prefixCls"
    :height="props.height"
    :item-height="props.itemHeight"
    :group="props.group"
    :sticky="props.sticky"
    :direction="props.direction"
    :class-names="props.classNames"
    :styles="props.styles"
    @scroll="props.onScroll"
  >
    <template #default="slotProps">
      <slot v-bind="slotProps" />
    </template>
  </RawList>
</template>
