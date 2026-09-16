import type { VueNode } from '@v-c/util'
import type {
  CSSProperties,
  HTMLAttributes,
  Ref,
  TdHTMLAttributes,
  Component as VueComponent,
} from 'vue'

import type { DeepNamePath } from './namePathType'

export type Key = string | number

export type FixedType = 'start' | 'end' | 'left' | 'right' | boolean

export type DefaultRecordType = Record<string, any>

export type TableLayout = 'auto' | 'fixed'

export interface ScrollConfig {
  index?: number
  key?: Key
  top?: number
  offset?: number
  align?: ScrollLogicalPosition
}

export type VirtualScrollConfig = ScrollConfig & {
  align?: Exclude<ScrollLogicalPosition, 'center'>
}

export interface Reference {
  nativeElement: HTMLDivElement
  scrollTo: (config: ScrollConfig) => void
}

// ==================== Row =====================
export type RowClassName<RecordType> = (
  record: RecordType,
  index: number,
  indent: number,
) => string

// =================== Column ===================
export interface CellType<RecordType> {
  key?: Key
  className?: string
  style?: CSSProperties
  children?: VueNode
  column?: ColumnsType<RecordType>[number]
  colSpan?: number
  rowSpan?: number
  hasSubColumns?: boolean
  colStart?: number
  colEnd?: number
}

export interface RenderedCell<RecordType> {
  props?: CellType<RecordType>
  children?: VueNode
}

export type Direction = 'ltr' | 'rtl'

export type SpecialString<T> = T | (string & NonNullable<unknown>)

export type DataIndex<T = any> =
  | DeepNamePath<T>
  | SpecialString<T>
  | number
  | (SpecialString<T> | number)[]

export type CellEllipsisType = { showTitle?: boolean } | boolean

export type ColScopeType = 'col' | 'colgroup'

export type RowScopeType = 'row' | 'rowgroup'

export type ScopeType = ColScopeType | RowScopeType

interface ColumnSharedType<RecordType> {
  title?: VueNode
  key?: Key
  className?: string
  hidden?: boolean
  fixed?: FixedType
  onHeaderCell?: GetComponentProps<ColumnsType<RecordType>[number]>
  ellipsis?: CellEllipsisType
  align?: AlignType
  rowScope?: RowScopeType
}

export interface ColumnGroupType<
  RecordType,
> extends ColumnSharedType<RecordType> {
  children: ColumnsType<RecordType>
}

export type AlignType =
  | 'start'
  | 'end'
  | 'left'
  | 'right'
  | 'center'
  | 'justify'
  | 'match-parent'

export interface ColumnType<
  RecordType = Record<string, any>,
> extends ColumnSharedType<RecordType> {
  colSpan?: number
  dataIndex?: DataIndex<RecordType>
  render?: (
    value: any,
    record: RecordType,
    index: number,
  ) => VueNode | RenderedCell<RecordType>
  shouldCellUpdate?: (record: RecordType, prevRecord: RecordType) => boolean
  rowSpan?: number
  width?: number | string
  minWidth?: number
  onCell?: GetComponentProps<RecordType>
  onCellClick?: (record: RecordType, e: MouseEvent) => void
}

export type ColumnsType<RecordType = Record<string, any>> = readonly (
  | ColumnGroupType<RecordType>
  | ColumnType<RecordType>
)[]

export type GetRowKey<RecordType = Record<string, any>> = (
  record: RecordType,
  index?: number,
) => Key

// ================= Fix Column =================
export interface StickyOffsets {
  start: readonly number[]
  end: readonly number[]
  widths: readonly number[]
  isSticky?: boolean
}

// ================= Customized =================
export type CellAttributes = HTMLAttributes &
  TdHTMLAttributes & {
    colSpan?: number
    rowSpan?: number
    colspan?: number
    rowspan?: number
    className?: string
  }

export type GetComponentProps<DataType = Record<string, any>> = {
  bivarianceHack: (data: DataType, index?: number) => Partial<CellAttributes>
}['bivarianceHack']

type Component = any

export type CustomizeComponent = Component

export type OnCustomizeScroll = (info: {
  currentTarget?: HTMLElement
  scrollLeft?: number
}) => void

export type CustomizeScrollBody<RecordType = Record<string, any>> = (
  data: readonly RecordType[],
  info: {
    scrollbarSize: number
    ref: Ref<{
      scrollLeft: number
      scrollTo?: (scrollConfig: ScrollConfig) => void
    } | null>
    onScroll: OnCustomizeScroll
  },
) => any

export interface TableComponents<RecordType> {
  ExpandIcon?: ExpandIconComponent<RecordType>
  table?: CustomizeComponent
  header?: {
    table?: CustomizeComponent
    wrapper?: CustomizeComponent
    row?: CustomizeComponent
    cell?: CustomizeComponent
  }
  body?:
    | CustomizeScrollBody<RecordType>
    | {
        wrapper?: CustomizeComponent
        row?: CustomizeComponent
        cell?: CustomizeComponent
      }
}

export type GetComponent = (
  path: readonly string[],
  defaultComponent?: CustomizeComponent,
) => CustomizeComponent

// =================== Expand ===================
export type ExpandableType = false | 'row' | 'nest'

export interface LegacyExpandableProps<RecordType> {
  expandedRowKeys?: Key[]
  defaultExpandedRowKeys?: Key[]
  expandedRowRender?: ExpandedRowRender<RecordType>
  expandRowByClick?: boolean
  expandIcon?: RenderExpandIcon<RecordType>
  onExpand?: (expanded: boolean, record: RecordType) => void
  onExpandedRowsChange?: (expandedKeys: Key[]) => void
  defaultExpandAllRows?: boolean
  indentSize?: number
  expandIconColumnIndex?: number
  expandedRowClassName?: RowClassName<RecordType>
  childrenColumnName?: string
  title?: PanelRender<RecordType>
}

export type ExpandedRowRender<ValueType> = (
  record: ValueType,
  index: number,
  indent: number,
  expanded: boolean,
) => any

export interface RenderExpandIconProps<RecordType> {
  prefixCls: string
  expanded: boolean
  record: RecordType
  expandable: boolean
  onExpand: TriggerEventHandler<RecordType>
}

export type RenderExpandIcon<RecordType> = (
  props: RenderExpandIconProps<RecordType>,
) => any

export type ExpandIconProps<RecordType> = {
  prefixCls: string
  expanded: boolean
  expandable: boolean
  onClick: (event: MouseEvent) => void
} & (
  | {
      type: 'row'
      record: RecordType
    }
  | {
      type: 'all'
      record?: never
    }
)

export type ExpandIconComponent<RecordType> = VueComponent<
  ExpandIconProps<RecordType>
>

export interface ExpandColumnTitleProps {
  expandIcon: VueNode
}

export type ExpandColumnTitle =
  | VueNode
  | ((props: ExpandColumnTitleProps) => VueNode)

export interface ExpandableConfig<RecordType> {
  expandedRowKeys?: readonly Key[]
  defaultExpandedRowKeys?: readonly Key[]
  expandedRowRender?: ExpandedRowRender<RecordType>
  forceRender?: boolean
  columnTitle?: ExpandColumnTitle
  expandRowByClick?: boolean
  expandIcon?: RenderExpandIcon<RecordType>
  onExpand?: (expanded: boolean, record: RecordType) => void
  onExpandAll?: (expanded: boolean) => void
  onExpandedRowsChange?: (expandedKeys: readonly Key[]) => void
  defaultExpandAllRows?: boolean
  indentSize?: number
  expandIconColumnIndex?: number
  showExpandColumn?: boolean
  showExpandAll?: boolean
  expandedRowClassName?: string | RowClassName<RecordType>
  childrenColumnName?: string
  rowExpandable?: (record: RecordType) => boolean
  columnWidth?: number | string
  fixed?: FixedType
  expandedRowOffset?: number
}

// =================== Render ===================
export type PanelRender<RecordType> = (data: readonly RecordType[]) => any

// =================== Events ===================
export type TriggerEventHandler<RecordType> = (
  record: RecordType,
  event: MouseEvent,
) => void

// =================== Sticky ===================
export interface TableSticky {
  offsetHeader?: number
  offsetSummary?: number
  offsetScroll?: number
  getContainer?: () => Window | HTMLElement
}

// =================== Table ===================
export type SemanticName = 'section' | 'title' | 'footer' | 'content'
export type ComponentsSemantic = 'wrapper' | 'cell' | 'row'

export interface TableProps<RecordType = DefaultRecordType> extends Omit<
  LegacyExpandableProps<RecordType>,
  'showExpandColumn' | 'onExpand' | 'onExpandedRowsChange' | 'title'
> {
  prefixCls?: string
  classNames?: Partial<Record<SemanticName, string>> & {
    body?: Partial<Record<ComponentsSemantic, string>>
    header?: Partial<Record<ComponentsSemantic, string>>
  }
  styles?: Partial<Record<SemanticName, CSSProperties>> & {
    body?: Partial<Record<ComponentsSemantic, CSSProperties>>
    header?: Partial<Record<ComponentsSemantic, CSSProperties>>
  }
  data?: readonly RecordType[]
  columns?: ColumnsType<RecordType>
  rowKey?: string | keyof RecordType | GetRowKey<RecordType>
  tableLayout?: TableLayout
  scroll?: { x?: number | true | string; y?: number | string }
  expandable?: ExpandableConfig<RecordType>
  indentSize?: number
  rowClassName?: string | RowClassName<RecordType>
  headerCell?: (ctx: {
    column: ColumnType<any>
    index: number
    text: any
  }) => any
  bodyCell?: (ctx: {
    column: ColumnType<any>
    index: number
    text: any
    record: RecordType
  }) => any
  caption?: any
  id?: string
  showHeader?: boolean
  components?: TableComponents<RecordType>
  onRow?: GetComponentProps<RecordType>
  onHeaderRow?: GetComponentProps<readonly ColumnType<RecordType>[]>
  emptyText?: any | (() => any)
  direction?: Direction
  sticky?: boolean | TableSticky
  rowHoverable?: boolean
  internalHooks?: string
  transformColumns?: (
    columns: ColumnsType<RecordType>,
  ) => ColumnsType<RecordType>
  tailor?: boolean
  getContainerWidth?: (ele: HTMLElement, width: number) => number
  internalRefs?: {
    body: { value?: HTMLDivElement | null }
  }
  measureRowRender?: (measureRow: any) => any
  getPopupContainer?: (triggerNode?: HTMLElement) => HTMLElement
  title?: PanelRender<RecordType>
  footer?: PanelRender<RecordType>
  summary?: (data: readonly RecordType[]) => any
  fixFooter?: 'top' | 'bottom'
}

export type VirtualTableProps<RecordType = DefaultRecordType> =
  TableProps<RecordType>
