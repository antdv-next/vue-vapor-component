<script setup vapor lang="ts">
  import type { InputFocusOptions } from '@v-c/util/dist/Dom/focus'

  import type { InputProps } from './interface'

  import { clsx } from '@v-c/util'
  import { triggerFocus } from '@v-c/util/dist/Dom/focus'
  import { KeyCodeStr } from '@v-c/util/dist/KeyCode'
  import {
    computed,
    shallowRef,
    toRef,
    useSlots,
    useTemplateRef,
    watch,
  } from 'vue'

  import BaseInput from './BaseInput.vue'
  import useCount from './hooks/useCount'
  import { resolveOnChange } from './utils/commonUtils'

  defineOptions({ name: 'Input' })

  const props = withDefaults(defineProps<InputProps>(), {
    prefixCls: 'vc-input',
    type: 'text',
  })

  const slots = useSlots()

  const focused = shallowRef(false)
  const compositionRef = shallowRef(false)
  const keyLockRef = shallowRef(false)
  // Track the value emitted by compositionEnd to dedup Firefox's subsequent input event
  const compositionEndValueRef = shallowRef<string | null>(null)

  const inputRef = useTemplateRef<HTMLInputElement>('input')
  const holderRef = useTemplateRef<{ nativeElement: HTMLElement | null }>(
    'holder',
  )

  function onChange(e: Event) {
    props?.onChange?.(e as any)
  }

  function focus(option?: InputFocusOptions) {
    if (inputRef.value) {
      triggerFocus(inputRef.value, option)
    }
  }

  // ====================== Value =======================
  const value = shallowRef(props?.value ?? props?.defaultValue)
  watch(
    () => props.value,
    newValue => {
      value.value = newValue
    },
  )
  const formatValue = computed(() =>
    value.value === undefined || value.value === null
      ? ''
      : String(value.value),
  )

  // =================== Select Range ===================
  const selection = shallowRef<[start: number, end: number] | null>(null)
  watch(selection, newSelection => {
    if (newSelection && inputRef.value) {
      inputRef.value.setSelectionRange(...newSelection)
    }
  })

  // ====================== Count =======================
  const countConfig = useCount(
    toRef(props, 'count') as any,
    toRef(props, 'showCount') as any,
  )
  const mergedMax = computed(() => countConfig?.value?.max || props?.maxLength)
  const valueLength = computed(
    () => countConfig.value?.strategy?.(formatValue.value) ?? 0,
  )
  const isOutOfRange = computed(
    () => !!mergedMax.value && valueLength.value > mergedMax.value,
  )

  watch(
    () => props.disabled,
    () => {
      if (keyLockRef.value) {
        keyLockRef.value = false
      }
      focused.value = focused.value && props.disabled ? false : focused.value
    },
    {
      immediate: true,
    },
  )

  function triggerChange(e: Event | CompositionEvent, currentValue: string) {
    // Skip during IME composition to avoid emitting intermediate values
    if (compositionRef.value && !props.changeOnComposing) {
      return
    }

    // Dedup: Firefox fires input event(s) AFTER compositionend with the same value.
    // Keep blocking until a genuinely different value arrives.
    if (compositionEndValueRef.value !== null) {
      if (currentValue === compositionEndValueRef.value) {
        return
      }
      compositionEndValueRef.value = null
    }

    let cutValue = currentValue
    const config = countConfig.value

    if (
      !compositionRef.value &&
      config?.exceedFormatter &&
      config.max &&
      config.strategy(currentValue) > config.max
    ) {
      cutValue = config.exceedFormatter(currentValue, {
        max: config.max,
      })

      if (currentValue !== cutValue) {
        selection.value = [
          inputRef.value?.selectionStart || 0,
          inputRef.value?.selectionEnd || 0,
        ]
      }
    }

    if (props.value === undefined) {
      value.value = cutValue
    }

    if (inputRef.value) {
      resolveOnChange(inputRef.value, e, onChange, cutValue)
    }
  }

  function onInternalChange(e: Event) {
    triggerChange(e, (e.target as HTMLInputElement).value)
  }

  function onInternalCompositionStart(e: CompositionEvent) {
    compositionRef.value = true
    // Clear stale dedup marker from previous composition cycle
    compositionEndValueRef.value = null
    props?.onCompositionStart?.(e as any)
  }

  function onInternalCompositionEnd(e: CompositionEvent) {
    compositionRef.value = false
    const currentValue = (e.target as HTMLInputElement).value
    // When changeOnComposing is true, the input event before compositionend
    // already fired onChange with the final value — skip to avoid duplicate.
    // When guard is on (default), the input event was blocked, so we must
    // trigger here as Chrome/Safari fire input BEFORE compositionend.
    // Also skip if value hasn't changed (e.g. composition cancelled via Esc).
    if (!props.changeOnComposing && currentValue !== formatValue.value) {
      triggerChange(e, currentValue)
    }
    // Always set dedup ref after compositionend: Firefox fires input event(s)
    // after compositionend regardless of whether value changed or not
    if (!props.changeOnComposing) {
      compositionEndValueRef.value = currentValue
    }
    props?.onCompositionEnd?.(e as any)
  }

  function handleKeyDown(e: KeyboardEvent) {
    if (e.key === KeyCodeStr.Enter && !keyLockRef.value && !e.isComposing) {
      keyLockRef.value = true
      props.onPressEnter?.(e)
    }
    props?.onKeyDown?.(e)
  }

  function handleKeyUp(e: KeyboardEvent) {
    if (e.key === 'Enter') {
      keyLockRef.value = false
    }
    props?.onKeyUp?.(e)
  }

  function handleFocus(e: FocusEvent) {
    focused.value = true
    props?.onFocus?.(e)
  }

  function handleBlur(e: FocusEvent) {
    if (keyLockRef.value) {
      keyLockRef.value = false
    }
    focused.value = false
    props?.onBlur?.(e)
  }

  function handleReset(e: MouseEvent) {
    compositionEndValueRef.value = null
    if (props.value === undefined) {
      value.value = ''
    }
    focus()
    if (inputRef.value) {
      resolveOnChange(inputRef.value, e, onChange)
    }
  }

  // mergedAllowClear: if user provides clearIcon slot, merge it into allowClear config
  const mergedAllowClear = computed(() => {
    if (!props.allowClear) {
      return props.allowClear
    }

    const clearIcon = slots.clearIcon?.()
    if (clearIcon) {
      return {
        ...(typeof props.allowClear === 'object' ? props.allowClear : {}),
        clearIcon,
      }
    }

    return props.allowClear
  })

  const inputClass = computed(() =>
    clsx(
      props.prefixCls,
      {
        [`${props.prefixCls}-disabled`]: props.disabled,
      },
      props.classNames?.input,
    ),
  )

  // Suffix render: count + user suffix
  const hasMaxLength = computed(() => Number(mergedMax.value) > 0)
  const dataCount = computed(() => {
    const config = countConfig.value
    if (config?.showFormatter) {
      return config.showFormatter({
        value: formatValue.value,
        count: valueLength.value,
        maxLength: mergedMax.value,
      })
    }
    return `${valueLength.value}${hasMaxLength.value ? ` / ${mergedMax.value}` : ''}`
  })

  const showCountSuffix = computed(() => !!countConfig.value?.show)
  const showCountSuffixCls = computed(() =>
    clsx(
      `${props.prefixCls}-show-count-suffix`,
      {
        [`${props.prefixCls}-show-count-has-suffix`]:
          !!slots.suffix || !!props.suffix,
      },
      props.classNames?.count,
    ),
  )

  defineExpose({
    focus,
    blur: () => {
      inputRef.value?.blur?.()
    },
    setSelectionRange: (
      start: number,
      end: number,
      direction?: 'forward' | 'backward' | 'none',
    ) => {
      inputRef.value?.setSelectionRange(start, end, direction)
    },
    select: () => {
      inputRef.value?.select()
    },
    input: inputRef,
    nativeElement: computed(
      () => holderRef.value?.nativeElement || inputRef.value,
    ),
  })
</script>

<template>
  <BaseInput
    ref="holder"
    :value="formatValue"
    :prefixCls="prefixCls"
    :allowClear="mergedAllowClear"
    :handleReset="handleReset"
    :prefix="prefix"
    :suffix="suffix"
    :addonBefore="addonBefore"
    :addonAfter="addonAfter"
    :focused="focused"
    :triggerFocus="focus"
    :disabled="disabled"
    :readOnly="readOnly"
    :classNames="classNames"
    :styles="styles"
    :dataAttrs="dataAttrs"
    :components="components"
    :hidden="hidden"
    :onClear="onClear"
    :classes="classes"
    :class="isOutOfRange && `${prefixCls}-out-of-range`"
  >
    <template #prefix>
      <slot name="prefix" />
    </template>

    <template #suffix>
      <span
        v-if="showCountSuffix"
        :class="showCountSuffixCls"
        :style="styles?.count"
        >{{ dataCount }}</span
      >
      <slot name="suffix" />
    </template>

    <template #addonBefore>
      <slot name="addonBefore" />
    </template>

    <template #addonAfter>
      <slot name="addonAfter" />
    </template>

    <template #clearIcon>
      <slot name="clearIcon" />
    </template>

    <input
      ref="input"
      :autocomplete="autoComplete"
      :value="formatValue"
      :class="inputClass"
      :style="styles?.input"
      :size="htmlSize"
      :type="type"
      :placeholder="placeholder"
      :maxlength="maxLength"
      :disabled="disabled || undefined"
      :readonly="readOnly || undefined"
      :hidden="hidden || undefined"
      @input="onInternalChange"
      @focus="handleFocus"
      @blur="handleBlur"
      @keydown="handleKeyDown"
      @keyup="handleKeyUp"
      @compositionstart="onInternalCompositionStart"
      @compositionend="onInternalCompositionEnd"
    />
  </BaseInput>
</template>
