import type { InternalMode, Locale, SharedPickerProps, SharedTimeProps } from '../interface'
import { getRowFormat, pickProps, toArray } from '../utils/miscUtil'
import { fillTimeFormat } from './useLocale'

function checkShow(format: string, keywords: string[], show?: boolean) {
  return show ?? keywords.some(keyword => format.includes(keyword))
}

const showTimeKeys = [
  // 'format',
  'showNow',
  'showHour',
  'showMinute',
  'showSecond',
  'showMillisecond',
  'use12Hours',
  'hourStep',
  'minuteStep',
  'secondStep',
  'millisecondStep',
  'hideDisabledOptions',
  'defaultValue',
  'disabledHours',
  'disabledMinutes',
  'disabledSeconds',
  'disabledMilliseconds',
  'disabledTime',
  'changeOnScroll',
  'defaultOpenValue',
] as const

/**
 * Get SharedTimeProps from props.
 */
function pickTimeProps<DateType extends object = any>(
  props: any,
): [timeProps: SharedTimeProps<DateType>, propFormat: string] {
  const timeProps: any = pickProps(props, showTimeKeys)
  const { format, picker } = props

  let propFormat: typeof format = null
  if (format) {
    propFormat = format

    if (Array.isArray(propFormat)) {
      propFormat = propFormat[0]
    }
    propFormat = typeof propFormat === 'object' ? propFormat.format : propFormat
  }

  if (picker === 'time') {
    timeProps.format = propFormat
  }

  return [timeProps, propFormat]
}

function isStringFormat(format: any): format is string {
  return format && typeof format === 'string'
}

export interface ComponentProps<DateType extends object> {
  picker?: InternalMode
  showTime?: boolean | Partial<SharedTimeProps<DateType>>
  locale: Locale
  format?: SharedPickerProps['format']
}

/** Check if all the showXXX is `undefined` */
function existShowConfig(
  showHour: boolean | undefined,
  showMinute: boolean | undefined,
  showSecond: boolean | undefined,
  showMillisecond: boolean | undefined,
) {
  return [showHour, showMinute, showSecond, showMillisecond].some(show => show !== undefined)
}

/** Fill the showXXX if needed */
function fillShowConfig(
  hasShowConfig: boolean | undefined,
  showHour: boolean | undefined,
  showMinute: boolean | undefined,
  showSecond: boolean | undefined,
  showMillisecond: boolean | undefined,
): [showHour: boolean | undefined, showMinute: boolean | undefined, showSecond: boolean | undefined, showMillisecond: boolean | undefined] {
  let parsedShowHour = showHour
  let parsedShowMinute = showMinute
  let parsedShowSecond = showSecond

  if (
    !hasShowConfig
    && !parsedShowHour
    && !parsedShowMinute
    && !parsedShowSecond
    && !showMillisecond
  ) {
    parsedShowHour = true
    parsedShowMinute = true
    parsedShowSecond = true
  }
  else if (hasShowConfig) {
    const existFalse = [parsedShowHour, parsedShowMinute, parsedShowSecond].includes(
      false,
    )
    const existTrue = [parsedShowHour, parsedShowMinute, parsedShowSecond].includes(
      true,
    )
    const defaultShow = existFalse ? true : !existTrue

    parsedShowHour = parsedShowHour ?? defaultShow
    parsedShowMinute = parsedShowMinute ?? defaultShow
    parsedShowSecond = parsedShowSecond ?? defaultShow
  }

  return [parsedShowHour, parsedShowMinute, parsedShowSecond, showMillisecond]
}

/**
 * Get `showHour`, `showMinute`, `showSecond` or other from the props.
 * This is pure function, will not get `showXXX` from the `format` prop.
 */
export function getTimeProps<DateType extends object>(
  componentProps: ComponentProps<DateType>,
): [
    showTimeProps: SharedTimeProps<DateType>,
    showTimePropsForLocale: SharedTimeProps<DateType>,
    showTimeFormat: string | undefined,
    propFormat: string,
] {
  const { showTime, picker } = componentProps

  const [pickedProps, propFormat] = pickTimeProps(componentProps)

  const showTimeConfig = showTime && typeof showTime === 'object' ? showTime : {}

  // Vapor's props proxy coerces non-declared boolean props to `false` instead of
  // `undefined`. `pickProps(props, showTimeKeys)` reads `props.showHour` etc.
  // which are NOT declared props of DatePicker/RangePicker — vapor returns
  // `false`, not `undefined`, so `pickProps` includes them. This makes
  // `hasShowConfig` = `true` (because `false !== undefined`), preventing
  // `fillShowConfig` from setting `showHour: true`. Only use top-level picked
  // props for TimePicker, where those keys ARE declared props.
  // vapor 的 props proxy 把未声明的布尔 prop 强制为 `false` 而非 `undefined`。
  // `pickProps(props, showTimeKeys)` 读取 `props.showHour` 等（DatePicker/
  // RangePicker 未声明的 prop），vapor 返回 `false` 而非 `undefined`，导致
  // `hasShowConfig` 为 `true`（`false !== undefined`），`fillShowConfig` 无法
  // 填充 `showHour: true`。仅对 TimePicker 使用顶层 picked props（那里这些 key
  // 是已声明的 prop）。
  const timeConfig = {
    defaultOpenValue: showTimeConfig.defaultOpenValue || showTimeConfig.defaultValue,
    ...(picker === 'time' ? pickedProps : {}),
    ...showTimeConfig,
  }

  const { showMillisecond } = timeConfig
  let { showHour, showMinute, showSecond } = timeConfig
  const hasShowConfig = existShowConfig(showHour, showMinute, showSecond, showMillisecond)

  ;[showHour, showMinute, showSecond] = fillShowConfig(
    hasShowConfig,
    showHour,
    showMinute,
    showSecond,
    showMillisecond,
  )

  return [
    timeConfig,
    {
      ...timeConfig,
      showHour,
      showMinute,
      showSecond,
      showMillisecond,
    },
    timeConfig.format,
    propFormat,
  ]
}

export function fillShowTimeConfig<DateType extends object>(
  picker: InternalMode,
  showTimeFormat: string | undefined,
  propFormat: string,
  timeConfig: SharedTimeProps<DateType>,
  locale: Locale,
): SharedTimeProps<DateType> | null {
  const isTimePicker = picker === 'time'

  if (picker === 'datetime' || isTimePicker) {
    const pickedProps = timeConfig

    // ====================== BaseFormat ======================
    const defaultLocaleFormat = getRowFormat(picker, locale, null) as string

    let baselineFormat = defaultLocaleFormat

    const formatList = [showTimeFormat, propFormat]
    for (let i = 0; i < formatList.length; i += 1) {
      const format = toArray(formatList[i])[0]

      if (isStringFormat(format)) {
        baselineFormat = format
        break
      }
    }

    // ========================= Show =========================
    let { showHour, showMinute, showSecond, showMillisecond } = pickedProps
    const { use12Hours } = pickedProps

    const showMeridiem = checkShow(baselineFormat, ['a', 'A', 'LT', 'LLL', 'LTS'], use12Hours)

    const hasShowConfig = existShowConfig(showHour, showMinute, showSecond, showMillisecond)

    // Fill with format, if needed
    if (!hasShowConfig) {
      showHour = checkShow(baselineFormat, ['H', 'h', 'k', 'LT', 'LLL'])
      showMinute = checkShow(baselineFormat, ['m', 'LT', 'LLL'])
      showSecond = checkShow(baselineFormat, ['s', 'LTS'])
      showMillisecond = checkShow(baselineFormat, ['SSS'])
    }

    // Fallback if all can not see
    ;[showHour, showMinute, showSecond] = fillShowConfig(
      hasShowConfig,
      showHour,
      showMinute,
      showSecond,
      showMillisecond,
    )

    // ======================== Format ========================
    const timeFormat
      = showTimeFormat
        || fillTimeFormat(showHour, showMinute, showSecond, showMillisecond, showMeridiem)

    // ======================== Props =========================
    return {
      ...pickedProps,

      // Format
      format: timeFormat,

      // Show Config
      showHour,
      showMinute,
      showSecond,
      showMillisecond,
      use12Hours: showMeridiem,
    }
  }

  return null
}
