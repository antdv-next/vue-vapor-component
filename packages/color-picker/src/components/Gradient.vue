<script setup vapor lang="ts">
  import type { GradientProps } from '../interface'

  import { computed } from 'vue'

  import { Color } from '../color'
  import { generateColor } from '../util'

  const {
    colors,
    direction = 'to right',
    type,
    prefixCls,
  } = defineProps<GradientProps>()

  const gradientBackground = computed(() => {
    const gradientColors = colors
      .map((color, idx) => {
        let result = generateColor(color as any)
        if (type === 'alpha' && idx === colors.length - 1) {
          result = new Color(result.setA(1))
        }
        return result.toRgbString()
      })
      .join(',')

    return `linear-gradient(${direction}, ${gradientColors})`
  })
</script>

<template>
  <div
    :class="`${prefixCls}-gradient`"
    :style="{ position: 'absolute', inset: 0, background: gradientBackground }"
  >
    <slot />
  </div>
</template>
