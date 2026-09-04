import type { TextAreaProps, TextAreaRef } from '@vapor-component/textarea'
import type { CommonInputProps } from '@vapor-component/input'
import type { VueNode } from '@v-c/util/dist/type'
import type { CSSProperties } from 'vue'

// ========================= Types =========================

export type Placement = 'top' | 'bottom'
export type Direction = 'ltr' | 'rtl'

export interface OptionProps {
  value?: string
  key?: string
  disabled?: boolean
  class?: string
  style?: CSSProperties
}

export interface DataDrivenOptionProps extends OptionProps {
  label?: VueNode
}

export interface MentionsContextProps {
  notFoundContent: VueNode
  activeIndex: number
  setActiveIndex: (index: number) => void
  selectOption: (option: OptionProps) => void
  onFocus: (e: FocusEvent) => void
  onBlur: (e: FocusEvent) => void
  onScroll: (e: UIEvent) => void
}

// Types excluded from forwarding to TextArea (managed internally)
export type BaseTextAreaAttrs = Omit<
  TextAreaProps,
  | 'prefix'
  | 'onChange'
  | 'onSelect'
  | 'showCount'
  | 'classNames'
  | 'value'
  | 'defaultValue'
  | 'onFocus'
  | 'onBlur'
  | 'onKeydown'
  | 'onKeyup'
>

export interface MentionsProps extends BaseTextAreaAttrs {
  id?: string
  autoFocus?: boolean
  defaultValue?: string
  value?: string
  notFoundContent?: VueNode
  split?: string
  transitionName?: string
  placement?: Placement
  direction?: Direction
  prefix?: string | string[]
  prefixCls?: string
  silent?: boolean
  getPopupContainer?: () => HTMLElement
  popupClassName?: string
  options?: DataDrivenOptionProps[]
  classNames?: CommonInputProps['classNames'] & {
    mentions?: string
    textarea?: string
    popup?: string
  }
  styles?: {
    suffix?: CSSProperties
    textarea?: CSSProperties
    popup?: CSSProperties
  }
  rows?: HTMLTextAreaElement['rows']
}

export interface MentionsRef {
  focus: () => void
  blur: () => void
  textarea: HTMLTextAreaElement | null
  nativeElement: HTMLElement
}

export interface KeywordTriggerProps {
  options: DataDrivenOptionProps[]
  prefixCls?: string
  placement?: Placement
  direction?: Direction
  visible?: boolean
  transitionName?: string
  getPopupContainer?: () => HTMLElement
  popupClassName?: string
  popupStyle?: CSSProperties
  popupRender?: (menu: VueNode) => VueNode
}

export interface DropdownMenuProps {
  prefixCls?: string
  options: DataDrivenOptionProps[]
  opened: boolean
}
