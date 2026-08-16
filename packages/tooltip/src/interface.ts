import type { VueNode } from '@v-c/util/dist/type'
import type {
  ActionType,
  AlignType,
  ArrowType,
  TriggerProps,
} from '@vapor-component/trigger'
import type { CSSProperties } from 'vue'

export type SemanticName = 'root' | 'arrow' | 'container' | 'uniqueContainer'

export interface TooltipProps extends Pick<
  TriggerProps,
  | 'builtinPlacements'
  | 'fresh'
  | 'mouseLeaveDelay'
  | 'mouseEnterDelay'
  | 'prefixCls'
  | 'forceRender'
  | 'popupVisible'
> {
  // Style
  classNames?: Partial<Record<SemanticName, string>>
  styles?: Partial<Record<SemanticName, CSSProperties>>

  /** Config popup motion */
  motion?: TriggerProps['popupMotion']

  // Rest
  trigger?: ActionType | ActionType[]
  defaultVisible?: boolean
  visible?: boolean
  placement?: string

  afterVisibleChange?: (visible: boolean) => void
  overlay: (() => VueNode) | VueNode

  getTooltipContainer?: (node: HTMLElement) => HTMLElement
  destroyOnHidden?: boolean
  align?: AlignType
  showArrow?: boolean | ArrowType
  arrowContent?: VueNode
  id?: string

  zIndex?: number

  /**
   * Configures Tooltip to reuse the background for transition usage.
   * This is an experimental API and may not be stable.
   */
  unique?: TriggerProps['unique']
}

export interface TooltipRef {
  nativeElement: HTMLElement
  popupElement: HTMLDivElement
  forceAlign: VoidFunction
}

export interface ContentProps {
  prefixCls?: string
  id?: string
  classNames?: TooltipProps['classNames']
  styles?: TooltipProps['styles']
}
