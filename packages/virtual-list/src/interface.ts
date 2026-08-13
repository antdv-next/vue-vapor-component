import type { Key } from '@v-c/util/dist/type'
import type { CSSProperties } from 'vue'

export type ScrollBarDirectionType = 'ltr' | 'rtl'

export type GetKey<T> = (item: T) => Key

export type GetSize = (startKey: Key, endKey?: Key) => { top: number; bottom: number }

export interface ExtraRenderInfo {
  start: number
  end: number
  virtual: boolean
  offsetX: number
  scrollTop: number
  offsetY: number
  rtl: boolean
  getSize: GetSize
}

export interface ScrollInfo {
  x: number
  y: number
}

export interface ScrollPos {
  left?: number
  top?: number
}

export interface ScrollTarget {
  index?: number
  key?: Key
  align?: 'top' | 'bottom' | 'auto'
  offset?: ScrollOffset
}

export type ScrollConfig = ScrollTarget | ScrollPos

export type ScrollAlign = 'top' | 'bottom' | 'auto'

export interface ScrollOffsetInfo {
  getSize: GetSize
  align: ScrollAlign
}

export type ScrollOffset = number | ((info: ScrollOffsetInfo) => number)

export type ScrollTo = (arg?: number | ScrollConfig | null) => void

export interface ListRef {
  nativeElement?: HTMLDivElement
  scrollTo: ScrollTo
  getScrollInfo: () => ScrollInfo
}

export interface InnerProps {
  role?: string
  id?: string
}

export interface ScrollBarRef {
  delayHidden: () => void
}

export interface ItemSlotProps<T> {
  item: T
  index: number
  itemStyle: CSSProperties
  offsetX: number
  setRef: (element: HTMLElement | null) => void
}

export interface ListProps {
  prefixCls?: string
  data?: any[]
  height?: number
  itemHeight?: number
  fullHeight?: boolean
  itemKey: Key | ((item: any) => Key)
  component?: string
  virtual?: boolean
  direction?: ScrollBarDirectionType
  scrollWidth?: number
  styles?: {
    horizontalScrollBar?: CSSProperties
    horizontalScrollBarThumb?: CSSProperties
    verticalScrollBar?: CSSProperties
    verticalScrollBarThumb?: CSSProperties
  }
  showScrollBar?: boolean | 'optional'
  onScroll?: (e: Event) => void
  onVirtualScroll?: (info: ScrollInfo) => void
  onVisibleChange?: (visibleList: any[], fullList: any[]) => void
  innerProps?: InnerProps
}
