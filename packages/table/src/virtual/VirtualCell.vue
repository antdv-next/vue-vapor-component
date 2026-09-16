<script setup vapor lang="ts">
  import type { CSSProperties } from 'vue'

  import type { useRowInfo } from '../hooks/useRowInfo'
  import type { ColumnType, CustomizeComponent } from '../interface'

  import { clsx } from '@v-c/util'
  import { getStylePxValue } from '@v-c/util/dist/props-util'

  import Cell from '../Cell.vue'
  import { getCellProps } from '../getCellProps'
  import { useInjectGridContext } from '../VirtualTableContextKey'

  const props = defineProps<{
    rowInfo: any
    column: ColumnType<any>
    colIndex: number
    indent: number
    index: number
    component?: CustomizeComponent
    renderIndex: number
    record: any
    style?: CSSProperties
    className?: string
    inverse?: boolean
    getHeight?: (rowSpan: number) => number
  }>()

  const gridContext = useInjectGridContext()

  function getColumnWidth(
    colIndex: number,
    colSpan: number,
    columnsOffset: number[],
  ) {
    const mergedColSpan = colSpan || 1
    return (
      columnsOffset[colIndex + mergedColSpan] - (columnsOffset[colIndex] || 0)
    )
  }

  const {
    render,
    dataIndex,
    className: columnClassName,
    width: colWidth,
  } = props.column
  const columnsOffset = gridContext.columnsOffset || []

  const cellProps = getCellProps(
    props.rowInfo,
    props.record,
    props.column,
    props.colIndex,
    props.indent,
    props.index,
  )

  const { key, fixedInfo, appendCellNode, additionalCellProps, hoverRowSpan } =
    cellProps

  const { style: cellStyle, colSpan = 1, rowSpan = 1 } = additionalCellProps

  const startColIndex = props.colIndex - 1
  const concatColWidth = getColumnWidth(startColIndex, colSpan, columnsOffset)

  const marginOffset = colSpan > 1 ? (colWidth as number) - concatColWidth : 0

  const normalizedCellStyle =
    cellStyle && !Array.isArray(cellStyle) && typeof cellStyle === 'object'
      ? cellStyle
      : {}
  const mergedStyle: CSSProperties = {
    ...normalizedCellStyle,
    ...(props.style || {}),
    flex: `0 0 ${concatColWidth}px`,
    width: `${concatColWidth}px`,
    marginRight:
      typeof marginOffset === 'number' ? `${marginOffset}px` : marginOffset,
    pointerEvents: 'auto',
  }

  const needHide = props.inverse
    ? rowSpan <= 1
    : colSpan === 0 || rowSpan === 0 || rowSpan > 1

  if (needHide) {
    mergedStyle.visibility = 'hidden'
  } else if (props.inverse) {
    mergedStyle.height = getStylePxValue(props.getHeight?.(rowSpan))
  }
  const mergedRender = needHide ? () => null : render

  const cellSpan: Record<string, any> = {}
  if (rowSpan === 0 || colSpan === 0) {
    cellSpan.rowSpan = 1
    cellSpan.colSpan = 1
  }

  const mergedClassName = clsx(columnClassName, props.className)
</script>

<template>
  <Cell
    :class-name="mergedClassName"
    :ellipsis="column.ellipsis"
    :align="column.align"
    :scope="column.rowScope"
    :component="component"
    :prefix-cls="rowInfo.tableContext.prefixCls"
    :key="key"
    :record="record"
    :index="index"
    :render-index="renderIndex"
    :data-index="dataIndex"
    :render="mergedRender"
    :column="column"
    row-type="body"
    :should-cell-update="column.shouldCellUpdate"
    v-bind="fixedInfo"
    :append-node="appendCellNode"
    :hover-row-span="hoverRowSpan"
    :additional-props="{
      ...additionalCellProps,
      style: mergedStyle,
      ...cellSpan,
    }"
  />
</template>
