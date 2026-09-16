<script setup vapor lang="ts">
  import type { AlignType } from './interface'

  import { computed } from 'vue'

  import Cell from './Cell.vue'
  import { useInjectSummaryContext } from './SummaryContextKey'
  import { useInjectTableContext } from './TableContextKey'
  import { getCellFixedInfo } from './utils/fixUtil'

  const props = defineProps<{
    className?: string
    index: number
    colSpan?: number
    rowSpan?: number
    align?: AlignType
  }>()

  const { prefixCls } = useInjectTableContext()
  const summaryContext = useInjectSummaryContext()

  const mergedColSpan = computed(() => {
    const lastIndex = props.index + (props.colSpan || 1) - 1
    const scrollColumnIndex = summaryContext.scrollColumnIndex
    return scrollColumnIndex !== null && lastIndex + 1 === scrollColumnIndex
      ? (props.colSpan || 1) + 1
      : props.colSpan || 1
  })

  const fixedInfo = computed(() => {
    const stickyOffsets = summaryContext.stickyOffsets || {
      start: [],
      end: [],
      widths: [],
    }
    return getCellFixedInfo(
      props.index,
      props.index + mergedColSpan.value - 1,
      summaryContext.flattenColumns || [],
      stickyOffsets as any,
    )
  })
</script>

<template>
  <Cell
    :class-name="className"
    :index="index"
    component="td"
    :prefix-cls="prefixCls"
    :record="null"
    :data-index="null"
    :align="align"
    :col-span="mergedColSpan"
    :row-span="rowSpan"
    v-bind="fixedInfo"
  >
    <template #default>
      <slot />
    </template>
  </Cell>
</template>
