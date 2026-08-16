import type {
  FocusEventHandler,
  KeyboardEventHandler,
} from '@v-c/util/dist/EventInterface'
import type { VueNode } from '@v-c/util/dist/type'

export type Direction = 'ltr' | 'rtl'

export interface StarProps {
  value: number
  index: number
  prefixCls?: string
  allowHalf?: boolean
  disabled?: boolean
  character?: ((props: StarProps) => any) | VueNode
  characterRender?: (origin: any, props: StarProps) => any
  focused?: boolean
  count?: number
}

export interface RateProps extends Pick<
  StarProps,
  'count' | 'character' | 'characterRender' | 'allowHalf' | 'disabled'
> {
  prefixCls?: string
  defaultValue?: number
  value?: number
  allowClear?: boolean
  keyboard?: boolean
  direction?: Direction
  tabIndex?: number | string
  autoFocus?: boolean
  'onUpdate:value'?: (value: number) => void
  id?: string
}
