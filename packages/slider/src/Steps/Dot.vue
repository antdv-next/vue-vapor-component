<script setup vapor lang="ts">
  import type { CSSProperties } from 'vue'
  import { clsx } from '@v-c/util'
  import { computed } from 'vue'
  import { useInjectSlider } from '../SliderContextKey'
  import { getDirectionStyle } from '../util'

  defineOptions({ name: 'SliderDot' })

  const props = withDefaults(defineProps<{
    prefixCls: string
    value: number
    style?: CSSProperties | ((dotValue: number) => CSSProperties)
    activeStyle?: CSSProperties | ((dotValue: number) => CSSProperties)
  }>(), {
    prefixCls: 'vc-slider',
    value: 0,
  })

  const sliderContext = useInjectSlider()

  const dotClassName = computed(() => `${props.prefixCls}-dot`)

  const active = computed(() => {
    const ctx = sliderContext.value
    return ctx.included && ctx.includedStart <= props.value && props.value <= ctx.includedEnd
  })

  const positionStyle = computed(() => {
    const ctx = sliderContext.value
    return getDirectionStyle(ctx.direction, props.value, ctx.min, ctx.max)
  })

  const mergedStyle = computed<CSSProperties>(() => {
    const style: CSSProperties = { ...positionStyle.value }
    if (active.value && props.activeStyle) {
      const activeStyle = typeof props.activeStyle === 'function'
        ? props.activeStyle(props.value)
        : props.activeStyle
      Object.assign(style, activeStyle)
    }
    return style
  })

  const dotCls = computed(() =>
    clsx(dotClassName.value, { [`${dotClassName.value}-active`]: active.value }),
  )
</script>

<template>
  <span
    :class="dotCls"
    :style="mergedStyle"
  />
</template>
