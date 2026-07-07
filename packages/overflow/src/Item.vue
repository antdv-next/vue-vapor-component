<script setup vapor lang="ts">
  import type { Key, VueNode } from '@v-c/util/dist/type'
  import type { CSSProperties } from 'vue'

  import { clsx } from '@v-c/util'
  import omit from '@v-c/util/dist/omit'
  import ResizeObserver from '@vapor-component/resize-observer'
  import { computed, onUnmounted, useAttrs } from 'vue'

  defineOptions({ name: 'OverflowItem', inheritAttrs: false })

  const props = defineProps<{
    prefixCls: string
    item?: any
    class?: string | object | string[]
    style?: CSSProperties
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
    clsx(!props.invalidate && props.prefixCls, props.class, attrs.class as any),
  )

  const nodeStyle = computed<CSSProperties>(() => {
    const style: CSSProperties = {
      ...(attrs.style as CSSProperties),
      ...(props.style as CSSProperties),
    }
    if (!props.invalidate) {
      if (mergedHidden.value) {
        style.opacity = 0
        style.height = 0
        style.overflowY = 'hidden'
        style.pointerEvents = 'none'
        style.position = 'absolute'
      }
      if (props.responsive) {
        style.order = props.order
      }
    }
    return style
  })

  const childNode = computed<VueNode | undefined>(() => {
    if (props.renderItem && props.item !== undefined) {
      return props.renderItem(props.item, { index: props.order })
    }
    return undefined
  })

  const restAttrs = computed(() =>
    omit(attrs as Record<string, any>, ['class', 'style', 'default']),
  )
</script>

<template>
  <ResizeObserver
    v-if="props.responsive"
    :disabled="props.responsiveDisabled"
    :onResize="({ offsetWidth }) => internalRegisterSize(offsetWidth)"
  >
    <component
      :is="props.component ?? 'div'"
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
    :is="props.component ?? 'div'"
    :class="nodeCls"
    :style="nodeStyle"
    v-bind="restAttrs"
    :aria-hidden="mergedHidden ? true : undefined"
  >
    <template v-if="childNode">{{ childNode }}</template>
    <slot v-else />
  </component>
</template>
