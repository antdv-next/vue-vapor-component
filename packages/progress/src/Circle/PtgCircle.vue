<script setup vapor lang="ts">
  import type { ProgressProps } from '../interface'

  import { computed, defineComponent, h, useAttrs } from 'vue'

  // ---- Block component (used for gradient rendering) ----
  const Block = defineComponent<{ bg: string }>(blockProps => {
    return () =>
      h(
        'div',
        { style: { width: '100%', height: '100%', background: blockProps.bg } },
        { default: () => '' },
      )
  })

  function getPtgColors(
    color: Record<string, string | boolean>,
    scale: number,
  ) {
    return Object.keys(color).map(key => {
      const parsedKey = parseFloat(key)
      const ptgKey = `${Math.floor(parsedKey * scale)}%`
      return `${color[key]} ${ptgKey}`
    })
  }

  defineOptions({ name: 'PtgCircle' })

  const props = defineProps<{
    prefixCls: string
    gradientId: string
    ptg: number
    radius: number
    strokeLinecap: ProgressProps['strokeLinecap']
    strokeWidth: ProgressProps['strokeWidth']
    size: number
    color?: string | Record<string, string | boolean>
    gapDegree: number
    className?: string
  }>()

  const isGradient = computed(
    () => props.color && typeof props.color === 'object',
  )
  const halfSize = computed(() => props.size / 2)
  const attrs = useAttrs()

  const fromDeg = computed(() =>
    props.gapDegree ? `${180 + props.gapDegree / 2}deg` : '0deg',
  )
  const conicColors = computed(() =>
    isGradient.value
      ? getPtgColors(
          props.color as Record<string, string | boolean>,
          (360 - props.gapDegree) / 360,
        ).join(', ')
      : '',
  )
  const linearColors = computed(() =>
    isGradient.value
      ? getPtgColors(props.color as Record<string, string | boolean>, 1).join(
          ', ',
        )
      : '',
  )
  const conicColorBg = computed(
    () => `conic-gradient(from ${fromDeg.value}, ${conicColors.value})`,
  )
  const linearColorBg = computed(() =>
    props.gapDegree
      ? `linear-gradient(to bottom, ${linearColors.value})`
      : `linear-gradient(to top, ${linearColors.value})`,
  )
  const maskId = computed(() => `${props.gradientId}-conic`)
</script>

<template>
  <template v-if="isGradient">
    <mask :id="maskId">
      <circle
        :class="[`${prefixCls}-circle-path`, className]"
        :r="radius"
        :cx="halfSize"
        :cy="halfSize"
        :stroke-linecap="strokeLinecap"
        :stroke-width="strokeWidth"
        :opacity="ptg === 0 ? 0 : 1"
        :style="attrs.style"
      />
    </mask>
    <foreignObject
      :x="0"
      :y="0"
      :width="size"
      :height="size"
      :mask="`url(#${maskId})`"
    >
      <Block :bg="linearColorBg">
        <Block :bg="conicColorBg" />
      </Block>
    </foreignObject>
  </template>
  <template v-else>
    <circle
      :class="[`${prefixCls}-circle-path`, className]"
      :r="radius"
      :cx="halfSize"
      :cy="halfSize"
      :stroke-linecap="strokeLinecap"
      :stroke-width="strokeWidth"
      :opacity="ptg === 0 ? 0 : 1"
      :style="attrs.style"
    />
  </template>
</template>
