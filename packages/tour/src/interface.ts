import type { TriggerProps } from '@vapor-component/trigger'
import type { VueNode } from '@v-c/util/dist/type'
import type { AriaAttributes, CSSProperties, Ref } from 'vue'
import type { Gap } from './hooks/useTarget'
import type { PlacementType } from './placements'

export type SemanticName =
  | 'section'
  | 'footer'
  | 'actions'
  | 'header'
  | 'title'
  | 'description'
  | 'mask'
  | 'close'

export type HTMLAriaDataAttributes = AriaAttributes & {
  [key: `data-${string}`]: unknown
  role?: string
}

export interface TourStepInfo {
  arrow?: boolean | { pointAtCenter: boolean }
  target?: Ref<HTMLElement | null | undefined> | HTMLElement | null | (() => HTMLElement | null | undefined)
  title: VueNode
  description?: VueNode
  placement?: PlacementType
  className?: string
  style?: CSSProperties
  mask?:
    | boolean
    | {
      style?: CSSProperties
      color?: string
    }
  scrollIntoViewOptions?: boolean | ScrollIntoViewOptions
  closeIcon?: VueNode
  closable?: boolean | ({ closeIcon?: VueNode } & HTMLAriaDataAttributes)
}

export interface TourStepProps extends TourStepInfo {
  prefixCls?: string
  total?: number
  current?: number
  onClose?: () => void
  onFinish?: () => void
  onPrev?: () => void
  onNext?: () => void
  classNames?: Partial<Record<SemanticName, string>>
  styles?: Partial<Record<SemanticName, CSSProperties>>
}

export interface DefaultPanelSlotData {
  prefixCls: string
  current: number
  total: number
  title: VueNode
  description: VueNode
  onClose: () => void
  onPrev: () => void
  onNext: () => void
  onFinish: () => void
  closable: ClosableConfig | null
  classNames: Partial<Record<SemanticName, string>>
  styles: Partial<Record<SemanticName, CSSProperties>>
}

export type ClosableConfig = {
  closeIcon?: VueNode
} & HTMLAriaDataAttributes

export interface TourProps extends /* @vue-ignore */ Pick<TriggerProps, 'onPopupAlign'> {
  classNames?: Partial<Record<SemanticName, string>>
  styles?: Partial<Record<SemanticName, CSSProperties>>
  className?: string
  style?: CSSProperties
  steps?: TourStepInfo[]
  open?: boolean
  defaultOpen?: boolean
  defaultCurrent?: number
  current?: number
  onChange?: (current: number) => void
  onClose?: (current: number) => void
  onFinish?: () => void
  closeIcon?: TourStepProps['closeIcon']
  closable?: TourStepProps['closable']
  mask?:
    | boolean
    | {
      style?: CSSProperties
      color?: string
    }
  arrow?: boolean | { pointAtCenter: boolean }
  rootClassName?: string
  placement?: PlacementType
  prefixCls?: string
  gap?: Gap
  animated?: boolean | { placeholder: boolean }
  scrollIntoViewOptions?: boolean | ScrollIntoViewOptions
  zIndex?: number
  getPopupContainer?: (node: HTMLElement) => HTMLElement
  builtinPlacements?:
    | TriggerProps['builtinPlacements']
    | ((config?: {
      arrowPointAtCenter?: boolean
    }) => TriggerProps['builtinPlacements'])
  disabledInteraction?: boolean
  keyboard?: boolean
}
