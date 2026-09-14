import type { VueNode } from '@v-c/util/dist/type'
import type {
  BaseInfo,
  PanelMode,
  RangeTimeProps,
  SharedPickerProps,
  SharedTimeProps,
  ValueDate,
} from '../interface'
import type { SelectorIdType } from './Selector/interface'

// Re-exported so `RangeSelector` can import it from this module rather than
// from a `.vue` file.
export type { SelectorIdType }

export interface CustomTagProps<DateType extends object = any> {
  label: any
  value: DateType
  disabled: boolean
  onClose: (event?: MouseEvent) => void
  closable: boolean
}

export interface BasePickerProps<DateType extends object = any> extends
  SharedPickerProps<DateType> {
  // Structure
  id?: string

  /** Not support `time` or `datetime` picker */
  multiple?: boolean
  removeIcon?: any
  /** Only work when `multiple` is in used */
  maxTagCount?: number | 'responsive'
  /** Only works when `multiple` is in use */
  tagRender?: (props: CustomTagProps<DateType>) => any

  // Value
  value?: DateType | DateType[] | string | string[] | null
  defaultValue?: DateType | DateType[] | string | string[]
  onChange?: (
    date: DateType | DateType[] | string | string[] | null,
    dateString: string | string[],
  ) => void
  onCalendarChange?: (
    date: DateType | DateType[] | string | string[],
    dateString: string | string[],
    info: BaseInfo,
  ) => void
  /**  */
  onOk?: (value?: DateType | DateType[] | string | string[]) => void

  // Placeholder
  placeholder?: string

  // Picker Value
  /**
   * Config the popup panel date.
   * Every time active the input to open popup will reset with `defaultPickerValue`.
   *
   * Note: `defaultPickerValue` priority is higher than `value` for the first open.
   */
  defaultPickerValue?: DateType | string | null
  /**
   * Config each start & end field popup panel date.
   * When config `pickerValue`, you must also provide `onPickerValueChange` to handle changes.
   */
  pickerValue?: DateType | string | null
  /**
   * Each popup panel `pickerValue` change will trigger the callback.
   * @param date The changed picker value
   * @param info.source `panel` from the panel click. `reset` from popup open or field typing.
   */
  onPickerValueChange?: (
    date: DateType,
    info: {
      source: 'reset' | 'panel'
      mode: PanelMode
    },
  ) => void

  // Preset
  presets?: ValueDate<DateType>[]

  // Control
  disabled?: boolean

  // Mode
  mode?: PanelMode
  onPanelChange?: (values: DateType, modes: PanelMode) => void
}

type PickerTimeProps<DateType extends object = any> = Omit<
  SharedTimeProps<DateType>,
  'format' | 'defaultValue'
>

export interface PickerProps<DateType extends object = any> extends
  BasePickerProps<DateType>,
    PickerTimeProps<DateType> {
  use12Hours?: boolean
}

type RangePickerSharedProps<DateType extends object = any> = Omit<
  SharedPickerProps<DateType>,
  'showTime' | 'id'
>

export interface BaseRangePickerProps<DateType extends object> extends
  RangePickerSharedProps<DateType> {
  // Structure
  id?: SelectorIdType

  separator?: VueNode

  // Value
  value?: RangeValueType<DateType | string> | null
  defaultValue?: RangeValueType<DateType | string>
  onChange?: (
    dates: NoUndefinedRangeValueType<DateType | string> | null,
    dateStrings: [string, string],
  ) => void
  onCalendarChange?: (
    dates: NoUndefinedRangeValueType<DateType | string>,
    dateStrings: [string, string],
    info: BaseInfo,
  ) => void
  onOk?: (values: NoUndefinedRangeValueType<DateType | string>) => void

  // Placeholder
  placeholder?: [string, string]

  // Picker Value
  /**
   * Config the popup panel date.
   * Every time active the input to open popup will reset with `defaultPickerValue`.
   *
   * Note: `defaultPickerValue` priority is higher than `value` for the first open.
   */
  defaultPickerValue?: [DateType | string, DateType | string] | DateType | string | null
  /**
   * Config each start & end field popup panel date.
   * When config `pickerValue`, you must also provide `onPickerValueChange` to handle changes.
   */
  pickerValue?: [DateType | string, DateType | string] | DateType | string | null
  /**
   * Each popup panel `pickerValue` includes `mode` change will trigger the callback.
   * @param date The changed picker value
   * @param info.source `panel` from the panel click. `reset` from popup open or field typing
   * @param info.mode Next `mode` panel
   */
  onPickerValueChange?: (
    date: [DateType, DateType],
    info: BaseInfo & {
      source: 'reset' | 'panel'
      mode: [PanelMode, PanelMode]
    },
  ) => void

  // Preset
  presets?: ValueDate<Exclude<RangeValueType<DateType>, null>>[]
  /** @deprecated Please use `presets` instead */
  ranges?: Record<
    string,
    Exclude<RangeValueType<DateType>, null> | (() => Exclude<RangeValueType<DateType>, null>)
  >

  // Control
  disabled?: boolean | [boolean, boolean]
  allowEmpty?: boolean | [boolean, boolean]

  // Time
  showTime?: boolean | RangeTimeProps<DateType>

  // Mode
  mode?: [startMode: PanelMode, endMode: PanelMode]
  /** Trigger on each `mode` or `pickerValue` changed. */
  onPanelChange?: (
    values: NoUndefinedRangeValueType<DateType>,
    modes: [startMode: PanelMode, endMode: PanelMode],
  ) => void
}

type RangePickerTimeProps<DateType extends object = any> = Omit<
  RangeTimeProps<DateType>,
  'format' | 'defaultValue' | 'defaultOpenValue'
>

export interface RangePickerProps<DateType extends object = any> extends
  BaseRangePickerProps<DateType>,
    RangePickerTimeProps<DateType> {}

export type RangeValueType<DateType> = [
  start: DateType | null | undefined,
  end: DateType | null | undefined,
]

export type NoUndefinedRangeValueType<DateType> = [start: DateType | null, end: DateType | null]
