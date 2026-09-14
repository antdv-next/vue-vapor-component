<script setup vapor lang="ts">
import type { CSSProperties } from 'vue'

import type { CellRender, CellRenderInfo } from '../interface'
import { computed, isVNode } from 'vue'

defineOptions({ name: 'CellItem', inheritAttrs: false })

const props = defineProps<{
  date: any
  label: any
  title?: string
  /** `clsx` returns a `string`; callers may also pass a class object. */
  cls: string | Record<string, any>
  style?: CSSProperties
  /** Vapor deviation: the cell inner class, e.g. `vc-picker-cell-inner` */
  innerCls: string
  cellRender?: CellRender<any>
  info: CellRenderInfo<any>
}>()

const emit = defineEmits<{
  click: []
  dblclick: []
  mouseenter: []
  mouseleave: []
}>()

// Rule 12: `cellRender` may be coerced to `false` by vapor, so guard with `typeof`.
const customNode = computed(() => {
  if (typeof props.cellRender !== 'function') return null
  return props.cellRender(props.date, props.info)
})

const isCustomComponent = computed<boolean>(() => {
  const node = customNode.value
  return node != null && typeof node !== 'string' && !isVNode(node)
})

const isCustomString = computed<boolean>(() => typeof customNode.value === 'string')

// Deprecated `dateRender` / `monthCellRender` return a vdom `VNode`. Vapor cannot
// render it inline, so we fall back to its text children.
const isCustomVNode = computed<boolean>(() => isVNode(customNode.value))
const vnodeText = computed<string>(() => {
  const node = customNode.value as any
  if (!node || typeof node !== 'object') return ''
  if (typeof node.children === 'string') return node.children
  if (Array.isArray(node.children)) {
    return node.children
      .map((child: any) => (typeof child === 'string' ? child : child?.children ?? ''))
      .join('')
  }
  return ''
})
</script>

<template>
  <td
    :class="cls"
    :title="title"
    :style="style"
    @click="emit('click')"
    @dblclick="emit('dblclick')"
    @mouseenter="emit('mouseenter')"
    @mouseleave="emit('mouseleave')"
  >
    <div :class="innerCls">
      <component v-if="isCustomComponent" :is="customNode" />
      <template v-else-if="isCustomString">{{ customNode }}</template>
      <template v-else-if="isCustomVNode && vnodeText">{{ vnodeText }}</template>
      <template v-else>{{ label }}</template>
    </div>
  </td>
</template>
