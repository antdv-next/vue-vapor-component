<script setup vapor lang="ts">
  import type { DataDrivenOptionProps, MentionsRef, OptionProps } from './interface'

  import TextArea from '@vapor-component/textarea'
  import { clsx } from '@v-c/util'
  import KeyCode from '@v-c/util/dist/KeyCode'
  import omit from '@v-c/util/dist/omit'
  import { getAttrStyleAndClass } from '@v-c/util/dist/props-util'
  import useId from '@v-c/util/dist/hooks/useId'
  import {
    computed,
    shallowRef,
    useAttrs,
    useTemplateRef,
    watch,
  } from 'vue'

  import KeywordTrigger from './KeywordTrigger.vue'
  import { useMentionsContextProvider } from './MentionsContextKey'
  import useEffectState from './hooks/useEffectState'
  import {
    filterOption as defaultFilterOption,
    validateSearch as defaultValidateSearch,
    getBeforeSelectionText,
    getLastMeasureIndex,
    replaceWithMeasure,
    setInputSelection,
  } from './utils'

  defineOptions({ name: 'InternalMentions', inheritAttrs: false })

  const props = withDefaults(
    defineProps<{
      value?: string
      defaultValue?: string
      prefix?: string | string[]
      prefixCls?: string
      split?: string
      notFoundContent?: any
      silent?: boolean
      rows?: HTMLTextAreaElement['rows']
      id?: string
      disabled?: boolean
      readOnly?: boolean
      placeholder?: string
      maxLength?: number
      autoFocus?: boolean
      classNames?: {
        mentions?: string
        textarea?: string
        popup?: string
      }
      styles?: {
        suffix?: any
        textarea?: any
        popup?: any
      }
      options?: DataDrivenOptionProps[]
      filterOption?: false | ((input: string, option: OptionProps) => boolean)
      validateSearch?: (text: string, split: string) => boolean
      getPopupContainer?: () => HTMLElement
      popupClassName?: string
      placement?: 'top' | 'bottom'
      direction?: 'ltr' | 'rtl'
      transitionName?: string
      hasWrapper?: boolean
      autoSize?: any
      allowClear?: any
      suffix?: any
      addonBefore?: any
      addonAfter?: any
    }>(),
    {
      prefixCls: 'vc-mentions',
      split: ' ',
      notFoundContent: 'Not Found',
      rows: 1,
      hasWrapper: false,
      validateSearch: () => defaultValidateSearch,
      filterOption: () => defaultFilterOption,
    },
  )

  const emit = defineEmits<{
    change: [value: string]
    select: [option: OptionProps, prefix: string]
    search: [text: string, prefix: string]
    focus: [e: FocusEvent]
    blur: [e: FocusEvent]
    keydown: [e: KeyboardEvent]
    keyup: [e: KeyboardEvent]
    'press-enter': [e: KeyboardEvent]
    'popup-scroll': [e: UIEvent]
  }>()

  const attrs = useAttrs()

  const mergedPrefix = computed<string[]>(() => {
    const prefix = props.prefix
    return Array.isArray(prefix) ? prefix : [prefix || '@']
  })

  // =============================== Refs ===============================
  const containerRef = useTemplateRef<HTMLElement>('container')
  const textareaRef = useTemplateRef<{
    resizableTextArea?: { textArea: HTMLTextAreaElement | null }
    textArea?: HTMLTextAreaElement | null
  }>('textarea')
  const measureRef = useTemplateRef<HTMLElement>('measure')

  const getTextArea = () => {
    const rt = textareaRef.value
    return rt?.resizableTextArea?.textArea ?? rt?.textArea ?? null
  }

  defineExpose({
    focus: () => textareaRef.value?.focus?.(),
    blur: () => textareaRef.value?.blur?.(),
    textarea: computed(() => getTextArea()),
    nativeElement: containerRef,
  })

  // ============================== State ===============================
  const measuring = shallowRef(false)
  const measureText = shallowRef('')
  const measurePrefix = shallowRef('')
  const measureLocation = shallowRef(0)
  const activeIndex = shallowRef(0)
  const isFocus = shallowRef(false)

  const setActiveIndex = (index: number) => {
    activeIndex.value = index
  }

  const uniqueKey = useId(props.id)

  // ============================== Value ===============================
  const mergedValue = shallowRef(props.defaultValue ?? props.value ?? '')
  watch(
    () => props.value,
    () => {
      mergedValue.value = props.value ?? ''
    },
    { immediate: true },
  )

  // ============================== Options ===============================
  const getOptions = (targetMeasureText: string): DataDrivenOptionProps[] => {
    const options = props.options || []
    const filterOption = props.filterOption ?? defaultFilterOption

    let list: DataDrivenOptionProps[]
    if (options.length > 0) {
      list = options.map(item => ({
        ...item,
        key: `${item.key ?? item.value}-${uniqueKey}`,
      }))
    } else {
      list = []
    }

    return list.filter((option: OptionProps) => {
      if (filterOption === false) return true
      if (typeof filterOption !== 'function') return true
      return filterOption(targetMeasureText, option)
    })
  }

  const mergedOptions = computed<DataDrivenOptionProps[]>(() =>
    getOptions(measureText.value),
  )

  const getEnabledActiveIndex = (index: number, offset: 1 | -1 = 1): number => {
    const optionLen = mergedOptions.value.length
    if (optionLen === 0) return -1
    for (let i = 0; i < optionLen; i += 1) {
      const current = (index + i * offset + optionLen) % optionLen
      if (!mergedOptions.value[current]?.disabled) {
        return current
      }
    }
    return -1
  }

  // ============================= Measure ==============================
  const onSelectionEffect = useEffectState()

  const startMeasure = (
    nextMeasureText: string,
    nextMeasurePrefix: string,
    nextMeasureLocation: number,
  ) => {
    measuring.value = true
    measureText.value = nextMeasureText
    measurePrefix.value = nextMeasurePrefix
    measureLocation.value = nextMeasureLocation
    activeIndex.value = getEnabledActiveIndex(0)
  }

  const stopMeasure = (callback?: VoidFunction) => {
    measuring.value = false
    measureLocation.value = 0
    measureText.value = ''
    onSelectionEffect(callback)
  }

  const mergedMeasuringInfo = computed(() => {
    return [
      measuring.value,
      measureText.value,
      measurePrefix.value,
      measureLocation.value,
    ] as const
  })
  const mergedMeasuring = computed(() => mergedMeasuringInfo.value[0])
  const mergedMeasureText = computed(() => mergedMeasuringInfo.value[1])
  const mergedMeasurePrefix = computed(() => mergedMeasuringInfo.value[2])
  const mergedMeasureLocation = computed(() => mergedMeasuringInfo.value[3])

  watch([mergedMeasuring, mergedOptions], () => {
    if (!mergedMeasuring.value) return
    const current = mergedOptions.value[activeIndex.value]
    if (!current || current.disabled) {
      const next = getEnabledActiveIndex(0)
      if (next !== activeIndex.value) {
        activeIndex.value = next
      }
    }
  })

  // ============================== Change ==============================
  const triggerChange = (nextValue: string) => {
    mergedValue.value = nextValue
    emit('change', nextValue)
  }

  const onInternalChange = (e: any) => {
    const nextValue = e?.target?.value
    triggerChange(nextValue)
  }

  const selectOption = (option?: OptionProps) => {
    if (!option || option.disabled) return
    const mentionValue = option.value ?? ''
    const textArea = getTextArea()
    if (!textArea) return

    const { text, selectionLocation } = replaceWithMeasure(mergedValue.value, {
      measureLocation: mergedMeasureLocation.value,
      targetText: mentionValue,
      prefix: mergedMeasurePrefix.value,
      selectionStart: textArea.selectionStart,
      split: props.split!,
    })
    triggerChange(text)
    stopMeasure(() => {
      setInputSelection(textArea, selectionLocation)
    })
    emit('select', option, mergedMeasurePrefix.value)
  }

  // ============================= KeyEvent =============================
  const onInternalKeyDown = (event: KeyboardEvent) => {
    emit('keydown', event)
    if (!mergedMeasuring.value) return
    const which = (event as any).which
    if (which === KeyCode.UP || which === KeyCode.DOWN) {
      const optionLen = mergedOptions.value.length
      if (optionLen === 0) {
        event.preventDefault()
        return
      }
      const offset = which === KeyCode.UP ? -1 : 1
      const nextIndex = getEnabledActiveIndex(activeIndex.value + offset, offset)
      if (nextIndex !== -1) {
        activeIndex.value = nextIndex
      }
      event.preventDefault()
    } else if (which === KeyCode.ESC) {
      stopMeasure()
    } else if (which === KeyCode.ENTER) {
      event.preventDefault()
      if (props.silent) return
      if (!mergedOptions.value.length) {
        stopMeasure()
        return
      }
      let currentIndex = activeIndex.value
      let option = mergedOptions.value[currentIndex]
      if (!option || option.disabled) {
        currentIndex = getEnabledActiveIndex(0)
        if (currentIndex === -1) {
          stopMeasure()
          return
        }
        activeIndex.value = currentIndex
        option = mergedOptions.value[currentIndex]
      }
      selectOption(option)
    }
  }

  const onInternalKeyUp = (event: KeyboardEvent) => {
    emit('keyup', event)
    const { key, which } = event as any
    const target = event.target as HTMLTextAreaElement
    const selectionStartText = getBeforeSelectionText(target)
    const { location: measureIndex, prefix: nextMeasurePrefix } = getLastMeasureIndex(
      selectionStartText,
      mergedPrefix.value,
    )

    if ([KeyCode.ESC, KeyCode.UP, KeyCode.DOWN, KeyCode.ENTER].includes(which)) {
      return
    }

    if (measureIndex !== -1) {
      const nextMeasureText = selectionStartText.slice(
        measureIndex + nextMeasurePrefix.length,
      )
      const validateSearchFn =
        typeof props.validateSearch === 'function'
          ? props.validateSearch
          : defaultValidateSearch
      const validateMeasure = validateSearchFn(nextMeasureText, props.split!)
      const matchOption = !!getOptions(nextMeasureText).length

      if (validateMeasure) {
        if (
          key === nextMeasurePrefix
          || key === 'Shift'
          || which === KeyCode.ALT
          || key === 'AltGraph'
          || mergedMeasuring.value
          || (nextMeasureText !== mergedMeasureText.value && matchOption)
        ) {
          startMeasure(nextMeasureText, nextMeasurePrefix, measureIndex)
        }
      } else if (mergedMeasuring.value) {
        stopMeasure()
      }

      if (validateMeasure) {
        emit('search', nextMeasureText, nextMeasurePrefix)
      }
    } else if (mergedMeasuring.value) {
      stopMeasure()
    }
  }

  const onInternalPressEnter = (event: KeyboardEvent) => {
    if (!mergedMeasuring.value) {
      emit('press-enter', event)
    }
  }

  // ============================ Focus Blur ============================
  const focusTimer = shallowRef<number>()

  const onInternalFocus = (event: FocusEvent) => {
    if (focusTimer.value) {
      window.clearTimeout(focusTimer.value)
      focusTimer.value = undefined
    }
    if (!isFocus.value) {
      isFocus.value = true
      emit('focus', event)
    }
  }

  const onInternalBlur = (event: FocusEvent) => {
    focusTimer.value = window.setTimeout(() => {
      isFocus.value = false
      stopMeasure()
      emit('blur', event)
    }, 0)
  }

  const onDropdownFocus = (e: FocusEvent) => {
    onInternalFocus(e)
  }

  const onDropdownBlur = (e: FocusEvent) => {
    onInternalBlur(e)
  }

  const onInternalPopupScroll = (event: UIEvent) => {
    emit('popup-scroll', event)
  }

  // ===================== Measure Scroll Sync =====================
  watch(measuring, () => {
    if (measuring.value && measureRef.value) {
      ;(measureRef.value as any).scrollTop = getTextArea()?.scrollTop
    }
  })

  // ===================== Context =====================
  const contextValue = computed(() => ({
    notFoundContent: props.notFoundContent || 'Not Found',
    activeIndex: activeIndex.value,
    setActiveIndex,
    selectOption,
    onFocus: onDropdownFocus,
    onBlur: onDropdownBlur,
    onScroll: onInternalPopupScroll,
  }))
  useMentionsContextProvider(contextValue)

  // ===================== Forwarded Props =====================
  const forwardedProps = computed(() => {
    const { style: _, class: __, ...safeRestAttrs } = restAttrs
    return {
      ...safeRestAttrs,
      ...omit(props as Record<string, any>, [
        'prefixCls',
        'classNames',
        'styles',
        'prefix',
        'split',
        'notFoundContent',
        'value',
        'defaultValue',
        'silent',
        'validateSearch',
        'filterOption',
        'placement',
        'direction',
        'transitionName',
        'getPopupContainer',
        'popupClassName',
        'rows',
        'options',
        'hasWrapper',
        'suffix',
        'allowClear',
        'addonBefore',
        'addonAfter',
      ] as string[]),
    }
  })

  // ===================== Styles =====================
  const { className, restAttrs, style } = getAttrStyleAndClass(attrs)

  const resizeStyle = computed(() => {
    return (props.styles?.textarea as any)?.resize ?? style?.resize
  })

  const mergedTextareaStyle = computed(() => {
    const s: Record<string, any> = { ...(props.styles?.textarea || {}) }
    if (resizeStyle.value !== undefined) {
      s.resize = resizeStyle.value
    }
    return s
  })

  const mergedStyles = computed(() => ({
    ...(props.styles || {}),
    textarea: mergedTextareaStyle.value,
  }))

  const measureCls = computed(() => `${props.prefixCls}-measure`)
  const popupClassName = computed(() =>
    clsx(props.popupClassName, props.classNames?.popup),
  )

  const valueBefore = computed(() =>
    mergedValue.value.slice(0, mergedMeasureLocation.value),
  )
  const valueAfter = computed(() =>
    mergedValue.value.slice(
      mergedMeasureLocation.value + mergedMeasurePrefix.value.length,
    ),
  )

  const containerCls = computed(() =>
    clsx(props.prefixCls, props.classNames?.mentions, className),
  )
</script>

<template>
  <div
    v-if="!hasWrapper"
    ref="container"
    :class="containerCls"
    :style="style"
  >
    <TextArea
      ref="textarea"
      v-bind="forwardedProps"
      :id="id"
      :prefix-cls="prefixCls"
      :class-names="{textarea: classNames?.textarea}"
      :styles="mergedStyles"
      :value="mergedValue"
      :rows="rows"
      :disabled="disabled"
      :read-only="readOnly"
      :placeholder="placeholder"
      :auto-focus="autoFocus"
      :auto-size="autoSize"
      :max-length="maxLength"
      @change="onInternalChange"
      @keydown="onInternalKeyDown"
      @keyup="onInternalKeyUp"
      @press-enter="onInternalPressEnter"
      @focus="onInternalFocus"
      @blur="onInternalBlur"
    />
    <div
      v-if="mergedMeasuring"
      ref="measure"
      :class="measureCls"
    >
      {{ valueBefore }}
      <KeywordTrigger
        :prefix-cls="prefixCls"
        :transition-name="transitionName"
        :placement="placement"
        :direction="direction"
        :options="mergedOptions"
        :visible="true"
        :get-popup-container="getPopupContainer"
        :popup-class-name="popupClassName"
        :popup-style="styles?.popup"
      >
        <template #default="{ trigger, setRef }">
          <span v-bind="trigger" :ref="setRef">
            {{ mergedMeasurePrefix }}
          </span>
        </template>
      </KeywordTrigger>
      {{ valueAfter }}
    </div>
  </div>
  <template v-else>
    <TextArea
      ref="textarea"
      v-bind="forwardedProps"
      :id="id"
      :prefix-cls="prefixCls"
      :class-names="{textarea: classNames?.textarea}"
      :styles="mergedStyles"
      :value="mergedValue"
      :rows="rows"
      :disabled="disabled"
      :read-only="readOnly"
      :placeholder="placeholder"
      :auto-focus="autoFocus"
      :auto-size="autoSize"
      :max-length="maxLength"
      @change="onInternalChange"
      @keydown="onInternalKeyDown"
      @keyup="onInternalKeyUp"
      @press-enter="onInternalPressEnter"
      @focus="onInternalFocus"
      @blur="onInternalBlur"
    />
    <div
      v-if="mergedMeasuring"
      ref="measure"
      :class="measureCls"
    >
      {{ valueBefore }}
      <KeywordTrigger
        :prefix-cls="prefixCls"
        :transition-name="transitionName"
        :placement="placement"
        :direction="direction"
        :options="mergedOptions"
        :visible="true"
        :get-popup-container="getPopupContainer"
        :popup-class-name="popupClassName"
        :popup-style="styles?.popup"
      >
        <template #default="{ trigger, setRef }">
          <span v-bind="trigger" :ref="setRef">
            {{ mergedMeasurePrefix }}
          </span>
        </template>
      </KeywordTrigger>
      {{ valueAfter }}
    </div>
  </template>
</template>
