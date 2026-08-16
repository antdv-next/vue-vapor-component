<script setup vapor lang="ts">
  import type { CSSProperties } from 'vue'

  import raf from '@v-c/util/dist/raf'
  import {
    computed,
    nextTick,
    onMounted,
    onUnmounted,
    ref,
    shallowRef,
    useTemplateRef,
    watch,
  } from 'vue'

  defineOptions({ name: 'ScrollBar', inheritAttrs: false })

  const props = withDefaults(
    defineProps<{
      prefixCls: string
      scrollOffset: number
      scrollRange: number
      rtl: boolean
      horizontal?: boolean
      style?: CSSProperties
      thumbStyle?: CSSProperties
      spinSize: number
      containerSize: number
      showScrollBar?: boolean | 'optional'
    }>(),
    {
      horizontal: false,
      showScrollBar: 'optional',
    },
  )

  const emit = defineEmits<{
    scroll: [scrollOffset: number, horizontal: boolean]
    'start-move': []
    'stop-move': []
  }>()

  const dragging = ref(false)
  const pageXY = ref<number | null>(null)
  const startTop = ref<number | null>(null)

  const isLTR = computed(() => !props.rtl)

  const scrollbarRef = useTemplateRef<HTMLDivElement>('scrollbar')
  const thumbRef = useTemplateRef<HTMLDivElement>('thumb')

  const visible = ref(
    props.showScrollBar === 'optional' ? true : props.showScrollBar,
  )
  let visibleTimeout: ReturnType<typeof setTimeout> | null = null

  const delayHidden = () => {
    if (props.showScrollBar === true || props.showScrollBar === false) return
    if (visibleTimeout) clearTimeout(visibleTimeout)
    visible.value = true
    visibleTimeout = setTimeout(() => {
      visible.value = false
    }, 3000)
  }

  const enableScrollRange = computed(
    () => props.scrollRange - props.containerSize || 0,
  )
  const enableOffsetRange = computed(
    () => props.containerSize - props.spinSize || 0,
  )

  const top = computed(() => {
    if (props.scrollOffset === 0 || enableScrollRange.value === 0) {
      return 0
    }
    const ptg = props.scrollOffset / enableScrollRange.value
    return ptg * enableOffsetRange.value
  })

  const scrollbarPrefixCls = computed(() => `${props.prefixCls}-scrollbar`)

  const containerStyle = computed<CSSProperties>(() => {
    const base: CSSProperties = {
      position: 'absolute',
      visibility: visible.value ? undefined : 'hidden',
    }

    if (props.horizontal) {
      return {
        ...base,
        height: '8px',
        left: 0,
        right: 0,
        bottom: 0,
        ...props.style,
      }
    }

    return {
      ...base,
      width: '8px',
      top: 0,
      bottom: 0,
      [isLTR.value ? 'right' : 'left']: 0,
      ...props.style,
    }
  })

  const thumbStyle = computed<CSSProperties>(() => {
    const base: CSSProperties = {
      position: 'absolute',
      borderRadius: '99px',
      background: 'var(--vc-virtual-list-scrollbar-bg, rgba(0, 0, 0, 0.5))',
      cursor: 'pointer',
      userSelect: 'none',
    }

    if (props.horizontal) {
      return {
        ...base,
        height: '100%',
        width: `${props.spinSize}px`,
        [isLTR.value ? 'left' : 'right']: `${top.value}px`,
        ...props.thumbStyle,
      }
    }

    return {
      ...base,
      width: '100%',
      height: `${props.spinSize}px`,
      top: `${top.value}px`,
      ...props.thumbStyle,
    }
  })

  const scrollbarCls = computed(() => [
    scrollbarPrefixCls.value,
    {
      [`${scrollbarPrefixCls.value}-horizontal`]: props.horizontal,
      [`${scrollbarPrefixCls.value}-vertical`]: !props.horizontal,
      [`${scrollbarPrefixCls.value}-visible`]: visible.value,
    },
  ])

  const thumbCls = computed(() => [
    `${scrollbarPrefixCls.value}-thumb`,
    {
      [`${scrollbarPrefixCls.value}-thumb-moving`]: dragging.value,
    },
  ])

  const stateRef = shallowRef({
    top: top.value,
    dragging: dragging.value,
    pageY: pageXY.value,
    startTop: startTop.value,
  })

  watch([top, dragging, pageXY, startTop], () => {
    stateRef.value = {
      top: top.value,
      dragging: dragging.value,
      pageY: pageXY.value,
      startTop: startTop.value,
    }
  })

  function getPageXY(e: MouseEvent | TouchEvent, horizontal: boolean): number {
    const obj = 'touches' in e ? e.touches[0] : e
    return (
      obj[horizontal ? 'pageX' : 'pageY'] -
      window[horizontal ? 'scrollX' : 'scrollY']
    )
  }

  function getScrollOffsetByThumbTop(
    thumbTop: number,
    enabledScrollRange: number,
    enabledOffsetRange: number,
  ): number {
    if (enabledScrollRange <= 0 || enabledOffsetRange <= 0) {
      return 0
    }
    const mergedThumbTop = Math.max(Math.min(thumbTop, enabledOffsetRange), 0)
    const ptg = mergedThumbTop / enabledOffsetRange
    let nextScrollOffset = Math.ceil(ptg * enabledScrollRange)
    nextScrollOffset = Math.max(nextScrollOffset, 0)
    nextScrollOffset = Math.min(nextScrollOffset, enabledScrollRange)
    return nextScrollOffset
  }

  const isThumbTarget = (target: EventTarget | null) => {
    return !!target && !!thumbRef.value?.contains(target as Node)
  }

  const scrollToTrackPosition = (e: MouseEvent) => {
    const scrollbarEle = scrollbarRef.value
    if (!scrollbarEle) return

    const rect = scrollbarEle.getBoundingClientRect()
    const pagePosition = getPageXY(e, props.horizontal)
    if (!Number.isFinite(pagePosition)) return

    let nextTop: number
    if (props.horizontal) {
      const horizontalStart = isLTR.value ? rect.left : rect.right
      if (!Number.isFinite(horizontalStart)) return
      nextTop =
        (isLTR.value
          ? pagePosition - horizontalStart
          : horizontalStart - pagePosition) -
        props.spinSize / 2
    } else {
      if (!Number.isFinite(rect.top)) return
      nextTop = pagePosition - rect.top - props.spinSize / 2
    }

    emit(
      'scroll',
      getScrollOffsetByThumbTop(
        nextTop,
        enableScrollRange.value,
        enableOffsetRange.value,
      ),
      props.horizontal,
    )
  }

  const onContainerMouseDown = (e: MouseEvent) => {
    e.stopPropagation()
    e.preventDefault()

    if (e.button !== 0 || isThumbTarget(e.target)) {
      return
    }

    scrollToTrackPosition(e)
  }

  const onThumbMouseDown = (e: MouseEvent | TouchEvent) => {
    dragging.value = true
    pageXY.value = getPageXY(e, props.horizontal)
    startTop.value = stateRef.value.top

    emit('start-move')
    e.stopPropagation()
    e.preventDefault()
  }

  let touchStartBound = false

  onMounted(() => {
    nextTick(() => {
      const scrollbarEle = scrollbarRef.value
      const thumbEle = thumbRef.value

      const onScrollbarTouchStart = (e: TouchEvent) => {
        e.preventDefault()
      }

      if (scrollbarEle && thumbEle && !touchStartBound) {
        touchStartBound = true
        scrollbarEle.addEventListener('touchstart', onScrollbarTouchStart, {
          passive: false,
        })
        thumbEle.addEventListener('touchstart', onThumbMouseDown as any, {
          passive: false,
        })
      }
    })
  })

  watch(dragging, (isDragging, _O, onCleanup) => {
    if (isDragging) {
      let moveRafId: number | null = null

      const onMouseMove = (e: MouseEvent | TouchEvent) => {
        const {
          dragging: stateDragging,
          pageY: statePageY,
          startTop: stateStartTop,
        } = stateRef.value
        raf.cancel(moveRafId!)

        const rect = scrollbarRef.value?.getBoundingClientRect()
        if (!rect) return
        const scale =
          props.containerSize / (props.horizontal ? rect.width : rect.height)

        if (stateDragging) {
          const offset =
            (getPageXY(e, props.horizontal) - (statePageY || 0)) * scale
          let newTop = stateStartTop || 0

          if (!isLTR.value && props.horizontal) {
            newTop -= offset
          } else {
            newTop += offset
          }

          const newScrollTop = getScrollOffsetByThumbTop(
            newTop,
            enableScrollRange.value,
            enableOffsetRange.value,
          )

          moveRafId = raf(() => {
            emit('scroll', newScrollTop, props.horizontal)
          })
        }
      }

      const onMouseUp = () => {
        dragging.value = false
        emit('stop-move')
      }

      window.addEventListener('mousemove', onMouseMove, {
        passive: true,
      } as any)
      window.addEventListener('touchmove', onMouseMove, {
        passive: true,
      } as any)
      window.addEventListener('mouseup', onMouseUp, { passive: true } as any)
      window.addEventListener('touchend', onMouseUp, { passive: true } as any)

      onCleanup(() => {
        window.removeEventListener('mousemove', onMouseMove)
        window.removeEventListener('touchmove', onMouseMove)
        window.removeEventListener('mouseup', onMouseUp)
        window.removeEventListener('touchend', onMouseUp)
        raf.cancel(moveRafId!)
      })
    }
  })

  watch(
    () => props.scrollOffset,
    () => {
      delayHidden()
    },
  )

  onUnmounted(() => {
    if (visibleTimeout) {
      clearTimeout(visibleTimeout)
      visibleTimeout = null
    }
  })

  defineExpose({
    delayHidden,
  })
</script>

<template>
  <div
    ref="scrollbar"
    :class="scrollbarCls"
    :style="containerStyle"
    @mousedown="onContainerMouseDown"
    @mousemove="delayHidden"
  >
    <div
      ref="thumb"
      :class="thumbCls"
      :style="thumbStyle"
      @mousedown="onThumbMouseDown"
    />
  </div>
</template>
