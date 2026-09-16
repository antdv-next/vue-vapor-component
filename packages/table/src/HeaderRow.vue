<script setup vapor lang="ts">
  import type {
    CellType,
    ColumnType,
    CustomizeComponent,
    GetComponentProps,
    StickyOffsets,
  } from './interface'
  import type { TableProps } from './interface'

  import { clsx } from '@v-c/util'
  import { computed } from 'vue'

  import Cell from './Cell.vue'
  import ExpandIcon from './ExpandIcon.vue'
  import { useInjectTableContext } from './TableContextKey'
  import { getCellFixedInfo } from './utils/fixUtil'
  import { getColumnsKey } from './utils/valueUtil'

  const props = defineProps<{
    cells: readonly CellType<any>[]
    stickyOffsets: StickyOffsets
    flattenColumns: readonly ColumnType<any>[]
    rowComponent: CustomizeComponent
    cellComponent: CustomizeComponent
    onHeaderRow?: GetComponentProps<readonly ColumnType<any>[]>
    index: number
    classNames: NonNullable<TableProps['classNames']>['header']
    styles: NonNullable<TableProps['styles']>['header']
  }>()

  const { prefixCls } = useInjectTableContext()

  const {
    cells,
    stickyOffsets,
    flattenColumns,
    onHeaderRow,
    index,
    classNames,
    styles,
  } = props

  const rowColumns = cells
    .map(cell => cell.column)
    .filter(Boolean) as ColumnType<any>[]
  const rowProps = onHeaderRow ? onHeaderRow(rowColumns, index) : undefined
  const columnsKey = getColumnsKey(rowColumns)

  const mergedRowClass = clsx(
    classNames?.row,
    rowProps?.className,
    rowProps?.class,
  )
  const mergedRowStyle = {
    ...(styles?.row || ({} as Record<string, any>)),
    ...(rowProps?.style || ({} as Record<string, any>)),
  }

  const cellFixedInfos = computed(() =>
    cells.map((cell: any, cellIndex: number) =>
      getCellFixedInfo(
        cell.colStart ?? cellIndex,
        cell.colEnd,
        flattenColumns,
        stickyOffsets,
      ),
    ),
  )
</script>

<template>
  <component
    :is="rowComponent"
    v-bind="rowProps || {}"
    :class="mergedRowClass"
    :style="mergedRowStyle"
  >
    <Cell
      v-for="(cell, cellIndex) in cells"
      :key="columnsKey[cellIndex]"
      v-bind="{ ...cell, ...cellFixedInfos[cellIndex] }"
      :col-index="cell.colStart ?? cellIndex"
      :scope="
        cell.column.title ? (cell.colSpan > 1 ? 'colgroup' : 'col') : null
      "
      :ellipsis="cell.column.ellipsis"
      :align="cell.column.align"
      :component="cellComponent"
      :prefix-cls="prefixCls"
      :additional-props="cell.column?.onHeaderCell?.(cell.column) || {}"
      row-type="header"
    >
      <template #default>
        <ExpandIcon
          v-if="cell.children?.__isExpandIcon"
          v-bind="cell.children"
        />
        <template v-else>{{ cell.children }}</template>
      </template>
    </Cell>
  </component>
</template>
