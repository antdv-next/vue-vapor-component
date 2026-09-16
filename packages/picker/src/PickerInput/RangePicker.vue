<script setup vapor lang="ts">
  import type { ComputedRef } from 'vue'

  import type {
    BaseInfo,
    InternalMode,
    OpenConfig,
    PanelMode,
    RangeTimeProps,
    SelectorProps,
  } from '../interface'
  import type { RangeValueChangeSource } from './hooks/useRangeValueChange'
  import type { RangePickerProps, RangeValueType } from './interface'
  import type { PopupShowTimeConfig } from './Popup/interface'

  import { clsx, warning } from '@v-c/util'
  import omit from '@v-c/util/dist/omit'
  import pickAttrs from '@v-c/util/dist/pickAttrs'
  import { computed, nextTick, ref, useTemplateRef, watch } from 'vue'

  import useSemantic from '../hooks/useSemantic'
  import PickerTrigger from '../PickerTrigger/index.vue'
  import { pickTriggerProps } from '../PickerTrigger/util'
  import {
    cloneProps,
    fillIndex,
    getFromDate,
    toArray,
  } from '../utils/miscUtil'
  import { formatValues as formatValuesByValueFormat } from '../utils/valueUtil'
  import { providePickerContext } from './context'
  import useCellRender from './hooks/useCellRender'
  import useFieldsInvalidate from './hooks/useFieldsInvalidate'
  import useFilledProps from './hooks/useFilledProps'
  import useFocusEvents, { isTargetInContainers } from './hooks/useFocusEvents'
  import useFocusLock from './hooks/useFocusLock'
  import useOpen from './hooks/useOpen'
  import usePresets from './hooks/usePresets'
  import useRangeDisabledDate from './hooks/useRangeDisabledDate'
  import useRangePickerValue from './hooks/useRangePickerValue'
  import useRangeValue, { useInnerValue } from './hooks/useRangeValue'
  import useRangeValueChange from './hooks/useRangeValueChange'
  import useShowNow from './hooks/useShowNow'
  import Popup from './Popup/index.vue'
  import RangeSelector from './Selector/RangeSelector.vue'

  /** Split a single-or-pair config into a normalized `[start, end]` pair. */
  function separateConfig<T>(
    config: T | [T, T] | null | undefined,
    defaultConfig: T,
  ): [T, T] {
    const singleConfig = config ?? defaultConfig

    if (Array.isArray(singleConfig)) {
      return singleConfig as [T, T]
    }

    return [singleConfig, singleConfig]
  }

  function getActiveRange(activeIndex: number): 'start' | 'end' {
    return activeIndex === 1 ? 'end' : 'start'
  }

  defineOptions({ name: 'VcRangePicker', inheritAttrs: false })

  // `order` defaults to `true`. Vapor coerces an absent boolean prop to `false`
  // (skill rule 7), so the default has to come from the runtime props definition
  // instead of the `?? true` fallback in `useFilledProps`.
  // `order` 默认 `true`。vapor 会把缺省的布尔 prop 强制成 `false`（规则 7），
  // 因此默认值必须写在运行时 props 定义里，而不是靠 `?? true` 回退。
  const props = withDefaults(defineProps<RangePickerProps>(), { order: true })

  // ========================= Prop =========================
  const [
    filledProps,
    internalPicker,
    complexPicker,
    formatList,
    maskFormat,
    isInvalidateDate,
  ] = useFilledProps<
    RangePickerProps,
    any,
    { disabled: [boolean, boolean]; allowEmpty: [boolean, boolean] }
  >(computed(() => props) as any, () => {
    const mergedDisabled = separateConfig(props.disabled, false)
    const mergedAllowEmpty = separateConfig(props.allowEmpty, false)
    return {
      disabled: mergedDisabled,
      allowEmpty: mergedAllowEmpty,
    }
  })

  const fp = computed(() => filledProps.value)
  const prefixCls = computed(() => fp.value.prefixCls)
  const rootClassName = computed(() => fp.value.rootClassName)
  const styles = computed(() => fp.value.styles)
  const classNames = computed(() => fp.value.classNames)
  const previewValue = computed(() => fp.value.previewValue)
  const defaultValue = computed(() => fp.value.defaultValue)
  const value = computed(() => fp.value.value)
  const needConfirm = computed(() => fp.value.needConfirm)
  const onKeyDown = computed(() => fp.value.onKeyDown)
  const disabled = computed(() => fp.value.disabled)
  const allowEmpty = computed(() => fp.value.allowEmpty)
  const disabledDate = computed(() => fp.value.disabledDate)
  const minDate = computed(() => fp.value.minDate)
  const maxDate = computed(() => fp.value.maxDate)
  const defaultOpen = computed(() => fp.value.defaultOpen)
  const open = computed(() => fp.value.open)
  const onOpenChange = computed(() => fp.value.onOpenChange)
  const locale = computed(() => fp.value.locale)
  const generateConfig = computed(() => fp.value.generateConfig)
  const picker = computed(() => fp.value.picker)
  const showNow = computed(() => fp.value.showNow)
  const showToday = computed(() => fp.value.showToday)
  const showTime = computed(() => fp.value.showTime)
  const mode = computed(() => fp.value.mode)
  const onPanelChange = computed(() => fp.value.onPanelChange)
  const onCalendarChange = computed(() => fp.value.onCalendarChange)
  const onOk = computed(() => fp.value.onOk)
  const valueFormat = computed(() => fp.value.valueFormat)
  const defaultPickerValue = computed(() => fp.value.defaultPickerValue)
  const pickerValue = computed(() => fp.value.pickerValue)
  const onPickerValueChange = computed(() => fp.value.onPickerValueChange)
  const inputReadOnly = computed(() => fp.value.inputReadOnly)
  const suffixIcon = computed(() => fp.value.suffixIcon)
  const onFocus = computed(() => fp.value.onFocus)
  const onBlur = computed(() => fp.value.onBlur)
  const presets = computed(() => fp.value.presets)
  const ranges = computed(() => props.ranges)
  const components = computed(() => fp.value.components)
  const cellRender = computed(() => fp.value.cellRender)
  const dateRender = computed(() => fp.value.dateRender)
  const monthCellRender = computed(() => fp.value.monthCellRender)
  const onClick = computed(() => fp.value.onClick)

  // ========================= Refs =========================
  const selectorRef = useTemplateRef<any>('selector')
  const popupRef = ref<HTMLDivElement>()
  // Vapor unwraps `Ref`s in template expressions, so the callback that mutates
  // `popupRef.value` must be defined in the script, not inlined in the template.
  // vapor 在模板表达式中会解包 `Ref`，因此修改 `popupRef.value` 的回调必须定义
  // 在 script 中，而不能内联在模板里。
  const onPopupContainerRef = (el: HTMLDivElement | undefined) => {
    popupRef.value = el
  }

  defineExpose({
    get nativeElement() {
      return selectorRef.value?.nativeElement
    },
    focus: (options?: FocusOptions & { index?: number }) => {
      selectorRef.value?.focus(options)
    },
    blur: () => {
      selectorRef.value?.blur()
    },
  })

  // ======================= Semantic =======================
  const semanticCtx = useSemantic(classNames, styles)

  // ========================= Open =========================
  const [mergedOpen, setMergeOpen] = useOpen(
    open,
    defaultOpen,
    disabled,
    open => {
      onOpenChange.value?.(open)
    },
  )

  const triggerOpen = (nextOpen: boolean, config?: OpenConfig) => {
    // No need to open if all disabled
    // 全部字段禁用时不需要打开
    if (disabled.value.some(fieldDisabled => !fieldDisabled) || !nextOpen) {
      setMergeOpen(nextOpen, config)
    }
  }

  // ======================== Values ========================
  const toValueByFormat = (dates: any[]) =>
    formatValuesByValueFormat(dates, {
      generateConfig: generateConfig.value,
      locale: locale.value,
      valueFormat: valueFormat.value,
    }) as any

  const onInternalCalendarChange = (
    dates: any[],
    dateStrings: string[],
    info: BaseInfo,
  ) => {
    if (onCalendarChange.value) {
      onCalendarChange.value(toValueByFormat(dates), dateStrings as any, info)
    }
  }

  const onInternalOk = (dates: any[]) => {
    onOk.value?.(toValueByFormat(dates))
  }

  const [
    mergedValue,
    setInnerValue,
    getCalendarValue,
    triggerCalendarChange,
    triggerOk,
  ] = useInnerValue(
    generateConfig,
    locale,
    formatList,
    ref(true), // rangeValue
    ref(false), // order
    defaultValue,
    value,
    onInternalCalendarChange,
    onInternalOk,
  )

  const calendarValue = computed(() => getCalendarValue.value) as ComputedRef<
    RangeValueType<any>
  >

  // ======================== Focus =========================
  const isInternalPickerElement = (element: EventTarget | null) =>
    isTargetInContainers(element, [
      selectorRef.value?.nativeElement,
      popupRef.value,
    ])

  const [focused, onFieldFocus, onFieldBlur] = useFocusEvents(
    isInternalPickerElement,
    (index, event) => {
      onFocus.value?.(event, { range: getActiveRange(index) })
    },
    (index, event) => {
      onBlur.value?.(event, { range: getActiveRange(index) })
    },
    () => {
      triggerOpen(false)
    },
  )

  // ========================= Value =========================
  const [
    /** Trigger `onChange` by check `disabledDate` */
    flushSubmit,
    /** Trigger `onChange` directly without check `disabledDate` */
    triggerSubmitChange,
    /** Reset uncommitted values */
    resetValue,
  ] = useRangeValue<RangeValueType<any>, any>(
    computed(() => ({
      ...fp.value,
      onChange: (dates: any, dateStrings: any) => {
        fp.value.onChange?.(toValueByFormat(dates), dateStrings)
      },
    })) as any,
    mergedValue as ComputedRef<any>,
    setInnerValue,
    () => getCalendarValue.value as any,
    triggerCalendarChange,
    disabled,
    formatList,
    isInvalidateDate,
  )

  const triggerFieldCalendarChange = (index: number, date: any) => {
    triggerCalendarChange(
      fillIndex(getCalendarValue.value as any, index, date) as any,
    )
  }

  const flushFieldSubmit = (index: number, needTriggerChange: boolean) => {
    flushSubmit(index, needTriggerChange)

    if (needTriggerChange) {
      triggerOpen(false, { force: true })
    }
  }

  const enabledFieldCount = computed(
    () => disabled.value.filter(fieldDisabled => !fieldDisabled).length,
  )

  const [
    rangeValueIndex,
    activeIndex,
    forceFocus,
    triggeredFields,
    triggerRangeValueChange,
    resetRangeValueChange,
  ] = useRangeValueChange<any>(
    enabledFieldCount,
    needConfirm as any,
    allowEmpty as any,
    () => getCalendarValue.value as any,
    triggerFieldCalendarChange,
    flushFieldSubmit,
    resetValue,
  )

  // ======================= Focus Lock ======================
  // Vapor has no patch/diff lifecycle, so `onUpdated` never fires and the
  // focus-lock correction the source relied on it for would run zero times. The
  // hook returns the correction and we drive it from the reactive sources that
  // can move DOM focus.
  // vapor 没有 patch/diff 生命周期，`onUpdated` 不会触发，源项目靠它运行的焦点
  // 锁定校正将完全不执行。这里改为由可能移动焦点的响应式来源显式驱动。
  const lockFocus = useFocusLock(
    rangeValueIndex,
    forceFocus,
    selectorRef as any,
    popupRef,
    triggerOpen,
  )

  watch(
    [mergedOpen, rangeValueIndex, activeIndex, focused, calendarValue],
    () => lockFocus(),
    { flush: 'post' },
  )

  // Finalize the current interaction only after the popup is actually closed.
  // 仅在 popup 实际关闭后，统一收口当前交互。
  watch(mergedOpen, open => {
    if (!open) {
      triggerRangeValueChange(
        rangeValueIndex.value ?? activeIndex.value,
        'popupClose',
      )
    }
  })

  // ======================= ShowTime =======================
  /** Used for Popup panel */
  const mergedShowTime = computed<
    PopupShowTimeConfig<any> & Pick<RangeTimeProps<any>, 'defaultOpenValue'>
  >(() => {
    if (!showTime.value) {
      return null as any
    }

    const { disabledTime } = showTime.value as any

    const proxyDisabledTime = disabledTime
      ? (date: any) => {
          const range = getActiveRange(activeIndex.value)
          const fromDate = getFromDate(
            calendarValue.value,
            triggeredFields.value,
            activeIndex.value,
          )
          return disabledTime(date, range, { from: fromDate })
        }
      : undefined

    return { ...showTime.value, disabledTime: proxyDisabledTime }
  })

  // ========================= Mode =========================
  const internalModes = ref<[PanelMode, PanelMode]>([
    picker.value,
    picker.value,
  ] as any)
  const modes = computed(
    () =>
      (mode.value ? mode.value : internalModes.value) as [PanelMode, PanelMode],
  )
  const setModes = (val: [PanelMode, PanelMode]) => {
    if (mode.value === undefined) {
      internalModes.value = val
    }
  }

  const mergedMode = computed(
    () => modes.value[activeIndex.value] || picker.value,
  )

  /** Extends from `mergedMode` to patch `datetime` mode */
  const internalMode = computed<InternalMode>(() =>
    mergedMode.value === 'date' && mergedShowTime.value
      ? 'datetime'
      : (mergedMode.value as any),
  )

  // ====================== PanelCount ======================
  const multiplePanel = computed(
    () => internalMode.value === picker.value && internalMode.value !== 'time',
  )

  // ======================= Show Now =======================
  const mergedShowNow = useShowNow(
    picker as any,
    mergedMode as any,
    showNow,
    showToday,
    ref(true),
  )

  // ===================== DisabledDate =====================
  const mergedDisabledDate = useRangeDisabledDate(
    calendarValue as any,
    disabled,
    activeIndex,
    triggeredFields,
    generateConfig,
    locale,
    disabledDate,
  )

  // ======================= Validate =======================
  const [submitInvalidates, onSelectorInvalid] = useFieldsInvalidate(
    calendarValue,
    isInvalidateDate,
    allowEmpty,
  )

  // ===================== Picker Value =====================
  const [currentPickerValue, setCurrentPickerValue] = useRangePickerValue(
    generateConfig,
    locale,
    calendarValue,
    modes as any,
    mergedOpen,
    focused,
    activeIndex,
    internalPicker,
    multiplePanel,
    defaultPickerValue,
    pickerValue,
    computed(() => mergedShowTime.value?.defaultOpenValue as any),
    onPickerValueChange,
    minDate,
    maxDate,
  )

  // >>> Mode need wait for `pickerValue`
  const triggerModeChange = (
    nextPickerValue: any,
    nextMode: PanelMode,
    triggerEvent?: boolean,
  ) => {
    const clone = fillIndex(modes.value, activeIndex.value, nextMode) as [
      PanelMode,
      PanelMode,
    ]

    if (clone[0] !== modes.value[0] || clone[1] !== modes.value[1]) {
      setModes(clone)
    }

    // Compatible with `onPanelChange`
    if (onPanelChange.value && triggerEvent !== false) {
      const clonePickerValue = [...calendarValue.value] as RangeValueType<any>
      if (nextPickerValue) {
        clonePickerValue[activeIndex.value] = nextPickerValue
      }
      onPanelChange.value(clonePickerValue as any, clone)
    }
  }

  // ======================== Change ========================
  const fillCalendarValue = (date: any, index: number) =>
    // Trigger change only when date changed
    fillIndex(calendarValue.value, index, date) as RangeValueType<any>

  // ======================== Submit ========================
  /**
   * Trigger by confirm operation.
   * This function has already handle the `needConfirm` check logic.
   * - Selector: enter key
   * - Panel: OK button
   */
  const triggerPartConfirm = (
    date?: any,
    source: RangeValueChangeSource = 'confirm',
  ) => {
    triggerRangeValueChange(activeIndex.value, source, date ?? undefined)
  }

  // ======================== Click =========================
  const onSelectorClick = (event: MouseEvent) => {
    const rootNode = (event.target as HTMLElement).getRootNode()
    if (
      !selectorRef.value?.nativeElement?.contains(
        ((rootNode as Document | ShadowRoot).activeElement ??
          document.activeElement) as Node,
      )
    ) {
      // Click to focus the enabled input
      const enabledIndex = disabled.value.findIndex(d => !d)
      if (enabledIndex >= 0) {
        selectorRef.value?.focus({ index: enabledIndex })
      }
    }

    // Delay to trigger `onPopupClose` after `triggerOpen`
    nextTick(() => {
      triggerOpen(true)

      onClick.value?.(event as any)
    })
  }

  const onSelectorClear = () => {
    resetRangeValueChange()
    triggerSubmitChange(null as any)
    triggerOpen(false, { force: true })
    fp.value.onClear?.()
  }

  // ======================== Hover =========================
  const hoverSource = ref<'cell' | 'preset' | null>(null)
  const internalHoverValues = ref<RangeValueType<any> | null>(null)

  const hoverValues = computed(() => {
    return internalHoverValues.value || calendarValue.value
  })

  // Clean up `internalHoverValues` when closed
  watch(mergedOpen, () => {
    if (!mergedOpen.value) {
      internalHoverValues.value = null
    }
  })

  // ========================================================
  // ==                       Panels                       ==
  // ========================================================
  const activeInfo = ref<
    [activeInputLeft: number, activeInputRight: number, selectorWidth: number]
  >([0, 0, 0])

  const onSetHover = (
    date: RangeValueType<any> | null,
    source: 'cell' | 'preset',
  ) => {
    if (previewValue.value !== 'hover') {
      return
    }
    internalHoverValues.value = date
    hoverSource.value = source
  }

  // ======================= Presets ========================
  const presetList = usePresets(presets, ranges)

  const onPresetHover = (nextValues: RangeValueType<any> | null) => {
    onSetHover(nextValues, 'preset')
  }

  const onPresetSubmit = (nextValues: RangeValueType<any>) => {
    const passed = triggerSubmitChange(nextValues)

    if (passed) {
      triggerOpen(false, { force: true })
    }
  }

  const onNow = (now: any) => {
    triggerPartConfirm(now)
  }

  // ======================== Panel =========================
  const onPanelHover = (date: any) => {
    onSetHover(date ? fillCalendarValue(date, activeIndex.value) : null, 'cell')
  }

  // >>> Focus
  const onPanelFocus = (event: FocusEvent) => {
    triggerOpen(true)
    onFieldFocus(activeIndex.value, 'panel', event)
  }

  // ========================================================
  // ==                      Selector                      ==
  // ========================================================

  // ======================== Change ========================
  const onSelectorChange = (date: any, index: number) => {
    triggerRangeValueChange(index, 'input', date)
  }

  const onSelectorInputChange = () => {
    triggerRangeValueChange(activeIndex.value, 'input')
  }

  const onSelectorBlur: SelectorProps['onBlur'] = (event, index) => {
    onFieldBlur(index!, 'input', event)
  }

  const onSelectorKeyDown: SelectorProps['onKeyDown'] = (
    event,
    preventDefault,
  ) => {
    if (event.key === 'Tab') {
      triggerPartConfirm(null, 'keyboard-submit-weak')
    } else if (event.key === 'Escape') {
      triggerRangeValueChange(activeIndex.value, 'esc')
      triggerOpen(false)
    }

    onKeyDown.value?.(event, preventDefault)
  }

  // >>> Calendar
  const onPanelSelect = (date: any) => {
    const panelFinished =
      !complexPicker.value && internalPicker.value === internalMode.value

    triggerRangeValueChange(
      activeIndex.value,
      panelFinished ? 'panel-final' : 'panel-intermediate',
      date,
    )
  }

  // >>> Close
  const onPopupClose = () => {
    // Close popup
    triggerOpen(false)
  }

  // >>> cellRender
  const onInternalCellRender = useCellRender(
    cellRender,
    dateRender,
    monthCellRender,
    computed(() => getActiveRange(activeIndex.value)),
  )

  // >>> Value
  const panelValue = computed(
    () => calendarValue.value[activeIndex.value] || null,
  )

  // >>> invalid
  const isPopupInvalidateDate = (date: any) => {
    return isInvalidateDate(date, { activeIndex: activeIndex.value })
  }

  const panelProps = computed(() => {
    const domProps = pickAttrs(fp.value, false)
    const restProps = omit(fp.value, [
      ...(Object.keys(domProps) as any[]),
      'onChange',
      'onCalendarChange',
      'onClear',
      'style',
      'className',
      'onPanelChange',
      'disabledTime',
      'classNames',
      'styles',
    ])
    return restProps
  })

  // ======================= Context ========================
  const context = computed(() => {
    const [mergedClassNames, mergedStyles] = semanticCtx.value

    return {
      prefixCls: prefixCls.value,
      locale: locale.value,
      generateConfig: generateConfig.value,
      button: components.value?.button,
      input: components.value?.input,
      classNames: mergedClassNames,
      styles: mergedStyles,
    }
  })

  providePickerContext(context)

  // ======================== Effect ========================
  // >>> Mode
  // Reset for every active
  watch(
    [mergedOpen, activeIndex, picker],
    () => {
      if (mergedOpen.value && activeIndex.value !== undefined) {
        // Legacy compatible. This effect update should not trigger `onPanelChange`
        triggerModeChange(null, picker.value as any, false)
      }
    },
    { flush: 'post' },
  )

  // ======================= Selector =======================
  const onSelectorFocus: SelectorProps['onFocus'] = (event, index) => {
    triggerRangeValueChange(index!, 'field-switch')

    triggerOpen(true, { inherit: true })

    onFieldFocus(index!, 'input', event)
  }

  // ====================== DevWarning ======================
  if (process.env.NODE_ENV !== 'production') {
    const isIndexEmpty = (index: number) => {
      return !value.value?.[index] && !defaultValue.value?.[index]
    }

    if (
      disabled.value.some(
        (fieldDisabled, index) =>
          fieldDisabled && isIndexEmpty(index) && !allowEmpty.value[index],
      )
    ) {
      warning(
        false,
        '`disabled` should not set with empty `value`. You should set `allowEmpty` or `value` instead.',
      )
    }
  }

  // ========================= Render ========================
  const triggerProps = computed(() => pickTriggerProps(fp.value as any))

  const popupStyle = computed(() => styles.value?.popup?.root)

  const popupClassName = computed(() => {
    const [mergedClassNames] = semanticCtx.value
    return clsx(rootClassName.value, mergedClassNames?.popup?.root)
  })

  // `cloneProps` instead of `{...fp.value}` (skill rule 18): a vapor props
  // proxy drops emit-listened `onXxx` keys on spread. `Record<string, any>`
  // keeps the widened keys (`picker` / `locale` / `generateConfig`, …) visible
  // to `v-bind` — TS narrows `{...record, ...literals}` to the literals.
  // 用 `cloneProps` 替代 `{...fp.value}`（规则 18）：vapor 的 props proxy
  // spread 会丢掉 emit 绑定的 `onXxx` key。返回类型放宽为 `Record<string, any>`
  // 以保留从 `cloneProps` 转发的 props（TS 会把 `{...record, ...literals}`
  // 收窄为字面量部分）。
  const rangeSelectorProps = computed<Record<string, any>>(() => {
    const [mergedClassNames, mergedStyles] = semanticCtx.value

    const baseProps = cloneProps(fp.value as any, [
      'autoFocus',
      'autofocus',
      'tabIndex',
      'tabindex',
      'onClick',
      'onMouseDown',
      'onMousedown',
    ])

    return {
      ...baseProps,
      // Style
      class: clsx(
        fp.value.className,
        rootClassName.value,
        mergedClassNames?.root,
      ),
      style: { ...mergedStyles?.root, ...fp.value.style },
      // Icon
      suffixIcon: suffixIcon.value,
      // Active
      activeIndex: focused.value || mergedOpen.value ? activeIndex.value : null,
      activeHelp: !!internalHoverValues.value,
      allHelp: !!internalHoverValues.value && hoverSource.value === 'preset',
      focused: focused.value,
      onFocus: onSelectorFocus,
      onBlur: onSelectorBlur,
      onKeyDown: onSelectorKeyDown,
      onSubmit: () => triggerPartConfirm(null, 'keyboard-submit'),
      value: hoverValues.value,
      maskFormat: maskFormat.value,
      onChange: onSelectorChange,
      onInputChange: onSelectorInputChange,
      format: formatList.value,
      inputReadOnly: inputReadOnly.value,
      // Disabled
      disabled: disabled.value,
      // open
      open: mergedOpen.value,
      onOpenChange: triggerOpen,
      // Click
      onClick: onSelectorClick,
      onClear: onSelectorClear,
      // Invalid
      invalid: submitInvalidates.value,
      onInvalid: onSelectorInvalid,
      // Offset
      onActiveInfo: (info: [number, number, number]) => {
        activeInfo.value = info
      },
    }
  })

  const popupProps = computed(() => {
    const [mergedClassNames, mergedStyles] = semanticCtx.value

    return {
      ...panelProps.value,
      showNow: mergedShowNow.value,
      showTime: mergedShowTime.value,
      range: true,
      multiplePanel: multiplePanel.value,
      activeInfo: activeInfo.value,
      disabledDate: mergedDisabledDate,
      onFocus: onPanelFocus,
      onBlur: (event: FocusEvent) =>
        onFieldBlur(activeIndex.value, 'panel', event),
      picker: picker.value as any,
      mode: mergedMode.value,
      internalMode: internalMode.value,
      onPanelChange: triggerModeChange,
      format: maskFormat.value,
      value: panelValue.value,
      isInvalid: isPopupInvalidateDate,
      onChange: null as any,
      onSelect: onPanelSelect,
      pickerValue: currentPickerValue.value,
      defaultOpenValue: toArray(showTime.value?.defaultOpenValue)[
        activeIndex.value
      ],
      onPickerValueChange: setCurrentPickerValue,
      hoverValue: hoverValues.value,
      onHover: onPanelHover,
      needConfirm: needConfirm.value!,
      onSubmit: (date?: any) => triggerPartConfirm(date, 'confirm'),
      onOk: triggerOk,
      presets: presetList.value,
      onPresetHover,
      onPresetSubmit,
      onNow,
      cellRender: onInternalCellRender,
      classNames: mergedClassNames,
      styles: mergedStyles,
    }
  })
</script>

<template>
  <PickerTrigger
    v-bind="triggerProps"
    :popup-style="popupStyle"
    :popup-class-name="popupClassName"
    :visible="mergedOpen"
    :on-close="onPopupClose"
    :range="true"
  >
    <template #default="{ trigger, setRef }">
      <RangeSelector
        ref="selector"
        :trigger-props="trigger"
        :set-ref="setRef"
        v-bind="rangeSelectorProps"
      >
        <template #suffixIcon>
          <slot name="suffixIcon" />
        </template>
        <template #clearIcon>
          <slot name="clearIcon" />
        </template>
      </RangeSelector>
    </template>
    <template #popup>
      <Popup v-bind="popupProps" :popup-container-ref="onPopupContainerRef">
        <template #extraFooter>
          <slot name="extraFooter">{{ renderExtraFooter }}</slot>
        </template>
      </Popup>
    </template>
  </PickerTrigger>
</template>
