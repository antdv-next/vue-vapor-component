import type { DecimalClass, ValueType } from '@v-c/mini-decimal'
import type { InputFocusOptions } from '@v-c/util/dist/Dom/focus'

export interface StepHandlerProps {
  prefixCls: string
  action: 'up' | 'down'
  disabled?: boolean
}

export type { ValueType, DecimalClass }

type SemanticName =
  | 'root'
  | 'actions'
  | 'input'
  | 'action'
  | 'prefix'
  | 'suffix'
  | 'clear'

export interface InputNumberProps<T extends ValueType = ValueType> {
  mode?: 'input' | 'spinner'
  prefixCls?: string
  classNames?: Partial<Record<SemanticName, string>>
  styles?: Partial<Record<SemanticName, any>>
  min?: T
  max?: T
  step?: ValueType
  defaultValue?: T
  value?: T | null
  disabled?: boolean
  readOnly?: boolean
  prefix?: any
  suffix?: any
  allowClear?:
    | boolean
    | {
        disabled?: boolean
        label?: string
      }
  upHandler?: any
  downHandler?: any
  keyboard?: boolean
  changeOnWheel?: boolean
  controls?: boolean
  parser?: (displayValue: string | undefined) => T
  formatter?: (
    value: T | undefined,
    info: { userTyping: boolean; input: string },
  ) => string
  precision?: number
  decimalSeparator?: string
  changeOnBlur?: boolean
  tabIndex?: number
  stringMode?: boolean
  placeholder?: string
}

export interface InputNumberRef extends HTMLInputElement {
  focus: (options?: InputFocusOptions) => void
  blur: () => void
  nativeElement: HTMLElement | null
  input: HTMLInputElement | null
}
