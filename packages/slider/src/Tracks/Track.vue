<script setup vapor lang="ts">
  import type { CSSProperties } from 'vue'
  import type { OnStartMove } from '../interface'
  import { clsx } from '@v-c/util'
  import { computed } from 'vue'
  import { useInjectSlider } from '../SliderContextKey'
  import { getOffset } from '../util'

  defineOptions({ name: 'SliderTrack' })

  const props = withDefaults(defineProps<{
    prefixCls: string
    replaceCls?: string
    start: number
    end: number
    index?: number
    onStartMove?: OnStartMove
    style?: CSSProperties
  }>(), {
    prefixCls: 'vc-slider',
    index: 0,
  })

  const sliderContext = useInjectSlider()

  const trackPrefixCls = computed(() => `${props.prefixCls}-track`)

  const positionStyle = computed<CSSProperties>(() => {
    const ctx = sliderContext.value
    const offsetStart = getOffset(props.start, ctx.min, ctx.max)
    const offsetEnd = getOffset(props.end, ctx.min, ctx.max)

    const style: CSSProperties = {}
    switch (ctx.direction) {
      case 'rtl':
        style.right = `${offsetStart * 100}%`
        style.width = `${offsetEnd * 100 - offsetStart * 100}%`
        break
      case 'btt':
        style.bottom = `${offsetStart * 100}%`
        style.height = `${offsetEnd * 100 - offsetStart * 100}%`
        break
      case 'ttb':
        style.top = `${offsetStart * 100}%`
        style.height = `${offsetEnd * 100 - offsetStart * 100}%`
        break
      default:
        style.left = `${offsetStart * 100}%`
        style.width = `${offsetEnd * 100 - offsetStart * 100}%`
    }
    return style
  })

  const trackCls = computed(() => {
    const ctx = sliderContext.value
    if (props.replaceCls) {
      return props.replaceCls
    }
    return clsx(
      trackPrefixCls.value,
      {
        [`${trackPrefixCls.value}-${props.index + 1}`]: props.index !== null && ctx.range,
        [`${props.prefixCls}-track-draggable`]: !!props.onStartMove,
      },
      ctx.classNames?.track,
    )
  })

  const mergedStyle = computed<CSSProperties>(() => ({
    ...positionStyle.value,
    ...props.style,
  }))

  function onInternalStartMove(e: MouseEvent | TouchEvent) {
    const ctx = sliderContext.value
    if (!ctx.disabled && props.onStartMove) {
      props.onStartMove(e, -1)
    }
  }
</script>

<template>
  <div
    :class="trackCls"
    :style="mergedStyle"
    v-if="positionStyle"
    @mousedown="onStartMove ? onInternalStartMove : undefined"
  />
</template>
