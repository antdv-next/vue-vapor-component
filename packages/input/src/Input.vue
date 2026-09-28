<script setup vapor lang="ts">
  import type { InputFocusOptions } from '@v-c/util/dist/Dom/focus'
  import type { CSSProperties } from 'vue'

  import type { InputProps, InputSlots } from './interface'

  import { clsx } from '@v-c/util'
  import { triggerFocus } from '@v-c/util/dist/Dom/focus'
  import { KeyCodeStr } from '@v-c/util/dist/KeyCode'
  import omit from '@v-c/util/dist/omit'
  import { getAttrStyleAndClass } from '@v-c/util/dist/props-util'
  import {
    computed,
    shallowRef,
    toRef,
    useAttrs,
    useSlots,
    useTemplateRef,
    watch,
  } from 'vue'

  import BaseInput from './BaseInput.vue'
  import useCount from './hooks/useCount'
  import { resolveOnChange } from './utils/commonUtils'

  defineOptions({ name: 'Input', inheritAttrs: false })
  defineSlots<Omit<InputSlots, 'default'>>()
  const props = withDefaults(defineProps<InputProps>(), {
    prefixCls: 'vc-input',
    type: 'text',
  })
  const emit = defineEmits<{
    change: [e: any]
    clear: [e: MouseEvent]
    'press-enter': [e: KeyboardEvent]
    keydown: [e: KeyboardEvent]
    keyup: [e: KeyboardEvent]
    focus: [e: FocusEvent]
    blur: [e: FocusEvent]
    compositionstart: [e: CompositionEvent]
    compositionend: [e: CompositionEvent]
  }>()

  const slots = useSlots()
  const attrs = useAttrs()

  // 非 props 的 HTML 属性（id / aria-* / name / inputmode / required …）要落到
  // <input> 上，对齐 @v-c input.tsx:256 的 restAttrs 与 :298 的 otherProps。
  // class / style 由 getAttrStyleAndClass 取出单独处理（vapor 下它们不进 props）。
  const rootStyle = computed(() => attrs.style)
  // vapor 下 onFocus/onChange 等不是 props、class/style 被提升到 attrs，
  // 所以 omit 列表只列真实声明的组件 props。
  const inputElementProps = computed(() => ({
    ...getAttrStyleAndClass(attrs).restAttrs,
    ...omit(props, [
      'prefixCls',
      'addonBefore',
      'addonAfter',
      'prefix',
      'suffix',
      'allowClear',
      'defaultValue',
      'showCount',
      'count',
      'classes',
      'htmlSize',
      'styles',
      'classNames',
      'dataAttrs',
      'components',
      'hidden',
      'readOnly',
      'value',
      'type',
      'changeOnComposing',
    ]),
  }))

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
    emit('change', e as any)
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
    compositionEndValueRef.value = null
    emit('compositionstart', e as any)
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
    emit('compositionend', e as any)
  }

  function handleKeyDown(e: KeyboardEvent) {
    if (e.key === KeyCodeStr.Enter && !keyLockRef.value && !e.isComposing) {
      keyLockRef.value = true
      emit('press-enter', e)
    }
    emit('keydown', e)
  }

  function handleKeyUp(e: KeyboardEvent) {
    if (e.key === 'Enter') {
      keyLockRef.value = false
    }
    emit('keyup', e)
  }

  function handleFocus(e: FocusEvent) {
    focused.value = true
    emit('focus', e)
  }

  function handleBlur(e: FocusEvent) {
    if (keyLockRef.value) {
      keyLockRef.value = false
    }
    focused.value = false
    emit('blur', e)
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

  // BaseInput 里 hasAffix / hasGroup / hasPrefix / hasSuffix / hasAddonBefore /
  // hasAddonAfter 读取 !!slots.x 决定 wrapper 结构，所以只在消费者真的提供了
  // 对应插槽时才转发；否则裸 <Input /> 也会渲染出完整的 group + affix 结构。
  // （#clearIcon 无对应结构守卫，仍无条件转发，✖ 回退照常生效。）
  const hasPrefixSlot = computed(() => !!slots.prefix)
  const hasSuffixSlot = computed(() => !!slots.suffix || showCountSuffix.value)
  const hasAddonBeforeSlot = computed(() => !!slots.addonBefore)
  const hasAddonAfterSlot = computed(() => !!slots.addonAfter)

  // BaseInput 的根节点在无 wrapper 时就是 <input> 本身，所以 root 的 class / style /
  // hidden 还得同时挂到 input 上；有 wrapper 时由 BaseInput 落到 wrapper 上。
  // hasAffix / hasGroup 的判定必须与 BaseInput 内部一致：prefix / suffix / addon 走
  // props 转发，对应插槽由上面的 has*Slot 决定是否转发。
  const hasAffix = computed(
    () =>
      !!props.prefix ||
      !!props.suffix ||
      !!props.allowClear ||
      hasPrefixSlot.value ||
      hasSuffixSlot.value,
  )
  const hasGroup = computed(
    () =>
      !!props.addonBefore ||
      !!props.addonAfter ||
      hasAddonBeforeSlot.value ||
      hasAddonAfterSlot.value,
  )
  const isInputRoot = computed(() => !hasAffix.value && !hasGroup.value)

  // BaseInput 收到的 :class，有无 wrapper 都先传过去
  const rootClass = computed(() =>
    clsx(attrs.class, isOutOfRange.value && `${props.prefixCls}-out-of-range`),
  )

  const inputClass = computed(() =>
    clsx(
      props.prefixCls,
      {
        [`${props.prefixCls}-disabled`]: props.disabled,
      },
      // @v-c BaseInput.tsx:64：无 affix 时 variant 挂到 input 元素上
      !hasAffix.value && props.classNames?.variant,
      props.classNames?.input,
      isInputRoot.value && rootClass.value,
    ),
  )

  const inputStyle = computed<CSSProperties | undefined>(() => {
    if (!isInputRoot.value) return props.styles?.input
    // attrs.style 是响应式 proxy，展开会带出非样式 key 让 patchStyle 崩，改用 for...in 拷贝
    const merged: CSSProperties = { ...props.styles?.input }
    const root = rootStyle.value
    if (root && typeof root === 'object' && !Array.isArray(root)) {
      const src = root as Record<string, unknown>
      const dst = merged as Record<string, unknown>
      for (const key in src) {
        dst[key] = src[key]
      }
    }
    return merged
  })

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
    :classNames="classNames"
    :styles="styles"
    :dataAttrs="dataAttrs"
    :components="components"
    :hidden="hidden"
    @clear="(e: MouseEvent) => emit('clear', e)"
    :classes="classes"
    :class="rootClass"
    :style="rootStyle"
  >
    <template v-if="hasPrefixSlot" #prefix>
      <slot name="prefix" />
    </template>

    <template v-if="hasSuffixSlot" #suffix>
      <span
        v-if="showCountSuffix"
        :class="showCountSuffixCls"
        :style="styles?.count"
        >{{ dataCount }}</span
      >
      <slot name="suffix" />
    </template>

    <template v-if="hasAddonBeforeSlot" #addonBefore>
      <slot name="addonBefore" />
    </template>

    <template v-if="hasAddonAfterSlot" #addonAfter>
      <slot name="addonAfter" />
    </template>

    <template #clearIcon>
      <slot name="clearIcon" />
    </template>

    <input
      ref="input"
      v-bind="inputElementProps"
      :autocomplete="autoComplete"
      :value="formatValue"
      :class="inputClass"
      :style="inputStyle"
      :size="htmlSize"
      :type="type"
      :placeholder="placeholder"
      :maxlength="maxLength"
      :disabled="disabled || undefined"
      :readonly="readOnly || undefined"
      :hidden="isInputRoot && hidden"
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
