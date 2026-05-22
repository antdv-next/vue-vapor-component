<script setup vapor lang="ts">
  import type { InputFocusOptions } from '@v-c/util/dist/Dom/focus'

  import type { ValueType, DecimalClass, InputNumberProps } from './interface'

  import getMiniDecimal, {
    getNumberPrecision,
    num2str,
    toFixed,
    validateNumber,
  } from '@v-c/mini-decimal'
  import { clsx } from '@v-c/util'
  import { triggerFocus } from '@v-c/util/dist/Dom/focus'
  import { KeyCodeStr } from '@v-c/util/dist/KeyCode'
  import omit from '@v-c/util/dist/omit'
  import {
    computed,
    useAttrs,
    useSlots,
    shallowRef,
    watch,
    watchEffect,
  } from 'vue'

  import useCursor from './hooks/useCursor'
  import useFrame from './hooks/useFrame'
  import StepHandler from './StepHandler.vue'
  import { getDecupleSteps } from './utils/numberUtil'

  defineOptions({ name: 'InputNumber' })
  const props = withDefaults(defineProps<InputNumberProps>(), {
    prefixCls: 'vc-input-number',
    step: 1,
    controls: true,
    changeOnWheel: false,
    mode: 'input',
    stringMode: false,
  })
  const emit = defineEmits()
  const attrs = useAttrs()
  const slots = useSlots()

  const prefixNode = computed(() => slots.prefix || props.prefix)
  const suffixNode = computed(() => slots.suffix || props.suffix)
  const upHandlerNode = computed(() => slots.upHandler || props.upHandler)
  const downHandlerNode = computed(() => slots.downHandler || props.downHandler)

  function getDecimalValue(
    stringMode: boolean | undefined,
    decimalValue: DecimalClass,
  ) {
    if (stringMode || decimalValue.isEmpty()) {
      return decimalValue.toString()
    }

    return decimalValue.toNumber()
  }

  function getDecimalIfValidate(value: ValueType) {
    const decimal = getMiniDecimal(value)
    return decimal.isInvalidate() ? null : decimal
  }
  const focus = shallowRef(false)
  const userTypingRef = shallowRef(false)
  const compositionRef = shallowRef(false)
  const shiftKeyRef = shallowRef(false)

  const rootRef = shallowRef<HTMLDivElement>()
  const inputRef = shallowRef<HTMLInputElement>()

  defineExpose({
    focus: (option?: InputFocusOptions) => {
      if (inputRef.value) {
        triggerFocus(inputRef.value, option)
      }
    },
    blur: () => {
      inputRef.value?.blur?.()
    },
    nativeElement: computed(() => rootRef.value || inputRef.value || null),
    input: inputRef,
  })

  // ============================ Value =============================
  const decimalValue = shallowRef<DecimalClass>(
    getMiniDecimal((props.value ?? props.defaultValue ?? '') as any),
  )
  console.log(decimalValue.value)

  const setUncontrolledDecimalValue = (newDecimal: DecimalClass) => {
    if (props.value === undefined) {
      decimalValue.value = newDecimal
    }
  }

  // ====================== Parser & Formatter ======================
  const getPrecision = (numStr: string, userTyping: boolean) => {
    if (userTyping) {
      return undefined
    }

    if (props.precision !== undefined && props.precision >= 0) {
      return props.precision
    }

    return Math.max(
      getNumberPrecision(numStr),
      getNumberPrecision(props.step ?? 1),
    )
  }

  const mergedParser = (num: string | number) => {
    const numStr = String(num)

    if (props.parser) {
      return props.parser(numStr)
    }

    let parsedStr = numStr
    if (props.decimalSeparator) {
      parsedStr = parsedStr.replace(props.decimalSeparator, '.')
    }

    return parsedStr.replace(/[^\w.-]+/g, '')
  }

  const inputValue = shallowRef<string | number>('')
  const inputValueRef = shallowRef<string | number>('')

  const mergedFormatter = (number: string, userTyping: boolean) => {
    if (props.formatter) {
      return props.formatter(number, {
        userTyping,
        input: String(inputValueRef.value),
      })
    }

    let str = typeof number === 'number' ? num2str(number) : number

    if (!userTyping) {
      const mergedPrecision = getPrecision(str, userTyping)

      if (
        validateNumber(str) &&
        (props.decimalSeparator ||
          (mergedPrecision !== undefined && mergedPrecision >= 0))
      ) {
        const separatorStr = props.decimalSeparator || '.'

        str = toFixed(str, separatorStr, mergedPrecision)
      }
    }

    return str
  }

  const syncInputValue = () => {
    const initValue = props.defaultValue ?? props.value
    if (
      decimalValue.value.isInvalidate() &&
      ['string', 'number'].includes(typeof initValue as any)
    ) {
      inputValue.value = Number.isNaN(initValue as any)
        ? ''
        : (initValue as any)
    } else {
      inputValue.value = mergedFormatter(decimalValue.value.toString(), false)
    }
    inputValueRef.value = inputValue.value
  }

  syncInputValue()

  watch(inputValue, val => {
    inputValueRef.value = val
  })

  const setInputValue = (newValue: DecimalClass, userTyping: boolean) => {
    inputValue.value = mergedFormatter(
      newValue.isInvalidate()
        ? newValue.toString(false)
        : newValue.toString(!userTyping),
      userTyping,
    )
  }

  // >>> Max & Min limit
  const maxDecimal = computed(() =>
    props.max !== undefined ? getDecimalIfValidate(props.max as any) : null,
  )
  const minDecimal = computed(() =>
    props.min !== undefined ? getDecimalIfValidate(props.min as any) : null,
  )

  const upDisabled = computed(() => {
    if (
      !maxDecimal.value ||
      !decimalValue.value ||
      decimalValue.value.isInvalidate()
    ) {
      return false
    }

    return maxDecimal.value.lessEquals(decimalValue.value)
  })

  const downDisabled = computed(() => {
    if (
      !minDecimal.value ||
      !decimalValue.value ||
      decimalValue.value.isInvalidate()
    ) {
      return false
    }

    return decimalValue.value.lessEquals(minDecimal.value)
  })

  // Cursor controller
  const recordCursorRef = shallowRef<() => void>(() => {})
  const restoreCursorRef = shallowRef<() => void>(() => {})
  watchEffect(() => {
    if (inputRef.value) {
      const [record, restore] = useCursor(inputRef.value, focus.value)
      recordCursorRef.value = record
      restoreCursorRef.value = restore
    }
  })
  const recordCursor = () => recordCursorRef.value?.()
  const restoreCursor = () => restoreCursorRef.value?.()

  // ============================= Data =============================
  const getRangeValue = (target: DecimalClass) => {
    if (maxDecimal.value && !target.lessEquals(maxDecimal.value)) {
      return maxDecimal.value
    }

    if (minDecimal.value && !minDecimal.value.lessEquals(target)) {
      return minDecimal.value
    }

    return null
  }

  const isInRange = (target: DecimalClass) => !getRangeValue(target)

  const triggerValueUpdate = (
    newValue: DecimalClass,
    userTyping: boolean,
  ): DecimalClass => {
    let updateValue = newValue

    let isRangeValidate = isInRange(updateValue) || updateValue.isEmpty()

    if (!updateValue.isEmpty() && !userTyping) {
      updateValue = getRangeValue(updateValue) || updateValue
      isRangeValidate = true
    }

    if (!props.readOnly && !props.disabled && isRangeValidate) {
      const numStr = updateValue.toString()
      const mergedPrecision = getPrecision(numStr, userTyping)
      if (mergedPrecision !== undefined && mergedPrecision >= 0) {
        updateValue = getMiniDecimal(toFixed(numStr, '.', mergedPrecision))

        if (!isInRange(updateValue)) {
          updateValue = getMiniDecimal(
            toFixed(numStr, '.', mergedPrecision, true),
          )
        }
      }

      if (!updateValue.equals(decimalValue.value)) {
        setUncontrolledDecimalValue(updateValue)
        const outValue = updateValue.isEmpty()
          ? null
          : getDecimalValue(props.stringMode, updateValue)
        emit('update:value', outValue as any)
        props.onChange?.(outValue as any)

        if (props.value === undefined) {
          setInputValue(updateValue, userTyping)
        }
      }

      return updateValue
    }

    return decimalValue.value
  }

  // ========================== User Input ==========================
  const onNextPromise = useFrame()

  const collectInputValue = (inputStr: string) => {
    recordCursor()

    inputValueRef.value = inputStr
    inputValue.value = inputStr

    if (!compositionRef.value) {
      const finalValue = mergedParser(inputStr)
      const finalDecimal = getMiniDecimal(finalValue as any)
      if (!finalDecimal.isNaN()) {
        triggerValueUpdate(finalDecimal, true)
      }
    }

    props.onInput?.(inputStr)

    onNextPromise(() => {
      let nextInputStr = inputStr
      if (!props.parser) {
        nextInputStr = inputStr.replace(/。/g, '.')
      }

      if (nextInputStr !== inputStr) {
        collectInputValue(nextInputStr)
      }
    })
  }

  // >>> Composition
  const onCompositionStart = (e: CompositionEvent) => {
    compositionRef.value = true
    props.onCompositionStart?.(e)
  }

  const onCompositionEnd = (e: CompositionEvent) => {
    compositionRef.value = false
    props.onCompositionEnd?.(e)

    if (inputRef.value) {
      collectInputValue(inputRef.value.value)
    }
  }

  // >>> Input
  const onInternalInput = (e: Event) => {
    collectInputValue((e.target as HTMLInputElement).value)
  }

  // ============================= Step =============================
  const onInternalStep = (
    up: boolean,
    emitter: 'handler' | 'keyboard' | 'wheel',
  ) => {
    if ((up && upDisabled.value) || (!up && downDisabled.value)) {
      return
    }

    userTypingRef.value = false

    let stepDecimal = getMiniDecimal(
      shiftKeyRef.value ? getDecupleSteps(props.step ?? 1) : (props.step ?? 1),
    )
    if (!up) {
      stepDecimal = stepDecimal.negate()
    }

    const target = (decimalValue.value || getMiniDecimal(0)).add(
      stepDecimal.toString(),
    )

    const updatedValue = triggerValueUpdate(target, false)

    const outValue = getDecimalValue(props.stringMode, updatedValue)
    props.onStep?.(outValue as any, {
      offset: shiftKeyRef.value
        ? getDecupleSteps(props.step ?? 1)
        : (props.step ?? 1),
      type: up ? 'up' : 'down',
      emitter,
    })

    inputRef.value?.focus()
  }

  // ============================ Flush =============================
  const flushInputValue = (userTyping: boolean) => {
    const parsedValue = getMiniDecimal(mergedParser(inputValue.value))
    let formatValue: DecimalClass

    if (!parsedValue.isNaN()) {
      formatValue = triggerValueUpdate(parsedValue, userTyping)
    } else {
      formatValue = triggerValueUpdate(decimalValue.value, userTyping)
    }

    if (props.value !== undefined) {
      setInputValue(decimalValue.value, false)
    } else if (!formatValue.isNaN()) {
      setInputValue(formatValue, false)
    }
  }

  const onBeforeInput = (e: InputEvent) => {
    userTypingRef.value = true
    props.onBeforeInput?.(e)
  }

  const onKeyDown = (event: KeyboardEvent) => {
    const { key, shiftKey } = event
    userTypingRef.value = true

    shiftKeyRef.value = shiftKey

    if (key === KeyCodeStr.Enter) {
      if (!compositionRef.value) {
        userTypingRef.value = false
      }
      flushInputValue(false)
      props.onPressEnter?.(event)
    }

    if (props.keyboard === false) {
      props.onKeyDown?.(event)
      return
    }

    if (
      !compositionRef.value &&
      ['Up', 'ArrowUp', 'Down', 'ArrowDown'].includes(key)
    ) {
      onInternalStep(key === 'Up' || key === 'ArrowUp', 'keyboard')
      event.preventDefault()
    }

    props.onKeyDown?.(event)
  }

  const onKeyUp = (event: KeyboardEvent) => {
    userTypingRef.value = false
    shiftKeyRef.value = false
    props.onKeyUp?.(event)
  }

  // ============================ Wheel ============================
  watchEffect(onCleanup => {
    if (props.changeOnWheel && focus.value && inputRef.value) {
      const onWheel = (event: WheelEvent) => {
        onInternalStep(event.deltaY < 0, 'wheel')
        event.preventDefault()
      }
      inputRef.value.addEventListener('wheel', onWheel, { passive: false })
      onCleanup(() => inputRef.value?.removeEventListener('wheel', onWheel))
    }
  })

  // >>> Focus & Blur
  const onBlur = (e: FocusEvent) => {
    if (props.changeOnBlur ?? true) {
      flushInputValue(false)
    }

    focus.value = false
    userTypingRef.value = false
    props.onBlur?.(e)
  }

  const onFocus = (e: FocusEvent) => {
    focus.value = true
    props.onFocus?.(e)
  }

  // >>> Mouse events
  const onInternalMouseDown = (event: MouseEvent) => {
    if (inputRef.value && event.target !== inputRef.value) {
      inputRef.value.focus()
      event.preventDefault()
    }

    props.onMouseDown?.(event)
  }

  // ========================== Controlled ==========================
  watch(
    [
      () => props.precision,
      () => props.formatter,
      () => props.decimalSeparator,
    ],
    () => {
      if (!decimalValue.value.isInvalidate()) {
        setInputValue(decimalValue.value, false)
      }
    },
  )

  watch(
    () => props.value,
    newVal => {
      const newValue = getMiniDecimal((newVal ?? '') as any)
      decimalValue.value = newValue
      const currentParsedValue = getMiniDecimal(mergedParser(inputValue.value))

      if (
        !newValue.equals(currentParsedValue) ||
        !userTypingRef.value ||
        props.formatter
      ) {
        setInputValue(newValue, userTypingRef.value)
      }
    },
  )

  // ============================ Cursor ============================
  watch(
    () => inputValue.value,
    () => {
      if (props.formatter) {
        restoreCursor()
      }
    },
    {
      flush: 'post',
    },
  )
  const mergedPrefixCls = computed(() => props.prefixCls)
  const mergedClassName = computed(() => props.className || attrs.class)
  const mergedStyle = computed(() => ({
    ...props.styles?.root,
    ...(attrs.style as any),
  }))
  const inputAttrs = omit(
    {
      ...attrs,
    },
    [
      'prefixCls',
      'classNames',
      'styles',
      'defaultValue',
      'value',
      'prefix',
      'suffix',
      'upHandler',
      'downHandler',
      'keyboard',
      'changeOnWheel',
      'controls',
      'mode',
      'parser',
      'formatter',
      'precision',
      'decimalSeparator',
      'onChange',
      'onInput',
      'onPressEnter',
      'onStep',
      'changeOnBlur',
      'class',
      'style',
      'onMouseDown',
      'onClick',
      'onMouseUp',
      'onMouseLeave',
      'onMouseMove',
      'onMouseEnter',
      'onMouseOut',
      'onFocus',
      'onBlur',
      'onKeyDown',
      'onKeyUp',
      'onCompositionStart',
      'onCompositionEnd',
      'onBeforeInput',
    ],
  )
  const rootClass = computed(() => {
    const { mode, classNames, disabled, readOnly } = props
    return clsx(
      mergedPrefixCls.value,
      `${mergedPrefixCls.value}-mode-${mode}`,
      mergedClassName,
      classNames?.root,
      {
        [`${mergedPrefixCls}-focused`]: focus.value,
        [`${mergedPrefixCls}-disabled`]: disabled,
        [`${mergedPrefixCls}-readonly`]: readOnly,
        [`${mergedPrefixCls}-not-a-number`]: decimalValue.value?.isNaN(),
        [`${mergedPrefixCls}-out-of-range`]:
          !decimalValue.value?.isInvalidate() && !isInRange(decimalValue.value),
      },
    )
  })
</script>

<template>
  <div
    ref="rootRef"
    :class="rootClass"
    :style="mergedStyle"
    @mousedown="onInternalMouseDown"
    @mouseup="
      (e: MouseEvent) => {
        emit('mouseUp', e)
      }
    "
    @mouseleave="
      (e: MouseEvent) => {
        emit('mouseLeave', e)
      }
    "
    @mousemove="
      (e: MouseEvent) => {
        emit('mouseMove', e)
      }
    "
    @mouseenter="
      (e: MouseEvent) => {
        emit('mouseEnter', e)
      }
    "
    @mouseout="
      (e: MouseEvent) => {
        emit('mouseOut', e)
      }
    "
    @click="
      (e: MouseEvent) => {
        emit('click', e)
      }
    "
  >
    <template v-if="mode === 'spinner' && controls">
      <StepHandler
        :prefixCls="mergedPrefixCls"
        action="down"
        :disabled="downDisabled"
        @Step="onInternalStep"
        :className="classNames?.action"
        :style="styles?.action"
      >
        <template v-if="downHandlerNode">
          <slot name="downHandler">{{ downHandler }}</slot>
        </template>
      </StepHandler>
    </template>

    <template v-if="!!prefixNode">
      <div
        :class="clsx(`${mergedPrefixCls}-prefix`, classNames?.prefix)"
        :style="styles?.prefix"
      >
        <slot name="prefix"> {{ prefix }}</slot>
      </div>
    </template>

    <input
      autocomplete="off"
      role="spinbutton"
      :aria-valuemin="min"
      :aria-valuemax="max"
      :aria-valuenow="
        decimalValue.isInvalidate() ? null : (decimalValue.toString() as any)
      "
      :step="step"
      ref="inputRef"
      :class="clsx(`${mergedPrefixCls}-input`, classNames?.input)"
      :style="styles?.input"
      :value="inputValue"
      @input="onInternalInput"
      :disabled="disabled"
      :readonly="readOnly"
      :placeholder="placeholder"
      @focus="onFocus"
      @blur="onBlur"
      @keydown="onKeyDown"
      @keyup="onKeyUp"
      @compositionstart="onCompositionStart"
      @compositionend="onCompositionEnd"
      @beforeinput="onBeforeInput"
      v-bind="inputAttrs"
    />
    <template v-if="!!suffixNode">
      <div
        :class="clsx(`${mergedPrefixCls}-suffix`, classNames?.suffix)"
        :style="styles?.suffix"
      >
        <slot name="suffix"> {{ suffix }}</slot>
      </div>
    </template>

    <template v-if="mode === 'spinner' && controls">
      <StepHandler
        :prefixCls="mergedPrefixCls"
        action="up"
        :disabled="upDisabled"
        @Step="onInternalStep"
        :className="classNames?.action"
        :style="styles?.action"
      >
        <template v-if="upHandlerNode">
          <slot name="upHandler">{{ upHandler }}</slot>
        </template>
      </StepHandler>
    </template>

    <template v-if="mode === 'input' && controls">
      <div
        :class="clsx(`${mergedPrefixCls}-actions`, classNames?.actions)"
        :style="styles?.actions"
      >
        <StepHandler
          :prefixCls="mergedPrefixCls"
          action="up"
          :disabled="upDisabled"
          @step="onInternalStep"
          :className="classNames?.action"
          :style="styles?.action"
        >
          <template v-if="upHandlerNode">
            <slot name="upHandler">{{ upHandler }}</slot>
          </template>
        </StepHandler>
        <StepHandler
          :prefixCls="mergedPrefixCls"
          action="down"
          :disabled="downDisabled"
          @step="onInternalStep"
          :className="classNames?.action"
          :style="styles?.action"
        >
          <template v-if="downHandlerNode">
            <slot name="downHandler">{{ downHandler }}</slot>
          </template>
        </StepHandler>
      </div>
    </template>
  </div>
</template>
