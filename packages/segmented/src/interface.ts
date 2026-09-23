import type { VueNode } from '@v-c/util/dist/type'
import type { CSSProperties } from 'vue'

export interface MotionThumbInterface {
  containerRef: HTMLDivElement
  value: SegmentedValue
  getValueIndex: (value: SegmentedValue) => number
  prefixCls: string
  motionName: string
  direction?: 'ltr' | 'rtl'
  vertical?: boolean
}

export type SemanticName = 'item' | 'label'
export type SegmentedValue = string | number

export type SegmentedRawOption = SegmentedValue

export interface SegmentedLabeledOption<ValueType = SegmentedRawOption> {
  class?: string
  disabled?: boolean
  label: string
  value: ValueType
  /**
   * html `title` property for label
   */
  title?: string
}
export type ItemRender = (item: SegmentedLabeledOption) => VueNode

export type SegmentedOptions<T = SegmentedRawOption> = (
  | T
  | SegmentedLabeledOption<T>
)[]

export interface SegmentedProps {
  options: SegmentedOptions
  defaultValue?: SegmentedValue
  value?: SegmentedValue
  disabled?: boolean
  prefixCls?: string
  direction?: 'ltr' | 'rtl'
  motionName?: string
  vertical?: boolean
  name?: string
  classNames?: Partial<Record<SemanticName, string>>
  styles?: Partial<Record<SemanticName, CSSProperties>>
}

export interface SegmentedSlots {
  itemRender?: ItemRender
  label?: () => any
}
