import type { VueNode } from '@v-c/util/dist/type'
import type {
  ActionType,
  AlignType,
  AnimationType,
  BuildInPlacements,
} from '@vapor-component/trigger'
import type { CSSProperties } from 'vue'

export interface DropdownProps {
  prefixCls?: string
  overlay?: (() => VueNode) | VueNode
  overlayClassName?: string
  openClassName?: string
  overlayStyle?: CSSProperties
  arrow?: boolean
  placement?: string
  placements?: BuildInPlacements
  trigger?: ActionType | ActionType[]
  alignPoint?: boolean
  showAction?: ActionType[]
  hideAction?: ActionType[]
  visible?: boolean
  defaultVisible?: boolean
  autoFocus?: boolean
  getPopupContainer?: (node: HTMLElement) => HTMLElement
  minOverlayWidthMatchTrigger?: boolean
  transitionName?: string
  animation?: AnimationType
  align?: AlignType
  onPopupAlign?: (element: HTMLElement, align: unknown) => void
  mouseEnterDelay?: number
  mouseLeaveDelay?: number
  autoDestroy?: boolean
}

export interface OverlayProps {
  prefixCls: string
  arrow?: boolean
  overlay?: (() => VueNode) | VueNode
}
