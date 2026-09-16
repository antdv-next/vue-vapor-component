<script setup vapor lang="ts">
  import type { ColumnType, StickyOffsets } from './interface'

  import { computed } from 'vue'

  import { useProvideSummaryContext } from './SummaryContextKey'
  import { useInjectTableContext } from './TableContextKey'

  const props = defineProps<{
    stickyOffsets: StickyOffsets
    flattenColumns: readonly (ColumnType<any> & { scrollbar?: boolean })[]
  }>()

  defineOptions({
    inheritAttrs: false,
  })

  const context = useInjectTableContext()

  const stickyOffsetsRef = computed(() => props.stickyOffsets)
  const flattenColumnsRef = computed(() => props.flattenColumns)
  const scrollColumnIndexRef = computed(() => {
    const lastColumnIndex = props.flattenColumns.length - 1
    const scrollColumn = props.flattenColumns[lastColumnIndex]
    return scrollColumn?.scrollbar ? lastColumnIndex : null
  })

  useProvideSummaryContext({
    get stickyOffsets() {
      return stickyOffsetsRef.value
    },
    get flattenColumns() {
      return flattenColumnsRef.value
    },
    get scrollColumnIndex() {
      return scrollColumnIndexRef.value
    },
  } as any)
</script>

<template>
  <tfoot :class="`${context.prefixCls}-summary`">
    <slot />
  </tfoot>
</template>
