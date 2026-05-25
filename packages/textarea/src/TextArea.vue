<script setup vapor lang="ts">
  import type { TextAreaProps } from './interface'

  import { clsx } from '@v-c/util'
  import { KeyCodeStr } from '@v-c/util/dist/KeyCode'
  import omit from '@v-c/util/dist/omit'
  import { getAttrStyleAndClass, toPropsRefs } from '@v-c/util/dist/props-util'
  import { BaseInput, resolveOnChange, useCount } from '@vapor-component/input'
  import { computed, shallowRef, useAttrs, useTemplateRef, watch } from 'vue'

  import ResizableTextArea from './ResizableTextArea.vue'

  defineOptions({ name: 'TextArea', inheritAttrs: false })

  const props = withDefaults(defineProps<TextAreaProps>(), {
    prefixCls: 'vc-textarea',
  })
  const emit = defineEmits()
  const attrs = useAttrs()

  const { count, showCount } = toPropsRefs(props, 'count', 'showCount')

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
  const focused = shallowRef(false)
  const compositionRef = shallowRef(false)
  // Track the value emitted by compositionEnd to dedup Firefox's subsequent input event
  const compositionEndValueRef = shallowRef<string | null>(null)

  const textareaResized = shallowRef<boolean>()

  const holderRef = useTemplateRef<{ nativeElement: HTMLElement | null }>(
    'holder',
  )
  const resizableTextAreaRef = useTemplateRef<{
    textArea: HTMLTextAreaElement | null
  }>('textarea')
  const getTextArea = () => resizableTextAreaRef.value?.textArea
  const focus = () => {
    getTextArea?.()?.focus()
  }

  defineExpose({
    resizableTextArea: resizableTextAreaRef,
    focus,
    blur: () => {
      getTextArea?.()?.blur()
    },
    nativeElement: computed(
      () => holderRef.value?.nativeElement || getTextArea(),
    ),
  })

  watch(
    () => props.disabled,
    () => {
      const prev = focused.value
      if (props.disabled && prev) {
        focused.value = !props?.disabled && prev
      }
    },
    { immediate: true, flush: 'post' },
  )
  // =========================== Select Range ===========================
  const selection = shallowRef<[number, number] | null>(null)
  watch(selection, () => {
    if (selection.value) {
      getTextArea?.()?.setSelectionRange(...selection.value)
    }
  })

  // ============================== Count ===============================
  const countConfig = useCount(count as any, showCount)
  const mergedMax = computed(() => countConfig.value.max ?? props.maxLength)

  // Max length value
  const hasMaxLength = computed(() => Number(mergedMax.value) > 0)

  const valueLength = computed(() =>
    countConfig.value.strategy(formatValue.value),
  )

  const isOutOfRange = computed(
    () => !!mergedMax.value && valueLength.value > mergedMax.value,
  )

  // ============================== Change ==============================
  const triggerChange = (e: any, currentValue: string) => {
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
    if (
      !compositionRef.value &&
      countConfig.value.exceedFormatter &&
      countConfig.value.max &&
      countConfig.value.strategy(currentValue) > countConfig.value.max
    ) {
      cutValue = countConfig.value.exceedFormatter(currentValue, {
        max: countConfig.value.max,
      })

      // When we already reached max and new input is truncated to the same value,
      // `value` may not change so Vue won't re-render. Force the native textarea
      // value back to the truncated text to drop the extra characters (non-IME).
      const textarea = getTextArea()

      if (currentValue !== cutValue) {
        selection.value = [
          textarea?.selectionStart || 0,
          textarea?.selectionEnd || 0,
        ]
      }
    }
    const textarea = getTextArea()
    if (textarea && textarea.value !== cutValue) {
      textarea.value = cutValue
    }

    value.value = cutValue

    resolveOnChange(
      e.currentTarget,
      e,
      props.onChange as unknown as any,
      cutValue,
    )
  }

  // =========================== Value Update ===========================
  const onInternalCompositionStart = () => {
    compositionRef.value = true
    // Clear stale dedup marker from previous composition cycle
    compositionEndValueRef.value = null
  }

  const onInternalCompositionEnd = (e: any) => {
    compositionRef.value = false
    const currentValue = e.currentTarget.value
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
  }

  const onInternalChange = (e: any) => {
    triggerChange(e, e.target.value)
  }

  const handleKeyDown = (e: KeyboardEvent) => {
    const { onPressEnter, onKeydown } = props
    if (e.key === KeyCodeStr.Enter && onPressEnter && !e.isComposing) {
      onPressEnter(e)
    }
    onKeydown?.(e)
  }
  const handleFocus = (e: any) => {
    focused.value = true
    props?.onFocus?.(e)
  }

  const handleBlur = (e: any) => {
    focused.value = false
    props?.onBlur?.(e)
  }

  // ============================== Reset ===============================
  const handleReset = (e: MouseEvent) => {
    compositionEndValueRef.value = null
    value.value = ''
    focus()
    resolveOnChange(getTextArea()!, e, props.onChange as unknown as any)
  }

  const handleResize: TextAreaProps['onResize'] = size => {
    props?.onResize?.(size)
    if (getTextArea()?.style.height) {
      textareaResized.value = true
    }
  }
  const isPureTextArea = computed(() => {
    const { autoSize, allowClear } = props
    return !autoSize && !showCount.value && !allowClear
  })
  const showCountSuffix = computed(() => countConfig.value.show)
  const showCountSuffixCls = computed(() => {
    const { classNames, prefixCls } = props
    if (showCountSuffix.value) {
      return clsx(`${prefixCls}-data-count`, classNames?.count)
    }
  })
  const dataCount = computed(() => {
    if (countConfig.value?.showFormatter) {
      return countConfig.value.showFormatter?.({
        value: formatValue.value,
        count: valueLength.value,
        maxLength: mergedMax.value,
      })
    } else {
      return `${valueLength.value}${hasMaxLength.value ? ` / ${mergedMax.value}` : ''}`
    }
  })
  const textAreaProps = computed(() => {
    const { restAttrs } = getAttrStyleAndClass(attrs)
    return {
      ...restAttrs,
      ...omit(props, [
        'suffix',
        'classNames',
        'styles',
        'prefixCls',
        'allowClear',
        'autoSize',
        'showCount',
        'disabled',
        'hidden',
        'readOnly',
        'onClear',
        'maxLength',
        'onResize',
        'onChange',
        'onKeydown',
        'onPressEnter',
        'onFocus',
        'onBlur',
        'changeOnComposing',
      ]),
    }
  })
</script>

<template>
  <BaseInput
    ref="holder"
    :value="formatValue"
    :prefixCls="prefixCls"
    :allowClear="allowClear"
    :handleReset="handleReset"
    :prefix="prefix"
    :suffix="suffix"
    :addonBefore="addonBefore"
    :addonAfter="addonAfter"
    :focused="focused"
    :triggerFocus="focus"
    :disabled="disabled"
    :readOnly="readOnly"
    :classNames="{
      ...classNames,
      affixWrapper: clsx(classNames?.affixWrapper, {
        [`${prefixCls}-show-count`]: showCount,
        [`${prefixCls}-textarea-allow-clear`]: allowClear,
      }),
    }"
    :styles="styles"
    :dataAttrs="{
      affixWrapper: {
        'data-count': typeof dataCount === 'string' ? dataCount : undefined,
      } as any,
    }"
    :components="components"
    :hidden="hidden"
    :onClear="onClear"
    :class="[props.class, isOutOfRange && `${prefixCls}-out-of-range`]"
    :style="{
      ...style,
      ...(textareaResized && !isPureTextArea ? { height: 'auto' } : {}),
    }"
  >
    <template #prefix>
      <slot name="prefix" />
    </template>

    <template #suffix>
      <slot name="suffix" />
      <span
        v-if="showCountSuffix"
        :class="showCountSuffixCls"
        :style="styles?.count"
        >{{ dataCount }}</span
      >
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

    <ResizableTextArea
      v-bind="textAreaProps"
      ref="textarea"
      :prefixCls="prefixCls"
      :class="clsx(classNames?.textarea)"
      :style="{
        resize: style?.resize,
        ...styles?.textarea,
      }"
      :autoSize="autoSize"
      :maxLength="maxLength"
      :placeholder="placeholder"
      :disabled="disabled"
      :readOnly="readOnly"
      :hidden="hidden"
      :value="formatValue"
      @change="onInternalChange"
      @focus="handleFocus"
      @blur="handleBlur"
      @keydown="handleKeyDown"
      @compositionstart="onInternalCompositionStart"
      @compositionend="onInternalCompositionEnd"
      @resize="handleResize"
    />
  </BaseInput>
</template>
