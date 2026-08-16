<script setup vapor lang="ts">
  import type { ListRef } from '@vapor-component/virtual-list'
  import type { CSSProperties } from 'vue'

  import type { Group } from './interface'

  import Portal from '@vapor-component/portal'
  import { computed } from 'vue'

  import GroupHeader from './GroupHeader.vue'
  import { toTaggedKey } from './util'

  type GetSizeFn = (
    startKey: any,
    endKey?: any,
  ) => { top: number; bottom: number }

  const HEADER_TOP_TOLERANCE = 1

  defineOptions({ name: 'StickyHeader' })

  const props = defineProps<{
    getSize: GetSizeFn
    scrollTop: number
    groupKeys: any[]
    groupKeyToItems: Map<any, any[]>
    group: Group
    prefixCls: string
    listRef?: ListRef
    headerClassName?: string
    headerStyle?: CSSProperties
  }>()

  const container = computed(() => props.listRef?.nativeElement ?? null)

  function findActiveHeaderIndex(
    groupKeys: any[],
    getHeaderTop: (groupKey: any) => number,
    scrollTop: number,
  ): number {
    let left = 0
    let right = groupKeys.length - 1
    let activeIndex = 0

    while (left <= right) {
      const mid = Math.floor((left + right) / 2)
      if (getHeaderTop(groupKeys[mid]) <= scrollTop + HEADER_TOP_TOLERANCE) {
        activeIndex = mid
        left = mid + 1
      } else {
        right = mid - 1
      }
    }
    return activeIndex
  }

  const activeHeaderIdx = computed(() => {
    if (!props.groupKeys.length) return 0
    return findActiveHeaderIndex(
      props.groupKeys,
      groupKey => props.getSize(toTaggedKey(groupKey, 'group')).top,
      props.scrollTop,
    )
  })

  const currGroupKey = computed(() => props.groupKeys[activeHeaderIdx.value])
  const currGroupItems = computed(
    () => props.groupKeyToItems.get(currGroupKey.value) || [],
  )

  const headerHeight = computed(() => {
    if (!currGroupKey.value) return 0
    const size = props.getSize(toTaggedKey(currGroupKey.value, 'group'))
    return size.bottom - size.top
  })

  const top = computed(() => {
    const nextGroupKey = props.groupKeys[activeHeaderIdx.value + 1]
    if (nextGroupKey === undefined) return 0
    return Math.min(
      0,
      props.getSize(toTaggedKey(nextGroupKey, 'group')).top -
        headerHeight.value -
        props.scrollTop,
    )
  })

  const mergedHeaderStyle = computed<CSSProperties>(() => ({
    ...props.headerStyle,
    top: `${top.value}px`,
  }))
</script>

<template>
  <Portal v-if="container" :open="true" :get-container="() => container!">
    <div :class="`${prefixCls}-group-header-holder`">
      <GroupHeader
        :group="group"
        :group-key="currGroupKey"
        :group-items="currGroupItems"
        :prefix-cls="prefixCls"
        fixed
        :class-name="headerClassName"
        :style="mergedHeaderStyle"
      />
    </div>
  </Portal>
</template>
