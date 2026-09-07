import type { VueNode } from '@v-c/util/dist/type'
import type { CSSMotionProps } from '@v-c/util/dist/utils/transition'
import type { CSSProperties } from 'vue'

export type SizeInfo = [width: number, height: number]

export interface EditableConfig {
  onEdit: (
    type: 'add' | 'remove',
    info: { key?: string; event: MouseEvent | KeyboardEvent },
  ) => void
  showAdd?: boolean
  removeIcon?: VueNode
  addIcon?: VueNode
}

export interface AnimatedConfig {
  inkBar?: boolean
  tabPane?: boolean
  tabPaneMotion?: CSSMotionProps
}

export interface TabsLocale {
  dropdownAriaLabel?: string
  removeAriaLabel?: string
  addAriaLabel?: string
}

export interface AddButtonProps {
  prefixCls: string
  editable?: EditableConfig
  locale?: TabsLocale
  style?: CSSProperties
}

export type OnTabScroll = (info: {
  direction: 'left' | 'right' | 'top' | 'bottom'
}) => void

export type TabBarExtraPosition = 'left' | 'right'

export type TabBarExtraMap = Partial<Record<TabBarExtraPosition, VueNode>>

export type TabBarExtraContent = VueNode | TabBarExtraMap

export interface ExtraContentProps {
  position: TabBarExtraPosition
  prefixCls: string
  extra?: TabBarExtraContent
}

export interface TabPaneProps {
  tab?: VueNode
  className?: unknown
  style?: CSSProperties
  disabled?: boolean
  children?: VueNode
  forceRender?: boolean
  closable?: boolean
  closeIcon?: VueNode
  icon?: VueNode

  // Pass by TabPaneList
  prefixCls?: string
  tabKey?: string
  id?: string | null
  animated?: boolean
  active?: boolean
  destroyOnHidden?: boolean
}

export interface Tab extends Omit<TabPaneProps, 'tab'> {
  key: string
  label: VueNode
}

export type moreIcon = VueNode

export type PopupRender = (
  menu: VueNode,
  info: {
    restTabs: Tab[]
    onClose: () => void
  },
) => VueNode

export type MoreProps = {
  icon?: moreIcon
  popupRender?: PopupRender
}

export interface OperationNodeProps {
  prefixCls: string
  className?: unknown
  style?: CSSProperties
  id: string | null
  tabs: Tab[]
  rtl: boolean
  tabBarGutter?: number
  activeKey: string
  mobile: boolean
  more?: MoreProps
  editable?: EditableConfig
  locale?: TabsLocale
  removeAriaLabel?: string
  tabMoving?: boolean
  getPopupContainer?: (node: HTMLElement) => HTMLElement
  popupClassName?: string
  popupStyle?: CSSProperties
  classNames?: Partial<Record<'remove', string>>
  styles?: Partial<Record<'remove', CSSProperties>>
}

export interface TabNodeProps {
  id: string | null
  prefixCls: string
  tab: Tab
  active: boolean
  focus: boolean
  closable?: boolean
  editable?: EditableConfig
  removeAriaLabel?: string
  tabCount: number
  currentPosition: number
  removeIcon?: VueNode
  style?: CSSProperties
  className?: string
  classNames?: Partial<Record<'item' | 'remove', string>>
  styles?: Partial<Record<'item' | 'remove', CSSProperties>>
}

export type TabPosition = 'left' | 'right' | 'top' | 'bottom'

export type GetIndicatorSize = number | ((origin: number) => number)

export type SemanticName =
  | 'popup'
  | 'item'
  | 'indicator'
  | 'body'
  | 'content'
  | 'header'
  | 'remove'
  | 'operations'

export interface IndicatorConfig {
  size?: GetIndicatorSize
  align?: 'start' | 'center' | 'end'
}

export interface TabNavListProps {
  id: string | null
  tabPosition: TabPosition
  activeKey: string
  rtl: boolean
  animated?: AnimatedConfig
  extra?: TabBarExtraContent
  editable?: EditableConfig
  more?: MoreProps
  mobile: boolean
  tabBarGutter?: number
  locale?: TabsLocale
  getPopupContainer?: (node: HTMLElement) => HTMLElement
  popupClassName?: string
  indicator?: IndicatorConfig
  classNames?: Partial<Record<SemanticName, string>>
  styles?: Partial<Record<SemanticName, CSSProperties>>
}

export interface TabNavListWrapperProps extends TabNavListProps {}

export interface TabsProps {
  prefixCls?: string
  id?: string | null

  items?: Tab[]

  activeKey?: string
  defaultActiveKey?: string
  direction?: 'ltr' | 'rtl'
  animated?: boolean | AnimatedConfig
  tabBarExtraContent?: TabBarExtraContent
  tabBarGutter?: number
  tabBarStyle?: CSSProperties
  tabPosition?: TabPosition
  destroyOnHidden?: boolean

  editable?: EditableConfig
  getPopupContainer?: (node: HTMLElement) => HTMLElement

  locale?: TabsLocale

  more?: MoreProps
  popupClassName?: string
  indicator?: IndicatorConfig
  classNames?: Partial<Record<SemanticName, string>>
  styles?: Partial<Record<SemanticName, CSSProperties>>
}
