import type { VueNode } from '@v-c/util/dist/type'
import type { CSSProperties } from 'vue'

// ======================== Types ========================

export type Placement =
  | 'top'
  | 'left'
  | 'right'
  | 'bottom'
  | 'topLeft'
  | 'topRight'
  | 'bottomLeft'
  | 'bottomRight'
  | 'leftTop'
  | 'leftBottom'
  | 'rightTop'
  | 'rightBottom'

export type AlignPointTopBottom = 't' | 'b' | 'c'
export type AlignPointLeftRight = 'l' | 'r' | 'c'

/** Two char of 't' 'b' 'c' 'l' 'r'. Example: 'lt' */
export type AlignPoint = `${AlignPointTopBottom}${AlignPointLeftRight}`

export type OffsetType = number | `${number}%`

export interface AlignType {
  points?: (string | AlignPoint)[]

  _experimental?: Record<string, any>

  offset?: OffsetType[]
  targetOffset?: OffsetType[]
  overflow?: {
    adjustX?: boolean | number
    adjustY?: boolean | number
    shiftX?: boolean | number
    shiftY?: boolean | number
  }
  autoArrow?: boolean
  htmlRegion?: 'visible' | 'scroll' | 'visibleFirst'
  dynamicInset?: boolean
  useCssRight?: boolean
  useCssBottom?: boolean
  useCssTransform?: boolean
  ignoreShake?: boolean
}

export interface ArrowTypeOuter {
  style?: CSSProperties
  className?: string
  content?: VueNode
}

export interface ArrowPos {
  x?: number
  y?: number
}

export type BuildInPlacements = Record<string, AlignType>

export type ActionType = 'hover' | 'focus' | 'click' | 'contextMenu'

export type AnimationType = string

export type TransitionNameType = string

export interface Point {
  pageX: number
  pageY: number
}

export interface CommonEventHandler {
  remove: () => void
}

// ======================== Mobile ========================

export interface MobileConfig {
  mask?: boolean
  motion?: any // CSSMotionProps
  maskMotion?: any // CSSMotionProps
}

// ======================== Trigger Props ========================

export interface TriggerProps {
  action?: ActionType | ActionType[]
  showAction?: ActionType[]
  hideAction?: ActionType[]

  prefixCls?: string

  zIndex?: number

  onPopupAlign?: (element: HTMLElement, align: AlignType) => void

  stretch?: string

  // Open
  popupVisible?: boolean
  defaultPopupVisible?: boolean
  onOpenChange?: (visible: boolean) => void
  afterOpenChange?: (visible: boolean) => void
  /** @deprecated Use `onOpenChange` instead */
  onPopupVisibleChange?: (visible: boolean) => void
  /** @deprecated Use `afterOpenChange` instead */
  afterPopupVisibleChange?: (visible: boolean) => void

  // Portal
  getPopupContainer?: ((node: HTMLElement) => HTMLElement) | false
  forceRender?: boolean
  autoDestroy?: boolean

  // Mask
  mask?: boolean
  maskClosable?: boolean

  // Motion
  popupMotion?: any // CSSMotionProps
  maskMotion?: any // CSSMotionProps

  // Delay
  mouseEnterDelay?: number
  mouseLeaveDelay?: number
  focusDelay?: number
  blurDelay?: number

  // Popup
  popup?: VueNode | (() => VueNode)
  popupPlacement?: string
  builtinPlacements?: BuildInPlacements
  popupAlign?: AlignType
  popupClassName?: string
  uniqueContainerClassName?: string
  uniqueContainerStyle?: CSSProperties
  popupStyle?: CSSProperties
  getPopupClassNameFromAlign?: (align: AlignType) => string
  onPopupClick?: (e: MouseEvent) => void

  alignPoint?: boolean

  fresh?: boolean
  unique?: boolean

  // Arrow
  arrow?: boolean | ArrowTypeOuter

  // Mobile
  mobile?: MobileConfig
}

// ======================== Popup Props ========================

export interface PopupProps {
  onEsc?: any // PortalProps['onEsc']

  prefixCls: string
  className?: string
  style?: CSSProperties
  popup?: TriggerProps['popup']
  target: HTMLElement
  onMouseEnter?: (e: MouseEvent) => void
  onMouseLeave?: (e: MouseEvent) => void
  onPointerEnter?: (e: PointerEvent) => void
  onPointerDownCapture?: (e: PointerEvent) => void
  zIndex?: number

  mask?: boolean
  onVisibleChanged: (visible: boolean) => void

  // Arrow
  align?: AlignType
  arrow?: ArrowTypeOuter | boolean
  arrowPos: ArrowPos

  // Open
  open: boolean
  keepDom: boolean
  fresh?: boolean

  // Click
  onClick?: (e: MouseEvent) => void

  // Motion
  motion?: any
  maskMotion?: any

  // Portal
  forceRender?: boolean
  getPopupContainer?: TriggerProps['getPopupContainer']
  autoDestroy?: boolean

  // children

  // Align
  ready: boolean
  offsetX: number
  offsetY: number
  offsetR: number
  offsetB: number
  onAlign: VoidFunction
  onPrepare: (element?: Element) => Promise<void>

  // stretch
  stretch?: string
  targetWidth?: number
  targetHeight?: number

  // Mobile
  mobile?: MobileConfig
}

// ======================== Mask Props ========================

export interface MaskProps {
  prefixCls: string
  open?: boolean
  zIndex?: number
  mask?: boolean
  motion?: any // CSSMotionProps
  mobile?: boolean
}

// ======================== UniqueProvider ========================

export interface UniqueShowOptions {
  id: string
  popup?: TriggerProps['popup']
  target: HTMLElement
  delay: number
  prefixCls?: string
  popupClassName?: string
  uniqueContainerClassName?: string
  uniqueContainerStyle?: CSSProperties
  popupStyle?: CSSProperties
  popupPlacement?: string
  builtinPlacements?: BuildInPlacements
  popupAlign?: AlignType
  zIndex?: number
  mask?: boolean
  maskClosable?: boolean
  popupMotion?: any
  maskMotion?: any
  arrow?: ArrowTypeOuter
  getPopupContainer?: TriggerProps['getPopupContainer']
  getPopupClassNameFromAlign?: (align: AlignType) => string
  onEsc?: any
}

export interface UniqueProviderProps {
  postTriggerProps?: (options: UniqueShowOptions) => UniqueShowOptions
}

export interface UniqueContextProps {
  show: (options: UniqueShowOptions, isOpen: () => boolean) => void
  hide: (delay: number) => void
}
