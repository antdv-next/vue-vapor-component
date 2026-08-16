import type { KeyboardEventHandler } from '@v-c/util/dist/EventInterface'
import type { CSSProperties, VNodeChild } from 'vue'

export type SwitchChangeEventHandler = (
  checked: boolean,
  event: MouseEvent | KeyboardEvent,
) => void
export type SwitchClickEventHandler = SwitchChangeEventHandler
export interface SwitchProps {
  className?: string
  prefixCls?: string
  disabled?: boolean
  checkedChildren?: VNodeChild | (() => VNodeChild)
  unCheckedChildren?: VNodeChild | (() => VNodeChild)
  'onUpdate:checked'?: (value: boolean) => void
  tabIndex?: number
  checked?: boolean
  defaultChecked?: boolean
  loadingIcon?: VNodeChild | (() => VNodeChild)
  title?: string
  styles?: { content?: CSSProperties }
  classNames?: { content?: string }
}
