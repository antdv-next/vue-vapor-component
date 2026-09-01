import type { CSSProperties, VueNode } from 'vue'

import type { RenderIconType } from './interface'

export type SubMenuSemanticName = 'list' | 'listTitle'

export interface SubMenuProps {
  style?: CSSProperties
  class?: string
  title?: VueNode
  itemTitle?: string
  disabled?: boolean
  eventKey?: string
  itemIcon?: RenderIconType
  expandIcon?: RenderIconType
  popupClassName?: string
  popupOffset?: number[]
  popupStyle?: CSSProperties
  classes?: Partial<Record<SemanticName, string>>
  styles?: Partial<Record<SemanticName, CSSProperties>>
  /** @private Used for rest popup */
  internalPopupClose?: boolean
  /** @private */
  warnKey?: boolean
}
