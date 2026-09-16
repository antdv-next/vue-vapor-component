<script setup vapor lang="ts">
  import type { CSSProperties, Ref } from 'vue'

  import type {
    ColumnsType,
    ColumnType,
    Direction,
    TableLayout,
  } from './interface'

  import { clsx } from '@v-c/util'
  import { getStylePxValue, toPropsRefs } from '@v-c/util/dist/props-util'
  import { computed, onBeforeUnmount, onMounted, ref } from 'vue'

  import ColGroup from './ColGroup.vue'
  import { useInjectTableContext } from './TableContextKey'

  function useColumnWidth(colWidths: Ref<number[]>, columnCount: Ref<number>) {
    return computed(() => {
      const cloneColumns: number[] = []
      for (let i = 0; i < columnCount.value; i += 1) {
        const val = colWidths.value[i]
        if (val !== undefined) {
          cloneColumns[i] = val
        } else {
          return null
        }
      }
      return cloneColumns
    })
  }

  interface FixedHeaderProps {
    columns: ColumnsType<any>
    flattenColumns: readonly ColumnType<any>[]
    stickyOffsets: any
    className: string
    style?: CSSProperties
    noData: boolean
    maxContentScroll: boolean
    colWidths: readonly number[]
    columCount: number
    direction: Direction
    fixHeader: boolean
    stickyTopOffset?: number
    stickyBottomOffset?: number
    stickyClassName?: string
    scrollX?: number | string | true
    tableLayout?: TableLayout
    onScroll: (info: {
      currentTarget: HTMLDivElement
      scrollLeft?: number
    }) => void
    colGroup?: any
  }

  const props = defineProps<FixedHeaderProps>()

  const context = useInjectTableContext()
  const scrollRef = ref<HTMLDivElement | null>(null)
  const { colWidths, columCount } = toPropsRefs(
    props,
    'colWidths',
    'columCount',
  )

  const combinationScrollBarSize = computed(() => {
    return context.isSticky && !props.fixHeader ? 0 : context.scrollbarSize
  })
  const mergedColumnWidth = useColumnWidth(colWidths as any, columCount as any)

  const isColGroupEmpty = computed(() => {
    const widths = mergedColumnWidth.value
    const noWidth = !widths || !widths.length || widths.every(w => !w)
    return props.noData || noWidth
  })

  const columnsWithScrollbar = computed<ColumnsType<unknown>>(() => {
    const lastColumn = props.flattenColumns[props.flattenColumns.length - 1]
    const ScrollBarColumn: ColumnType<unknown> & { scrollbar: true } = {
      fixed: lastColumn?.fixed,
      scrollbar: true,
      onHeaderCell: () => ({
        class: `${context.prefixCls}-cell-scrollbar`,
      }),
    }
    return combinationScrollBarSize.value
      ? [...props.columns, ScrollBarColumn]
      : props.columns
  })

  const flattenColumnsWithScrollbar = computed(() => {
    const lastColumn = props.flattenColumns[props.flattenColumns.length - 1]
    const ScrollBarColumn: ColumnType<unknown> & { scrollbar: true } = {
      fixed: lastColumn?.fixed,
      scrollbar: true,
      onHeaderCell: () => ({
        class: `${context.prefixCls}-cell-scrollbar`,
      }),
    }
    return combinationScrollBarSize.value
      ? [...props.flattenColumns, ScrollBarColumn]
      : props.flattenColumns
  })

  const headerStickyOffsets = computed(() => {
    const { start, end } = props.stickyOffsets
    return {
      ...props.stickyOffsets,
      start,
      end: [...end.map(width => width + combinationScrollBarSize.value), 0],
      isSticky: context.isSticky,
    }
  })

  const onWheel = (event: WheelEvent) => {
    const currentTarget = event.currentTarget as HTMLDivElement
    const { deltaX } = event
    if (deltaX) {
      const { scrollLeft, scrollWidth, clientWidth } = currentTarget
      const maxScrollWidth = scrollWidth - clientWidth
      let nextScroll = scrollLeft + deltaX

      if (props.direction === 'rtl') {
        nextScroll = Math.max(-maxScrollWidth, nextScroll)
        nextScroll = Math.min(0, nextScroll)
      } else {
        nextScroll = Math.min(maxScrollWidth, nextScroll)
        nextScroll = Math.max(0, nextScroll)
      }

      props.onScroll({
        currentTarget,
        scrollLeft: nextScroll,
      })
      event.preventDefault()
    }
  }

  onMounted(() => {
    scrollRef.value?.addEventListener('wheel', onWheel, { passive: false })
  })

  onBeforeUnmount(() => {
    scrollRef.value?.removeEventListener('wheel', onWheel)
  })
</script>

<template>
  <div
    ref="scrollRef"
    :style="{
      overflow: 'hidden',
      ...(context.isSticky
        ? {
            top: getStylePxValue(stickyTopOffset),
            bottom: getStylePxValue(stickyBottomOffset),
          }
        : {}),
      ...style,
    }"
    :class="clsx(className, { [stickyClassName as string]: !!stickyClassName })"
  >
    <component
      :is="context.getComponent(['header', 'table'], 'table')"
      :style="{
        tableLayout: tableLayout,
        minWidth: '100%',
        width: typeof scrollX === 'number' ? `${scrollX}px` : scrollX,
      }"
    >
      <slot v-if="isColGroupEmpty" name="colGroup">
        {{ colGroup }}
      </slot>
      <ColGroup
        v-else
        :col-widths="[...(mergedColumnWidth || []), combinationScrollBarSize]"
        :colum-count="columCount + 1"
        :columns="flattenColumnsWithScrollbar"
      />
      <slot
        :columns="columnsWithScrollbar"
        :flattenColumns="flattenColumnsWithScrollbar"
        :stickyOffsets="headerStickyOffsets"
      />
    </component>
  </div>
</template>
