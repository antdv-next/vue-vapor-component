<script setup vapor lang="ts">
  import type { SharedTimeProps } from '../../../interface'

  import { clsx } from '@v-c/util'
  import { computed } from 'vue'

  import useTimeInfo, { type Unit } from '../../../hooks/useTimeInfo'
  import { formatValue } from '../../../utils/dateUtil'
  import { usePanelContext, usePickerHackContext } from '../../context'
  import TimeColumn from './TimeColumn.vue'

  defineOptions({ name: 'TimePanelBody', inheritAttrs: false })

  const props = defineProps<SharedTimeProps<any>>()

  const context = usePanelContext()!
  const pickerHackContext = usePickerHackContext()

  function isAM(hour: number) {
    return hour < 12
  }

  // ========================= Hook =========================
  const value = computed(() => context.value.values?.[0] || null)
  const generateConfig = computed(() => context.value.generateConfig!)

  const [
    getValidTime,
    rowHourUnits,
    getMinuteUnits,
    getSecondUnits,
    getMillisecondUnits,
  ] = useTimeInfo(
    generateConfig,
    computed(() => props as any),
    value,
  )

  const getUnitValue = (
    func: 'getHour' | 'getMinute' | 'getSecond' | 'getMillisecond',
  ) => {
    const val = value.value
    const pickerVal = context.value.pickerValue
    const valueUnitVal = val && generateConfig.value[func](val)
    const pickerUnitValue = pickerVal && generateConfig.value[func](pickerVal)
    return [valueUnitVal, pickerUnitValue] as const
  }

  const getEnabled = (
    units: Unit<number>[],
    val: number | null | undefined,
  ) => {
    const enabledUnits = units.filter(unit => !unit.disabled)
    return val ?? enabledUnits?.[0]?.value
  }

  // ======================== Render ========================
  const ctx = computed(() => context.value)

  const prefixCls = computed(() => ctx.value.prefixCls)
  const panelClassNames = computed(() => ctx.value.classNames)
  const styles = computed(() => ctx.value.styles)
  const locale = computed(() => ctx.value.locale)
  const onSelect = computed(() => ctx.value.onSelect)
  const onHover = computed(() => ctx.value.onHover)

  const showHour = computed(() => props.showHour)
  const showMinute = computed(() => props.showMinute)
  const showSecond = computed(() => props.showSecond)
  const showMillisecond = computed(() => props.showMillisecond)
  const showMeridiem = computed(() => props.use12Hours)
  const changeOnScroll = computed(() => props.changeOnScroll)

  const onCellDblClick = computed(
    () => pickerHackContext?.value?.onCellDblClick,
  )

  const contentCls = computed(() =>
    clsx(`${prefixCls.value}-content`, panelClassNames.value?.content),
  )

  const hourValue = computed(() => getUnitValue('getHour'))
  const minuteValue = computed(() => getUnitValue('getMinute'))
  const secondValue = computed(() => getUnitValue('getSecond'))
  const millisecondValue = computed(() => getUnitValue('getMillisecond'))

  const hour = computed(() => hourValue.value[0])
  const pickerHour = computed(() => hourValue.value[1])
  const minute = computed(() => minuteValue.value[0])
  const pickerMinute = computed(() => minuteValue.value[1])
  const second = computed(() => secondValue.value[0])
  const pickerSecond = computed(() => secondValue.value[1])
  const millisecond = computed(() => millisecondValue.value[0])
  const pickerMillisecond = computed(() => millisecondValue.value[1])

  const meridiem = computed<string | null>(() => {
    const h = hour.value
    if (h === null) return null
    return isAM(h as number) ? 'am' : 'pm'
  })

  // Hours
  const hourUnits = computed(() => {
    if (!showMeridiem.value) return rowHourUnits.value
    const h = hour.value as number
    return isAM(h)
      ? rowHourUnits.value.filter(u => isAM(u.value as number))
      : rowHourUnits.value.filter(u => !isAM(u.value as number))
  })

  // Minutes
  const validHour = computed(() =>
    getEnabled(rowHourUnits.value, hour.value as number),
  )
  const minuteUnits = computed(() => getMinuteUnits(validHour.value))

  // Seconds
  const validMinute = computed(() =>
    getEnabled(minuteUnits.value, minute.value as number),
  )
  const secondUnits = computed(() =>
    getSecondUnits(validHour.value, validMinute.value),
  )

  // Milliseconds
  const validSecond = computed(() =>
    getEnabled(secondUnits.value, second.value as number),
  )
  const millisecondUnits = computed(() =>
    getMillisecondUnits(validHour.value, validMinute.value, validSecond.value),
  )

  const validMillisecond = computed(() =>
    getEnabled(millisecondUnits.value, millisecond.value as number),
  )

  // Meridiem
  const meridiemUnits = computed<Unit<string>[]>(() => {
    if (!showMeridiem.value) return []
    const gc = generateConfig.value
    const base = gc.getNow()
    const amDate = gc.setHour(base, 9)
    const pmDate = gc.setHour(base, 15)

    const formatMeridiem = (date: any, defaultLabel: string): string => {
      const { cellMeridiemFormat } = locale.value ?? {}
      // `formatValue` may return `null` for an unparseable date, so fall back to
      // the literal `AM` / `PM` label to keep `Unit<string>.label` a `string`.
      // `formatValue` 在日期无法解析时可能返回 `null`，这里回退到字面量
      // `AM` / `PM`，以保证 `Unit<string>.label` 始终为 `string`。
      return (
        (cellMeridiemFormat
          ? formatValue(date, {
              generateConfig: gc,
              locale: locale.value!,
              format: cellMeridiemFormat,
            })
          : defaultLabel) || defaultLabel
      )
    }

    return [
      {
        label: formatMeridiem(amDate, 'AM'),
        value: 'am',
        disabled: rowHourUnits.value.every(
          h => h.disabled || !isAM(h.value as number),
        ),
      },
      {
        label: formatMeridiem(pmDate, 'PM'),
        value: 'pm',
        disabled: rowHourUnits.value.every(
          h => h.disabled || isAM(h.value as number),
        ),
      },
    ]
  })

  // ======================== Change ========================
  const triggerDateTmpl = computed(() => {
    let tmpl =
      value.value || ctx.value.pickerValue || generateConfig.value.getNow()
    const gc = generateConfig.value
    const isNotNull = (num: any) => num !== null && num !== undefined

    if (isNotNull(hour.value)) {
      tmpl = gc.setHour(tmpl, hour.value!)
      tmpl = gc.setMinute(tmpl, minute.value!)
      tmpl = gc.setSecond(tmpl, second.value!)
      tmpl = gc.setMillisecond(tmpl, millisecond.value!)
    } else if (isNotNull(pickerHour.value)) {
      tmpl = gc.setHour(tmpl, pickerHour.value!)
      tmpl = gc.setMinute(tmpl, pickerMinute.value!)
      tmpl = gc.setSecond(tmpl, pickerSecond.value!)
      tmpl = gc.setMillisecond(tmpl, pickerMillisecond.value!)
    } else if (isNotNull(validHour.value)) {
      tmpl = gc.setHour(tmpl, validHour.value)
      tmpl = gc.setMinute(tmpl, validMinute.value)
      tmpl = gc.setSecond(tmpl, validSecond.value)
      tmpl = gc.setMillisecond(tmpl, validMillisecond.value)
    }
    return tmpl
  })

  const fillColumnValue = (
    val: number | string,
    func: 'setHour' | 'setMinute' | 'setSecond' | 'setMillisecond',
  ) => {
    if (val === null) return null
    return generateConfig.value[func](triggerDateTmpl.value, val as any)
  }

  const triggerChange = (nextDate: any) => {
    const validateDate = getValidTime(nextDate)
    onSelect.value(validateDate)
  }

  const onNextHourTime = (val: number) => fillColumnValue(val, 'setHour')
  const onNextMinuteTime = (val: number) => fillColumnValue(val, 'setMinute')
  const onNextSecondTime = (val: number) => fillColumnValue(val, 'setSecond')
  const onNextMillisecondTime = (val: number) =>
    fillColumnValue(val, 'setMillisecond')

  const getMeridiemTime = (val: string) => {
    if (val === null) return null
    const h = hour.value as number
    if (val === 'am' && !isAM(h)) {
      return generateConfig.value.setHour(triggerDateTmpl.value, h - 12)
    }
    if (val === 'pm' && isAM(h)) {
      return generateConfig.value.setHour(triggerDateTmpl.value, h + 12)
    }
    return triggerDateTmpl.value
  }

  const onHourChange = (val: number | string) =>
    triggerChange(onNextHourTime(val as number))
  const onMinuteChange = (val: number | string) =>
    triggerChange(onNextMinuteTime(val as number))
  const onSecondChange = (val: number | string) =>
    triggerChange(onNextSecondTime(val as number))
  const onMillisecondChange = (val: number | string) =>
    triggerChange(onNextMillisecondTime(val as number))
  const onMeridiemChange = (val: number | string) =>
    triggerChange(getMeridiemTime(val as string))

  const onHourHover = (val: number | string | null) =>
    onHover.value?.(onNextHourTime(val as number))
  const onMinuteHover = (val: number | string | null) =>
    onHover.value?.(onNextMinuteTime(val as number))
  const onSecondHover = (val: number | string | null) =>
    onHover.value?.(onNextSecondTime(val as number))
  const onMillisecondHover = (val: number | string | null) =>
    onHover.value?.(onNextMillisecondTime(val as number))
  const onMeridiemHover = (val: number | string | null) =>
    onHover.value?.(getMeridiemTime(val as string))
</script>

<template>
  <div :class="contentCls" :style="styles.content">
    <TimeColumn
      v-if="showHour"
      :units="hourUnits"
      :value="hour"
      :optional-value="pickerHour"
      type="hour"
      :change-on-scroll="changeOnScroll"
      :on-dbl-click="onCellDblClick"
      :on-change="onHourChange"
      :on-hover="onHourHover"
    />
    <TimeColumn
      v-if="showMinute"
      :units="minuteUnits"
      :value="minute"
      :optional-value="pickerMinute"
      type="minute"
      :change-on-scroll="changeOnScroll"
      :on-dbl-click="onCellDblClick"
      :on-change="onMinuteChange"
      :on-hover="onMinuteHover"
    />
    <TimeColumn
      v-if="showSecond"
      :units="secondUnits"
      :value="second"
      :optional-value="pickerSecond"
      type="second"
      :change-on-scroll="changeOnScroll"
      :on-dbl-click="onCellDblClick"
      :on-change="onSecondChange"
      :on-hover="onSecondHover"
    />
    <TimeColumn
      v-if="showMillisecond"
      :units="millisecondUnits"
      :value="millisecond"
      :optional-value="pickerMillisecond"
      type="millisecond"
      :change-on-scroll="changeOnScroll"
      :on-dbl-click="onCellDblClick"
      :on-change="onMillisecondChange"
      :on-hover="onMillisecondHover"
    />
    <TimeColumn
      v-if="showMeridiem"
      :units="meridiemUnits"
      :value="meridiem ?? undefined"
      type="meridiem"
      :change-on-scroll="changeOnScroll"
      :on-dbl-click="onCellDblClick"
      :on-change="onMeridiemChange"
      :on-hover="onMeridiemHover"
    />
  </div>
</template>
