<script setup vapor lang="ts">
  import type { ListRef as VcListRef } from '@vapor-component/virtual-list'

  import type { ListyRef, ListyScrollToConfig, ScrollAlign } from './interface'
  import type { ListComponentProps } from './interface'

  import VcVirtualList from '@vapor-component/virtual-list'
  import { computed, ref } from 'vue'

  import GroupHeader from './GroupHeader.vue'
  import useFlattenRows from './hooks/useFlattenRows'
  import useGroupSegments from './hooks/useGroupSegments'
  import useItemKey from './hooks/useItemKey'
  import StickyHeader from './StickyHeader.vue'
  import { toTaggedKey } from './util'

  defineOptions({ name: 'ListyVirtualList', inheritAttrs: false })

  const props = defineProps<ListComponentProps>()
  const emit = defineEmits<{
    scroll: [e: Event]
  }>()

  const listRef = ref<VcListRef>()
  const getItemKey = useItemKey(props.rowKey)
  const groupData = useGroupSegments(props.data, props.group)

  const flattenRows = computed(() =>
    useFlattenRows(props.data, groupData.value, getItemKey, props.group),
  )

  const itemKeyToGroupKey = computed(() => {
    const map = new Map<string, any>()
    let currentGroupKey: any | undefined
    flattenRows.value.rows.forEach(row => {
      if (row.type === 'group') {
        currentGroupKey = row.groupKey
      } else if (currentGroupKey !== undefined) {
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
        props.sticky &&
        props.group &&
        cfg.align !== 'bottom'
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
        offset: ({
          getSize,
          align,
        }: {
          getSize: (key: any) => { top: number; bottom: number }
          align: ScrollAlign
        }) => {
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
    :height="height"
    :item-height="itemHeight"
    :direction="direction"
    :prefix-cls="prefixCls"
    :full-height="false"
    item-key="taggedKey"
    :virtual="true"
    :class="classNames?.root"
    :style="styles?.root"
    @scroll="(e: Event) => emit('scroll', e)"
  >
    <template #default="{ item: row }">
      <template v-if="(row as any).type === 'group'">
        <GroupHeader
          :group="group!"
          :group-key="(row as any).groupKey"
          :group-items="getGroupItems((row as any).groupKey)"
          :prefix-cls="prefixCls"
          :class-name="classNames?.groupHeader"
          :style="styles?.groupHeader"
        />
      </template>
      <template v-else>
        <div
          style="pointer-events: auto"
          :class="`${prefixCls}-item`"
          :style="styles?.item"
        >
          <slot
            v-bind="{ item: (row as any).item, index: (row as any).index }"
          />
        </div>
      </template>
    </template>
    <template #extraRender="{ getSize, scrollTop, virtual: isVirtual }">
      <StickyHeader
        v-if="isVirtual && sticky && group && flattenRows.groupKeys.length"
        :get-size="getSize"
        :scroll-top="scrollTop"
        :group-keys="flattenRows.groupKeys"
        :group-key-to-items="flattenRows.groupKeyToItems"
        :group="group"
        :prefix-cls="prefixCls"
        :list-ref="listRef"
        :header-class-name="classNames?.groupHeader"
        :header-style="styles?.groupHeader"
      />
    </template>
  </VcVirtualList>
</template>
