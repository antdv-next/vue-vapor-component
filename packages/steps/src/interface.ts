import type { CSSProperties } from 'vue'

export type Status = 'error' | 'process' | 'finish' | 'wait'

export type SemanticName =
  | 'root'
  | 'item'
  | 'itemWrapper'
  | 'itemHeader'
  | 'itemTitle'
  | 'itemSubtitle'
  | 'itemSection'
  | 'itemContent'
  | 'itemIcon'
  | 'itemRail'

export type ItemSemanticName =
  | 'root'
  | 'wrapper'
  | 'header'
  | 'title'
  | 'subtitle'
  | 'section'
  | 'content'
  | 'icon'
  | 'rail'

export type ComponentType = string | any

export interface StepItem {
  /** @deprecated Please use `content` instead. */
  description?: string | number
  content?: string | number
  disabled?: boolean
  icon?: string
  status?: Status
  subTitle?: string | number
  title?: string | number
  classNames?: Partial<Record<ItemSemanticName, string>>
  styles?: Partial<Record<ItemSemanticName, CSSProperties>>
  onClick?: (e: MouseEvent) => void
  class?: string
  style?: CSSProperties
}

export interface RenderInfo {
  index: number
  active: boolean
  item: StepItem
}

export interface StepsProps {
  // style
  prefixCls?: string
  style?: CSSProperties
  className?: string
  classNames?: Partial<Record<SemanticName, string>>
  styles?: Partial<Record<SemanticName, CSSProperties>>
  rootClassName?: string

  // layout
  orientation?: 'horizontal' | 'vertical'
  titlePlacement?: 'horizontal' | 'vertical'

  // a11y
  components?: {
    root?: ComponentType
    item?: ComponentType
  }

  // data
  status?: Status
  current?: number
  initial?: number
  items?: StepItem[]
}

export interface StepsSlots {
  title?: (slotProps: { title?: string | number }) => any
  subTitle?: (slotProps: { subTitle?: string | number }) => any
  content?: (slotProps: { content?: string | number }) => any
  iconRender?: (slotProps: RenderInfo & { icon: any }) => any
  itemRender?: (slotProps: { info: RenderInfo }) => any
  itemWrapperRender?: (slotProps: { info: RenderInfo }) => any
}

export interface StepsEmits {
  change: [current: number]
}

export interface StepSlots {
  title?: (slotProps: { title?: string | number }) => any
  subTitle?: (slotProps: { subTitle?: string | number }) => any
  content?: (slotProps: { content?: string | number }) => any
  iconRender?: (slotProps: RenderInfo & { icon: any }) => any
  itemRender?: (slotProps: { info: RenderInfo }) => any
  itemWrapperRender?: (slotProps: { info: RenderInfo }) => any
}

export interface StepEmits {
  click: [index: number]
}
