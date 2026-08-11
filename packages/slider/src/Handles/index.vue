<script setup vapor lang="ts">
  import type { CSSProperties } from 'vue'
  import type { OnStartMove } from '../interface'
  import { computed, shallowRef, useSlots } from 'vue'
  import { getIndex } from '../util'
  import Handle from './Handle.vue'

  defineOptions({ name: 'SliderHandles' })

  const props = withDefaults(defineProps<{
    prefixCls: string
    values: number[]
    handleStyle?: CSSProperties | CSSProperties[]
    onStartMove: OnStartMove
    onOffsetChange: (offset: number | 'min' | 'max', valueIndex: number) => void
    onFocus?: (e: FocusEvent) => void
    onBlur?: (e: FocusEvent) => void
    onDelete: (index: number) => void
    draggingIndex?: number
    draggingDelete?: boolean
    onChangeComplete?: () => void
  }>(), {
    prefixCls: 'vc-slider',
    values: () => [],
    draggingIndex: -1,
    draggingDelete: false,
  })

  const slots = useSlots()
  const handleRefs = shallowRef<Record<number, any>>({})
  const activeVisible = shallowRef(false)
  const activeIndex = shallowRef(-1)

  function setHandleRef(index: number, node: any) {
    if (!node) {
      delete handleRefs.value[index]
    } else {
      handleRefs.value[index] = node
    }
  }

  function onActive(index: number) {
    activeIndex.value = index
    activeVisible.value = true
  }

  function onHandleFocus(e: FocusEvent, index: number) {
    onActive(index)
    props.onFocus?.(e)
  }

  function onHandleMouseEnter(_e: MouseEvent, index: number) {
    onActive(index)
  }

  const activeHandleValue = computed(() =>
    props.values[activeIndex.value] as number,
  )

  defineExpose({
    focus: (index: number) => {
      handleRefs.value[index]?.focus?.()
    },
    hideHelp: () => {
      activeVisible.value = false
    },
  })
</script>

<template>
  <template v-for="(value, index) in values" :key="index">
    <Handle
      :ref="(node: any) => setHandleRef(index, node)"
      :prefix-cls="prefixCls"
      :value="value as number"
      :value-index="index"
      :dragging="draggingIndex === index"
      :dragging-delete="draggingIndex === index && draggingDelete"
      :style="getIndex(handleStyle, index)"
      :on-start-move="onStartMove"
      :on-offset-change="onOffsetChange"
      :on-delete="onDelete"
      :on-focus="onHandleFocus"
      :on-mouseenter="onHandleMouseEnter"
      :on-blur="onBlur"
      :on-change-complete="onChangeComplete"
    >
      <template v-if="slots.handle" #handle="data">
        <slot name="handle" v-bind:data="data" />
      </template>
    </Handle>
  </template>
  <Handle
    v-if="slots['active-handle'] && activeVisible"
    :key="'a11y'"
    :prefix-cls="prefixCls"
    :value="activeHandleValue"
    :value-index="null"
    :dragging="draggingIndex !== -1"
    :dragging-delete="draggingDelete"
    :on-start-move="onStartMove"
    :on-offset-change="onOffsetChange"
    :on-delete="onDelete"
    :on-change-complete="onChangeComplete"
  >
    <template #handle="data">
      <slot name="active-handle" v-bind:data="data" />
    </template>
  </Handle>
</template>
