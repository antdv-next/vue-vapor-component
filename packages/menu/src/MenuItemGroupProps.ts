import type { VueNode } from '@v-c/util/dist/type'
import type { CSSProperties } from 'vue'

export interface MenuItemGroupProps {
  style?: CSSProperties
  class?: string
  title?: VueNode
  /** @private */
  eventKey?: string
  /** @private */
  warnKey?: boolean
}
