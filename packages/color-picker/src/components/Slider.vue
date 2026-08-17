<script setup vapor lang="ts">
  import type { Ref } from 'vue'

  import type { Color } from '../color'
  import type { HsbaColorType, TransformOffset } from '../interface'

  import { computed, ref, useTemplateRef } from 'vue'

  import useColorDrag from '../hooks/useColorDrag'
  import { calcOffset, calculateColor } from '../util'
  import Gradient from './Gradient.vue'
  import Handler from './Handler.vue'
  import Palette from './Palette.vue'
  import Transform from './Transform.vue'

  defineOptions({ name: 'ColorPickerSlider' })

  const {
    colors,
    type,
    color,
    prefixCls,
    disabled = false,
  } = defineProps<{
    prefixCls: string
    colors: { percent: number; color: string }[]
    min: number
    max: number
    value: number
    disabled?: boolean
    type: HsbaColorType
    color?: Color
  }>()

  const emit = defineEmits<{
    change: [value: number]
    'change-complete': [value: number]
  }>()

  const sliderRef = useTemplateRef<HTMLDivElement>('slider')
  const transformRef = useTemplateRef<{ transformDomRef: HTMLDivElement }>(
    'transform',
  )
  const colorRef = ref<Color>(color as Color)

  const getValue = (c: Color) => {
    return type === 'hue' ? c.getHue() : c.a * 100
  }

  const onDragChange = (offsetValue: TransformOffset) => {
    const calcColor = calculateColor({
      offset: offsetValue,
      color,
      type,
    })
    colorRef.value = calcColor
    emit('change', getValue(calcColor))
  }

  const [offset, dragStartHandle] = useColorDrag({
    color,
    targetRef: transformRef as Ref<{ transformDomRef: HTMLDivElement }>,
    containerRef: sliderRef as Ref<HTMLDivElement>,
    calculate: () =>
      color ? calcOffset(color, type) : ({ x: 0, y: 50 } as TransformOffset),
    onDragChange,
    onDragChangeComplete: () => {
      emit('change-complete', getValue(colorRef.value as Color))
    },
    direction: 'x',
    disabledDrag: disabled,
  })

  const handleColor = computed(() => {
    if (!color) return ''
    if (type === 'hue') {
      const hsb = color.toHsb()
      return `hsl(${hsb.h},100%,50%)`
    }
    return color.toRgbString()
  })

  const gradientList = computed(() =>
    colors.map(info => `${info.color} ${info.percent}%`),
  )
</script>

<template>
  <div
    ref="slider"
    :class="[`${prefixCls}-slider`, `${prefixCls}-slider-${type}`]"
    @mousedown="dragStartHandle"
    @touchstart="dragStartHandle"
  >
    <Palette :prefixCls="prefixCls">
      <Transform :x="offset.x" :y="offset.y" ref="transform">
        <Handler size="small" :color="handleColor" :prefix-cls="prefixCls" />
      </Transform>
      <Gradient :colors="gradientList" :type="type" :prefix-cls="prefixCls" />
    </Palette>
  </div>
</template>
