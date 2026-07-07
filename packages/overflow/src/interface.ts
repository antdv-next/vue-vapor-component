import type { Key, VueNode } from '@v-c/util/dist/type'
import type { CSSProperties } from 'vue'

export type { Key, VueNode }

export const RESPONSIVE = 'responsive' as const
export const INVALIDATE = 'invalidate' as const

export interface OverflowProps<ItemType = any> {
  prefixCls?: string
  data?: ItemType[]
  itemKey?: Key | ((item: ItemType) => Key)
  /** Used for `responsive`. It will limit render node to avoid perf issue */
  itemWidth?: number
  renderItem?: (item: ItemType, info: { index: number }) => VueNode
  /** @private Do not use in your production. Render raw node that need wrap Item by developer self */
  renderRawItem?: (item: ItemType, index: number) => VueNode
  maxCount?: number | typeof RESPONSIVE | typeof INVALIDATE
  renderRest?: VueNode | ((omittedItems: ItemType[]) => VueNode)
  /** @private Do not use in your production. Render raw node that need wrap Item by developer self */
  renderRawRest?: (omittedItems: ItemType[]) => VueNode
  prefix?: VueNode | (() => VueNode)
  suffix?: VueNode | (() => VueNode)
  component?: any
  itemComponent?: any
  /** @private This API may be refactor since not well design */
  onVisibleChange?: (visibleCount: number) => void
  /** When set to `full`, ssr will render full items by default and remove at client side */
  ssr?: 'full'
}

export interface OverflowContextType {
  prefixCls: string
  responsive: boolean
  order: number
  registerSize: (key: Key, width: number | null) => void
  display: boolean
  invalidate: boolean
  item?: any
  itemKey?: Key
  className?: string
}

export type SemanticName = 'item' | 'prefix' | 'suffix' | 'rest'
export type OverflowClassNames = Partial<Record<SemanticName, string>>
export type OverflowStyles = Partial<Record<SemanticName, CSSProperties>>
