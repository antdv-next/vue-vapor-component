<script setup vapor lang="ts">
  import type { CSSProperties } from 'vue'

  import type { CustomizeComponent, TableProps } from './interface'

  import { clsx } from '@v-c/util'
  import { computed, ref, watchEffect } from 'vue'

  import Cell from './Cell.vue'
  import ExpandedRow from './ExpandedRow.vue'
  import { getCellProps } from './getCellProps'
  import useRowInfo from './hooks/useRowInfo'
  import { computedExpandedClassName } from './utils/expandUtil'

  interface BodyRowProps {
    record: any
    index: number
    renderIndex: number
    className?: string
    style?: CSSProperties
    classNames: NonNullable<TableProps['classNames']>['body']
    styles: NonNullable<TableProps['styles']>['body']
    rowComponent: CustomizeComponent
    cellComponent: CustomizeComponent
    scopeCellComponent: CustomizeComponent
    indent?: number
    rowKey: string | number
    rowKeys: (string | number)[]
    expandedRowInfo?: {
      offset: number
      colSpan: number
      sticky: number
    }
  }

  const props = defineProps<BodyRowProps>()

  // Keep the expanded row mounted after it has been expanded
  const expandedRef = ref(false)

  const rowInfo = useRowInfo(
    computed(() => props.record),
    computed(() => props.rowKey),
    computed(() => props.index),
    computed(() => props.indent || 0),
  )

  watchEffect(() => {
    if (rowInfo.expanded.value) {
      expandedRef.value = true
    }
  })

  const {
    className,
    style,
    classNames,
    styles,
    record,
    index,
    renderIndex,
    rowKey,
    rowKeys,
    indent = 0,
    rowComponent,
    cellComponent,
    scopeCellComponent,
    expandedRowInfo,
  } = props

  const { tableContext, rowProps, expanded, rowSupportExpand } = rowInfo
  const prefixCls = tableContext.prefixCls
  const flattenColumns = tableContext.flattenColumns
  const expandedRowClassName = tableContext.expandedRowClassName
  const expandedRowRender = tableContext.expandedRowRender
  const forceRender = tableContext.forceRender

  const expandedClsName = computedExpandedClassName(
    expandedRowClassName,
    record,
    index,
    indent,
  )

  const rowPropsStyle = rowProps.value?.style
  const mergedRowStyle = {
    ...(style || ({} as Record<string, any>)),
    ...(typeof rowPropsStyle === 'object'
      ? rowPropsStyle
      : ({} as Record<string, any>)),
    ...(styles?.row || ({} as Record<string, any>)),
  }

  const cellPropsList = computed(() =>
    flattenColumns.map((column: any, colIndex: number) => {
      return getCellProps(
        rowInfo,
        record,
        column,
        colIndex,
        indent,
        index,
        rowKeys,
        expandedRowInfo?.offset,
      )
    }),
  )

  // ============================ Expanded Row ============================
  const showExpandedRow = computed(
    () =>
      rowSupportExpand.value &&
      (forceRender || expandedRef.value || expanded.value),
  )

  const expandedContent = computed(() => {
    if (!showExpandedRow.value || !expandedRowRender) return null
    return expandedRowRender(record, index, indent + 1, expanded.value)
  })

  const expandedRowClass = computed(() => {
    const computedExpandedRowClassName = computedExpandedClassName(
      expandedRowClassName,
      record,
      index,
      indent,
    )
    return clsx(
      `${prefixCls}-expanded-row`,
      `${prefixCls}-expanded-row-level-${indent + 1}`,
      computedExpandedRowClassName,
    )
  })
</script>

<template>
  <component
    :is="rowComponent"
    v-bind="rowProps"
    :data-row-key="rowKey"
    :class="
      clsx(
        className,
        `${prefixCls}-row`,
        `${prefixCls}-row-level-${indent}`,
        rowProps?.className,
        rowProps?.class,
        classNames?.row,
        { [expandedClsName]: indent >= 1 },
      )
    "
    :style="mergedRowStyle"
  >
    <Cell
      v-for="(column, colIndex) in flattenColumns"
      :key="cellPropsList[colIndex].key"
      :class-name="clsx(column.className, classNames?.cell)"
      :style="styles?.cell"
      :ellipsis="column.ellipsis"
      :align="column.align"
      :component="column.rowScope ? scopeCellComponent : cellComponent"
      :prefix-cls="prefixCls"
      :record="record"
      :index="index"
      :render-index="renderIndex"
      :data-index="column.dataIndex"
      :render="column.render"
      :should-cell-update="column.shouldCellUpdate"
      :scope="column.rowScope || (column.title ? 'row' : undefined)"
      row-type="body"
      v-bind="cellPropsList[colIndex].fixedInfo"
      :additional-props="cellPropsList[colIndex].additionalCellProps"
      :hover-row-span="cellPropsList[colIndex].hoverRowSpan"
      :column="column"
      :append-node="cellPropsList[colIndex].appendCellNode"
    >
      <template #render="{ value, record, index, column }">
        <slot
          name="render"
          :value="value"
          :record="record"
          :index="index"
          :column="column"
        />
      </template>
    </Cell>
  </component>

  <ExpandedRow
    v-if="showExpandedRow"
    :expanded="expanded"
    :class-name="expandedRowClass"
    :prefix-cls="prefixCls"
    :component="rowComponent"
    :cell-component="cellComponent"
    :col-span="expandedRowInfo?.colSpan ?? flattenColumns.length"
    :sticky-offset="expandedRowInfo?.sticky"
  >
    <slot
      name="expandedRowRender"
      :record="record"
      :index="index"
      :indent="indent + 1"
      :expanded="expanded"
      >{{ expandedContent }}</slot
    >
  </ExpandedRow>
</template>
