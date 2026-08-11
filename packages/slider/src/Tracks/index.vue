<script setup vapor lang="ts">
  import type { CSSProperties } from 'vue'
  import type { OnStartMove } from '../interface'
  import { clsx } from '@v-c/util'
  import { computed } from 'vue'
  import { useInjectSlider } from '../SliderContextKey'
  import { getIndex } from '../util'
  import Track from './Track.vue'

  defineOptions({ name: 'SliderTracks' })

  const props = withDefaults(defineProps<{
    prefixCls: string
    trackStyle?: CSSProperties | CSSProperties[]
    values: number[]
    onStartMove?: OnStartMove
    startPoint?: number
  }>(), {
    prefixCls: 'vc-slider',
    values: () => [],
  })

  const sliderContext = useInjectSlider()

  const trackList = computed(() => {
    const ctx = sliderContext.value
    const range = ctx.range
    const min = ctx.min

    if (!range) {
      if (props.values.length === 0) {
        return []
      }
      const startValue = props.startPoint ?? min
      const endValue = props.values[0]
      return [{ start: Math.min(startValue, endValue), end: Math.max(startValue, endValue) }]
    }

    const list: { start: number; end: number }[] = []
    for (let i = 0; i < props.values.length - 1; i += 1) {
      list.push({ start: props.values[i], end: props.values[i + 1] })
    }
    return list
  })

  const shouldRender = computed(() => sliderContext.value.included && trackList.value.length > 0)

  const tracksCls = computed(() => {
    const ctx = sliderContext.value
    return clsx(ctx.classNames?.tracks, `${props.prefixCls}-tracks`)
  })

  const hasDisabledHandle = computed(() =>
    props.values.some((_, index) => sliderContext.value.isHandleDisabled(index)),
  )
</script>

<template>
  <template v-if="shouldRender">
    <Track
      v-if="sliderContext.classNames?.tracks || sliderContext.styles?.tracks"
      :index="0"
      :prefix-cls="prefixCls"
      :start="trackList[0].start"
      :end="trackList[trackList.length - 1].end"
      :replace-cls="tracksCls"
      :style="sliderContext.styles?.tracks"
    />
    <template v-for="(item, index) in trackList" :key="index">
      <Track
        :index="index"
        :prefix-cls="prefixCls"
        :start="item.start"
        :end="item.end"
        :style="{ ...getIndex(trackStyle, index), ...sliderContext.styles?.track }"
        :on-start-move="hasDisabledHandle ? undefined : onStartMove"
      />
    </template>
  </template>
</template>
