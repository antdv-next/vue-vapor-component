<script setup vapor lang="ts">
  import type { CSSProperties } from 'vue'

  import type { AlignType, ArrowPos, ArrowTypeOuter } from '../interface'

  import { clsx } from '@v-c/util'
  import { computed } from 'vue'

  defineOptions({ name: 'Arrow' })

  const props = defineProps<{
    prefixCls: string
    align: AlignType
    arrow: ArrowTypeOuter
    arrowPos: ArrowPos
  }>()

  const alignStyle = computed<CSSProperties>(() => {
    const { align, arrow, arrowPos } = props
    const {
      className: _className,
      content: _content,
      style: _style,
    } = arrow || {}
    const { x = 0, y = 0 } = arrowPos

    if (!align || !align.points) return {}

    const alignStyle: CSSProperties = { position: 'absolute' }

    if (align.autoArrow !== false) {
      const popupPoints = align.points[0]
      const targetPoints = align.points[1]
      const popupTB = popupPoints[0]
      const popupLR = popupPoints[1]
      const targetTB = targetPoints[0]
      const targetLR = targetPoints[1]

      if (popupTB === targetTB || !['t', 'b'].includes(popupTB))
        {alignStyle.top = `${y}px`}
      else if (popupTB === 't') alignStyle.top = 0
      else alignStyle.bottom = 0

      if (popupLR === targetLR || !['l', 'r'].includes(popupLR))
        {alignStyle.left = `${x}px`}
      else if (popupLR === 'l') alignStyle.left = 0
      else alignStyle.right = 0
    }

    return alignStyle
  })

  const cls = computed(() =>
    clsx(`${props.prefixCls}-arrow`, props.arrow?.className),
  )

  const mergedStyle = computed<CSSProperties>(() => ({
    ...alignStyle.value,
    ...props.arrow?.style,
  }))
</script>

<template>
  <div ref="arrowRef" :class="cls" :style="mergedStyle">
    <template v-if="arrow?.content">
      <component :is="arrow.content" />
    </template>
  </div>
</template>
