<script setup vapor lang="ts">
  import type { Key, VueNode } from '@v-c/util/dist/type'

  import { clsx } from '@v-c/util'
  import omit from '@v-c/util/dist/omit'
  import ResizeObserver from '@vapor-component/resize-observer'
  import { computed, onUnmounted, useAttrs } from 'vue'

  defineOptions({ name: 'OverflowItem', inheritAttrs: false })

  const props = defineProps<{
    prefixCls: string
    item?: any
    renderItem?: (item: any, info: { index: number }) => VueNode
    responsive?: boolean
    responsiveDisabled?: boolean
    itemKey?: Key
    registerSize: (key: Key, width: number | null) => void
    display?: boolean
    order: number
    component?: any
    invalidate?: boolean
  }>()

  const attrs = useAttrs()

  const mergedHidden = computed(() => props.responsive && !props.display)

  function internalRegisterSize(width: number | null) {
    const key = props.itemKey ?? props.order
    props.registerSize(key, width)
  }

  onUnmounted(() => {
    internalRegisterSize(null)
  })

  const nodeCls = computed(() =>
    clsx(!props.invalidate && props.prefixCls, attrs.class as any),
  )

  const nodeStyle = computed<CSSProperties>(() => {
    const result: CSSProperties = {}
    const parentStyle = attrs.style
    if (
      parentStyle &&
      typeof parentStyle === 'object' &&
      !Array.isArray(parentStyle)
    ) {
      for (const key in parentStyle) {
        result[key] = parentStyle[key]
      }
    }
    if (!props.invalidate) {
      if (mergedHidden.value) {
        result.opacity = 0
        result.height = 0
        result.overflowY = 'hidden'
        result.pointerEvents = 'none'
        result.position = 'absolute'
      }
      if (props.responsive) {
        result.order = props.order
      }
    }
    return result
  })

  const childNode = computed<VueNode | undefined>(() => {
    if (props.renderItem && props.item !== undefined) {
      return props.renderItem(props.item, { index: props.order })
    }
    return undefined
  })

  const restAttrs = computed(() =>
    omit(attrs as Record<string, any>, [
      'class',
      'style',
      'default',
      'aria-hidden',
    ]),
  )
</script>

<template>
  <ResizeObserver
    v-if="responsive"
    :disabled="responsiveDisabled"
    @resize="({ offsetWidth }) => internalRegisterSize(offsetWidth)"
  >
    <component
      :is="component ?? 'div'"
      :class="nodeCls"
      :style="nodeStyle"
      v-bind="restAttrs"
      :aria-hidden="mergedHidden ? true : undefined"
    >
      <template v-if="childNode">{{ childNode }}</template>
      <slot v-else />
    </component>
  </ResizeObserver>
  <component
    v-else
    :is="component ?? 'div'"
    :class="nodeCls"
    :style="nodeStyle"
    v-bind="restAttrs"
    :aria-hidden="mergedHidden ? true : undefined"
  >
    <template v-if="childNode">{{ childNode }}</template>
    <slot v-else />
  </component>
</template>
