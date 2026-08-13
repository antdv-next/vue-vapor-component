<script setup vapor lang="ts">
import type { ListRef as VcListRef } from '@vapor-component/virtual-list'
import type { ListyRef, ListyScrollToConfig, ScrollAlign } from './interface'
import VcVirtualList from '@vapor-component/virtual-list'
import { computed, ref } from 'vue'
import GroupHeader from './GroupHeader.vue'
import StickyHeader from './StickyHeader.vue'
import useFlattenRows from './hooks/useFlattenRows'
import useGroupSegments from './hooks/useGroupSegments'
import useItemKey from './hooks/useItemKey'
import { toTaggedKey } from './util'
import type { ListComponentProps } from './interface'

defineOptions({ name: 'ListyVirtualList', inheritAttrs: false })

const props = defineProps<ListComponentProps>()

const listRef = ref<VcListRef>()
const getItemKey = useItemKey(props.rowKey)
const groupData = useGroupSegments(props.data, props.group)

const flattenRows = computed(() =>
  useFlattenRows(props.data, groupData.value, getItemKey, props.group),
)

const itemKeyToGroupKey = computed(() => {
  const map = new Map<string, any>()
  let currentGroupKey: any | undefined
  flattenRows.value.rows.forEach((row) => {
    if (row.type === 'group') {
      currentGroupKey = row.groupKey
    }
    else if (currentGroupKey !== undefined) {
      map.set(row.taggedKey, currentGroupKey)
    }
  })
  return map
})

const getGroupItems = (groupKey: any) =>
  flattenRows.value.groupKeyToItems.get(groupKey) || []

const scrollTo: ListyRef['scrollTo'] = (config?: ListyScrollToConfig) => {
  if (config === null || typeof config === 'number') {
    listRef.value?.scrollTo(config)
    return
  }

  const cfg = config as
    | { groupKey: string; align?: ScrollAlign; offset?: number }
    | { key: string; align?: ScrollAlign; offset?: number }
    | { left?: number; top?: number }

  if ('groupKey' in cfg) {
    listRef.value?.scrollTo({
      key: toTaggedKey(cfg.groupKey, 'group'),
      align: cfg.align,
      offset: cfg.offset,
    })
    return
  }

  if ('key' in cfg) {
    const taggedItemKey = toTaggedKey(cfg.key, 'item')
    const shouldCompensate = !!(
      props.sticky
      && props.group
      && cfg.align !== 'bottom'
    )
    const stickyGroupKey = shouldCompensate
      ? itemKeyToGroupKey.value.get(taggedItemKey)
      : undefined

    if (!stickyGroupKey) {
      listRef.value?.scrollTo({ ...cfg, key: taggedItemKey })
      return
    }

    listRef.value?.scrollTo({
      ...cfg,
      key: taggedItemKey,
      offset: ({ getSize, align }: { getSize: (key: any) => { top: number; bottom: number }; align: ScrollAlign }) => {
        const baseOffset = cfg.offset ?? 0
        if (align !== 'top') return baseOffset
        const headerSize = getSize(toTaggedKey(stickyGroupKey, 'group'))
        const headerHeight = headerSize.bottom - headerSize.top
        return baseOffset + (Number.isFinite(headerHeight) ? headerHeight : 0)
      },
    })
    return
  }

  listRef.value?.scrollTo(cfg)
}

defineExpose({ scrollTo })
</script>

<template>
  <VcVirtualList
    ref="listRef"
    :data="flattenRows.rows"
    :height="props.height"
    :item-height="props.itemHeight"
    :direction="props.direction"
    :prefix-cls="props.prefixCls"
    :full-height="false"
    item-key="taggedKey"
    :virtual="true"
    :class="props.classNames?.root"
    :style="props.styles?.root"
    @scroll="props.onScroll"
  >
    <template #default="{ item: row }">
      <template v-if="(row as any).type === 'group'">
        <GroupHeader
          :group="props.group!"
          :group-key="(row as any).groupKey"
          :group-items="getGroupItems((row as any).groupKey)"
          :prefix-cls="props.prefixCls"
          :class-name="props.classNames?.groupHeader"
          :style="props.styles?.groupHeader"
        />
      </template>
      <template v-else>
        <div
          style="pointer-events: auto"
          :class="`${props.prefixCls}-item`"
          :style="props.styles?.item"
        >
          <slot v-bind="{ item: (row as any).item, index: (row as any).index }" />
        </div>
      </template>
    </template>
    <template #extraRender="{ getSize, scrollTop, virtual: isVirtual }">
      <StickyHeader
        v-if="isVirtual && props.sticky && props.group && flattenRows.groupKeys.length"
        :get-size="getSize"
        :scroll-top="scrollTop"
        :group-keys="flattenRows.groupKeys"
        :group-key-to-items="flattenRows.groupKeyToItems"
        :group="props.group"
        :prefix-cls="props.prefixCls"
        :list-ref="listRef"
        :header-class-name="props.classNames?.groupHeader"
        :header-style="props.styles?.groupHeader"
      />
    </template>
  </VcVirtualList>
</template>