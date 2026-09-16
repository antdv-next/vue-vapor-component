<script setup vapor lang="ts">
  import type { DisabledDate, SharedPanelProps } from '../../interface'

  import { computed } from 'vue'

  import { formatValue, isInRange, isSameYear } from '../../utils/dateUtil'
  import {
    providePanelContext,
    useInfo,
    useSharedPanelContext,
  } from '../context'
  import PanelBody from '../PanelBody.vue'
  import PanelHeader from '../PanelHeader.vue'

  defineOptions({ name: 'YearPanel', inheritAttrs: false })

  const props = defineProps<SharedPanelProps<any>>()

  const sharedContext = useSharedPanelContext()
  const panelContext = computed(() => {
    const [info] = useInfo(props, 'year', sharedContext)
    return info
  })
  providePanelContext(panelContext)

  // ========================= Render =========================
  // `generateConfig` is optional on `SharedPanelProps` (it falls back to the
  // picker context higher up) but every panel method below requires it, so
  // narrow once and reuse. Exposed to the template too — the `superOffset`
  // arrow needs it.
  const generateConfig = computed(() => props.generateConfig!)

  const panelPrefixCls = computed(() => `${props.prefixCls}-year-panel`)
  const cellYearFormat = computed(() => props.locale?.cellYearFormat || 'YYYY')
  const yearFormat = computed(() => props.locale?.yearFormat || 'YYYY')

  const getStartYear = (date: any) => {
    const startYear = Math.floor(generateConfig.value.getYear(date) / 10) * 10
    return generateConfig.value.setYear(date, startYear)
  }

  const getEndYear = (date: any) => {
    const startYear = getStartYear(date)
    return generateConfig.value.addYear(startYear, 9)
  }

  const startYearDate = computed(() => getStartYear(props.pickerValue))
  const endYearDate = computed(() => getEndYear(props.pickerValue))

  const baseDate = computed(() =>
    generateConfig.value.addYear(startYearDate.value, -1),
  )

  const getCellDate = (date: any, offset: number) =>
    generateConfig.value.addYear(date, offset)

  const getCellText = (date: any) =>
    formatValue(date, {
      locale: props.locale!,
      format: cellYearFormat.value,
      generateConfig: generateConfig.value,
    })

  const getCellClassName = (date: any) => ({
    [`${props.prefixCls}-cell-in-view`]:
      isSameYear(generateConfig.value, date, startYearDate.value) ||
      isSameYear(generateConfig.value, date, endYearDate.value) ||
      isInRange(
        generateConfig.value,
        startYearDate.value,
        endYearDate.value,
        date,
      ),
  })

  const mergedDisabledDate = computed<DisabledDate<any> | undefined>(() =>
    props.disabledDate
      ? (currentDate: any, disabledInfo: any) => {
          const gc = generateConfig.value
          const startMonth = gc.setMonth(currentDate, 0)
          const startDate = gc.setDate(startMonth, 1)
          const endMonth = gc.addYear(startDate, 1)
          const endDate = gc.addDate(endMonth, -1)
          return (
            props.disabledDate!(startDate, disabledInfo) &&
            props.disabledDate!(endDate, disabledInfo)
          )
        }
      : undefined,
  )

  const startYearText = computed(() =>
    formatValue(startYearDate.value, {
      locale: props.locale!,
      format: yearFormat.value,
      generateConfig: generateConfig.value,
    }),
  )

  const endYearText = computed(() =>
    formatValue(endYearDate.value, {
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
        (distance: number, date: any) =>
          generateConfig.addYear(date, distance * 10)
      "
      :on-change="onPickerValueChange"
      :get-start="getStartYear"
      :get-end="getEndYear"
    >
      <button
        type="button"
        tabindex="-1"
        :aria-label="locale?.decadeSelect"
        :class="`${prefixCls}-decade-btn`"
        @click="onModeChange('decade')"
      >
        {{ startYearText }}-{{ endYearText }}
      </button>
    </PanelHeader>

    <PanelBody
      :row-num="4"
      :col-num="3"
      :base-date="baseDate"
      :title-format="locale?.fieldYearFormat"
      :get-cell-date="getCellDate"
      :get-cell-text="getCellText"
      :get-cell-class-name="getCellClassName"
      :disabled-date="mergedDisabledDate"
    />
  </div>
</template>
