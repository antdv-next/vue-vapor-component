<script setup vapor lang="ts">
import type { GenerateConfig } from '../../generate'
import type { PanelMode, SharedPanelProps } from '../../interface'
import { clsx } from '@v-c/util'
import { computed } from 'vue'
import {
  formatValue,
  getWeekStartDate,
  isSameDate,
  isSameMonth,
  WEEK_DAY_COUNT,
} from '../../utils/dateUtil'
import { providePanelContext, useInfo, useSharedPanelContext } from '../context'
import PanelBody from '../PanelBody.vue'
import PanelHeader from '../PanelHeader.vue'

export interface DatePanelProps<DateType extends object = any>
  extends SharedPanelProps<DateType> {
  panelName?: PanelMode
  rowClassName?: (date: DateType) => string
  mode?: PanelMode
  cellSelection?: boolean
}

defineOptions({ name: 'DatePanel', inheritAttrs: false })

const props = withDefaults(defineProps<DatePanelProps<any>>(), {
  panelName: 'date',
  mode: 'date',
})

const sharedContext = useSharedPanelContext()
const panelContext = computed(() => {
  const panelMode = props.mode || 'date'
  const [info] = useInfo(props, panelMode, sharedContext)
  return info
})
providePanelContext(panelContext)

// ========================= Render =========================
const panelPrefixCls = computed(() => `${props.prefixCls}-${props.panelName}-panel`)
const isWeek = computed<boolean>(() => props.mode === 'week')

const weekFirstDay = computed(
  () => props.generateConfig?.locale?.getWeekFirstDay?.(props.locale!.locale!) ?? 0,
)

const baseDate = computed(() => {
  const monthStartDate = props.generateConfig?.setDate(props.pickerValue, 1)
  return getWeekStartDate(
    props.locale!.locale,
    props.generateConfig as GenerateConfig<any>,
    monthStartDate,
  )
})

const month = computed(() => props.generateConfig?.getMonth?.(props.pickerValue))

const cellDateFormat = computed(() => {
  const locale = props.locale
  return locale?.cellDateFormat || locale?.dayFormat || 'D'
})
const yearFormat = computed(() => props.locale?.yearFormat || 'YYYY')

// =========================== PrefixColumn ===========================
const showPrefixColumn = computed<boolean>(() =>
  props.showWeek === undefined ? isWeek.value : !!props.showWeek,
)

const prefixColumnText = computed(() =>
  showPrefixColumn.value
    ? (date: any) => props.generateConfig?.locale.getWeek?.(props.locale!.locale, date)
    : undefined,
)

const prefixColumnDisabled = computed(() =>
  showPrefixColumn.value
    ? (date: any) => !!props.disabledDate?.(date, { type: 'week' })
    : undefined,
)

// ========================= Header cells =========================
const weekDaysLocale = computed<string[]>(() => {
  const generateConfig = props.generateConfig
  return (
    props.locale?.shortWeekDays ||
    (generateConfig?.locale?.getShortWeekDays
      ? generateConfig.locale.getShortWeekDays(props.locale!.locale)
      : []) ||
    []
  )
})

const headerCells = computed<string[]>(() => {
  const cells: string[] = []
  for (let i = 0; i < WEEK_DAY_COUNT; i += 1) {
    cells.push(weekDaysLocale.value[(i + weekFirstDay.value) % WEEK_DAY_COUNT])
  }
  return cells
})

const getCellDate = (date: any, offset: number) => props.generateConfig?.addDate?.(date, offset)

const getCellText = (date: any) =>
  formatValue(date, {
    locale: props.locale!,
    format: cellDateFormat.value,
    generateConfig: props.generateConfig!,
  })

const getCellClassName = (date: any) => {
  const nowVal = panelContext.value.now
  return {
    [`${props.prefixCls}-cell-in-view`]: isSameMonth(
      props.generateConfig!,
      date,
      props.pickerValue,
    ),
    [`${props.prefixCls}-cell-today`]: isSameDate(props.generateConfig!, date, nowVal),
  }
}

// ========================= Header =========================
const monthsLocale = computed<string[]>(() => {
  const generateConfig = props.generateConfig
  return (
    props.locale?.shortMonths ||
    (generateConfig?.locale?.getShortMonths
      ? generateConfig.locale.getShortMonths?.(props.locale!.locale) || []
      : [])
  )
})

const yearText = computed(() =>
  formatValue(props.pickerValue, {
    locale: props.locale!,
    format: yearFormat.value,
    generateConfig: props.generateConfig!,
  }),
)

const monthText = computed(() =>
  props.locale?.monthFormat
    ? formatValue(props.pickerValue, {
        locale: props.locale,
        format: props.locale.monthFormat,
        generateConfig: props.generateConfig!,
      })
    : monthsLocale.value[month.value!],
)
</script>

<template>
  <div :class="clsx(panelPrefixCls, showWeek && `${panelPrefixCls}-show-week`)">
    <PanelHeader
      :offset="(distance: number, date: any) => generateConfig?.addMonth?.(date, distance)"
      :super-offset="(distance: number, date: any) => generateConfig?.addYear?.(date, distance)"
      :on-change="onPickerValueChange"
      :get-start="(date: any) => generateConfig?.setDate?.(date, 1)"
      :get-end="
        (date: any) => {
          let clone = generateConfig?.setDate?.(date, 1)
          clone = generateConfig?.addMonth(clone!, 1)
          return generateConfig?.addDate(clone!, -1)
        }
      "
    >
      <template v-if="locale?.monthBeforeYear">
        <button
          type="button"
          tabindex="-1"
          :aria-label="locale?.monthSelect"
          :class="`${prefixCls}-month-btn`"
          @click="onModeChange('month', pickerValue)"
        >
          {{ monthText }}
        </button>
        <button
          type="button"
          tabindex="-1"
          :aria-label="locale?.yearSelect"
          :class="`${prefixCls}-year-btn`"
          @click="onModeChange('year', pickerValue)"
        >
          {{ yearText }}
        </button>
      </template>
      <template v-else>
        <button
          type="button"
          tabindex="-1"
          :aria-label="locale?.yearSelect"
          :class="`${prefixCls}-year-btn`"
          @click="onModeChange('year', pickerValue)"
        >
          {{ yearText }}
        </button>
        <button
          type="button"
          tabindex="-1"
          :aria-label="locale?.monthSelect"
          :class="`${prefixCls}-month-btn`"
          @click="onModeChange('month', pickerValue)"
        >
          {{ monthText }}
        </button>
      </template>
    </PanelHeader>

    <PanelBody
      :row-num="6"
      :col-num="WEEK_DAY_COUNT"
      :base-date="baseDate"
      :title-format="locale?.fieldDateFormat"
      :get-cell-date="getCellDate"
      :get-cell-text="getCellText"
      :get-cell-class-name="getCellClassName"
      :disabled-date="disabledDate"
      :header-cells="headerCells"
      :header-hidden-label="locale?.week"
      :prefix-column-text="prefixColumnText"
      :prefix-column-disabled="prefixColumnDisabled"
      :row-class-name="rowClassName"
      :cell-selection="!isWeek"
    />
  </div>
</template>
