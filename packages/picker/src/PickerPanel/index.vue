<script setup vapor lang="ts">
  import type { InternalMode, PanelMode } from '../interface'
  import type { PickerPanelProps } from './interface'

  import { clsx, warning } from '@v-c/util'
  import { computed, ref, toRef, useAttrs, useTemplateRef, watch } from 'vue'

  import useLocale from '../hooks/useLocale'
  import { fillShowTimeConfig, getTimeProps } from '../hooks/useTimeConfig'
  import useToggleDates from '../hooks/useToggleDates'
  import defaultLocale from '../locale/en_US'
  import { usePickerContext } from '../PickerInput/context'
  import useCellRender from '../PickerInput/hooks/useCellRender'
  import { isSame } from '../utils/dateUtil'
  import { pickProps, toArray } from '../utils/miscUtil'
  import {
    providePickerHackContext,
    provideSharedPanelContext,
    usePickerHackContext,
  } from './context'
  import DatePanel from './DatePanel/index.vue'
  import DateTimePanel from './DateTimePanel/index.vue'
  import DecadePanel from './DecadePanel/index.vue'
  import MonthPanel from './MonthPanel/index.vue'
  import QuarterPanel from './QuarterPanel/index.vue'
  import TimePanel from './TimePanel/index.vue'
  import WeekPanel from './WeekPanel/index.vue'
  import YearPanel from './YearPanel/index.vue'

  defineOptions({ name: 'PickerPanel', inheritAttrs: false })

  const props = defineProps<PickerPanelProps<any>>()
  const attrs = useAttrs()

  // ========================= Setup =========================
  const pickerContext = usePickerContext()
  const rootRef = useTemplateRef<HTMLDivElement>('root')

  const mergedPrefixCls = computed(
    () => pickerContext.value.prefixCls || props.prefixCls || 'vc-picker',
  )
  const mergedGenerateConfig = computed(
    () => props.generateConfig || pickerContext.value.generateConfig,
  )
  const mergedLocale = computed(
    () => props.locale || pickerContext.value.locale || defaultLocale,
  )

  // ========================= Time =========================
  const timePropsInfo = computed(() =>
    getTimeProps({
      ...props,
      locale: mergedLocale.value,
      format: undefined,
      picker: props.picker,
    }),
  )

  const localeTimeProps = computed(() => timePropsInfo.value[1])
  const showTimeFormat = computed(() => timePropsInfo.value[2])
  const propFormat = computed(() => timePropsInfo.value[3])
  const timeProps = computed(() => timePropsInfo.value[0])

  const filledLocale = useLocale(mergedLocale, localeTimeProps)

  const internalPicker = computed<InternalMode>(() => {
    if (props.picker === 'date' && props.showTime) return 'datetime'
    return props.picker || 'date'
  })

  const mergedShowTime = computed(() =>
    fillShowTimeConfig(
      internalPicker.value,
      showTimeFormat.value,
      propFormat.value,
      timeProps.value,
      filledLocale.value,
    ),
  )

  const now = computed(() => mergedGenerateConfig.value?.getNow?.())

  // ========================= Mode =========================
  const internalModeState = ref<PanelMode>(props.picker || 'date')
  const mergedMode = computed(() => props.mode || internalModeState.value)
  const setMergedMode = (m: PanelMode) => {
    internalModeState.value = m
  }

  const internalMode = computed(() =>
    mergedMode.value === 'date' && mergedShowTime.value
      ? 'datetime'
      : mergedMode.value,
  )

  // ========================= Toggle =========================
  const toggleDates = useToggleDates(
    mergedGenerateConfig as any,
    filledLocale,
    internalPicker,
  )

  // ========================= Value =========================
  const internalValueState = ref<any>(props.defaultValue)
  const innerValue = computed(() =>
    props.value !== undefined ? props.value : internalValueState.value,
  )
  const setMergedValue = (val: any) => {
    internalValueState.value = val
  }

  const mergedValue = computed(() => {
    const vals = toArray(innerValue.value).filter(val => val)
    return props.multiple ? vals : vals.slice(0, 1)
  })

  const triggerChange = (nextValue: any[] | null) => {
    setMergedValue(nextValue)

    if (
      props.onChange &&
      (nextValue === null ||
        mergedValue.value.length !== nextValue.length ||
        mergedValue.value.some(
          (ori, index) =>
            !isSame(
              mergedGenerateConfig.value,
              filledLocale.value,
              ori,
              nextValue[index],
              internalPicker.value,
            ),
        ))
    ) {
      props.onChange(props.multiple ? nextValue : nextValue?.[0])
    }
  }

  const onInternalSelect = (newDate: any) => {
    props.onSelect?.(newDate)

    if (mergedMode.value === props.picker) {
      const nextValues = props.multiple
        ? toggleDates(mergedValue.value, newDate)
        : [newDate]
      triggerChange(nextValues)
    }
  }

  // ===================== PickerValue ======================
  const internalPickerValueState = ref(
    props.defaultPickerValue || mergedValue.value[0] || now.value,
  )
  const mergedPickerValue = computed(() =>
    props.pickerValue !== undefined
      ? props.pickerValue
      : internalPickerValueState.value,
  )
  const setInternalPickerValue = (val: any) => {
    internalPickerValueState.value = val
  }

  watch(
    () => mergedValue.value[0],
    val => {
      if (val && props.pickerValue === undefined) {
        setInternalPickerValue(val)
      }
    },
  )

  const triggerPanelChange = (viewDate?: any, nextMode?: PanelMode) => {
    props.onPanelChange?.(
      viewDate || mergedPickerValue.value,
      nextMode || mergedMode.value,
    )
  }

  const setPickerValue = (nextPickerValue: any, triggerPanelEvent = false) => {
    setInternalPickerValue(nextPickerValue)
    props.onPickerValueChange?.(nextPickerValue)
    if (triggerPanelEvent) triggerPanelChange(nextPickerValue)
  }

  const triggerModeChange = (nextMode: PanelMode, viewDate?: any) => {
    setMergedMode(nextMode)
    if (viewDate) setPickerValue(viewDate)
    triggerPanelChange(viewDate, nextMode)
  }

  const onPanelValueSelect = (nextValue: any) => {
    onInternalSelect(nextValue)
    setPickerValue(nextValue)

    if (mergedMode.value !== props.picker) {
      const decadeYearQueue: PanelMode[] = ['decade', 'year']
      const decadeYearMonthQueue: PanelMode[] = [...decadeYearQueue, 'month']

      const pickerQueue: Partial<Record<string, PanelMode[]>> = {
        quarter: [...decadeYearQueue, 'quarter'],
        week: [...decadeYearMonthQueue, 'week'],
        date: [...decadeYearMonthQueue, 'date'],
      }

      const queue = pickerQueue[props.picker || 'date'] || decadeYearMonthQueue
      const index = queue.indexOf(mergedMode.value)
      const nextMode = queue[index + 1]

      if (nextMode) triggerModeChange(nextMode, nextValue)
    }
  }

  // ========================= Hover Date =========================
  const hoverRangeDate = computed(() => {
    let start: any
    let end: any

    if (Array.isArray(props.hoverRangeValue)) {
      ;[start, end] = props.hoverRangeValue
    } else {
      start = props.hoverRangeValue
    }

    if (!start && !end) return null

    start = start || end
    end = end || start

    return mergedGenerateConfig.value.isAfter(start, end)
      ? [end, start]
      : [start, end]
  })

  // ========================= CellRender =========================
  const onInternalCellRender = useCellRender(
    toRef(props, 'cellRender'),
    toRef(props, 'dateRender') as any,
    toRef(props, 'monthCellRender') as any,
  )

  // ========================= Shared Context =========================
  // Rule 11: getter object + `computed(() => reactiveObj)` so vapor recomputes.
  const sharedPanelContext = computed(() => ({
    classNames: pickerContext.value.classNames?.popup ?? props.classNames ?? {},
    styles: pickerContext.value.styles?.popup ?? props.styles ?? {},
  }))
  provideSharedPanelContext(sharedPanelContext)

  const parentHackContext = usePickerHackContext()
  const pickerPanelContext = computed(() => ({
    ...(parentHackContext?.value || {}),
    hideHeader: props.hideHeader,
  }))
  providePickerHackContext(pickerPanelContext)

  if (process.env.NODE_ENV !== 'production') {
    warning(
      !mergedValue.value ||
        mergedValue.value.every(val =>
          mergedGenerateConfig.value.isValidate(val),
        ),
      'Invalidate date pass to `value` or `defaultValue`.',
    )
  }

  // ========================= Render =========================
  const DefaultComponents: Record<string, any> = {
    date: DatePanel,
    datetime: DateTimePanel,
    week: WeekPanel,
    month: MonthPanel,
    quarter: QuarterPanel,
    year: YearPanel,
    decade: DecadePanel,
    time: TimePanel,
  }

  const panelComponent = computed(
    () =>
      (props.components?.[internalMode.value] as any) ||
      DefaultComponents[internalMode.value] ||
      DatePanel,
  )

  const panelCls = computed(() => `${mergedPrefixCls.value}-panel`)

  const nodeCls = computed(() =>
    clsx(panelCls.value, {
      [`${panelCls.value}-rtl`]: props.direction === 'rtl',
    }),
  )

  // Rule 15: wrap in `computed` so the template binding stays reactive.
  const panelProps = computed(() =>
    pickProps(props, [
      'showWeek',
      'prevIcon',
      'nextIcon',
      'superPrevIcon',
      'superNextIcon',
      'disabledDate',
      'minDate',
      'maxDate',
      'onHover',
    ]),
  )

  defineExpose({
    nativeElement: rootRef,
  })
</script>

<template>
  <div ref="root" :tabindex="tabindex" :class="nodeCls" v-bind="attrs">
    <component
      :is="panelComponent"
      v-bind="panelProps"
      :show-time="mergedShowTime"
      :prefix-cls="mergedPrefixCls"
      :locale="filledLocale"
      :generate-config="mergedGenerateConfig"
      :on-mode-change="triggerModeChange"
      :picker-value="mergedPickerValue"
      :on-picker-value-change="
        (nextPickerValue: any) => setPickerValue(nextPickerValue, true)
      "
      :value="mergedValue[0]"
      :on-select="onPanelValueSelect"
      :values="mergedValue"
      :cell-render="onInternalCellRender"
      :hover-range-value="hoverRangeDate"
      :hover-value="hoverValue"
    />
  </div>
</template>
