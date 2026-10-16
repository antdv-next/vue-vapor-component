import type { Key } from '@v-c/util/dist/type'
import type { CSSProperties, Ref, TransitionProps } from 'vue'

export type SemanticName = 'header' | 'title' | 'body' | 'icon'

export interface CollapsePanelProps {
  id?: string
  header?: string
  prefixCls?: string
  headerClass?: string
  showArrow?: boolean
  classNames?: Partial<Record<SemanticName, string>>
  styles?: Partial<Record<SemanticName, CSSProperties>>
  isActive?: boolean
  openMotion?: TransitionProps
  destroyOnHidden?: boolean
  accordion?: boolean
  forceRender?: boolean
  extra?: string
  panelKey?: Key
  role?: string
  collapsible?: CollapsibleType
  children?: string
  content?: string
}

export type CollapsibleType = 'header' | 'icon' | 'disabled'

/** Scope passed to the `expandIcon` slots: the Panel props plus the merged active state. */
export type ExpandIconSlotProps = CollapsePanelProps & { isActive: boolean }

export interface ItemType extends Omit<
  CollapsePanelProps,
  | 'header' // alias of label
  | 'prefixCls'
  | 'panelKey' // alias of key
  | 'isActive'
  | 'accordion'
  | 'openMotion'
> {
  key?: CollapsePanelProps['panelKey']
  label?: CollapsePanelProps['header']
  ref?: Ref<HTMLDivElement>
}

export interface CollapseProps {
  prefixCls?: string
  activeKey?: Key | Key[]
  defaultActiveKey?: Key | Key[]
  openMotion?: TransitionProps
  accordion?: boolean
  destroyOnHidden?: boolean
  collapsible?: CollapsibleType
  items?: ItemType[]
  classNames?: Partial<Record<SemanticName, string>>
  styles?: Partial<Record<SemanticName, CSSProperties>>
}

export interface CollapseSlots {
  default?: () => any
  /** Re-scoped to each Panel's props, so consumers can read `isActive` / `panelKey` */
  expandIcon?: (slotProps: ExpandIconSlotProps) => any
  content?: () => any
}

export interface CollapsePanelSlots {
  /** Panel body content (VNode-capable); takes priority over the default slot */
  content?: () => any
  /** Panel body content too, rendered as the `content` slot's fallback */
  default?: () => any
  /** Fallbacks to the `header` prop text when not provided */
  header?: () => any
  /** Fallbacks to the `extra` prop text when not provided */
  extra?: () => any
  expandIcon?: (slotProps: ExpandIconSlotProps) => any
}

export type { Key }
