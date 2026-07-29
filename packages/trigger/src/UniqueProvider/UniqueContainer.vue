<script setup vapor lang="ts">
  import type { CSSMotionProps } from '@v-c/util/dist/utils/transition'
  import type { CSSProperties } from 'vue'

  import type { AlignType, ArrowPos } from '../interface'

  import { getTransitionProps } from '@v-c/util/dist/utils/transition'
  import { computed, shallowRef, Transition, watchEffect } from 'vue'

  import useOffsetStyle from '../hooks/useOffsetStyle'

  defineOptions({ name: 'UniqueContainer', inheritAttrs: false })

  const props = defineProps<{
    prefixCls: string
    isMobile: boolean
    ready: boolean
    open: boolean
    align: AlignType
    offsetR: number
    offsetB: number
    offsetX: number
    offsetY: number
    arrowPos?: ArrowPos
    popupSize?: { width: number; height: number }
    motion?: CSSMotionProps
    uniqueContainerClassName?: string
    uniqueContainerStyle?: CSSProperties
  }>()

  const motionVisible = shallowRef(false)

  const offsetStyle = useOffsetStyle(
    computed(() => props.isMobile),
    computed(() => props.ready),
    computed(() => props.open),
    computed(() => props.align),
    computed(() => props.offsetR),
    computed(() => props.offsetB),
    computed(() => props.offsetX),
    computed(() => props.offsetY),
  )

  const cachedOffsetStyleRef = shallowRef<CSSProperties>(offsetStyle.value)

  watchEffect(() => {
    if (props.ready) {
      cachedOffsetStyleRef.value = offsetStyle.value
    }
  })

  const mergedOffsetStyle = computed(() => {
    if (
      cachedOffsetStyleRef.value &&
      Object.keys(cachedOffsetStyleRef.value).length > 0
    ) {
      return cachedOffsetStyleRef.value
    }
    return offsetStyle.value
  })

  const sizeStyle = computed<CSSProperties>(() => {
    const style: CSSProperties = {}
    if (props.popupSize) {
      style.width = `${props.popupSize.width}px`
      style.height = `${props.popupSize.height}px`
    }
    return style
  })

  const baseTransitionProps = getTransitionProps(
    (props.motion as any)?.name,
    props.motion,
  ) as any

  const mergedTransitionProps = {
    ...baseTransitionProps,
    onAfterEnter: (element: Element) => {
      motionVisible.value = true
      baseTransitionProps.onAfterEnter?.(element)
    },
    onAfterLeave: (element: Element) => {
      motionVisible.value = false
      baseTransitionProps.onAfterLeave?.(element)
    },
  }

  const containerCls = `${props.prefixCls}-unique-container`
</script>

<template>
  <Transition v-bind="mergedTransitionProps">
    <div
      v-show="open"
      :class="[
        containerCls,
        uniqueContainerClassName,
        {
          [`${containerCls}-visible`]: motionVisible,
          [`${containerCls}-hidden`]: !open,
        },
      ]"
      :style="[
        {
          '--arrow-x': `${arrowPos?.x || 0}px`,
          '--arrow-y': `${arrowPos?.y || 0}px`,
        },
        mergedOffsetStyle,
        sizeStyle,
        uniqueContainerStyle,
      ]"
    />
  </Transition>
</template>
