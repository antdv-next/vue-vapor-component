import type { Key, VueNode } from '@v-c/util/dist/type'
import type { CSSProperties } from 'vue'

import type { SubMenuProps } from './SubMenu'

// ========================= Options =========================

export interface ItemSharedProps {
  style?: CSSProperties
  class?: string
}

export interface SubMenuType extends ItemSharedProps {
  type?: 'submenu'
  label?: VueNode
  title?: string
  children: ItemType[]
  disabled?: boolean
  key: string
  rootClass?: string
  itemIcon?: RenderIconType
  expandIcon?: RenderIconType
  onMouseEnter?: MenuHoverEventHandler
  onMouseLeave?: MenuHoverEventHandler
  popupClassName?: string
  popupOffset?: number[]
  popupStyle?: CSSProperties
  popupRender?: PopupRender
  onClick?: MenuClickEventHandler
  onTitleClick?: (info: MenuTitleInfo) => void
  onTitleMouseEnter?: MenuHoverEventHandler
  onTitleMouseLeave?: MenuHoverEventHandler
}

export interface MenuItemType extends ItemSharedProps {
  type?: 'item'
  label?: VueNode
  disabled?: boolean
  itemIcon?: RenderIconType
  extra?: VueNode
  key: Key
  onMouseEnter?: MenuHoverEventHandler
  onMouseLeave?: MenuHoverEventHandler
  onClick?: MenuClickEventHandler
}

export interface ItemData {
  label?: VueNode
  itemIcon?: RenderIconType
  extra?: VueNode
  key: Key
  title?: string
}

export interface MenuItemGroupType extends ItemSharedProps {
  type: 'group'
  label?: VueNode
  children?: ItemType[]
}

export interface MenuDividerType extends ItemSharedProps {
  type: 'divider'
}

export type ItemType =
  | SubMenuType
  | MenuItemType
  | MenuItemGroupType
  | MenuDividerType
  | null

// ========================== Basic ==========================

export type MenuMode = 'horizontal' | 'vertical' | 'inline'

export type BuiltinPlacements = Record<string, any>

export type TriggerSubMenuAction = 'click' | 'hover'

export interface RenderIconInfo {
  isSelected?: boolean
  isOpen?: boolean
  isSubMenu?: boolean
  disabled?: boolean
}

export type RenderIconType =
  | VueNode
  | ((props: RenderIconInfo) => VueNode)
  | boolean

export interface MenuInfo {
  key: string
  keyPath: string[]
  /** @deprecated Use itemData instead */
  item: VueNode
  domEvent: MouseEvent | KeyboardEvent
  itemData: ItemData
}

export interface MenuTitleInfo {
  key: string
  domEvent: MouseEvent
}

export type MenuHoverEventHandler = (info: {
  key: string
  domEvent: MouseEvent
}) => void

export interface SelectInfo extends MenuInfo {
  selectedKeys: string[]
}

export type SelectEventHandler = (info: SelectInfo) => void

export type MenuClickEventHandler = (info: MenuInfo) => void

export interface MenuRef {
  focus: (options?: FocusOptions) => void
  list: HTMLUListElement
  findItem: (params: { key: string }) => HTMLElement | null
}

export type ComponentType = 'submenu' | 'item' | 'group' | 'divider'

export type Components = Partial<Record<ComponentType, any>>

export type PopupRender = (
  node: any,
  info: { item: SubMenuProps & { key?: any }; keys: string[] },
) => VueNode

export type SemanticName = 'list' | 'listTitle'
