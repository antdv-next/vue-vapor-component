<script setup vapor lang="ts">
  import type { CheckboxChangeEvent, CheckboxProps } from './interface'

  import { computed, useTemplateRef, useAttrs } from 'vue'

  defineOptions({ name: 'Checkbox', inheritAttrs: false })
  const {
    prefixCls = 'vc-checkbox',
    checked,
    defaultChecked,
    disabled,
    type = 'checkbox',
    title,
  } = defineProps<CheckboxProps>()
  const emit = defineEmits<{
    change: [e: CheckboxChangeEvent]
    'update:checked': [checked: boolean]
  }>()
  const attrs = useAttrs()
  const holderRef = useTemplateRef('holder')
  const inputRef = useTemplateRef('input')
  const rawValue = computed(() => !!checked || !!defaultChecked)
  const classNames = computed(() => [
    prefixCls,
    {
      [`${prefixCls}-checked`]: rawValue.value,
      [`${prefixCls}-disabled`]: disabled,
    },
  ])
  function handleChange(e: Event) {
    if (disabled) return
    if (e.target instanceof HTMLInputElement) {
      emit('update:checked', e.target.checked)
      emit('change', {
        target: {
          type,
          checked: e.target.checked,
        },
        stopPropagation() {
          e.stopPropagation()
        },
        preventDefault() {
          e.preventDefault()
        },
        nativeEvent: e,
      })
    }
  }
  defineExpose({
    focus: () => {
      inputRef.value?.focus()
    },
    blur: () => {
      inputRef.value?.blur()
    },
    input: inputRef,
    nativeElement: holderRef,
  })
</script>

<template>
  <span ref="holder" :class="classNames" :title="title" :style="attrs.style">
    <input
      ref="input"
      :class="`${prefixCls}-input`"
      :checked="!!rawValue"
      :disabled="disabled"
      :type="type"
      @change="handleChange"
    />
    <span :class="`${prefixCls}-inner`" />
  </span>
</template>
