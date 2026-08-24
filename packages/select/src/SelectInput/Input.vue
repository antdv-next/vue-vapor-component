<script setup vapor lang="ts">
  import { clsx } from '@v-c/util'
  import { nextTick, shallowRef, useAttrs, watch } from 'vue'

  import useBaseProps from '../hooks/useBaseProps'
  import { useSelectInputContext } from './SelectInputContextKey'

  defineOptions({ name: 'SelectInput', inheritAttrs: false })

  const props = defineProps<{
    id?: string
    readOnly?: boolean
    value?: string
    placeholder?: string
    className?: string
    style?: any
    maxLength?: number
    syncWidth?: boolean
    autoComplete?: string
  }>()

  const attrs = useAttrs()
  const selectInputContext = useSelectInputContext()
  const baseProps = useBaseProps()
  const inputRef = shallowRef<HTMLInputElement>()

  const compositionStatusRef = shallowRef(false)
  const pastedTextRef = shallowRef<string | null>(null)
  const widthCssVar = shallowRef<number>()

  defineExpose({ input: inputRef })

  const handleChange = (event: Event) => {
    const ctx = selectInputContext.value
    let nextVal = (event.target as HTMLInputElement).value
    if (
      ctx?.tokenWithEnter &&
      pastedTextRef.value &&
      /[\r\n]/.test(pastedTextRef.value)
    ) {
      const replacedText = pastedTextRef.value
        .replace(/[\r\n]+$/, '')
        .replace(/\r\n/g, ' ')
        .replace(/[\r\n]/g, ' ')
      nextVal = nextVal.replace(replacedText, pastedTextRef.value)
    }
    pastedTextRef.value = null
    ctx?.onSearch?.(nextVal, true, compositionStatusRef.value)
  }

  const handleKeyDown = (event: KeyboardEvent) => {
    const ctx = selectInputContext.value
    const isOpen = !!baseProps.value?.triggerOpen
    if (
      event.key === 'Enter' &&
      ctx?.mode === 'tags' &&
      !isOpen &&
      !compositionStatusRef.value &&
      ctx.onSearchSubmit
    ) {
      ctx.onSearchSubmit((event.target as HTMLInputElement).value)
    }
  }

  const handleBlur = (_event: FocusEvent) => {
    selectInputContext.value?.onInputBlur?.()
  }

  const handleCompositionStart = () => {
    compositionStatusRef.value = true
  }
  const handleCompositionEnd = (event: CompositionEvent) => {
    const ctx = selectInputContext.value
    compositionStatusRef.value = false
    if (ctx && ctx.mode !== 'combobox') {
      ctx.onSearch?.((event.target as HTMLInputElement).value, true, false)
    }
  }

  const handlePaste = (event: ClipboardEvent) => {
    pastedTextRef.value = event.clipboardData?.getData('text') || ''
  }

  watch(
    [() => props.syncWidth, () => props.value],
    async () => {
      await nextTick()
      const input = inputRef.value
      if (props.syncWidth && input) {
        input.style.width = '0px'
        widthCssVar.value = input.scrollWidth
        input.style.width = ''
      }
    },
    { immediate: true },
  )
</script>

<template>
  <input
    ref="inputRef"
    type="text"
    :id="id"
    :read-only="readOnly"
    :style="{
      ...baseProps?.styles?.input,
      ...style,
      '--select-input-width': widthCssVar,
    }"
    :auto-focus="selectInputContext?.autoFocus"
    :autocomplete="autoComplete || 'new-password'"
    :class="
      clsx(
        `${selectInputContext?.prefixCls}-input`,
        baseProps?.classNames?.input,
        attrs.class,
      )
    "
    :disabled="baseProps?.disabled"
    :value="value || ''"
    :max-length="maxLength"
    :role="baseProps?.role || 'combobox'"
    :aria-expanded="baseProps?.triggerOpen || false"
    :aria-haspopup="'listbox'"
    :aria-owns="`${baseProps?.id}_list`"
    :aria-autocomplete="'list'"
    :aria-controls="`${baseProps?.id}_list`"
    :aria-activedescendant="
      baseProps?.triggerOpen ? baseProps?.activeDescendantId : undefined
    "
    @input="handleChange"
    @keydown="handleKeyDown"
    @blur="handleBlur"
    @paste="handlePaste"
    @compositionstart="handleCompositionStart"
    @compositionend="handleCompositionEnd"
  />
</template>
