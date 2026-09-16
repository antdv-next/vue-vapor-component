import type {
  ColumnsType,
  ColumnType,
  DataIndex,
  ExpandableConfig,
  ExpandIconComponent,
  ExpandIconProps,
  FixedType,
  GetComponentProps,
  GetRowKey,
  Reference,
  RenderedCell,
} from './interface'
import type { VirtualTableProps } from './interface'
import type { TableProps } from './interface'

import Column from './Column.vue'
import ColumnGroup from './ColumnGroup.vue'
import { EXPAND_COLUMN, INTERNAL_HOOKS } from './constant'
import Summary from './Summary.vue'
import SummaryCell from './SummaryCell.vue'
import SummaryRow from './SummaryRow.vue'
import Table from './Table.vue'
import { INTERNAL_COL_DEFINE } from './utils/legacyUtil'
import VirtualTable from './virtual/VirtualTable.vue'

export type {
  DataIndex,
  ExpandableConfig,
  ExpandIconComponent,
  ExpandIconProps,
  FixedType,
  GetComponentProps,
  GetRowKey,
  RenderedCell,
}
export {
  Column,
  ColumnGroup,
  type ColumnsType,
  type ColumnType,
  EXPAND_COLUMN,
  INTERNAL_COL_DEFINE,
  INTERNAL_HOOKS,
  type Reference,
  Summary,
  SummaryCell,
  SummaryRow,
  type TableProps,
  VirtualTable,
  type VirtualTableProps,
}

// Pattern C: Attach static properties to Table
const ImmutableTable = Table as typeof Table & {
  EXPAND_COLUMN: typeof EXPAND_COLUMN
  INTERNAL_HOOKS: typeof INTERNAL_HOOKS
  Column: typeof Column
  ColumnGroup: typeof ColumnGroup
  Summary: typeof Summary
}

ImmutableTable.EXPAND_COLUMN = EXPAND_COLUMN
ImmutableTable.INTERNAL_HOOKS = INTERNAL_HOOKS
ImmutableTable.Column = Column
ImmutableTable.ColumnGroup = ColumnGroup
ImmutableTable.Summary = Summary

export default ImmutableTable
