import type { FixedType, StickyOffsets } from '../interface'

export interface FixedInfo {
  fixStart: number | false
  fixEnd: number | false
  isSticky: boolean
  fixedStartShadow?: boolean
  fixedEndShadow?: boolean
  offsetFixedStartShadow?: number
  offsetFixedEndShadow?: number
  zIndex?: number
  zIndexReverse?: number
}

function isFixedStart(column: { fixed?: FixedType }) {
  return column.fixed === 'start'
}
function isFixedEnd(column: { fixed?: FixedType }) {
  return column.fixed === 'end'
}

export function getCellFixedInfo(
  colStart: number,
  colEnd: number,
  columns: readonly { fixed?: FixedType }[],
  stickyOffsets: StickyOffsets,
): FixedInfo {
  const startColumn = columns[colStart] || {}
  const endColumn = columns[colEnd] || {}

  let fixStart: number | null = null
  let fixEnd: number | null = null

  if (isFixedStart(startColumn) && isFixedStart(endColumn)) {
    fixStart = stickyOffsets.start[colStart]
  } else if (isFixedEnd(endColumn) && isFixedEnd(startColumn)) {
    fixEnd = stickyOffsets.end[colEnd]
  }

  let fixedStartShadow = false
  let fixedEndShadow = false

  let zIndex = 0
  let zIndexReverse = 0

  if (fixStart !== null) {
    fixedStartShadow =
      !columns[colEnd + 1] || !isFixedStart(columns[colEnd + 1])
    zIndex = columns.length * 2 - colStart
    zIndexReverse = columns.length + colStart
  }
  if (fixEnd !== null) {
    fixedEndShadow =
      !columns[colStart - 1] || !isFixedEnd(columns[colStart - 1])
    zIndex = colEnd
    zIndexReverse = columns.length - colEnd
  }

  let offsetFixedStartShadow = 0
  let offsetFixedEndShadow = 0

  if (fixedStartShadow) {
    for (let i = 0; i < colStart; i += 1) {
      if (!isFixedStart(columns[i])) {
        offsetFixedStartShadow += stickyOffsets.widths[i] || 0
      }
    }
  }
  if (fixedEndShadow) {
    for (let i = columns.length - 1; i > colEnd; i -= 1) {
      if (!isFixedEnd(columns[i])) {
        offsetFixedEndShadow += stickyOffsets.widths[i] || 0
      }
    }
  }

  return {
    fixStart: fixStart!,
    fixEnd: fixEnd!,
    fixedStartShadow,
    fixedEndShadow,
    offsetFixedStartShadow,
    offsetFixedEndShadow,
    isSticky: stickyOffsets.isSticky!,
    zIndex,
    zIndexReverse,
  }
}
