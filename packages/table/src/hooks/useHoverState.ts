import type { ComputedRef } from 'vue'

import type { TableContextProps } from '../TableContextKey'
import type { OnHover } from './useHover'

import { computed } from 'vue'

function inHoverRange(
  cellStartRow: number,
  cellRowSpan: number,
  startRow: number,
  endRow: number,
) {
  const cellEndRow = cellStartRow + cellRowSpan - 1
  return cellStartRow <= endRow && cellEndRow >= startRow
}

export default function useHoverState(
  rowIndex: number,
  rowSpan: number,
  context: TableContextProps,
): [hovering: ComputedRef<boolean>, onHover: OnHover] {
  const hovering = computed(() => {
    return inHoverRange(
      rowIndex,
      rowSpan || 1,
      context.hoverStartRow,
      context.hoverEndRow,
    )
  })

  return [hovering, context.onHover]
}
