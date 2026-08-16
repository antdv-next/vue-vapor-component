import type { CSSProperties } from 'vue'

/**
 * Accepted by the public `api.open()` call.
 */
export type NotificationListConfig = Partial<
  Omit<NotificationProps, 'prefixCls' | 'key'>
> &
  NotificationCallbacks & {
    key: Key
    placement?: Placement
  }

export type Placement =
  | 'top'
  | 'topLeft'
  | 'topRight'
  | 'bottom'
  | 'bottomLeft'
  | 'bottomRight'

export type Key = string | number

export type StackConfig = {
  threshold?: number
  offset?: number
}

export type Placements = Partial<Record<Placement, NotificationListConfig[]>>

export type InnerOpenConfig = NotificationListConfig & { times?: number }

export type StackParams = Exclude<StackConfig, boolean>

// ===== Notification notice types =====

export type ClosableType = boolean | null | undefined

export type ClosableConfig = {
  closeIcon?: VueNode
  disabled?: boolean
  onClose?: VoidFunction
}

export interface ParsedClosableConfig extends ClosableConfig {
  closeIcon: VueNode
  disabled: boolean
}

export type VueNode = import('vue').VNode | string | number

export interface NotificationClassNames {
  wrapper?: string
  root?: string
  icon?: string
  section?: string
  title?: string
  description?: string
  actions?: string
  close?: string
  progress?: string
}

export interface NotificationStyles {
  wrapper?: CSSProperties
  root?: CSSProperties
  icon?: CSSProperties
  section?: CSSProperties
  title?: CSSProperties
  description?: CSSProperties
  actions?: CSSProperties
  close?: CSSProperties
  progress?: CSSProperties
}

export interface ComponentsType {
  progress?: any
}

export interface NotificationProps {
  // Style
  prefixCls: string
  className?: string
  style?: CSSProperties
  classNames?: NotificationClassNames
  styles?: NotificationStyles
  components?: ComponentsType

  // UI
  title?: VueNode
  description?: VueNode
  icon?: VueNode
  actions?: VueNode
  role?: string
  closable?: ClosableType
  offset?: number
  notificationIndex?: number
  stackInThreshold?: boolean

  // Behavior
  duration?: number | false | null
  showProgress?: boolean
  hovering?: boolean
  pauseOnHover?: boolean
}

export interface NotificationCallbacks {
  onClick?: (e: MouseEvent) => void
  onMouseEnter?: (e: MouseEvent) => void
  onMouseLeave?: (e: MouseEvent) => void
  onClose?: VoidFunction
}

// ===== NotificationList types =====

export interface NotificationListClassNames extends NotificationClassNames {
  list?: string
  listContent?: string
}

export interface NotificationListStyles extends NotificationStyles {
  list?: CSSProperties
  listContent?: CSSProperties
}

export interface NotificationListProps {
  configList?: NotificationListConfig[]
  prefixCls?: string
  placement: Placement
  pauseOnHover?: boolean
  classNames?: NotificationListClassNames
  styles?: NotificationListStyles
  components?: ComponentsType
  stack?: StackConfig
  motion?: any
  className?: string
  style?: CSSProperties
}

// ===== Notifications types =====

export interface NotificationsProps {
  prefixCls?: string
  motion?: any
  container?: HTMLElement | ShadowRoot
  maxCount?: number
  pauseOnHover?: boolean
  classNames?: NotificationClassNames
  styles?: NotificationStyles
  components?: ComponentsType
  className?: (placement: Placement) => string
  style?: (placement: Placement) => CSSProperties
  stack?: StackConfig
}

export interface NotificationsRef {
  open: (config: NotificationListConfig) => void
  close: (key: Key) => void
  destroy: () => void
}

// ===== useNotification hook types =====

export interface NotificationConfig {
  prefixCls?: string
  getContainer?: () => HTMLElement | ShadowRoot
  motion?: any
  closable?: ClosableType
  maxCount?: number
  duration?: number | false | null
  showProgress?: boolean
  pauseOnHover?: boolean
  placement?: Placement
  classNames?: NotificationClassNames
  styles?: NotificationStyles
  components?: ComponentsType
  className?: (placement: Placement) => string
  style?: (placement: Placement) => CSSProperties
  onAllRemoved?: VoidFunction
  stack?: StackConfig
}

export interface NotificationAPI {
  open: (config: Partial<NotificationListConfig>) => void
  close: (key: Key) => void
  destroy: () => void
}

// ===== Progress types =====

export interface NotificationProgressProps {
  percent: number
}
