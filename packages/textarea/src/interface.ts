import type { InputFocusOptions } from '@v-c/util/dist/Dom/focus'
import type {
  ChangeEventHandler,
  CompositionEventHandler,
  FocusEventHandler,
  KeyboardEventHandler,
  MouseEventHandler,
} from '@v-c/util/dist/EventInterface'
import type { VueNode } from '@v-c/util/dist/type'
import type { CSSProperties, TextareaHTMLAttributes } from 'vue'

export type ValueType = TextareaHTMLAttributes['value'] | bigint

export type AutoSizeType = boolean | { minRows?: number; maxRows?: number }

export type ShowCountFormatter = (args: {
  value: string
  count: number
  maxLength?: number
}) => any

export type ExceedFormatter = (value: string, config: { max: number }) => string

export interface CountConfig {
  max?: number
  strategy?: (value: string) => number
  show?: boolean | ShowCountFormatter
  exceedFormatter?: ExceedFormatter
}

type DataAttr = Record<`data-${string}`, string>

export interface TextAreaProps {
  value?: ValueType
  defaultValue?: any
  disabled?: boolean
  prefixCls?: string
  prefix?: VueNode
  suffix?: VueNode
  addonBefore?: VueNode
  addonAfter?: VueNode
  allowClear?: boolean | { clearIcon?: VueNode }
  autoSize?: AutoSizeType
  showCount?:
    | boolean
    | {
        formatter: ShowCountFormatter
      }
  placeholder?: string
  class?: any
  classes?: {
    affixWrapper?: string
    group?: string
    wrapper?: string
  }
  classNames?: {
    affixWrapper?: string
    prefix?: string
    suffix?: string
    groupWrapper?: string
    wrapper?: string
    variant?: string
    textarea?: string
    count?: string
  }
  style?: CSSProperties
  styles?: {
    affixWrapper?: CSSProperties
    prefix?: CSSProperties
    suffix?: CSSProperties
    textarea?: CSSProperties
    count?: CSSProperties
    clear?: CSSProperties
  }
  count?: CountConfig
  onClear?: () => void
  maxLength?: number
  readOnly?: boolean
  hidden?: boolean
  autoFocus?: boolean
  onResize?: (size: { width: number; height: number }) => void
  onChange?: ChangeEventHandler
  onFocus?: FocusEventHandler
  onBlur?: FocusEventHandler
  onKeydown?: KeyboardEventHandler
  onKeyUp?: KeyboardEventHandler
  onCompositionStart?: CompositionEventHandler
  onCompositionEnd?: CompositionEventHandler
  onPressEnter?: KeyboardEventHandler
  changeOnComposing?: boolean
  handleReset?: MouseEventHandler
  components?: {
    affixWrapper?: 'span' | 'div'
    groupWrapper?: 'span' | 'div'
    wrapper?: 'span' | 'div'
    groupAddon?: 'span' | 'div'
  }
  dataAttrs?: {
    affixWrapper?: DataAttr
  }
}

export interface ResizableTextAreaRef {
  textArea: HTMLTextAreaElement | null
  nativeElement: HTMLTextAreaElement | null
}

export interface TextAreaRef {
  focus: (options?: InputFocusOptions) => void
  blur: () => void
  setSelectionRange: (
    start: number,
    end: number,
    direction?: 'forward' | 'backward' | 'none',
  ) => void
  select: () => void
  resizableTextArea: ResizableTextAreaRef | null
  textarea: HTMLTextAreaElement | null
  nativeElement: HTMLElement | null
}
