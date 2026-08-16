<script setup vapor lang="ts">
  import type { CSSProperties } from 'vue'

  import type { InnerProps } from './interface'

  import ResizeObserver from '@vapor-component/resize-observer'
  import { computed } from 'vue'

  defineOptions({ name: 'Filler', inheritAttrs: false })

  const props = withDefaults(
    defineProps<{
      prefixCls?: string
      height?: number
      offsetY?: number
      offsetX?: number
      scrollWidth?: number
      rtl?: boolean
      innerProps?: InnerProps
    }>(),
    {
      rtl: false,
    },
  )

  const emit = defineEmits<{
    'inner-resize': []
  }>()

  const hasOffset = computed(() => props.offsetY !== undefined)

  const outerStyle = computed<CSSProperties>(() => {
    if (hasOffset.value) {
      return {
        height: `${props.height}px`,
        position: 'relative',
        overflow: 'hidden',
      }
    }
    return {}
  })

  const innerStyle = computed<CSSProperties>(() => {
    const base: CSSProperties = {
      display: 'flex',
      flexDirection: 'column',
    }
    if (hasOffset.value) {
      return {
        ...base,
        transform: `translateY(${props.offsetY}px)`,
        [props.rtl ? 'marginRight' : 'marginLeft']: `-${props.offsetX || 0}px`,
        position: 'absolute',
        left: 0,
        right: 0,
        top: 0,
      }
    }
    return base
  })

  const innerClass = computed(() =>
    props.prefixCls ? `${props.prefixCls}-holder-inner` : undefined,
  )

  const handleInnerResize = (_size: { offsetHeight: number }) => {
    emit('inner-resize')
  }
</script>

<template>
  <div :style="outerStyle">
    <ResizeObserver @resize="handleInnerResize">
      <div
        :style="innerStyle"
        :class="innerClass"
        :role="innerProps?.role"
        :id="innerProps?.id"
      >
        <slot />
      </div>
    </ResizeObserver>
  </div>
</template>
