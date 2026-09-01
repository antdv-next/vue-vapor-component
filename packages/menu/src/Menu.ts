import type { CSSMotionProps } from '@v-c/util/dist/utils/transition'
import type { CSSProperties } from 'vue'

import type {
  BuiltinPlacements,
  Components,
  ItemType,
  MenuClickEventHandler,
  MenuMode,
  PopupRender,
  RenderIconType,
  SelectEventHandler,
  TriggerSubMenuAction,
} from './interface'
import type {
  InternalRenderMenuItem,
  InternalRenderSubMenuItem,
} from './PrivateContextKey'
import type { SemanticName } from './SubMenu'

export interface MenuProps {
  prefixCls?: string
  rootClass?: string
  classes?: Partial<Record<SemanticName, string>>
  styles?: Partial<Record<SemanticName, CSSProperties>>
  disabled?: boolean
  disabledOverflow?: boolean
  direction?: 'ltr' | 'rtl'
  mode?: MenuMode
  inlineCollapsed?: boolean
  defaultOpenKeys?: string[]
  openKeys?: string[]
  activeKey?: string
  defaultActiveFirst?: boolean
  selectable?: boolean
  multiple?: boolean
  defaultSelectedKeys?: string[]
  selectedKeys?: string[]
  inlineIndent?: number
  motion?: CSSMotionProps
  defaultMotions?: Partial<{ [key in MenuMode | 'other']: CSSMotionProps }>
  subMenuOpenDelay?: number
  subMenuCloseDelay?: number
  forceSubMenuRender?: boolean
  triggerSubMenuAction?: TriggerSubMenuAction
  builtinPlacements?: BuiltinPlacements
  itemIcon?: RenderIconType
  expandIcon?: RenderIconType
  overflowedIndicator?: string | number
  overflowedIndicatorPopupClassName?: string
  getPopupContainer?: (node: HTMLElement) => HTMLElement
  id?: string
  popupRender?: PopupRender

  // Internal (pro-layout only)
  _internalRenderMenuItem?: InternalRenderMenuItem
  _internalRenderSubMenuItem?: InternalRenderSubMenuItem
  _internalComponents?: Components
}
