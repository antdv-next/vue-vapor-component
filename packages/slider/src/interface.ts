import type { CSSProperties } from 'vue'

export type Direction = 'rtl' | 'ltr' | 'ttb' | 'btt'

export type OnStartMove = (
  e: MouseEvent | TouchEvent,
  valueIndex: number,
  startValues?: number[],
) => void

export type AriaValueFormat = (value: number) => string

export type SemanticName = 'tracks' | 'track' | 'rail' | 'handle'

export type SliderClassNames = Partial<Record<SemanticName, string>>
export type SliderStyles = Partial<Record<SemanticName, CSSProperties>>

export interface RangeConfig {
  editable?: boolean
  draggableTrack?: boolean
  minCount?: number
  maxCount?: number
}

export interface RenderProps {
  index: number | null
  prefixCls: string
  value: number
  dragging: boolean
  draggingDelete: boolean
  node: any
}

export type ValueType = number | number[]

export interface SliderProps<Value extends ValueType = ValueType> {
  prefixCls?: string
  className?: string
  style?: CSSProperties

  classNames?: SliderClassNames
  styles?: SliderStyles

  id?: string

  disabled?: boolean | boolean[]
  keyboard?: boolean
  autoFocus?: boolean

  range?: boolean | RangeConfig
  count?: number
  min?: number
  max?: number
  step?: number | null
  value?: Value | null
  defaultValue?: Value | null

  allowCross?: boolean
  pushable?: boolean | number

  reverse?: boolean
  vertical?: boolean

  included?: boolean
  startPoint?: number
  trackStyle?: CSSProperties | CSSProperties[]
  handleStyle?: CSSProperties | CSSProperties[]
  railStyle?: CSSProperties
  dotStyle?: CSSProperties | ((dotValue: number) => CSSProperties)
  activeDotStyle?: CSSProperties | ((dotValue: number) => CSSProperties)

  marks?: Record<string | number, any | MarkObj>
  dots?: boolean

  track?: boolean

  tabIndex?: number | number[]
  ariaLabelForHandle?: string | string[]
  ariaLabelledByForHandle?: string | string[]
  ariaRequired?: boolean
  ariaValueTextFormatterForHandle?: AriaValueFormat | AriaValueFormat[]
}

export interface SliderRef {
  focus: () => void
  blur: () => void
}

export interface MarkObj {
  style?: CSSProperties
  label?: any
}

export interface InternalMarkObj extends MarkObj {
  value: number
}
