import type { VueNode } from '@v-c/util'
import type { InjectionKey } from 'vue'

import type {
  ColumnsType,
  ColumnType,
  Direction,
  ExpandableConfig,
  ExpandableType,
  ExpandedRowRender,
  GetComponent,
  GetComponentProps,
  GetRowKey,
  RenderExpandIcon,
  RowClassName,
  TableLayout,
  TriggerEventHandler,
} from './interface'
import type { TableProps } from './interface'
import type { FixedInfo } from './utils/fixUtil'

import { inject, provide } from 'vue'

export type ScrollInfoType = [scrollLeft: number, scrollRange: number]

export interface TableContextProps<RecordType = any> {
  // Scroll
  scrollX: number | string | true
  classNames?: TableProps['classNames']
  styles?: TableProps['styles']

  // Table
  prefixCls: string
  getComponent: GetComponent
  scrollbarSize: number
  direction: Direction
  fixedInfoList: readonly FixedInfo[]
  isSticky: boolean
  componentWidth: number
  fixHeader: boolean
  fixColumn: boolean
  horizonScroll: boolean
  scrollInfo: ScrollInfoType

  // Body
  rowClassName: string | RowClassName<RecordType>
  expandedRowClassName: string | RowClassName<RecordType>
  onRow?: GetComponentProps<RecordType>
  emptyNode?: VueNode

  tableLayout: TableLayout

  indentSize: number
  expandableType: ExpandableType
  expandRowByClick: boolean
  expandedRowRender: ExpandedRowRender<RecordType>
  forceRender: boolean
  expandIcon: RenderExpandIcon<RecordType>
  onTriggerExpand: TriggerEventHandler<RecordType>
  expandIconColumnIndex: number
  allColumnsFixedLeft: boolean

  // Column
  columns: ColumnsType<RecordType>
  flattenColumns: readonly ColumnType<RecordType>[]
  onColumnResize: (columnKey: string | number, width: number) => void
  colWidths: number[]

  // Row
  hoverStartRow: number
  hoverEndRow: number
  onHover: (start: number, end: number) => void
  rowExpandable: (record: RecordType) => boolean

  expandedKeys: Set<string | number>
  getRowKey: GetRowKey<RecordType>
  childrenColumnName: string

  rowHoverable?: boolean

  expandedRowOffset: ExpandableConfig<RecordType>['expandedRowOffset']

  // Measure Row
  measureRowRender?: (measureRow: VueNode) => VueNode

  // Cell Render
  headerCell?: TableProps<RecordType>['headerCell']
  bodyCell?: TableProps<RecordType>['bodyCell']
}

export const TableContextKey: InjectionKey<TableContextProps> =
  Symbol('TableContextProps')

export function useProvideTableContext<T>(context: T) {
  return provide(TableContextKey, context as any)
}

export function useInjectTableContext<RecordType = any>() {
  return inject(TableContextKey, {} as TableContextProps<RecordType>)
}

export const makeImmutable = <T>(component: T, _shouldTriggerRender?: any): T =>
  component

export const responseImmutable = <T>(component: T): T => component

export function useImmutableMark() {
  return 0
}
