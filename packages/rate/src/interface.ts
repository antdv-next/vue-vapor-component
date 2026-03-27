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
  onClick?: (e: MouseEvent | KeyboardEvent, index: number) => void
  onHover?: (e: MouseEvent, index: number) => void
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
  onHoverChange?: (value: number) => void
  onChange?: (value: number) => void
  onFocus?: () => void
  onBlur?: () => void
  onKeyDown?: KeyboardEventHandler
  onMouseLeave?: FocusEventHandler
  'onUpdate:value'?: (value: number) => void
  id?: string
}
