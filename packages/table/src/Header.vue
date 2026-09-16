<script setup vapor lang="ts">
  import type {
    CellType,
    ColumnGroupType,
    ColumnsType,
    ColumnType,
    GetComponentProps,
    StickyOffsets,
  } from './interface'
  import type { TableProps } from './Table'

  import { clsx } from '@v-c/util'
  import { computed } from 'vue'

  import HeaderRow from './HeaderRow.vue'
  import { useInjectTableContext } from './TableContextKey'

  const props = defineProps<{
    columns: ColumnsType<any>
    flattenColumns: readonly ColumnType<any>[]
    stickyOffsets: StickyOffsets
    onHeaderRow?: GetComponentProps<readonly ColumnType<any>[]>
  }>()

  defineOptions({
    inheritAttrs: false,
  })

  const context = useInjectTableContext()
  const headerCls = computed(
    () =>
      context.classNames?.header ||
      ({} as NonNullable<TableProps['classNames']>['header']),
  )
  const headerStyles = computed(
    () =>
      context.styles?.header ||
      ({} as NonNullable<TableProps['styles']>['header']),
  )

  function parseHeaderRows(
    rootColumns: ColumnsType<any>,
    classNames: NonNullable<TableProps['classNames']>['header'],
    styles: NonNullable<TableProps['styles']>['header'],
  ): CellType<any>[][] {
    const rows: CellType<any>[][] = []

    function fillRowCells(
      columns: ColumnsType<any>,
      colIndex: number,
      rowIndex: number = 0,
    ): number[] {
      rows[rowIndex] = rows[rowIndex] || []

      let currentColIndex = colIndex
      const colSpans: number[] = columns.filter(Boolean).map(column => {
        const cell: any = {
          key: column.key,
          className: clsx(column.className, classNames?.cell) || '',
          style: styles?.cell,
          children: column.title,
          column,
          colStart: currentColIndex,
        }

        let colSpan = 1

        const subColumns = (column as ColumnGroupType<any>).children
        if (subColumns && subColumns.length > 0) {
          colSpan = fillRowCells(
            subColumns,
            currentColIndex,
            rowIndex + 1,
          ).reduce((total, count) => total + count, 0)
          cell.hasSubColumns = true
        }

        if ('colSpan' in column) {
          colSpan = (column as any).colSpan
        }

        if ('rowSpan' in column) {
          cell.rowSpan = (column as any).rowSpan
        }

        cell.colSpan = colSpan
        cell.colEnd = cell.colStart + colSpan - 1
        rows[rowIndex].push(cell)

        currentColIndex += colSpan
        return colSpan
      })

      return colSpans
    }

    fillRowCells(rootColumns, 0)

    const rowCount = rows.length
    for (let rowIndex = 0; rowIndex < rowCount; rowIndex += 1) {
      rows[rowIndex].forEach((cell: any) => {
        if (!('rowSpan' in cell) && !cell.hasSubColumns) {
          cell.rowSpan = rowCount - rowIndex
        }
      })
    }

    return rows
  }

  const rows = computed(() =>
    parseHeaderRows(props.columns, headerCls.value, headerStyles.value),
  )
</script>

<template>
  <component
    :is="context.getComponent(['header', 'wrapper'], 'thead')"
    :class="clsx(`${context.prefixCls}-thead`, headerCls.wrapper)"
    :style="headerStyles.wrapper"
  >
    <HeaderRow
      v-for="(row, rowIndex) in rows"
      :key="rowIndex"
      :class-names="headerCls"
      :styles="headerStyles"
      :flatten-columns="flattenColumns"
      :cells="row"
      :sticky-offsets="stickyOffsets"
      :row-component="context.getComponent(['header', 'row'], 'tr')"
      :cell-component="context.getComponent(['header', 'cell'], 'th')"
      :on-header-row="onHeaderRow"
      :index="rowIndex"
    />
  </component>
</template>
