<script setup vapor lang="ts">
  import type { CSSProperties } from 'vue'

  import type { FlattenData } from '../hooks/useFlattenRecords'

  import { clsx } from '@v-c/util'
  import { computed } from 'vue'

  import Cell from '../Cell.vue'
  import useRowInfo from '../hooks/useRowInfo'
  import { computedExpandedClassName } from '../utils/expandUtil'
  import { useInjectStaticContext } from '../VirtualTableContextKey'
  import VirtualCell from './VirtualCell.vue'

  const props = defineProps<{
    data: FlattenData<any>
    index: number
    className?: string
    style?: CSSProperties
    rowKey: string | number
    extra?: boolean
    getHeight?: (rowSpan: number) => number
  }>()

  const staticContext = useInjectStaticContext()

  const rowInfo = useRowInfo(
    computed(() => props.data?.record),
    computed(() => props.rowKey),
    computed(() => props.index),
    computed(() => props.data?.indent || 0),
  )

  const { record, indent, index: renderIndex } = props.data

  const tableContext = rowInfo.tableContext
  const RowComponent =
    staticContext.getComponent?.(['body', 'row'], 'div') || 'div'
  const CellComponent =
    staticContext.getComponent?.(['body', 'cell'], 'div') || 'div'

  const { rowSupportExpand, expanded, rowProps } = rowInfo
  const expandedRowRender = tableContext.expandedRowRender
  const expandedRowClassName = tableContext.expandedRowClassName
  const forceRender = tableContext.forceRender

  let expandRowNode: any = null
  if (
    !props.extra &&
    rowSupportExpand.value &&
    (forceRender || expanded.value)
  ) {
    const expandContent = expandedRowRender(
      record,
      props.index,
      indent + 1,
      expanded.value,
    )
    const expandedClsName = computedExpandedClassName(
      expandedRowClassName,
      record,
      props.index,
      indent,
    )

    let additionalProps: Record<string, any> = {}
    if (tableContext.fixColumn) {
      additionalProps = {
        style: {
          ['--virtual-width' as any]: `${tableContext.componentWidth}px`,
        },
      }
    }

    const rowCellCls = `${tableContext.prefixCls}-expanded-row-cell`

    expandRowNode = {
      expandedClsName,
      expandContent,
      additionalProps,
      rowCellCls,
    }
  }

  const rowStyle: CSSProperties = {
    ...(props.style || {}),
    width:
      typeof tableContext.scrollX === 'number'
        ? `${tableContext.scrollX}px`
        : (tableContext.scrollX as any),
  }

  if (props.extra) {
    rowStyle.position = 'absolute'
    rowStyle.pointerEvents = 'none'
  }
  const rowPropsStyle = rowProps.value?.style
  const mergedRowStyle = {
    ...rowStyle,
    ...(typeof rowPropsStyle === 'object' ? rowPropsStyle : {}),
  }

  const tableClassNames = (tableContext as any).classNames
  const tableStyles = (tableContext as any).styles
</script>

<template>
  <div v-if="rowSupportExpand">
    <component
      :is="RowComponent"
      v-bind="rowProps"
      :data-row-key="rowKey"
      :class="
        clsx(
          className,
          `${tableContext.prefixCls}-row`,
          rowProps?.className,
          rowProps?.class,
          tableClassNames?.body?.row,
          {
            [`${tableContext.prefixCls}-row-extra`]: extra,
          },
        )
      "
      :style="{ ...mergedRowStyle, ...tableStyles?.body?.row }"
    >
      <VirtualCell
        v-for="(column, colIndex) in tableContext.flattenColumns"
        :key="colIndex"
        :component="CellComponent"
        :row-info="rowInfo"
        :column="column"
        :col-index="colIndex"
        :indent="indent"
        :index="index"
        :render-index="renderIndex"
        :record="record"
        :inverse="extra"
        :get-height="getHeight"
        :class-name="tableClassNames?.body?.cell"
        :style="tableStyles?.body?.cell"
      />
    </component>

    <component
      v-if="expandRowNode"
      :is="RowComponent"
      :class="
        clsx(
          `${tableContext.prefixCls}-expanded-row`,
          `${tableContext.prefixCls}-expanded-row-level-${indent + 1}`,
          expandRowNode.expandedClsName,
        )
      "
      :style="{ display: expanded ? undefined : 'none' }"
    >
      <Cell
        :component="CellComponent"
        :prefix-cls="tableContext.prefixCls"
        :class-name="
          clsx(expandRowNode.rowCellCls, {
            [`${expandRowNode.rowCellCls}-fixed`]: tableContext.fixColumn,
          })
        "
        :additional-props="expandRowNode.additionalProps"
      >
        <template #default>
          {{ expandRowNode.expandContent }}
        </template>
      </Cell>
    </component>
  </div>

  <component
    v-else
    :is="RowComponent"
    v-bind="rowProps"
    :data-row-key="rowKey"
    :class="
      clsx(
        className,
        `${tableContext.prefixCls}-row`,
        rowProps?.className,
        rowProps?.class,
        tableClassNames?.body?.row,
        {
          [`${tableContext.prefixCls}-row-extra`]: extra,
        },
      )
    "
    :style="{ ...mergedRowStyle, ...tableStyles?.body?.row }"
  >
    <VirtualCell
      v-for="(column, colIndex) in tableContext.flattenColumns"
      :key="colIndex"
      :component="CellComponent"
      :row-info="rowInfo"
      :column="column"
      :col-index="colIndex"
      :indent="indent"
      :index="index"
      :render-index="renderIndex"
      :record="record"
      :inverse="extra"
      :get-height="getHeight"
      :class-name="tableClassNames?.body?.cell"
      :style="tableStyles?.body?.cell"
    />
  </component>
</template>
