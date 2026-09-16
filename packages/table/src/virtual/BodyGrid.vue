<script setup vapor lang="ts">
  import type { ListRef } from '@vapor-component/virtual-list'
  import type { CSSProperties } from 'vue'

  import type { ColumnType, Key, OnCustomizeScroll } from '../interface'

  import { getStylePxValue } from '@v-c/util/dist/props-util'
  import VirtualList from '@vapor-component/virtual-list'
  import { computed, reactive, ref, toRaw, watch } from 'vue'

  import useFlattenRecords from '../hooks/useFlattenRecords'
  import { useInjectTableContext } from '../TableContextKey'
  import {
    useInjectStaticContext,
    useProvideGridContext,
  } from '../VirtualTableContextKey'
  import BodyLine from './BodyLine.vue'

  const props = defineProps<{
    data: any[]
    onScroll: OnCustomizeScroll
  }>()

  const tableContext = useInjectTableContext()
  const staticContext = useInjectStaticContext()
  const listRef = ref<ListRef | null>(null)

  const flattenData = useFlattenRecords(
    computed(() => props.data),
    computed(() => tableContext.childrenColumnName),
    computed(() => tableContext.expandedKeys),
    computed(() => tableContext.getRowKey),
  )

  const columnsWidth = computed<[key: Key, width: number, total: number][]>(
    () => {
      let total = 0
      return tableContext.flattenColumns.map(({ width, minWidth, key }) => {
        const finalWidth = Math.max(
          (width as number) || 0,
          (minWidth as number) || 0,
        )
        total += finalWidth
        return [key as Key, finalWidth, total]
      })
    },
  )

  const columnsOffset = computed(() =>
    columnsWidth.value.map(colWidth => colWidth[2]),
  )

  watch(
    columnsWidth,
    newColumns => {
      newColumns.forEach(([key, width]) => {
        tableContext.onColumnResize(key, width)
      })
    },
    { immediate: true },
  )

  const gridContext = reactive({
    get columnsOffset() {
      return columnsOffset.value
    },
  })
  useProvideGridContext(gridContext)

  function getRowSpan(
    column: ColumnType<any>,
    index: number,
    data?: any,
  ): number {
    const rawData = data ?? toRaw(flattenData.value)
    const record = rawData[index]?.record
    const { onCell } = column

    if (onCell) {
      const cellProps = onCell(record, index) as any
      return cellProps?.rowSpan ?? 1
    }
    return 1
  }

  function computeExtraRenderLines(
    start: number,
    end: number,
    getSize: any,
    offsetY: number,
  ): any[] {
    if (end < 0) {
      return []
    }
    const flattenColumns = toRaw(tableContext).flattenColumns
    const rawData = toRaw(flattenData.value)
    let firstRowSpanColumns = flattenColumns.filter(
      column => getRowSpan(column, start, rawData) === 0,
    )

    let startIndex = start
    for (let i = start; i >= 0; i -= 1) {
      firstRowSpanColumns = firstRowSpanColumns.filter(
        column => getRowSpan(column, i, rawData) === 0,
      )

      if (!firstRowSpanColumns.length) {
        startIndex = i
        break
      }
    }

    let lastRowSpanColumns = flattenColumns.filter(
      column => getRowSpan(column, end, rawData) !== 1,
    )

    let endIndex = end
    for (let i = end; i < rawData.length; i += 1) {
      lastRowSpanColumns = lastRowSpanColumns.filter(
        column => getRowSpan(column, i, rawData) !== 1,
      )

      if (!lastRowSpanColumns.length) {
        endIndex = Math.max(i - 1, end)
        break
      }
    }

    const spanLines: number[] = []
    for (let i = startIndex; i <= endIndex; i += 1) {
      const item = rawData[i]
      if (!item) {
        continue
      }

      if (flattenColumns.some(column => getRowSpan(column, i, rawData) > 1)) {
        spanLines.push(i)
      }
    }

    if (!spanLines.length) {
      return []
    }

    return spanLines.map(index => {
      const item = rawData[index]
      if (!item) {
        return null
      }

      const rowKey = item.rowKey

      const getHeight = (rowSpan: number) => {
        const endItemIndex = index + rowSpan - 1
        const endItem = rawData[endItemIndex]

        if (!endItem || !endItem.record) {
          const safeEndIndex = Math.min(endItemIndex, rawData.length - 1)
          const safeEndItem = rawData[safeEndIndex]

          const endItemKey = safeEndItem.rowKey
          const sizeInfo = getSize(rowKey, endItemKey)
          return sizeInfo.bottom - sizeInfo.top
        }

        const endItemKey = endItem.rowKey
        const sizeInfo = getSize(rowKey, endItemKey)
        return sizeInfo.bottom - sizeInfo.top
      }

      const sizeInfo = getSize(rowKey)
      return {
        key: index,
        item,
        rowKey,
        style: {
          top: getStylePxValue(-offsetY + sizeInfo.top),
        },
        extra: true,
        getHeight,
      }
    })
  }

  const ALIGN_MAP: Record<string, 'top' | 'bottom' | 'auto'> = {
    start: 'top',
    end: 'bottom',
    nearest: 'auto',
  }

  const exposed: any = {
    scrollTo: (config: any) => {
      if (!listRef.value) {
        return
      }
      const { align, offset, ...restConfig } = config || {}
      const virtualAlign =
        (align ? ALIGN_MAP[align] : undefined) ?? (offset ? 'top' : 'auto')

      listRef.value.scrollTo({
        ...restConfig,
        offset,
        align: virtualAlign,
      } as any)
    },
    get nativeElement() {
      const native = listRef.value?.nativeElement
      return native && typeof native === 'object' && 'value' in native
        ? (native as any).value
        : native
    },
  }

  Object.defineProperty(exposed, 'scrollLeft', {
    get: () => listRef.value?.getScrollInfo().x || 0,
    set: (value: number) => {
      listRef.value?.scrollTo({ left: value })
    },
  })

  Object.defineProperty(exposed, 'scrollTop', {
    get: () => listRef.value?.getScrollInfo().y || 0,
    set: (value: number) => {
      listRef.value?.scrollTo({ top: value })
    },
  })

  defineExpose(exposed)

  const tblPrefixCls = computed(() => `${tableContext.prefixCls}-tbody`)
  const wrapperComponent =
    staticContext.getComponent?.(['body', 'wrapper'], 'div') || 'div'

  const horizontalScrollBarStyle: CSSProperties = {}
  if (staticContext.sticky) {
    horizontalScrollBarStyle.position = 'sticky'
    horizontalScrollBarStyle.bottom = 0
    if (
      typeof staticContext.sticky === 'object' &&
      staticContext.sticky.offsetScroll
    ) {
      horizontalScrollBarStyle.bottom = staticContext.sticky.offsetScroll
    }
  }

  const listStyles = computed(() => ({
    horizontalScrollBar: horizontalScrollBarStyle,
  }))
</script>

<template>
  <VirtualList
    :full-height="false"
    ref="listRef"
    :prefix-cls="`${tblPrefixCls}-virtual`"
    :styles="listStyles"
    :class="tblPrefixCls"
    :height="staticContext.scrollY"
    :item-height="staticContext.listItemHeight || 24"
    :data="flattenData"
    :item-key="(item: any) => item.rowKey"
    :component="wrapperComponent"
    :scroll-width="tableContext.scrollX as number"
    :direction="tableContext.direction"
    @virtual-scroll="
      ({ x }: { x: number }) => {
        onScroll({
          currentTarget: exposed.nativeElement,
          scrollLeft: x,
        })
      }
    "
    @scroll="(e: Event) => staticContext.onScroll?.(e)"
  >
    <template #default="{ item, index, style: itemStyle }">
      <BodyLine
        :data="item"
        :row-key="item.rowKey"
        :index="index"
        :style="itemStyle"
      />
    </template>

    <template #extraRender="{ start, end, getSize, offsetY }">
      <template
        v-for="line in computeExtraRenderLines(start, end, getSize, offsetY)"
        :key="line.key"
      >
        <BodyLine
          v-if="line"
          :data="line.item"
          :row-key="line.rowKey"
          :index="line.key"
          :style="line.style"
          :extra="true"
          :get-height="line.getHeight"
        />
      </template>
    </template>
  </VirtualList>
</template>
