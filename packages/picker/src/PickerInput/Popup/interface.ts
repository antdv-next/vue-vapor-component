import type { VueNode } from '@v-c/util/dist/type'
import type { GenerateConfig } from '../../generate'
import type {
  DisabledDate,
  InternalMode,
  PanelMode,
  RangeTimeProps,
  SharedTimeProps,
} from '../../interface'
import type { PickerPanelProps } from '../../PickerPanel/interface'

/**
 * Time config used by the popup (single + range share it).
 * Mirrors the vdom source `Popup/index.tsx` export.
 */
export type PopupShowTimeConfig<DateType extends object = any> = Omit<
  RangeTimeProps<DateType>,
  'defaultValue' | 'defaultOpenValue' | 'disabledTime'
> & Pick<SharedTimeProps<DateType>, 'disabledTime'>

export interface FooterProps<DateType extends object = any> {
  mode: PanelMode
  internalMode: InternalMode
  renderExtraFooter?: string
  showNow?: boolean
  generateConfig?: GenerateConfig<DateType>
  disabledDate?: DisabledDate<DateType>
  showTime?: PopupShowTimeConfig<DateType>

  // Invalid
  /** From Footer component used only. Check if can OK button click */
  invalid?: boolean

  // Submit
  onSubmit?: (date?: DateType) => void
  needConfirm?: boolean

  // Now
  onNow?: (now: DateType) => void
}

export type MustProp<DateType extends object> = Required<
  Pick<PickerPanelProps<DateType>, 'mode' | 'onPanelChange'>
>

type PopupPanelPropsWrapper<DateType extends object = any>
  = MustProp<DateType>
    & Omit<PickerPanelProps<DateType>, 'onPickerValueChange' | 'showTime'>
    & FooterProps<DateType>

export interface PopupPanelProps<DateType extends object = any>
  extends PopupPanelPropsWrapper<DateType> {
  multiplePanel?: boolean
  range?: boolean
  onPickerValueChange: (date: DateType) => void
}
