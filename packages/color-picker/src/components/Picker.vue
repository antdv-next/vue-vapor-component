<script setup vapor lang="ts">
  import type { Ref } from 'vue'

  import type { Color } from '../color'
  import type { TransformOffset } from '../interface'

  import { computed, ref, useTemplateRef } from 'vue'

  import useColorDrag from '../hooks/useColorDrag'
  import { calcOffset, calculateColor } from '../util'
  import Handler from './Handler.vue'
  import Palette from './Palette.vue'
  import Transform from './Transform.vue'

  defineOptions({ name: 'ColorPickerPicker' })

  const {
    color,
    prefixCls,
    disabled = false,
  } = defineProps<{
    color?: Color
    prefixCls: string
    disabled?: boolean
  }>()

  const emit = defineEmits<{
    change: [color: Color]
    'change-complete': [color: Color]
  }>()

  const pickerRef = useTemplateRef<HTMLDivElement>('picker')
  const transformRef = useTemplateRef<{ transformDomRef: HTMLDivElement }>(
    'transform',
  )

  const colorRef = ref<Color>(color as Color)

  const onDragChange = (offsetValue: TransformOffset) => {
    const calcColor = calculateColor({
      offset: offsetValue,
      color,
    })
    colorRef.value = calcColor
    emit('change', calcColor)
  }

  const [offset, dragStartHandle] = useColorDrag({
    color,
    containerRef: pickerRef as Ref<HTMLDivElement>,
    targetRef: transformRef as Ref<{ transformDomRef: HTMLDivElement }>,
    calculate: () =>
      color ? calcOffset(color) : ({ x: 0, y: 0 } as TransformOffset),
    onDragChange,
    onDragChangeComplete: () =>
      emit('change-complete', colorRef.value as Color),
    disabledDrag: disabled,
  })

  const saturationBg = computed(() => {
    if (!color) return ''
    const hsb = color.toHsb()
    return `hsl(${hsb.h},100%, 50%)`
  })
</script>

<template>
  <div
    ref="picker"
    :class="`${prefixCls}-select`"
    @mousedown="dragStartHandle"
    @touchstart="dragStartHandle"
  >
    <Palette :prefix-cls="prefixCls">
      <Transform :x="offset.x" :y="offset.y" ref="transform">
        <Handler :color="color?.toRgbString()" :prefix-cls="prefixCls" />
      </Transform>
      <div
        :class="`${prefixCls}-saturation`"
        :style="{
          backgroundColor: saturationBg,
          backgroundImage:
            'linear-gradient(0deg, #000, transparent),linear-gradient(90deg, #fff, hsla(0, 0%, 100%, 0))',
        }"
      />
    </Palette>
  </div>
</template>
