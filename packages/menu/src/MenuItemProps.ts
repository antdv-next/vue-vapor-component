import type { CSSProperties, VueNode } from 'vue'

import type { ItemData, RenderIconType } from './interface'

export interface MenuItemProps {
  style?: CSSProperties
  class?: string
  disabled?: boolean
  itemIcon?: RenderIconType
  extra?: VueNode
  /** @private Internal filled key */
  eventKey?: string
  /** @private Origin item config from items prop */
  itemData?: ItemData
  role?: string
  /** @private */
  warnKey?: boolean
}
