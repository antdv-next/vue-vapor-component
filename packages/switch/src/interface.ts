import type { KeyboardEventHandler } from '@v-c/util/dist/EventInterface'
import type { CSSProperties } from 'vue'

export type SwitchChangeEventHandler = (
  checked: boolean,
  event: MouseEvent | KeyboardEvent,
) => void
export type SwitchClickEventHandler = SwitchChangeEventHandler
export interface SwitchProps {
  className?: string
  prefixCls?: string
  disabled?: boolean
  checkedChildren?: string
  unCheckedChildren?: string
  'onUpdate:checked'?: (value: boolean) => void
  tabIndex?: number
  checked?: boolean
  defaultChecked?: boolean
  title?: string
  styles?: { content?: CSSProperties }
  classNames?: { content?: string }
}

export interface SwitchSlots {
  loadingIcon?: () => any
  checkedChildren?: () => any
  unCheckedChildren?: () => any
}

export interface SwitchEmits {
  change: [checked: boolean, e: Event]
  'update:checked': [checked: boolean]
  keydown: [e: Event]
  click: [checked: boolean, e: Event]
}
