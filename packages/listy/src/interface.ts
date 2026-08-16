import type { Key } from '@v-c/util/dist/type'
import type { CSSProperties } from 'vue'

export type RowKey<T = any> = keyof T | ((item: T) => Key)

export type ScrollAlign = 'top' | 'bottom' | 'auto'

export type ListySemanticName = 'root' | 'item' | 'groupHeader'

export type ListyClassNames = Partial<Record<ListySemanticName, string>>

export type ListyStyles = Partial<Record<ListySemanticName, CSSProperties>>

export interface GroupScrollToConfig {
  groupKey: string
  align?: ScrollAlign
  offset?: number
}

export interface KeyScrollToConfig {
  key: string
  align?: ScrollAlign
  offset?: number
}

export interface PositionScrollToConfig {
  left?: number
  top?: number
}

export type ListyScrollToConfig =
  | number
  | null
  | KeyScrollToConfig
  | PositionScrollToConfig
  | GroupScrollToConfig

export interface ListyRef {
  scrollTo: (config?: ListyScrollToConfig) => void
}

export type GroupKey<T = any> = ((item: T) => Key) | Key

export interface Group<T = any> {
  key: GroupKey<T>
  title?: (groupKey: Key, items: T[]) => any
}

export interface ListyProps {
  items?: any[]
  rowKey: RowKey
  virtual?: boolean
  prefixCls?: string
  height?: number
  itemHeight?: number
  group?: Group
  sticky?: boolean
  direction?: 'ltr' | 'rtl'
  classNames?: ListyClassNames
  styles?: ListyStyles
}

export interface ListComponentProps {
  data: any[]
  rowKey: RowKey
  prefixCls: string
  height?: number
  itemHeight?: number
  group?: Group
  sticky?: boolean
  direction?: 'ltr' | 'rtl'
  classNames?: ListyClassNames
  styles?: ListyStyles
}
