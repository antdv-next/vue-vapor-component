<script setup vapor lang="ts">
  import type { Key } from '@v-c/util/dist/type'
  import type { CSSProperties } from 'vue'
  import type {
    ExtraRenderInfo,
    GetKey,
    ListProps,
  } from './interface'

  import ResizeObserver from '@vapor-component/resize-observer'
  import { getDOM } from '@v-c/util/dist/Dom/findDOMNode'
  import omit from '@v-c/util/dist/omit'
  import { clsx } from '@v-c/util'
  import {
    computed,
    nextTick,
    onMounted,
    onUnmounted,
    shallowRef,
    toRaw,
    unref,
    useAttrs,
    watch,
  } from 'vue'

  import Filler from './Filler.vue'
  import ScrollBar from './ScrollBar.vue'
  import useDiffItem from './hooks/useDiffItem'
  import { useGetSize } from './hooks/useGetSize'
  import useHeights from './hooks/useHeights'
  import useFrameWheel from './hooks/useFrameWheel'
  import useMobileTouchMove from './hooks/useMobileTouchMove'
  import useScrollDrag from './hooks/useScrollDrag'
  import useScrollTo from './hooks/useScrollTo'
  import { getSpinSize } from './utils/scrollbarUtil'

  defineOptions({ name: 'VirtualList', inheritAttrs: false })

  const props = withDefaults(defineProps<ListProps>(), {
    prefixCls: 'vc-virtual-list',
    fullHeight: true,
    component: 'div',
    virtual: true,
    showScrollBar: 'optional',
  })

  const attrs = useAttrs()

  const EMPTY_DATA: any[] = []

  const ScrollStyle: CSSProperties = {
    overflowY: 'auto',
    overflowAnchor: 'none',
  }

  // =============================== Item Key ===============================
  let itemKeyProp: Key | ((item: any) => Key) = props.itemKey
  watch(
    () => props.itemKey,
    (val) => {
      itemKeyProp = val
    },
  )

  const getKey: GetKey<any> = (item: any): Key => {
    const _itemKey = itemKeyProp
    if (typeof _itemKey === 'function') {
      return _itemKey(item)
    }
    return item?.[_itemKey as string]
  }

  // ================================ Height ================================
  const [_setInstanceRef, collectHeight, heights, heightUpdatedMark, instanceRef] = useHeights(
    getKey,
    undefined,
    undefined,
  )

  // Auto-measure item heights via ResizeObserver on each item wrapper
  let itemResizeObserver: any = null
  onMounted(() => {
    itemResizeObserver = new window.ResizeObserver(() => {
      collectHeight()
    })
  })
  onUnmounted(() => {
    itemResizeObserver?.disconnect()
    itemResizeObserver = null
  })

  // ================================= MISC =================================
  const mergedData = shallowRef(props.data || EMPTY_DATA)
  watch(() => props.data, () => {
    mergedData.value = props.data || EMPTY_DATA
  })

  const useVirtual = computed(() =>
    !!(props.virtual !== false && props.height && props.itemHeight),
  )

  const inVirtual = computed(() => {
    const data = mergedData.value
    return (
      useVirtual.value
      && data
      && (props.itemHeight! * data.length > props.height!
        || !!props.scrollWidth)
    )
  })

  // ================================= Refs =================================
  const componentRef = shallowRef<HTMLDivElement>()
  const containerRef = shallowRef<HTMLDivElement>()
  const verticalScrollBarRef = shallowRef<any>(null)
  const horizontalScrollBarRef = shallowRef<any>(null)

  const offsetTop = shallowRef(0)
  const offsetLeft = shallowRef(0)
  const scrollMoving = shallowRef(false)

  const verticalScrollBarSpinSize = shallowRef(0)
  const horizontalScrollBarSpinSize = shallowRef(0)
  const contentScrollWidth = shallowRef<number>(props.scrollWidth || 0)

  // ========================== Visible Calculation =========================
  const scrollHeight = shallowRef(0)
  const start = shallowRef(0)
  const end = shallowRef(0)
  const fillerOffset = shallowRef<number | undefined>(undefined)

  // ================================ Scroll ================================
  function syncScrollTop(newTop: number | ((prev: number) => number)) {
    let value: number
    if (typeof newTop === 'function') {
      value = newTop(offsetTop.value)
    }
    else {
      value = newTop
    }

    const maxScrollHeight = scrollHeight.value - props.height!
    const alignedTop = Math.max(0, Math.min(value, maxScrollHeight || 0))

    if (componentRef.value) {
      componentRef.value.scrollTop = alignedTop
    }
    offsetTop.value = alignedTop
  }

  // ================================ Range ================================
  watch(
    [
      inVirtual,
      useVirtual,
      offsetTop,
      mergedData,
      heightUpdatedMark,
      () => props.height,
    ],
    () => {
      if (!useVirtual.value) {
        scrollHeight.value = 0
        start.value = 0
        end.value = mergedData.value.length - 1
        fillerOffset.value = undefined
        return
      }

      if (!inVirtual.value) {
        scrollHeight.value = componentRef.value?.scrollHeight || 0
        start.value = 0
        end.value = mergedData.value.length - 1
        fillerOffset.value = undefined
        return
      }

      const { itemHeight, height } = props
      const dataLen = mergedData.value.length

      if (!dataLen) {
        scrollHeight.value = 0
        start.value = 0
        end.value = -1
        fillerOffset.value = 0
        return
      }

      if (unref(heights.id) === 0) {
        const safeItemHeight = itemHeight!
        const safeListHeight = height!

        const startIndex = Math.max(0, Math.floor(offsetTop.value / safeItemHeight))
        const startOffset = startIndex * safeItemHeight

        let endIndex = startIndex + Math.ceil(safeListHeight / safeItemHeight)
        endIndex = Math.min(endIndex + 1, dataLen - 1)

        scrollHeight.value = dataLen * safeItemHeight
        start.value = startIndex
        end.value = endIndex
        fillerOffset.value = startOffset
        return
      }

      let itemTop = 0
      let startIndex: number | undefined
      let startOffset: number | undefined
      let endIndex: number | undefined

      const data = toRaw(mergedData.value)
      const _offsetTop = offsetTop.value
      for (let i = 0; i < dataLen; i += 1) {
        const item = data[i]
        const key = getKey(item)

        const cacheHeight = heights.get(key)
        const currentItemBottom = itemTop + (cacheHeight === undefined ? itemHeight! : cacheHeight)

        if (currentItemBottom >= _offsetTop && startIndex === undefined) {
          startIndex = i
          startOffset = itemTop
        }

        if (currentItemBottom > _offsetTop + height! && endIndex === undefined) {
          endIndex = i
        }

        itemTop = currentItemBottom
      }

      if (startIndex === undefined) {
        startIndex = 0
        startOffset = 0
        endIndex = Math.ceil(height! / itemHeight!)
      }
      if (endIndex === undefined) {
        endIndex = data.length - 1
      }

      endIndex = Math.min(endIndex + 1, data.length - 1)

      scrollHeight.value = itemTop
      start.value = startIndex
      end.value = endIndex
      fillerOffset.value = startOffset
    },
    { immediate: true },
  )

  // Sync scroll top when height changes
  watch(
    scrollHeight,
    () => {
      const changedRecord = heights.getRecord()
      if (changedRecord.size === 1) {
        const recordKey = Array.from(changedRecord.keys())[0]
        const prevCacheHeight = changedRecord.get(recordKey)

        const startItem = mergedData.value[start.value]
        if (startItem && prevCacheHeight === undefined) {
          const startIndexKey = getKey(startItem)
          if (startIndexKey === recordKey) {
            const realStartHeight = heights.get(recordKey)
            const diffHeight = realStartHeight - props.itemHeight!
            syncScrollTop(ori => ori + diffHeight)
          }
        }
      }

      if (useVirtual.value && props.height) {
        const maxScrollTop = Math.max(0, scrollHeight.value - props.height)
        if (offsetTop.value > maxScrollTop) {
          syncScrollTop(maxScrollTop)
        }
      }

      heights.resetRecord()
    },
  )

  // ================================= Size =================================
  const size = shallowRef({ width: 0, height: props.height || 0 })

  const onHolderResize = (sizeInfo: { offsetWidth: number; offsetHeight: number }) => {
    size.value = {
      width: sizeInfo.offsetWidth,
      height: sizeInfo.offsetHeight,
    }
    contentScrollWidth.value = props.scrollWidth ?? sizeInfo.offsetWidth
  }

  // =============================== Scroll ===============================
  const isRTL = computed(() => props.direction === 'rtl')

  const getVirtualScrollInfo = () => ({
    x: isRTL.value ? -offsetLeft.value : offsetLeft.value,
    y: offsetTop.value,
  })

  const lastVirtualScrollInfo = shallowRef(getVirtualScrollInfo())

  const triggerScroll = (params?: { x?: number; y?: number }) => {
    if (props.onVirtualScroll) {
      const nextInfo = { ...getVirtualScrollInfo(), ...params }

      if (
        lastVirtualScrollInfo.value.x !== nextInfo.x
        || lastVirtualScrollInfo.value.y !== nextInfo.y
      ) {
        props.onVirtualScroll(nextInfo)
        lastVirtualScrollInfo.value = nextInfo
      }
    }
  }

  // ========================== Scroll Position ===========================
  const horizontalRange = computed(() =>
    Math.max(0, (contentScrollWidth.value || 0) - size.value.width),
  )
  const hasHorizontalScroll = computed(() => horizontalRange.value > 0)

  const isScrollAtTop = computed(() => offsetTop.value === 0)
  const isScrollAtBottom = computed(() => offsetTop.value + props.height! >= scrollHeight.value)
  const isScrollAtLeft = computed(() => offsetLeft.value === 0)
  const isScrollAtRight = computed(() => offsetLeft.value >= horizontalRange.value)

  const keepInHorizontalRange = (nextOffsetLeft: number) => {
    const max = horizontalRange.value
    return Math.max(0, Math.min(nextOffsetLeft, max))
  }

  // ========================== Wheel & Touch =========================
  const delayHideScrollBar = () => {
    verticalScrollBarRef.value?.delayHidden()
    horizontalScrollBarRef.value?.delayHidden()
  }

  const [onWheel, onFireFoxScroll] = useFrameWheel(
    inVirtual,
    isScrollAtTop,
    isScrollAtBottom,
    isScrollAtLeft,
    isScrollAtRight,
    hasHorizontalScroll,
    (offsetY, isHorizontal) => {
      if (isHorizontal) {
        const next = isRTL.value ? offsetLeft.value - offsetY : offsetLeft.value + offsetY
        const aligned = keepInHorizontalRange(next)
        offsetLeft.value = aligned
        triggerScroll({ x: isRTL.value ? -aligned : aligned })
      }
      else {
        syncScrollTop(top => top + offsetY)
      }
    },
  )

  watch(
    componentRef,
    (element, _prevElement, onCleanup) => {
      if (!element) {
        return
      }

      const onMozMousePixelScroll: EventListener = (rawEvent) => {
        const event = rawEvent as WheelEvent & { detail?: number }
        const detail = event.detail ?? 0
        const scrollingUpAtTop = isScrollAtTop.value && detail < 0
        const scrollingDownAtBottom = isScrollAtBottom.value && detail > 0

        if (inVirtual.value && !scrollingUpAtTop && !scrollingDownAtBottom) {
          event.preventDefault()
        }
      }

      element.addEventListener('wheel', onWheel, { passive: false })
      element.addEventListener('DOMMouseScroll', onFireFoxScroll, { passive: true })
      element.addEventListener('MozMousePixelScroll', onMozMousePixelScroll, { passive: false })

      onCleanup(() => {
        element.removeEventListener('wheel', onWheel)
        element.removeEventListener('DOMMouseScroll', onFireFoxScroll)
        element.removeEventListener('MozMousePixelScroll', onMozMousePixelScroll)
      })
    },
    {
      immediate: true,
      flush: 'post',
    },
  )

  useMobileTouchMove(
    inVirtual,
    componentRef,
    (isHorizontal, offset, _smoothOffset, _e) => {
      if (isHorizontal) {
        const next = isRTL.value ? offsetLeft.value - offset : offsetLeft.value + offset
        const aligned = keepInHorizontalRange(next)
        offsetLeft.value = aligned
        triggerScroll({ x: isRTL.value ? -aligned : aligned })
        return true
      }
      else {
        syncScrollTop(top => top + offset)
        return true
      }
    },
  )

  useScrollDrag(
    inVirtual,
    componentRef,
    (offset) => {
      syncScrollTop(top => top + offset)
    },
  )

  // ========================== ScrollBar =========================
  const onScrollBar = (newScrollOffset: number, horizontal?: boolean) => {
    if (horizontal) {
      offsetLeft.value = newScrollOffset
      triggerScroll({ x: isRTL.value ? -newScrollOffset : newScrollOffset })
    }
    else {
      syncScrollTop(newScrollOffset)
    }
  }

  const onScrollbarStartMove = () => {
    scrollMoving.value = true
  }

  const onScrollbarStopMove = () => {
    scrollMoving.value = false
  }

  useDiffItem(mergedData, getKey)

  // Calculate ScrollBar spin size
  watch(
    [() => props.height, scrollHeight, inVirtual, () => size.value.height],
    () => {
      if (inVirtual.value && props.height && scrollHeight.value) {
        verticalScrollBarSpinSize.value = getSpinSize(size.value.height, scrollHeight.value)
      }
    },
    { immediate: true },
  )

  watch(
    [() => size.value.width, contentScrollWidth],
    () => {
      if (inVirtual.value && contentScrollWidth.value) {
        horizontalScrollBarSpinSize.value = getSpinSize(size.value.width, contentScrollWidth.value)
      }
    },
    { immediate: true },
  )

  watch(
    () => props.scrollWidth,
    (val) => {
      contentScrollWidth.value = val ?? size.value.width
      offsetLeft.value = keepInHorizontalRange(offsetLeft.value)
    },
    { immediate: true },
  )

  function onFallbackScroll(e: Event) {
    const target = e.currentTarget as HTMLDivElement
    const newScrollTop = target.scrollTop

    if (!useVirtual.value || !inVirtual.value) {
      offsetTop.value = newScrollTop
    }
    else if (newScrollTop !== offsetTop.value) {
      syncScrollTop(newScrollTop)
    }

    props.onScroll?.(e)
    triggerScroll()
  }

  // ================================= Ref ==================================
  const getSize = useGetSize(mergedData, getKey, heights, shallowRef(props.itemHeight || 0))

  const [scrollTo, getTotalHeight] = useScrollTo(
    componentRef as any,
    mergedData,
    heights,
    shallowRef(props.itemHeight || 0),
    getKey,
    getSize,
    () => collectHeight(true),
    (newTop: number) => {
      const totalHeight = getTotalHeight()
      const maxScrollHeight = Math.max(scrollHeight.value, totalHeight) - props.height!
      const alignedTop = Math.max(0, Math.min(newTop, maxScrollHeight || 0))

      if (componentRef.value) {
        componentRef.value.scrollTop = alignedTop
      }
      offsetTop.value = alignedTop
    },
    delayHideScrollBar,
  )

  defineExpose({
    nativeElement: computed(() => containerRef.value),
    getScrollInfo: getVirtualScrollInfo,
    scrollTo: (config: any) => {
      function isPosScroll(arg: any): arg is { left?: number; top?: number } {
        return arg && typeof arg === 'object' && ('left' in arg || 'top' in arg)
      }
      if (isPosScroll(config)) {
        if (config.left !== undefined) {
          offsetLeft.value = keepInHorizontalRange(config.left)
        }
        scrollTo(config.top as any)
      }
      else {
        scrollTo(config)
      }
    },
  })

  // ================================ Effect ================================
  watch(
    [start, end, mergedData],
    () => {
      if (props.onVisibleChange) {
        const renderList = mergedData.value.slice(start.value, end.value + 1)
        props.onVisibleChange(renderList, mergedData.value)
      }
    },
    {
      flush: 'post',
    },
  )

  // ================================ Computed ================================
  const visibleItems = computed(() =>
    mergedData.value.slice(start.value, end.value + 1),
  )

  const extraRenderInfo = computed<ExtraRenderInfo>(() => ({
    start: start.value,
    end: end.value,
    virtual: inVirtual.value,
    offsetX: offsetLeft.value,
    scrollTop: offsetTop.value,
    offsetY: fillerOffset.value || 0,
    rtl: isRTL.value,
    getSize,
  }))

  const restAttrs = computed(() =>
    omit(attrs as Record<string, any>, ['class', 'style']),
  )

  const containerCls = computed(() =>
    clsx(
      props.prefixCls,
      { [`${props.prefixCls}-rtl`]: isRTL.value },
      attrs.class as string,
    ),
  )

  const parseStringStyle = (cssText: string): CSSProperties => {
    const ret: CSSProperties = {}
    cssText.split(';').forEach((item) => {
      const idx = item.indexOf(':')
      if (idx > 0) {
        ret[item.slice(0, idx).trim()] = item.slice(idx + 1).trim()
      }
    })
    return ret
  }

  const mergeAttrsStyle = (style: CSSProperties) => {
    const attrsStyle = attrs.style
    if (!attrsStyle) return
    const styles = Array.isArray(attrsStyle) ? attrsStyle : [attrsStyle]
    for (const s of styles) {
      if (typeof s === 'string') {
        Object.assign(style, parseStringStyle(s))
      }
      else if (s && typeof s === 'object') {
        Object.assign(style, s as CSSProperties)
      }
    }
  }

  const containerStyle = computed<CSSProperties>(() => {
    const style: CSSProperties = { position: 'relative' }
    mergeAttrsStyle(style)
    return style
  })

  const getHolderSizeStyle = (style: CSSProperties): Pick<CSSProperties, 'height' | 'maxHeight'> => {
    if (!style) {
      return {}
    }
    const { height, maxHeight } = style
    const sizeStyle: Pick<CSSProperties, 'height' | 'maxHeight'> = {}
    if (height !== undefined)
      sizeStyle.height = height
    if (maxHeight !== undefined)
      sizeStyle.maxHeight = maxHeight
    return sizeStyle
  }

  const componentStyle = computed<CSSProperties>(() => {
    const style: CSSProperties = {}

    if (props.height) {
      style[props.fullHeight ? 'height' : 'maxHeight'] = `${props.height}px`
      Object.assign(style, ScrollStyle)

      if (inVirtual.value) {
        style.overflowY = 'hidden'

        if (horizontalRange.value > 0) {
          style.overflowX = 'hidden'
        }

        if (scrollMoving.value) {
          style.pointerEvents = 'none'
        }
      }
    }
    else {
      const mergedAttrsStyle: CSSProperties = {}
      mergeAttrsStyle(mergedAttrsStyle)
      const holderSizeStyle = getHolderSizeStyle(mergedAttrsStyle)
      if (holderSizeStyle.height !== undefined || holderSizeStyle.maxHeight !== undefined) {
        Object.assign(style, holderSizeStyle, ScrollStyle)
      }
    }

    return style
  })

  const getItemWrapperStyle = (idx: number): CSSProperties => ({
    width: `${contentScrollWidth.value}px`,
    position: isRTL.value ? 'relative' : 'relative',
    [isRTL.value ? 'marginRight' : 'marginLeft']: `${offsetLeft.value}px`,
    display: 'block',
  })

  let itemCollectPending = false

  const onItemRef = (item: any, el: HTMLElement | null) => {
    const key = getKey(item)
    if (el) {
      instanceRef.value.set(key, el)
      const dom = getDOM(el)
      if (dom instanceof window.Element && dom.isConnected && itemResizeObserver) {
        itemResizeObserver.observe(dom)
      }
    }
    else {
      instanceRef.value.delete(key)
    }
    if (!itemCollectPending) {
      itemCollectPending = true
      nextTick(() => {
        itemCollectPending = false
        collectHeight()
      })
    }
  }

  const showVerticalScrollBar = computed(() =>
    inVirtual.value && scrollHeight.value > (props.height || 0),
  )

  const showHorizontalScrollBar = computed(() =>
    inVirtual.value && contentScrollWidth.value > size.value.width,
  )

  
</script>

<template>
  <div
    ref="containerRef"
    v-bind="restAttrs"
    :style="containerStyle"
    :dir="isRTL ? 'rtl' : undefined"
    :class="containerCls"
  >
    <ResizeObserver @resize="onHolderResize">
      <component
        :is="props.component"
        :class="`${props.prefixCls}-holder`"
        :style="componentStyle"
        ref="componentRef"
        @scroll="onFallbackScroll"
        @mouseenter="delayHideScrollBar"
      >
        <Filler
          :prefix-cls="props.prefixCls"
          :height="scrollHeight"
          :offset-y="fillerOffset"
          :offset-x="offsetLeft"
          :scroll-width="contentScrollWidth"
          :rtl="isRTL"
          :inner-props="props.innerProps"
          @inner-resize="collectHeight"
        >
          <template v-for="(item, idx) in visibleItems" :key="getKey(item)">
            <div
              :ref="(el: HTMLElement | null) => onItemRef(item, el)"
              :style="getItemWrapperStyle(idx)"
            >
              <slot
                :item="item"
                :index="start + idx"
                :item-style="{ width: `${contentScrollWidth}px` }"
                :offset-x="offsetLeft"
                :set-ref="(el: HTMLElement | null) => onItemRef(item, el)"
              />
            </div>
          </template>
          <slot name="extraRender" v-bind="extraRenderInfo" />
        </Filler>
      </component>
    </ResizeObserver>

    <ScrollBar
      v-if="showVerticalScrollBar"
      ref="verticalScrollBarRef"
      :prefix-cls="props.prefixCls"
      :scroll-offset="offsetTop"
      :scroll-range="scrollHeight"
      :rtl="isRTL"
      :spin-size="verticalScrollBarSpinSize"
      :container-size="size.height"
      :show-scroll-bar="props.showScrollBar"
      :style="props.styles?.verticalScrollBar"
      :thumb-style="props.styles?.verticalScrollBarThumb"
      @scroll="(offset: number, horizontal: boolean) => onScrollBar(offset, horizontal)"
      @start-move="onScrollbarStartMove"
      @stop-move="onScrollbarStopMove"
    />

    <ScrollBar
      v-if="showHorizontalScrollBar"
      ref="horizontalScrollBarRef"
      :prefix-cls="props.prefixCls"
      :scroll-offset="offsetLeft"
      :scroll-range="contentScrollWidth"
      :rtl="isRTL"
      :horizontal="true"
      :spin-size="horizontalScrollBarSpinSize"
      :container-size="size.width"
      :show-scroll-bar="props.showScrollBar"
      :style="props.styles?.horizontalScrollBar"
      :thumb-style="props.styles?.horizontalScrollBarThumb"
      @scroll="(offset: number, horizontal: boolean) => onScrollBar(offset, horizontal)"
      @start-move="onScrollbarStartMove"
      @stop-move="onScrollbarStopMove"
    />
  </div>
</template>
