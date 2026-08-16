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
  import { useAttrs } from 'vue'
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
    itemRender?: ItemRender
  }>()
  const emit = defineEmits<{
    change: [e: ChangeEvent, value: SegmentedRawOption]
    focus: [e: FocusEvent]
    blur: [e: FocusEvent]
    keydown: [e: KeyboardEvent]
    keyup: [e: KeyboardEvent]
    mousedown: []
  }>()
  const attrs = useAttrs()
  const handleChange = (event: Event) => {
    if (props.disabled) {
      return
    }
    emit('change', event as any, props.value)
  }
</script>

<template>
  <slot name="itemRender">
    <label
      :class="
        clsx(attrs.class, {
          [`${prefixCls}-item-disabled`]: disabled,
        })
      "
      :style="attrs.style"
      @mousedown="() => emit('mousedown')"
    >
      <input
        :name="name"
        :class="`${prefixCls}-item-input`"
        type="radio"
        :disabled="disabled"
        :checked="checked"
        @change="handleChange"
        @focus="e => emit('focus', e)"
        @blur="e => emit('blur', e)"
        @keydown="e => emit('keydown', e)"
        @keyup="e => emit('keyup', e)"
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
