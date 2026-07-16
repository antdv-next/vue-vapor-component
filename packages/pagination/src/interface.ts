import type { VueNode } from '@v-c/util/dist/type'
import type { CSSProperties } from 'vue'

export type { VueNode }

export interface PaginationLocale {
  items_per_page?: string
  jump_to?: string
  jump_to_confirm?: string
  page?: string
  prev_page?: string
  next_page?: string
  prev_5?: string
  next_5?: string
  prev_3?: string
  next_3?: string
  page_size?: string
}

export type SemanticName = 'item'

export type ItemRender = (
  page: number,
  type: 'page' | 'prev' | 'next' | 'jump-prev' | 'jump-next',
  element: VueNode,
) => VueNode

export type ShowTotal = (total: number, range: [number, number]) => VueNode

export type SizeChangerRender = (info: {
  disabled: boolean
  size: number
  onSizeChange: (value: string | number) => void
  'aria-label': string
  className: string
  options: { label: string; value: string | number }[]
}) => VueNode

export interface PaginationProps {
  prefixCls?: string
  selectPrefixCls?: string
  current?: number
  defaultCurrent?: number
  total?: number
  pageSize?: number
  defaultPageSize?: number
  pageSizeOptions?: number[]
  hideOnSinglePage?: boolean
  align?: 'start' | 'center' | 'end'
  showSizeChanger?: boolean
  sizeChangerRender?: SizeChangerRender
  showLessItems?: boolean
  showPrevNextJumpers?: boolean
  showQuickJumper?: boolean | { goButton?: boolean | string | VueNode }
  showTitle?: boolean
  simple?: boolean | { readOnly?: boolean }
  disabled?: boolean
  locale?: PaginationLocale
  prevIcon?: VueNode | (() => VueNode)
  nextIcon?: VueNode | (() => VueNode)
  jumpPrevIcon?: VueNode | (() => VueNode)
  jumpNextIcon?: VueNode | (() => VueNode)
  classNames?: Partial<Record<SemanticName, string>>
  styles?: Partial<Record<SemanticName, CSSProperties>>
  itemRender?: ItemRender
  showTotal?: ShowTotal
  onChange?: (page: number, pageSize: number) => void
  onShowSizeChange?: (current: number, size: number) => void
  role?: string
  totalBoundaryShowSizeChanger?: number
}

export interface PagerProps {
  rootPrefixCls: string
  page: number
  active?: boolean
  class?: string | object | string[]
  style?: CSSProperties
  showTitle: boolean
  itemRender?: ItemRender
  onClick?: (page: number) => void
}

export interface OptionsProps {
  disabled?: boolean
  locale: PaginationLocale
  rootPrefixCls: string
  pageSize: number
  pageSizeOptions?: number[]
  goButton?: boolean | string | VueNode
  changeSize?: (size: number) => void
  quickGo?: (value: number | undefined) => void
  showSizeChanger: boolean
  sizeChangerRender?: SizeChangerRender
}
