<script setup vapor lang="ts">
import type { DisabledDate, SharedPanelProps } from '../../interface'
import { computed } from 'vue'
import { formatValue, isInRange, isSameDecade } from '../../utils/dateUtil'
import { providePanelContext, useInfo, useSharedPanelContext } from '../context'
import PanelBody from '../PanelBody.vue'
import PanelHeader from '../PanelHeader.vue'

defineOptions({ name: 'DecadePanel', inheritAttrs: false })

const props = defineProps<SharedPanelProps<any>>()

const sharedContext = useSharedPanelContext()
const panelContext = computed(() => {
  const [info] = useInfo(props, 'decade', sharedContext)
  return info
})
providePanelContext(panelContext)

// ========================= Render =========================
// `generateConfig` is optional on `SharedPanelProps` (it falls back to the
// picker context higher up) but every panel method below requires it, so
// narrow once and reuse. Exposed to the template too — the `superOffset`
// arrow needs it.
const generateConfig = computed(() => props.generateConfig!)

const panelPrefixCls = computed(() => `${props.prefixCls}-decade-panel`)
const cellYearFormat = computed(() => props.locale?.cellYearFormat || 'YYYY')
const yearFormat = computed(() => props.locale?.yearFormat || 'YYYY')

const getStartYear = (date: any) => {
  const startYear = Math.floor(generateConfig.value.getYear(date) / 100) * 100
  return generateConfig.value.setYear(date, startYear)
}

const getEndYear = (date: any) => {
  const startYear = getStartYear(date)
  return generateConfig.value.addYear(startYear, 99)
}

const startYearDate = computed(() => getStartYear(props.pickerValue))
const endYearDate = computed(() => getEndYear(props.pickerValue))

const baseDate = computed(() => generateConfig.value.addYear(startYearDate.value, -10))

const getCellDate = (date: any, offset: number) =>
  generateConfig.value.addYear(date, offset * 10)

const getCellText = (date: any) => {
  const startYearStr = formatValue(date, {
    locale: props.locale!,
    format: cellYearFormat.value,
    generateConfig: generateConfig.value,
  })
  const endYearStr = formatValue(generateConfig.value.addYear(date, 9), {
    locale: props.locale!,
    format: cellYearFormat.value,
    generateConfig: generateConfig.value,
  })
  return `${startYearStr}-${endYearStr}`
}

const getCellClassName = (date: any) => ({
  [`${props.prefixCls}-cell-in-view`]:
    isSameDecade(generateConfig.value, date, startYearDate.value)
    || isSameDecade(generateConfig.value, date, endYearDate.value)
    || isInRange(generateConfig.value, startYearDate.value, endYearDate.value, date),
})

const mergedDisabledDate = computed<DisabledDate<any> | undefined>(() =>
  props.disabledDate
    ? (currentDate: any, disabledInfo: any) => {
        const gc = generateConfig.value
        const baseStartDate = gc.setDate(currentDate, 1)
        const baseStartMonth = gc.setMonth(baseStartDate, 0)
        const baseStartYear = gc.setYear(
          baseStartMonth,
          Math.floor(gc.getYear(baseStartMonth) / 10) * 10,
        )
        const baseEndYear = gc.addYear(baseStartYear, 10)
        const baseEndDate = gc.addDate(baseEndYear, -1)
        return (
          props.disabledDate!(baseStartYear, disabledInfo) &&
          props.disabledDate!(baseEndDate, disabledInfo)
        )
      }
    : undefined,
)

const yearText = computed(() => {
  const start = formatValue(startYearDate.value, {
    locale: props.locale!,
    format: yearFormat.value,
    generateConfig: generateConfig.value,
  })
  const end = formatValue(endYearDate.value, {
    locale: props.locale!,
    format: yearFormat.value,
    generateConfig: generateConfig.value,
  })
  return `${start}-${end}`
})
</script>

<template>
  <div :class="panelPrefixCls">
    <PanelHeader
      :super-offset="(distance: number, date: any) => generateConfig.addYear(date, distance * 100)"
      :on-change="onPickerValueChange"
      :get-start="getStartYear"
      :get-end="getEndYear"
    >
      {{ yearText }}
    </PanelHeader>

    <PanelBody
      :row-num="4"
      :col-num="3"
      :base-date="baseDate"
      :get-cell-date="getCellDate"
      :get-cell-text="getCellText"
      :get-cell-class-name="getCellClassName"
      :disabled-date="mergedDisabledDate"
    />
  </div>
</template>
