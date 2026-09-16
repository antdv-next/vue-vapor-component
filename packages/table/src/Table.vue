<script setup vapor lang="ts">
  import type { CSSProperties } from 'vue'

  import type { FixedHeaderProps } from './FixedHolder'
  import type {
    ColumnsType,
    ColumnType,
    CustomizeScrollBody,
    DefaultRecordType,
    Direction,
    GetComponent,
    GetRowKey,
    Reference,
    TableLayout,
  } from './interface'
  import type { ScrollInfoType } from './TableContextKey'

  import { clsx, get, warning } from '@v-c/util'
  import canUseDom from '@v-c/util/dist/Dom/canUseDom'
  import { getDOM } from '@v-c/util/dist/Dom/findDOMNode'
  import { getTargetScrollBarSize } from '@v-c/util/dist/getScrollBarSize'
  import isEqual from '@v-c/util/dist/isEqual'
  import pickAttrs from '@v-c/util/dist/pickAttrs'
  import { filterEmpty } from '@v-c/util/dist/props-util'
  import ResizeObserver from '@vapor-component/resize-observer'
  import {
    computed,
    nextTick,
    onMounted,
    reactive,
    ref,
    shallowRef,
    useAttrs,
    useSlots,
    watch,
    watchEffect,
  } from 'vue'

  import Body from './Body.vue'
  import ColGroup from './ColGroup.vue'
  import { EXPAND_COLUMN, INTERNAL_HOOKS } from './constant'
  import { DEFAULT_PREFIX, defaultEmpty } from './constant'
  import FixedHolder from './FixedHolder.vue'
  import Footer from './Footer.vue'
  import Header from './Header.vue'
  import useColumns from './hooks/useColumns'
  import useExpand from './hooks/useExpand'
  import useFixedInfo from './hooks/useFixedInfo'
  import { useTimeoutLock } from './hooks/useFrame'
  import useHover from './hooks/useHover'
  import useSticky from './hooks/useSticky'
  import useStickyOffsets from './hooks/useStickyOffsets'
  import Panel from './Panel.vue'
  import StickyScrollBar from './StickyScrollBar.vue'
  import { useProvideTableContext } from './TableContextKey'
  import { isNonNullable, isVueRenderable } from './utils/isUtil'
  import { getColumnsKey, validNumberValue } from './utils/valueUtil'

  const EMPTY_DATA: any[] = []
  const EMPTY_SCROLL_TARGET = {}

  const props = withDefaults(
    defineProps<{
      prefixCls?: string
      classNames?: any
      styles?: any
      data?: readonly any[]
      columns?: ColumnsType<any>
      rowKey?: string | keyof any | GetRowKey<any>
      tableLayout?: TableLayout
      scroll?: { x?: number | true | string; y?: number | string }
      expandable?: any
      expandedRowKeys?: (string | number)[]
      indentSize?: number
      rowClassName?: any
      title?: (data: readonly any[]) => any
      footer?: (data: readonly any[]) => any
      summary?: (data: readonly any[]) => any
      fixFooter?: 'top' | 'bottom'
      headerCell?: (ctx: {
        column: ColumnType<any>
        index: number
        text: any
      }) => any
      bodyCell?: (ctx: {
        column: ColumnType<any>
        index: number
        text: any
        record: any
      }) => any
      caption?: any
      id?: string
      showHeader?: boolean
      components?: any
      onRow?: (data: any, index: number) => any
      onHeaderRow?: (columns: readonly ColumnType<any>[], index: number) => any
      emptyText?: any
      direction?: Direction
      sticky?: boolean | any
      rowHoverable?: boolean
      internalHooks?: string
      transformColumns?: (columns: ColumnsType<any>) => ColumnsType<any>
      tailor?: boolean
      getContainerWidth?: (ele: HTMLElement, width: number) => number
      internalRefs?: {
        body: { value?: HTMLDivElement | null }
      }
      bodyRef?: any
      measureRowRender?: (measureRow: any) => any
      getPopupContainer?: (triggerNode?: HTMLElement) => HTMLElement
    }>(),
    {
      rowKey: 'key',
      prefixCls: DEFAULT_PREFIX,
      emptyText: defaultEmpty,
      rowHoverable: true,
      showHeader: true,
    },
  )

  const emit = defineEmits<{
    scroll: [event: Event]
    'update:expandedRowKeys': [keys: any[]]
  }>()

  const attrs = useAttrs()
  const slots = useSlots()

  const slotKeys = Object.keys(slots)
  const hasExpandedRowSlot = slotKeys.includes('expandedRowRender')
  const hasRenderSlot = slotKeys.includes('render')

  const mergedData = shallowRef(props.data || EMPTY_DATA)
  watch(
    () => props.data,
    () => {
      mergedData.value = props.data || EMPTY_DATA
    },
  )
  const hasData = computed(() => !!mergedData.value.length)
  const useInternalHooks = computed(
    () => props.internalHooks === INTERNAL_HOOKS,
  )

  const mergedPrefixCls = computed(() => props.prefixCls || DEFAULT_PREFIX)
  const mergedRowHoverable = computed(() =>
    props.rowHoverable !== undefined ? props.rowHoverable : true,
  )
  const mergedEmptyText = computed(() =>
    props.emptyText === undefined ? defaultEmpty : props.emptyText,
  )
  const mergedDirection = computed<Direction>(() => props.direction || 'ltr')

  const getComponent: GetComponent = (path, defaultComponent) => {
    return get(props.components, path as any) || defaultComponent
  }

  const getRowKey = computed<GetRowKey<any>>(() => {
    if (typeof props.rowKey === 'function') {
      return props.rowKey as GetRowKey<any>
    }
    const rowKey = props.rowKey ?? 'key'
    return (record: any) => {
      const key = record && record[rowKey]
      if (process.env.NODE_ENV !== 'production') {
        warning(
          key !== undefined,
          'Each record in table should have a unique `key` prop, or set `rowKey` to an unique primary key.',
        )
      }
      return key
    }
  })

  const customizeScrollBody = computed(() => getComponent(['body']))

  const [startRow, endRow, onHover] = useHover()

  const [
    expandableConfig,
    expandableType,
    mergedExpandedKeys,
    mergedExpandIcon,
    mergedChildrenColumnName,
    onTriggerExpand,
    expandAllInfo,
  ] = useExpand(
    props,
    mergedData,
    getRowKey,
    keys => emit('update:expandedRowKeys', keys),
    hasExpandedRowSlot,
  )

  const componentWidth = ref(0)

  const slotChildren = shallowRef<any>(null)

  const [columns, flattenColumns, flattenScrollX] = useColumns(
    {
      prefixCls: mergedPrefixCls,
      columns: computed(() => props.columns),
      children: slotChildren,
      expandable: computed(
        () => !!expandableConfig.value.expandedRowRender || hasExpandedRowSlot,
      ),
      columnTitle: computed(() => expandableConfig.value.columnTitle),
      expandedKeys: mergedExpandedKeys,
      getRowKey,
      onTriggerExpand,
      expandIcon: mergedExpandIcon,
      ExpandIcon: computed(() => props.components?.ExpandIcon),
      expandAllInfo,
      rowExpandable: computed(() => expandableConfig.value.rowExpandable),
      expandIconColumnIndex: computed(
        () => expandableConfig.value.expandIconColumnIndex,
      ),
      expandedRowOffset: expandableConfig.value.expandedRowOffset,
      direction: mergedDirection,
      expandRowByClick: computed(() => expandableConfig.value.expandRowByClick),
      columnWidth: computed(() => expandableConfig.value.columnWidth),
      fixed: computed(() => expandableConfig.value.fixed),
      scrollWidth: computed(() =>
        useInternalHooks.value &&
        props.tailor &&
        typeof props.scroll?.x === 'number'
          ? props.scroll?.x
          : null,
      ),
      clientWidth: componentWidth,
    },
    computed(() =>
      useInternalHooks.value ? props.transformColumns || null : null,
    ),
  )

  const mergedScrollX = computed(() => flattenScrollX.value ?? props.scroll?.x)

  const fullTableRef = ref<HTMLDivElement | null>(null)
  const scrollHeaderRef = ref<any>(null)
  const scrollBodyRef = ref<any>(null)
  const scrollBodyContainerRef = ref<HTMLDivElement | null>(null)

  const scrollToFn = (config: any) => {
    const targetRef = scrollBodyRef.value
    const targetElement = getDOM(targetRef)
    if (targetElement instanceof HTMLElement) {
      const { index, top, key, offset, align = 'nearest' } = config || {}
      if (validNumberValue(top)) {
        targetElement.scrollTo({ top })
      } else {
        const mergedKey = key ?? getRowKey.value(mergedData.value[index])
        const rowElement = targetElement.querySelector(
          `[data-row-key="${mergedKey}"]`,
        ) as HTMLElement | null
        if (rowElement) {
          rowElement.scrollIntoView({ block: align })
          if (offset) {
            targetElement.scrollTo({ top: targetElement.scrollTop + offset })
          }
        }
      }
    } else if (targetRef?.scrollTo) {
      targetRef.scrollTo(config)
    }
  }

  defineExpose({
    get nativeElement() {
      return fullTableRef.value as HTMLDivElement
    },
    scrollTo: scrollToFn,
  } as Reference)

  const scrollSummaryRef = ref<any>(null)
  const shadowStart = ref(false)
  const shadowEnd = ref(false)
  const colsWidths = ref(new Map<string | number, number>())

  const colsKeys = computed(() => getColumnsKey(flattenColumns.value))
  const colWidths = computed(() =>
    colsKeys.value.map(columnKey => colsWidths.value.get(columnKey)),
  )
  const stickyRef = ref<any>(null)
  const stickyConfig = useSticky(
    computed(() => props.sticky),
    mergedPrefixCls,
  )

  const stickyOffsets = useStickyOffsets(colWidths, flattenColumns)
  const mergedStickyOffsets = computed(() => ({
    ...stickyOffsets.value,
    isSticky: stickyConfig.value.isSticky,
  }))
  const fixHeader = computed(
    () => !!(props.scroll && isNonNullable(props.scroll.y)),
  )
  const horizonScroll = computed(
    () =>
      !!(props.scroll && isNonNullable(mergedScrollX.value)) ||
      !!expandableConfig.value.fixed,
  )
  const fixColumn = computed(
    () =>
      horizonScroll.value && flattenColumns.value.some(({ fixed }) => fixed),
  )

  const summaryNode = computed(() => props.summary?.(mergedData.value))

  const fixFooterComputed = computed(() => {
    if (props.fixFooter) {
      return fixHeader.value || stickyConfig.value.isSticky
        ? props.fixFooter
        : false
    }
    return false
  })

  const scrollXStyle = computed<CSSProperties | undefined>(() => {
    if (horizonScroll.value) {
      return { overflowX: 'auto' }
    }
    return undefined
  })

  const scrollYStyle = computed<CSSProperties | undefined>(() => {
    if (fixHeader.value) {
      return {
        overflowY: hasData.value ? 'scroll' : 'auto',
        maxHeight:
          typeof props.scroll?.y === 'number'
            ? `${props.scroll?.y}px`
            : props.scroll?.y,
      }
    }
    if (horizonScroll.value && !fixHeader.value) {
      return { overflowY: 'hidden' }
    }
    return undefined
  })

  const scrollTableStyle = computed<CSSProperties | undefined>(() => {
    if (!horizonScroll.value) {
      return undefined
    }
    const width =
      mergedScrollX.value === true
        ? 'auto'
        : typeof mergedScrollX.value === 'number'
          ? `${mergedScrollX.value}px`
          : mergedScrollX.value
    return {
      width,
      minWidth: '100%',
    }
  })

  const onColumnResize = (columnKey: string | number, width: number) => {
    if (colsWidths.value.get(columnKey) !== width) {
      const newWidths = new Map(colsWidths.value)
      newWidths.set(columnKey, width)
      colsWidths.value = newWidths
    }
  }

  const [setScrollTarget, getScrollTarget] = useTimeoutLock<HTMLElement | null>(
    null,
  )
  const scrollRetryTimeoutMap = new WeakMap<
    object,
    ReturnType<typeof setTimeout>
  >()

  function syncScrollLeft(target: { scrollLeft: number }, scrollLeft: number) {
    const scrollRetryTimeout = scrollRetryTimeoutMap.get(target)
    if (scrollRetryTimeout) {
      clearTimeout(scrollRetryTimeout)
    }

    if (target.scrollLeft !== scrollLeft) {
      target.scrollLeft = scrollLeft

      const retryTimeout = setTimeout(() => {
        if (target.scrollLeft !== scrollLeft) {
          target.scrollLeft = scrollLeft
        }
      }, 0)

      scrollRetryTimeoutMap.set(target, retryTimeout)
    }
  }

  function forceScroll(scrollLeft: number, target: any) {
    if (!target) {
      return
    }
    if (typeof target === 'function') {
      target(scrollLeft)
      return
    }

    if ('scrollLeft' in target) {
      syncScrollLeft(target, scrollLeft)
      return
    }

    const element = (
      target.nativeElement ? getDOM(target.nativeElement) : getDOM(target)
    ) as HTMLElement | null
    if (element) {
      syncScrollLeft(element, scrollLeft)
    }
  }

  const scrollInfo = ref<ScrollInfoType>([0, 0])

  const onInternalScroll = (info: {
    currentTarget?: HTMLElement
    scrollLeft?: number
  }) => {
    const currentTarget =
      info.currentTarget || (scrollBodyRef.value as HTMLElement)
    const mergedScrollLeft =
      typeof info.scrollLeft === 'number'
        ? info.scrollLeft
        : currentTarget?.scrollLeft || 0
    const compareTarget = currentTarget || EMPTY_SCROLL_TARGET
    if (!getScrollTarget() || getScrollTarget() === compareTarget) {
      setScrollTarget(compareTarget)
      forceScroll(mergedScrollLeft, scrollHeaderRef.value)
      forceScroll(mergedScrollLeft, scrollBodyRef.value)
      forceScroll(mergedScrollLeft, scrollSummaryRef.value)
      forceScroll(mergedScrollLeft, stickyRef.value?.setScrollLeft)
    }

    const measureTarget = currentTarget || getDOM(scrollHeaderRef.value)
    if (measureTarget) {
      const scrollWidth =
        useInternalHooks.value &&
        props.tailor &&
        typeof mergedScrollX.value === 'number'
          ? mergedScrollX.value
          : measureTarget.scrollWidth
      const clientWidth = measureTarget.clientWidth
      const absScrollStart = Math.abs(mergedScrollLeft)
      const nextScrollInfo: ScrollInfoType = [
        absScrollStart,
        scrollWidth - clientWidth,
      ]
      scrollInfo.value = isEqual(scrollInfo.value, nextScrollInfo)
        ? scrollInfo.value
        : nextScrollInfo

      if (scrollWidth === clientWidth) {
        shadowStart.value = false
        shadowEnd.value = false
        return
      }
      shadowStart.value = absScrollStart > 0
      shadowEnd.value = absScrollStart < scrollWidth - clientWidth - 1
    }
  }

  const onBodyScroll = (event: Event) => {
    onInternalScroll({ currentTarget: event.currentTarget as HTMLElement })
    emit('scroll', event)
  }

  const triggerOnScroll = () => {
    if (horizonScroll.value && scrollBodyRef.value) {
      const bodyElement = getDOM(scrollBodyRef.value) as HTMLElement
      onInternalScroll({
        currentTarget: bodyElement,
        scrollLeft: (scrollBodyRef.value as any)?.scrollLeft,
      })
    } else {
      shadowStart.value = false
      shadowEnd.value = false
    }
  }

  const onFullTableResize = (offsetWidth?: number) => {
    stickyRef.value?.checkScrollBarVisible?.()
    let mergedWidth = offsetWidth ?? fullTableRef.value?.offsetWidth ?? 0
    if (
      useInternalHooks.value &&
      props.getContainerWidth &&
      fullTableRef.value
    ) {
      mergedWidth =
        props.getContainerWidth(fullTableRef.value, mergedWidth) || mergedWidth
    }
    if (mergedWidth !== componentWidth.value) {
      triggerOnScroll()
      componentWidth.value = mergedWidth
    }
  }

  watch(
    horizonScroll,
    () => {
      if (horizonScroll.value) {
        onFullTableResize()
      }
    },
    { immediate: true, flush: 'post' },
  )

  const mounted = ref(false)
  watch(
    () => [horizonScroll.value, props.data, columns.value.length],
    async () => {
      if (mounted.value) {
        await nextTick()
        triggerOnScroll()
      }
    },
  )
  onMounted(() => {
    mounted.value = true
  })

  const scrollbarSize = ref(0)
  onMounted(() => {
    if (!props.tailor || !useInternalHooks.value) {
      if (scrollBodyRef.value?.nodeType === 1) {
        scrollbarSize.value = getTargetScrollBarSize(
          scrollBodyRef.value as HTMLElement,
        ).width
      } else {
        scrollbarSize.value = getTargetScrollBarSize(
          scrollBodyContainerRef.value as any,
        ).width
      }
    }
  })

  watchEffect(() => {
    if (!canUseDom()) {
      return
    }
    if (useInternalHooks.value && props.internalRefs?.body) {
      props.internalRefs.body.value = getDOM(
        scrollBodyRef.value,
      ) as HTMLDivElement
    }
  })

  const TableComponent = computed(() => getComponent(['table'], 'table'))

  const mergedTableLayout = computed<TableLayout>(() => {
    if (props.tableLayout) {
      return props.tableLayout
    }
    if (fixColumn.value) {
      return mergedScrollX.value === 'max-content' ? 'auto' : 'fixed'
    }
    if (
      fixHeader.value ||
      stickyConfig.value.isSticky ||
      flattenColumns.value.some(({ ellipsis }) => ellipsis)
    ) {
      return 'fixed'
    }
    return 'auto'
  })

  const headerProps = computed(() => ({
    colWidths: colWidths.value,
    columCount: flattenColumns.value.length,
    stickyOffsets: mergedStickyOffsets.value,
    onHeaderRow: props.onHeaderRow,
    fixHeader: fixHeader.value,
    scroll: props.scroll,
  }))

  const emptyNode = computed(() => {
    if (hasData.value) {
      return null
    }
    const emptyText = mergedEmptyText.value
    if (typeof emptyText === 'function') {
      return emptyText()
    }
    return emptyText
  })

  const fixedInfoList = useFixedInfo(flattenColumns, mergedStickyOffsets)

  // Context with reactive getters (Rule 11 - avoids watchEffect fragility in vapor)
  const tableContext = reactive<any>({
    get scrollX() {
      return mergedScrollX.value
    },
    get scrollInfo() {
      return scrollInfo.value
    },
    get classNames() {
      return props.classNames
    },
    get styles() {
      return props.styles
    },
    get prefixCls() {
      return mergedPrefixCls.value
    },
    get getComponent() {
      return getComponent
    },
    get scrollbarSize() {
      return scrollbarSize.value
    },
    get direction() {
      return mergedDirection.value
    },
    get fixedInfoList() {
      return fixedInfoList.value
    },
    get isSticky() {
      return stickyConfig.value.isSticky
    },
    get componentWidth() {
      return componentWidth.value
    },
    get fixHeader() {
      return fixHeader.value
    },
    get fixColumn() {
      return fixColumn.value
    },
    get horizonScroll() {
      return horizonScroll.value
    },
    get tableLayout() {
      return mergedTableLayout.value
    },
    get rowClassName() {
      return props.rowClassName
    },
    get expandedRowClassName() {
      return expandableConfig.value.expandedRowClassName
    },
    get expandIcon() {
      return mergedExpandIcon.value
    },
    get expandableType() {
      return expandableType.value
    },
    get expandRowByClick() {
      return expandableConfig.value.expandRowByClick
    },
    get expandedRowRender() {
      return expandableConfig.value.expandedRowRender
    },
    get forceRender() {
      return expandableConfig.value.forceRender ?? false
    },
    get expandedRowOffset() {
      return expandableConfig.value.expandedRowOffset
    },
    get onTriggerExpand() {
      return onTriggerExpand
    },
    get expandIconColumnIndex() {
      return expandableConfig.value.expandIconColumnIndex
    },
    get indentSize() {
      return expandableConfig.value.indentSize ?? 15
    },
    get allColumnsFixedLeft() {
      return flattenColumns.value.every(col => col.fixed === 'start')
    },
    get emptyNode() {
      return emptyNode.value
    },
    get columns() {
      return columns.value
    },
    get flattenColumns() {
      return flattenColumns.value
    },
    get onColumnResize() {
      return onColumnResize
    },
    get colWidths() {
      return colWidths.value as number[]
    },
    get hoverStartRow() {
      return startRow.value
    },
    get hoverEndRow() {
      return endRow.value
    },
    get onHover() {
      return onHover
    },
    get rowExpandable() {
      return expandableConfig.value.rowExpandable
    },
    get onRow() {
      return props.onRow
    },
    get getRowKey() {
      return getRowKey.value
    },
    get expandedKeys() {
      return mergedExpandedKeys.value
    },
    get childrenColumnName() {
      return mergedChildrenColumnName.value
    },
    get rowHoverable() {
      return mergedRowHoverable.value
    },
    get measureRowRender() {
      return props.measureRowRender
    },
    get headerCell() {
      return props.headerCell
    },
    get bodyCell() {
      return props.bodyCell
    },
    get hasExpandedRowSlot() {
      return hasExpandedRowSlot
    },
    get hasRenderSlot() {
      return hasRenderSlot
    },
  })
  useProvideTableContext(tableContext)

  // Fixed holder props for shared use
  const fixedHolderBaseProps = computed(() => ({
    noData: !mergedData.value.length,
    maxContentScroll:
      horizonScroll.value && mergedScrollX.value === 'max-content',
    ...headerProps.value,
    columns: columns.value,
    flattenColumns: flattenColumns.value,
    direction: mergedDirection.value,
    stickyClassName: stickyConfig.value.stickyClassName,
    scrollX: mergedScrollX.value,
    tableLayout: mergedTableLayout.value,
    onScroll: onInternalScroll,
  }))

  const onResizeWrapper = (size: any, _element: any) => {
    if (horizonScroll.value) {
      onFullTableResize(size?.offsetWidth)
    }
  }

  // Table styles and classes
  const tableStyle = computed<CSSProperties>(() => {
    const style: CSSProperties = {}
    const attrStyle = (attrs as any).style
    if (typeof attrStyle === 'object' && attrStyle) {
      for (const key in attrStyle) {
        style[key] = (attrStyle as any)[key]
      }
    }
    if (stickyConfig.value.isSticky) {
      ;(style as any)['--columns-count'] = flattenColumns.value.length
    }
    return style
  })

  const tableClass = computed(() => {
    const attrClass = (attrs as any).class || (attrs as any).className
    return clsx(
      mergedPrefixCls.value,
      {
        [`${mergedPrefixCls.value}-rtl`]: mergedDirection.value === 'rtl',
        [`${mergedPrefixCls.value}-fix-start-shadow`]: horizonScroll.value,
        [`${mergedPrefixCls.value}-fix-end-shadow`]: horizonScroll.value,
        [`${mergedPrefixCls.value}-fix-start-shadow-show`]:
          horizonScroll.value && shadowStart.value,
        [`${mergedPrefixCls.value}-fix-end-shadow-show`]:
          horizonScroll.value && shadowEnd.value,
        [`${mergedPrefixCls.value}-layout-fixed`]:
          props.tableLayout === 'fixed',
        [`${mergedPrefixCls.value}-fixed-header`]: fixHeader.value,
        [`${mergedPrefixCls.value}-fixed-column`]: fixColumn.value,
        [`${mergedPrefixCls.value}-scroll-horizontal`]: horizonScroll.value,
        [`${mergedPrefixCls.value}-has-fix-start`]:
          flattenColumns.value[0]?.fixed,
        [`${mergedPrefixCls.value}-has-fix-end`]:
          flattenColumns.value[flattenColumns.value.length - 1]?.fixed ===
          'end',
      },
      attrClass,
    )
  })

  const ariaProps = computed(() => pickAttrs(attrs, { aria: true }))

  const hasCustomBody = computed(() => !!customizeScrollBody.value)

  const setScrollBodyRef = (el: any) => {
    scrollBodyRef.value = el
    if (props.bodyRef) {
      if (typeof props.bodyRef === 'function') {
        props.bodyRef(el)
      } else if (props.bodyRef && 'value' in props.bodyRef) {
        ;(props.bodyRef as any).value = el
      }
    }
  }
</script>

<template>
  <ResizeObserver :on-resize="onResizeWrapper">
    <div
      ref="fullTableRef"
      :class="tableClass"
      :style="tableStyle"
      :id="id"
      v-bind="ariaProps"
    >
      <Panel
        v-if="title"
        :class="clsx(`${mergedPrefixCls}-title`, classNames?.title)"
        :style="styles?.title"
      >
        {{ title(mergedData) }}
      </Panel>

      <div
        ref="scrollBodyContainerRef"
        :class="clsx(`${mergedPrefixCls}-container`, classNames?.section)"
        :style="styles?.section"
      >
        <!-- Fixed Header / Sticky layout -->
        <template v-if="fixHeader || stickyConfig.isSticky">
          <FixedHolder
            v-if="showHeader !== false"
            v-bind="fixedHolderBaseProps"
            :sticky-top-offset="stickyConfig.offsetHeader"
            :class-name="`${mergedPrefixCls}-header`"
            ref="scrollHeaderRef"
          >
            <template #colGroup>
              <ColGroup
                :col-widths="flattenColumns.map(({ width }) => width)"
                :columns="flattenColumns"
              />
            </template>
            <template
              #default="{
                columns: fc,
                flattenColumns: ffc,
                stickyOffsets: fso,
              }"
            >
              <Header
                :columns="fc"
                :flatten-columns="ffc"
                :sticky-offsets="fso"
                :on-header-row="onHeaderRow"
              />
              <Footer
                v-if="fixFooterComputed === 'top'"
                :sticky-offsets="fso"
                :flatten-columns="ffc"
              >
                {{ summaryNode }}
              </Footer>
            </template>
          </FixedHolder>

          <!-- Body content -->
          <component
            :is="customizeScrollBody"
            v-if="hasCustomBody"
            :data="mergedData"
            :on-scroll="onInternalScroll"
            :scrollbar-size="scrollbarSize"
            ref="setScrollBodyRef"
          />
          <div
            v-else
            ref="scrollBodyRef"
            :style="{ ...scrollXStyle, ...scrollYStyle }"
            :class="`${mergedPrefixCls}-body`"
            @scroll="onBodyScroll"
          >
            <component
              :is="TableComponent"
              :style="{ ...scrollTableStyle, tableLayout: mergedTableLayout }"
              v-bind="ariaProps"
            >
              <caption
                v-if="isNonNullable(caption)"
                :class="`${mergedPrefixCls}-caption`"
              >
                {{
                  caption
                }}
              </caption>
              <ColGroup
                :col-widths="flattenColumns.map(({ width }) => width)"
                :columns="flattenColumns"
              />
              <Body
                :data="mergedData"
                :measure-column-width="
                  fixHeader || horizonScroll || stickyConfig.isSticky
                "
              >
                <template
                  v-if="hasExpandedRowSlot"
                  #expandedRowRender="{ record, index, indent, expanded }"
                >
                  <slot
                    name="expandedRowRender"
                    :record="record"
                    :index="index"
                    :indent="indent"
                    :expanded="expanded"
                  />
                </template>
                <template
                  v-if="hasRenderSlot"
                  #render="{ value, record, index, column }"
                >
                  <slot
                    name="render"
                    :value="value"
                    :record="record"
                    :index="index"
                    :column="column"
                  />
                </template>
              </Body>
              <Footer
                v-if="!fixFooterComputed && isVueRenderable(summaryNode)"
                :sticky-offsets="mergedStickyOffsets"
                :flatten-columns="flattenColumns"
              >
                {{ summaryNode }}
              </Footer>
            </component>
          </div>

          <!-- Fixed Footer -->
          <FixedHolder
            v-if="fixFooterComputed && fixFooterComputed !== 'top'"
            v-bind="fixedHolderBaseProps"
            :sticky-bottom-offset="stickyConfig.offsetSummary"
            :class-name="`${mergedPrefixCls}-summary`"
            ref="scrollSummaryRef"
          >
            <template #colGroup>
              <ColGroup
                :col-widths="flattenColumns.map(({ width }) => width)"
                :columns="flattenColumns"
              />
            </template>
            <template
              #default="{
                columns: fc,
                flattenColumns: ffc,
                stickyOffsets: fso,
              }"
            >
              <Footer :sticky-offsets="fso" :flatten-columns="ffc">
                {{ summaryNode }}
              </Footer>
            </template>
          </FixedHolder>

          <!-- Sticky ScrollBar -->
          <StickyScrollBar
            v-if="
              stickyConfig.isSticky &&
              scrollBodyRef &&
              (scrollBodyRef as any).nodeType === 1
            "
            ref="stickyRef"
            :offset-scroll="stickyConfig.offsetScroll"
            :scroll-body-ref="scrollBodyRef"
            :on-scroll="onInternalScroll"
            :container="stickyConfig.container"
            :direction="mergedDirection"
          />
        </template>

        <!-- Non-fixed layout -->
        <template v-else>
          <div
            ref="scrollBodyRef"
            :style="{ ...scrollXStyle, ...scrollYStyle, ...styles?.content }"
            :class="clsx(`${mergedPrefixCls}-content`, classNames?.content)"
            @scroll="onBodyScroll"
          >
            <component
              :is="TableComponent"
              :style="{ ...scrollTableStyle, tableLayout: mergedTableLayout }"
              v-bind="ariaProps"
            >
              <caption
                v-if="isNonNullable(caption)"
                :class="`${mergedPrefixCls}-caption`"
              >
                {{
                  caption
                }}
              </caption>
              <ColGroup
                :col-widths="flattenColumns.map(({ width }) => width)"
                :columns="flattenColumns"
              />
              <Header
                v-if="showHeader !== false"
                :columns="columns"
                :flatten-columns="flattenColumns"
                :sticky-offsets="mergedStickyOffsets"
                :on-header-row="onHeaderRow"
              />
              <Body
                :data="mergedData"
                :measure-column-width="
                  fixHeader || horizonScroll || stickyConfig.isSticky
                "
              >
                <template
                  v-if="hasExpandedRowSlot"
                  #expandedRowRender="{ record, index, indent, expanded }"
                >
                  <slot
                    name="expandedRowRender"
                    :record="record"
                    :index="index"
                    :indent="indent"
                    :expanded="expanded"
                  />
                </template>
                <template
                  v-if="hasRenderSlot"
                  #render="{ value, record, index, column }"
                >
                  <slot
                    name="render"
                    :value="value"
                    :record="record"
                    :index="index"
                    :column="column"
                  />
                </template>
              </Body>
              <Footer
                v-if="!fixFooterComputed && isVueRenderable(summaryNode)"
                :sticky-offsets="mergedStickyOffsets"
                :flatten-columns="flattenColumns"
              >
                {{ summaryNode }}
              </Footer>
            </component>
          </div>
        </template>
      </div>

      <Panel
        v-if="footer"
        :class="clsx(`${mergedPrefixCls}-footer`, classNames?.footer)"
        :style="styles?.footer"
      >
        {{ footer(mergedData) }}
      </Panel>
    </div>
  </ResizeObserver>
</template>
