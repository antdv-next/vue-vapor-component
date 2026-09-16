import type { useRowInfo } from './hooks/useRowInfo'
import type { ColumnType } from './interface'

export function getCellProps<RecordType>(
  rowInfo: ReturnType<typeof useRowInfo<RecordType>>,
  record: RecordType,
  column: ColumnType<RecordType>,
  colIndex: number,
  indent: number,
  index: number,
  rowKeys: (string | number)[] = [],
  expandedRowOffset = 0,
) {
  const { columnsKey, nestExpandable, expanded, hasNestChildren, expandable } =
    rowInfo
  const tableContext = rowInfo.tableContext
  const {
    prefixCls,
    fixedInfoList,
    expandIconColumnIndex,
    indentSize,
    expandIcon,
    onTriggerExpand,
    expandedKeys,
  } = tableContext

  const key = columnsKey.value[colIndex]
  const fixedInfo = fixedInfoList[colIndex]

  let appendCellNode: any
  if (colIndex === (expandIconColumnIndex || 0) && nestExpandable.value) {
    appendCellNode = {
      __isExpandCell: true,
      indent,
      indentSize,
      expandIcon: expandIcon({
        prefixCls,
        expanded: expanded.value,
        expandable: hasNestChildren.value,
        record,
        onExpand: onTriggerExpand,
      }),
    }
  }

  // Clone so patching `rowSpan` below never mutates the object `onCell` returned
  const additionalCellProps = { ...column.onCell?.(record, index) }

  let hoverRowSpan: number | undefined
  if (expandedRowOffset && expandable.value && colIndex < expandedRowOffset) {
    const { rowSpan = 1 } = additionalCellProps
    if (rowSpan) {
      hoverRowSpan = rowSpan
      let expandedCount = 0
      for (let i = index; i < index + rowSpan; i += 1) {
        if (expandedKeys.has(rowKeys[i])) {
          expandedCount += 1
        }
      }
      additionalCellProps.rowSpan = rowSpan + expandedCount
    }
  }

  return {
    key,
    fixedInfo,
    appendCellNode,
    additionalCellProps,
    hoverRowSpan,
  }
}
