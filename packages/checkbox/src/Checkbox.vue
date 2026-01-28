<script setup vapor lang="ts">
  import type { CheckboxProps, CheckboxChangeEvent } from './interface'
  import { computed, useTemplateRef } from 'vue'

  defineOptions({ name: 'Checkbox' })
  const emit = defineEmits<{
    change: [e: CheckboxChangeEvent,]
    'update:checked': [checked: boolean]
  }>()
  const { prefixCls = 'vc-checkbox', checked, disabled, type = 'checkbox', title } = defineProps<CheckboxProps>()
  const holderRef = useTemplateRef('holder')
  const inputRef = useTemplateRef('input')  
  const classNames = computed(() => [
    prefixCls,
    {
      [`${prefixCls}-checked`]: checked,
      [`${prefixCls}-disabled`]: disabled,
    }
  ])
  const handleChange = (e: Event) => {
    if (disabled) return
    if (e.target instanceof HTMLInputElement) {
      emit('update:checked', e.target.checked)
      emit('change', {
        target: {
          type,
          checked: e.target.checked
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
  <span ref="holder" :class="classNames" :title="title">
    <input ref="input" :class="`${prefixCls}-input`" :disabled="disabled" :type="type" @change="handleChange"></input>
    <span :class="`${prefixCls}-inner`"></span>
  </span>
</template>
