<script setup vapor lang="ts">
  import type { CSSProperties } from 'vue'

  import type {
    AlignType,
    CellEllipsisType,
    CellType,
    ColumnType,
    CustomizeComponent,
    DataIndex,
    DefaultRecordType,
    RenderedCell,
    ScopeType,
  } from './interface'

  import { clsx, warning } from '@v-c/util'
  import { filterEmpty } from '@v-c/util/dist/props-util'
  import getValue from '@v-c/util/dist/utils/get'
  import { computed, isVNode, toRaw, useSlots } from 'vue'

  import ExpandIcon from './ExpandIcon.vue'
  import useHoverState from './hooks/useHoverState'
  import { useInjectPerfContext } from './PerfContextKey'
  import { useInjectTableContext } from './TableContextKey'
  import { isNonNullable } from './utils/isUtil'
  import { INTERNAL_COL_DEFINE } from './utils/legacyUtil'

  const props = defineProps<{
    prefixCls?: string
    className?: string
    style?: CSSProperties
    record?: any
    index?: number
    colIndex?: number
    renderIndex?: number
    dataIndex?: DataIndex<any>
    render?: ColumnType<any>['render']
    component?: CustomizeComponent
    children?: any
    colSpan?: number
    rowSpan?: number
    hoverRowSpan?: number
    scope?: ScopeType
    ellipsis?: CellEllipsisType
    align?: AlignType
    shouldCellUpdate?: (record: any, prevRecord: any) => boolean
    column?: ColumnType<any>
    fixStart?: number | false
    fixEnd?: number | false
    fixedStartShadow?: boolean
    fixedEndShadow?: boolean
    offsetFixedStartShadow?: number
    offsetFixedEndShadow?: number
    zIndex?: number
    zIndexReverse?: number
    allColsFixedLeft?: boolean
    appendNode?: any
    additionalProps?: Record<string, any>
    rowType?: 'header' | 'body' | 'footer'
    isSticky?: boolean
  }>()

  const tableContext = useInjectTableContext()
  const perfRecord = useInjectPerfContext()
  const slots = useSlots()

  const isFixStart = computed(() => {
    return (
      typeof props.fixStart === 'number' && !tableContext.allColumnsFixedLeft
    )
  })

  const isFixEnd = computed(() => {
    return typeof props.fixEnd === 'number' && !tableContext.allColumnsFixedLeft
  })

  const isInternalColumn = computed(() => {
    const col = props.column
    return !!(col && (col as any)[INTERNAL_COL_DEFINE])
  })

  const shadowInfo = computed(() => {
    if (!isFixStart.value && !isFixEnd.value) {
      return [false, false] as [boolean, boolean]
    }
    const {
      fixedEndShadow,
      offsetFixedStartShadow,
      offsetFixedEndShadow,
      fixedStartShadow,
    } = props
    const [absScroll = 0, scrollWidth = 0] = tableContext.scrollInfo || []
    const showStartShadow =
      isFixStart.value && fixedStartShadow
        ? absScroll - (offsetFixedStartShadow || 0) >= 1
        : false
    const showEndShadow =
      isFixEnd.value && fixedEndShadow
        ? scrollWidth - absScroll - (offsetFixedEndShadow || 0) > 1
        : false

    return [showStartShadow, showEndShadow] as [boolean, boolean]
  })

  function getTitleFromCellRenderChildren({
    ellipsis,
    rowType,
    children,
  }: Pick<typeof props, 'ellipsis' | 'rowType' | 'children'>) {
    const ellipsisConfig = ellipsis === true ? { showTitle: true } : ellipsis
    const showTitle = !!(
      ellipsisConfig &&
      typeof ellipsisConfig === 'object' &&
      ellipsisConfig.showTitle
    )
    if (ellipsisConfig && (showTitle || rowType === 'header')) {
      if (typeof children === 'string' || typeof children === 'number') {
        return children.toString()
      }
      if (isVNode(children) && typeof children.children === 'string') {
        return children.children
      }
      if (Array.isArray(children)) {
        const first = filterEmpty(children)[0]
        if (typeof first === 'string' || typeof first === 'number') {
          return first.toString()
        }
        if (isVNode(first) && typeof first.children === 'string') {
          return first.children
        }
      }
    }
    return undefined
  }

  function isRenderCell(data: any): data is RenderedCell<any> {
    return (
      data &&
      typeof data === 'object' &&
      !Array.isArray(data) &&
      !isVNode(data) &&
      !!data.props
    )
  }

  function resolveCellRender({
    record,
    dataIndex,
    renderIndex,
    children,
    render,
    perfRecord,
  }: {
    record: any
    dataIndex: DataIndex<any> | undefined
    renderIndex: number
    children: any
    render?: ColumnType<any>['render']
    perfRecord?: { renderWithProps: boolean }
  }): [any, CellType<any>?] | [any] {
    if (isNonNullable(children)) {
      return [children]
    }

    const path =
      dataIndex === null || dataIndex === undefined || dataIndex === ''
        ? []
        : Array.isArray(dataIndex)
          ? dataIndex
          : [dataIndex]

    const value: any = getValue(record as any, path as any)
    let returnChildNode = value
    let returnCellProps: CellType<any> | undefined

    if (render) {
      const renderData = render(value, record, renderIndex)
      if (isRenderCell(renderData)) {
        if (process.env.NODE_ENV !== 'production') {
          warning(
            false,
            '`columns.render` return cell props is deprecated with perf issue, please use `onCell` instead.',
          )
        }
        returnChildNode = renderData.props?.children ?? renderData.children
        returnCellProps = renderData.props
        if (perfRecord) {
          perfRecord.renderWithProps = true
        }
      } else {
        returnChildNode = renderData
      }
    }

    return [returnChildNode, returnCellProps] as [any, CellType<any>?] | [any]
  }

  const mergedRenderIndex = computed(
    () => props.renderIndex ?? props.index ?? 0,
  )

  const contentMemo = computed(() => {
    const { record, dataIndex, index, render, rowType } = props
    const rawProps = toRaw(props)
    const column = rawProps.column
    const colIndex = rawProps.colIndex
    const slotChildren = props.children ?? slots.default?.()

    const path =
      dataIndex === null || dataIndex === undefined || dataIndex === ''
        ? []
        : Array.isArray(dataIndex)
          ? dataIndex
          : [dataIndex]
    const rawValue = getValue(record as any, path as any)

    const effectiveRender =
      tableContext.hasRenderSlot && !isInternalColumn.value ? undefined : render

    const [childNode, legacyCellProps] = resolveCellRender({
      record,
      dataIndex,
      renderIndex: mergedRenderIndex.value,
      children: slotChildren,
      render: effectiveRender,
      perfRecord,
    })

    let rawChildNode: any = childNode
    const renderCell =
      rowType === 'header'
        ? tableContext.headerCell
        : rowType === 'body'
          ? tableContext.bodyCell
          : undefined

    if (renderCell && column) {
      const ctxIndex =
        rowType === 'header' ? (colIndex ?? 0) : mergedRenderIndex.value
      const renderCellNode =
        rowType === 'body'
          ? renderCell({ column, index: ctxIndex, text: childNode, record })
          : renderCell({ column, index: ctxIndex, text: childNode } as any)
      if (Array.isArray(renderCellNode)) {
        const filteredNodes = filterEmpty(renderCellNode)
        if (filteredNodes.length > 0) {
          rawChildNode = filteredNodes
        }
      } else if (renderCellNode !== null && renderCellNode !== undefined) {
        rawChildNode = renderCellNode
      }
    }

    return { rawChildNode, legacyCellProps, rawValue }
  })

  const { rawChildNode, legacyCellProps, rawValue } = contentMemo.value

  const [showFixStartShadow, showFixEndShadow] = shadowInfo.value

  const fixedStyle: CSSProperties = {}
  if (isFixStart.value) {
    fixedStyle.insetInlineStart = `${props.fixStart as number}px`
    ;(fixedStyle as any)['--z-offset'] = props.zIndex
    ;(fixedStyle as any)['--z-offset-reverse'] = props.zIndexReverse
  }
  if (isFixEnd.value) {
    fixedStyle.insetInlineEnd = `${props.fixEnd as number}px`
    ;(fixedStyle as any)['--z-offset'] = props.zIndex
    ;(fixedStyle as any)['--z-offset-reverse'] = props.zIndexReverse
  }

  const additionalProps = props.additionalProps || {}
  const mergedColSpan = computed(
    () =>
      legacyCellProps?.colSpan ?? additionalProps.colSpan ?? props.colSpan ?? 1,
  )
  const mergedRowSpan = computed(
    () =>
      legacyCellProps?.rowSpan ?? additionalProps.rowSpan ?? props.rowSpan ?? 1,
  )
  const mergedHoverRowSpan = computed(
    () => legacyCellProps?.rowSpan ?? props.hoverRowSpan ?? mergedRowSpan.value,
  )

  const [hovering, onHover] = useHoverState(
    props.index!,
    mergedHoverRowSpan.value,
    tableContext,
  )

  const onMouseEnter = (event: MouseEvent) => {
    if (props.record) {
      onHover(props.index!, props.index! + mergedHoverRowSpan.value - 1)
    }
    const onMouseEnterHandler =
      additionalProps.onMouseEnter || additionalProps.onMouseenter
    onMouseEnterHandler?.(event)
  }

  const onMouseLeave = (event: MouseEvent) => {
    if (props.record) {
      onHover(-1, -1)
    }
    const onMouseLeaveHandler =
      additionalProps.onMouseLeave || additionalProps.onMouseleave
    onMouseLeaveHandler?.(event)
  }

  let mergedChildNode: any = rawChildNode

  // Prevent VNodes and non-stringifiable objects from reaching {{ }} interpolation
  if (mergedChildNode != null && typeof mergedChildNode === 'object') {
    if (isVNode(mergedChildNode)) {
      mergedChildNode =
        typeof mergedChildNode.children === 'string'
          ? mergedChildNode.children
          : null
    } else if (
      mergedChildNode.__isExpandIcon ||
      mergedChildNode.__isExpandCell
    ) {
      // Expand icon/cell data — rendered by <ExpandIcon /> in template
    } else if (!Array.isArray(mergedChildNode)) {
      mergedChildNode = null
    }
  }

  const title =
    additionalProps.title ??
    getTitleFromCellRenderChildren({
      rowType: props.rowType,
      ellipsis: props.ellipsis,
      children: mergedChildNode,
    })

  const additionalClassName = additionalProps.className || additionalProps.class
  const cellPrefixCls = `${props.prefixCls}-cell`
  let mergedAppendNode = props.appendNode ?? slots.appendNode?.()
  if (mergedAppendNode != null && typeof mergedAppendNode === 'object') {
    if (isVNode(mergedAppendNode)) {
      mergedAppendNode =
        typeof mergedAppendNode.children === 'string'
          ? mergedAppendNode.children
          : null
    } else if (mergedAppendNode.__isExpandCell) {
      // Expand cell data — rendered by <ExpandIcon /> in template
    } else if (!Array.isArray(mergedAppendNode)) {
      mergedAppendNode = null
    }
  }

  const mergedClassName = clsx(
    cellPrefixCls,
    props.className,
    {
      [`${cellPrefixCls}-fix`]: isFixStart.value || isFixEnd.value,
      [`${cellPrefixCls}-fix-start`]: isFixStart.value,
      [`${cellPrefixCls}-fix-end`]: isFixEnd.value,
      [`${cellPrefixCls}-fix-start-shadow`]: props.fixedStartShadow,
      [`${cellPrefixCls}-fix-start-shadow-show`]:
        props.fixedStartShadow && showFixStartShadow,
      [`${cellPrefixCls}-fix-end-shadow`]: props.fixedEndShadow,
      [`${cellPrefixCls}-fix-end-shadow-show`]:
        props.fixedEndShadow && showFixEndShadow,
      [`${cellPrefixCls}-ellipsis`]: props.ellipsis,
      [`${cellPrefixCls}-with-append`]: mergedAppendNode,
      [`${cellPrefixCls}-fix-sticky`]:
        (isFixStart.value || isFixEnd.value) && props.isSticky,
      [`${cellPrefixCls}-row-hover`]: !legacyCellProps && hovering.value,
    },
    additionalClassName,
    legacyCellProps?.className,
  )

  const alignStyle: CSSProperties = {}
  if (props.align) {
    alignStyle.textAlign = props.align as any
  }

  const mergedStyle: CSSProperties = {
    ...legacyCellProps?.style,
    ...fixedStyle,
    ...alignStyle,
    ...additionalProps.style,
    ...props.style,
  }

  const Component = props.component || 'td'

  const mergedBindProps = computed(() => {
    const result: Record<string, any> = {
      ...legacyCellProps,
      ...additionalProps,
    }
    delete result.colspan
    delete result.colSpan
    delete result.rowspan
    delete result.rowSpan
    if (mergedColSpan.value !== 1) {
      result.colspan = mergedColSpan.value
    }
    if (mergedRowSpan.value !== 1) {
      result.rowspan = mergedRowSpan.value
    }
    return result
  })
</script>

<template>
  <component
    v-if="mergedColSpan !== 0 && mergedRowSpan !== 0"
    :is="Component"
    v-bind="mergedBindProps"
    :class="mergedClassName"
    :style="mergedStyle"
    :title="title"
    :scope="scope"
    @mouseenter="tableContext.rowHoverable ? onMouseEnter : undefined"
    @mouseleave="tableContext.rowHoverable ? onMouseLeave : undefined"
  >
    <template v-if="mergedAppendNode">
      <template v-if="mergedAppendNode.__isExpandCell">
        <span
          v-if="mergedAppendNode.indent !== undefined"
          :style="{
            paddingLeft: `${mergedAppendNode.indentSize * mergedAppendNode.indent}px`,
          }"
          :class="`${prefixCls}-row-indent indent-level-${mergedAppendNode.indent}`"
        />
        <ExpandIcon
          v-if="mergedAppendNode.expandIcon"
          v-bind="mergedAppendNode.expandIcon"
        />
      </template>
      <template v-else>{{ mergedAppendNode }}</template>
    </template>
    <template
      v-if="
        column &&
        !isInternalColumn &&
        rowType === 'body' &&
        tableContext.hasRenderSlot
      "
    >
      <slot
        name="render"
        :value="rawValue"
        :record="record"
        :index="mergedRenderIndex"
        :column="column"
      >
        <ExpandIcon
          v-if="mergedChildNode?.__isExpandIcon"
          v-bind="mergedChildNode"
        />
        <template v-else>{{ mergedChildNode }}</template>
      </slot>
    </template>
    <slot v-else>
      <ExpandIcon
        v-if="mergedChildNode?.__isExpandIcon"
        v-bind="mergedChildNode"
      />
      <template v-else>{{ mergedChildNode }}</template>
    </slot>
  </component>
</template>
