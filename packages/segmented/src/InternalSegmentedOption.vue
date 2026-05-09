<script setup lang="ts" vapor>
  import type { ChangeEvent } from '@v-c/util/dist/EventInterface'
  import type { VueNode } from '@v-c/util/dist/type'
  import type { CSSProperties } from 'vue'

  import type {
    ItemRender,
    SegmentedLabeledOption,
    SegmentedRawOption,
    SemanticName,
  } from './interface'

  import { clsx } from '@v-c/util'
  defineOptions({ name: 'InternalSegmentedOption' })
  const props = defineProps<{
    prefixCls: string
    classNames?: Partial<Record<SemanticName, string>>
    styles?: Partial<Record<SemanticName, CSSProperties>>
    data: SegmentedLabeledOption
    disabled?: boolean
    checked: boolean
    label: VueNode
    title?: string
    value: SegmentedRawOption
    name?: string
    onChange: (e: ChangeEvent, value: SegmentedRawOption) => void
    onFocus: (e: FocusEvent) => void
    onBlur: (e: FocusEvent) => void
    onKeyDown: (e: KeyboardEvent) => void
    onKeyUp: (e: KeyboardEvent) => void
    onMouseDown: () => void
    itemRender?: ItemRender
  }>()
  const handleChange = (event: Event) => {
    if (props.disabled) {
      return
    }
    props?.onChange?.(event as any, props.value)
  }
</script>

<template>
  <slot name="itemRender">
    <label
      :class="
        clsx(($attrs as any).class, {
          [`${prefixCls}-item-disabled`]: disabled,
        })
      "
      :style="($attrs as any).style"
      @mousedown="onMouseDown"
    >
      <input
        :name="name"
        :class="`${prefixCls}-item-input`"
        type="radio"
        :disabled="disabled"
        :checked="checked"
        @change="handleChange"
        @focus="onFocus"
        @blur="onBlur"
        @keydown="onKeyDown"
        @keyup="onKeyUp"
      />
      <div
        :class="clsx(`${prefixCls}-item-label`, classNames?.label)"
        :title="title"
        :style="styles?.label"
      >
        {{ typeof label === 'function' ? (label as any)?.() : label }}
      </div>
    </label>
  </slot>
</template>
