<script setup vapor lang="ts">
  import type { DisabledDate, SharedPanelProps } from '../../interface'

  import { computed } from 'vue'

  import { formatValue } from '../../utils/dateUtil'
  import {
    providePanelContext,
    useInfo,
    useSharedPanelContext,
  } from '../context'
  import PanelBody from '../PanelBody.vue'
  import PanelHeader from '../PanelHeader.vue'

  defineOptions({ name: 'MonthPanel', inheritAttrs: false })

  const props = defineProps<SharedPanelProps<any>>()

  const sharedContext = useSharedPanelContext()
  const panelContext = computed(() => {
    const [info] = useInfo(props, 'month', sharedContext)
    return info
  })
  providePanelContext(panelContext)

  // ========================= Render =========================
  // `generateConfig` is optional on `SharedPanelProps` (it falls back to the
  // picker context higher up) but every panel method below requires it, so
  // narrow once and reuse. Exposed to the template too — the `superOffset` /
  // `getStart` / `getEnd` arrows need it.
  const generateConfig = computed(() => props.generateConfig!)

  const panelPrefixCls = computed(() => `${props.prefixCls}-month-panel`)

  const baseDate = computed(() =>
    generateConfig.value.setMonth(props.pickerValue, 0),
  )
  const yearFormat = computed(() => props.locale?.yearFormat || 'YYYY')

  const monthsLocale = computed<string[]>(() => {
    const gc = generateConfig.value
    return (
      props.locale?.shortMonths ||
      (gc.locale.getShortMonths
        ? gc.locale.getShortMonths(props.locale!.locale) || []
        : [])
    )
  })

  const getCellDate = (date: any, offset: number) =>
    generateConfig.value.addMonth(date, offset)

  const getCellText = (date: any) => {
    const month = generateConfig.value.getMonth(date)
    return props.locale?.monthFormat
      ? formatValue(date, {
          locale: props.locale,
          format: props.locale.monthFormat,
          generateConfig: generateConfig.value,
        })
      : monthsLocale.value[month]
  }

  const getCellClassName = () => ({
    [`${props.prefixCls}-cell-in-view`]: true,
  })

  const mergedDisabledDate = computed<DisabledDate<any> | undefined>(() =>
    props.disabledDate
      ? (currentDate: any, disabledInfo: any) => {
          const gc = generateConfig.value
          const startDate = gc.setDate(currentDate, 1)
          const nextMonthStartDate = gc.setMonth(
            startDate,
            gc.getMonth(startDate) + 1,
          )
          const endDate = gc.addDate(nextMonthStartDate, -1)
          return (
            props.disabledDate!(startDate, disabledInfo) &&
            props.disabledDate!(endDate, disabledInfo)
          )
        }
      : undefined,
  )

  const yearText = computed(() =>
    formatValue(props.pickerValue, {
      locale: props.locale!,
      format: yearFormat.value,
      generateConfig: generateConfig.value,
    }),
  )
</script>

<template>
  <div :class="panelPrefixCls">
    <PanelHeader
      :super-offset="
        (distance: number, date: any) => generateConfig.addYear(date, distance)
      "
      :on-change="onPickerValueChange"
      :get-start="(date: any) => generateConfig.setMonth(date, 0)"
      :get-end="(date: any) => generateConfig.setMonth(date, 11)"
    >
      <button
        type="button"
        tabindex="-1"
        :aria-label="locale?.yearSelect"
        :class="`${prefixCls}-year-btn`"
        @click="onModeChange('year')"
      >
        {{ yearText }}
      </button>
    </PanelHeader>

    <PanelBody
      :row-num="4"
      :col-num="3"
      :base-date="baseDate"
      :title-format="locale?.fieldMonthFormat"
      :get-cell-date="getCellDate"
      :get-cell-text="getCellText"
      :get-cell-class-name="getCellClassName"
      :disabled-date="mergedDisabledDate"
    />
  </div>
</template>
