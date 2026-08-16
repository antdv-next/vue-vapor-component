<script setup vapor lang="ts">
  import type { CSSProperties } from 'vue'

  import type { InternalMarkObj } from '../interface'

  import { computed } from 'vue'

  import { useInjectSlider } from '../SliderContextKey'
  import Dot from './Dot.vue'

  defineOptions({ name: 'SliderSteps' })

  const props = withDefaults(
    defineProps<{
      prefixCls: string
      marks: InternalMarkObj[]
      dots?: boolean
      style?: CSSProperties | ((dotValue: number) => CSSProperties)
      activeStyle?: CSSProperties | ((dotValue: number) => CSSProperties)
    }>(),
    {
      prefixCls: 'vc-slider',
      marks: () => [],
    },
  )

  const sliderContext = useInjectSlider()

  const stepDots = computed<number[]>(() => {
    const ctx = sliderContext.value
    const { marks, dots } = props
    const dotSet = new Set<number>()

    marks.forEach(mark => {
      dotSet.add(mark.value)
    })

    if (dots && ctx.step !== null) {
      let current = ctx.min
      while (current <= ctx.max) {
        dotSet.add(current)
        current += ctx.step!
      }
    }

    return Array.from(dotSet)
  })
</script>

<template>
  <div :class="`${prefixCls}-step`">
    <template v-for="dotValue in stepDots" :key="dotValue">
      <Dot
        :prefix-cls="prefixCls"
        :value="dotValue"
        :style="style"
        :active-style="activeStyle"
      />
    </template>
  </div>
</template>
