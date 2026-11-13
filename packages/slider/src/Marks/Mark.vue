<script setup vapor lang="ts">
  import type { CSSProperties } from 'vue'

  import { clsx } from '@v-c/util'
  import { computed, useAttrs } from 'vue'

  import { useInjectSlider } from '../SliderContextKey'
  import { getDirectionStyle } from '../util'

  defineOptions({ name: 'SliderMark', inheritAttrs: false })

  const props = withDefaults(
    defineProps<{
      prefixCls: string
      value: number
    }>(),
    {
      prefixCls: 'vc-slider-mark',
      value: 0,
    },
  )
  const emit = defineEmits<{
    click: [value: number]
  }>()

  const sliderContext = useInjectSlider()
  const attrs = useAttrs()

  const textCls = computed(() => `${props.prefixCls}-text`)

  const active = computed(() => {
    const ctx = sliderContext.value
    return (
      ctx.included &&
      ctx.includedStart <= props.value &&
      props.value <= ctx.includedEnd
    )
  })

  const positionStyle = computed(() => {
    const ctx = sliderContext.value
    return getDirectionStyle(ctx.direction, props.value, ctx.min, ctx.max)
  })

  const mergedStyle = computed<CSSProperties>(() => ({
    ...positionStyle.value,
    ...(attrs.style as CSSProperties),
  }))

  const markTextCls = computed(() =>
    clsx(textCls.value, { [`${textCls.value}-active`]: active.value }),
  )

  function onMousedown(e: MouseEvent) {
    e.stopPropagation()
  }

  function handleClick() {
    emit('click', props.value)
  }
</script>

<template>
  <span
    :class="markTextCls"
    :style="mergedStyle"
    @mousedown="onMousedown"
    @click="handleClick"
  >
    <slot name="mark" />
  </span>
</template>
