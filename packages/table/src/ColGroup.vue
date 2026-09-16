<script setup vapor lang="ts">
  import type { ColumnType } from './interface'

  import { computed } from 'vue'

  import { useInjectTableContext } from './TableContextKey'
  import { INTERNAL_COL_DEFINE } from './utils/legacyUtil'

  const props = defineProps<{
    colWidths: readonly (number | string)[]
    columns?: readonly ColumnType<any>[]
    columCount?: number
  }>()

  const context = useInjectTableContext()

  interface ColItem {
    key: number
    style: Record<string, string>
    additionalProps: Record<string, any>
  }

  const cols = computed<ColItem[]>(() => {
    const { colWidths, columns, columCount } = props
    const result: ColItem[] = []
    const len = columCount || columns?.length || 0

    let mustInsert = false
    for (let i = len - 1; i >= 0; i -= 1) {
      const width = colWidths[i]
      const column = columns && columns[i]
      let additionalProps: Record<string, any> | undefined
      let minWidth: number | undefined
      if (column) {
        additionalProps = (column as any)[INTERNAL_COL_DEFINE]
        if (context.tableLayout === 'auto') {
          minWidth = column.minWidth
        }
      }

      if (width || minWidth || additionalProps || mustInsert) {
        const mergedWidth = typeof width === 'number' ? `${width}px` : width
        const mergedMinWidth =
          typeof minWidth === 'number' ? `${minWidth}px` : minWidth
        const { columnType, ...restAdditionalProps } = additionalProps || {}
        const style: Record<string, string> = {}
        if (mergedWidth) style.width = mergedWidth
        if (mergedMinWidth) style.minWidth = mergedMinWidth

        result.unshift({
          key: i,
          style,
          additionalProps: restAdditionalProps,
        })
        mustInsert = true
      }
    }

    return result
  })

  const showColgroup = computed(() => cols.value.length > 0)
</script>

<template>
  <colgroup v-if="showColgroup">
    <col
      v-for="col in cols"
      :key="col.key"
      v-bind="col.additionalProps"
      :style="col.style"
    />
  </colgroup>
</template>
