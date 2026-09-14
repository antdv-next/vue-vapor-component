import type { VueNode } from '@v-c/util/dist/type'
import type { CSSProperties } from 'vue'
import type {
  CellRender,
  Components,
  Locale,
  OnPanelChange,
  PanelMode,
  PanelSemanticName,
  PickerMode,
  SharedPanelProps,
  SharedTimeProps,
} from '../interface'

export interface PickerPanelRef {
  nativeElement: HTMLDivElement
}

type BasePickerPanelSharedProps<DateType extends object = any> = Pick<
  SharedPanelProps<DateType>,
  // MISC
  | 'locale'
  | 'generateConfig'

  // Disabled
  | 'disabledDate'
  | 'minDate'
  | 'maxDate'

  // Icon
  | 'prevIcon'
  | 'nextIcon'
  | 'superPrevIcon'
  | 'superNextIcon'
>

export interface BasePickerPanelProps<DateType extends object = any>
  extends BasePickerPanelSharedProps<DateType>,
  SharedTimeProps<DateType> {
  // Style
  prefixCls?: string

  direction?: 'ltr' | 'rtl'

  tabindex?: string | number

  // Value
  onSelect?: (date: DateType) => void

  // Panel control
  defaultPickerValue?: DateType | null
  pickerValue?: DateType | null
  onPickerValueChange?: (date: DateType) => void

  // Mode
  mode?: PanelMode
  /**
   * Compatible with origin API.
   * Not mean the PickerPanel `onChange` event.
   */
  onPanelChange?: OnPanelChange<DateType>
  picker?: PickerMode

  // Time
  showTime?: true | SharedTimeProps<DateType>

  // Week
  /**
   * Only worked in `date` mode. Show the current week
   */
  showWeek?: boolean

  // Cell
  cellRender?: CellRender<DateType>

  /** @deprecated use cellRender instead of dateRender */
  dateRender?: (currentDate: DateType, today: DateType) => VueNode
  /** @deprecated use cellRender instead of monthCellRender */
  monthCellRender?: (currentDate: DateType, locale: Locale) => VueNode

  // Hover
  /** @private Used for Picker passing */
  hoverValue?: DateType[]
  /** @private Used for Picker passing */
  hoverRangeValue?: [start: DateType, end: DateType]
  /** @private Used for Picker passing */
  onHover?: (date: DateType) => void

  // Components
  components?: Components

  /** @private This is internal usage. Do not use in your production env */
  hideHeader?: boolean
}

export interface SinglePickerPanelProps<DateType extends object = any>
  extends BasePickerPanelProps<DateType> {
  multiple?: false

  defaultValue?: DateType
  value?: DateType | null
  onChange?: (date: DateType) => void
}

export type PickerPanelProps<DateType extends object = any> = BasePickerPanelProps<DateType> & {
  /** multiple selection. Not support time or datetime picker */
  multiple?: boolean

  defaultValue?: DateType | DateType[] | null
  value?: DateType | DateType[] | null
  onChange?: (date: DateType | DateType[]) => void
  styles?: Partial<Record<PanelSemanticName, CSSProperties>>
  classNames?: Partial<Record<PanelSemanticName, string>>
}
