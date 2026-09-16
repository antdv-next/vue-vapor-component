import type {
  ExpandableConfig,
  GetRowKey,
  Key,
  RenderExpandIconProps,
} from '../interface'

export function renderExpandIcon<RecordType>({
  prefixCls,
  record,
  onExpand,
  expanded,
  expandable,
}: RenderExpandIconProps<RecordType>) {
  const onClick = (event: MouseEvent) => {
    onExpand(record, event)
    event.stopPropagation()
  }

  return {
    __isExpandIcon: true,
    type: 'row',
    prefixCls,
    record,
    expanded,
    expandable: !!expandable,
    onClick,
  } as any
}

export function renderRowExpandIcon<RecordType>(
  _CustomExpandIcon: any,
  props: RenderExpandIconProps<RecordType>,
) {
  const { prefixCls, record, onExpand, expanded, expandable } = props
  const onClick = (event: MouseEvent) => {
    onExpand(record, event)
    event.stopPropagation()
  }

  return {
    __isExpandIcon: true,
    type: 'row',
    prefixCls,
    record,
    expanded,
    expandable: !!expandable,
    onClick,
  } as any
}

export function findAllChildrenKeys<RecordType>(
  data: readonly RecordType[],
  getRowKey: GetRowKey<RecordType>,
  childrenColumnName: string,
): Key[] {
  const keys: Key[] = []

  function dig(list: readonly RecordType[]) {
    ;(list || []).forEach((item, index) => {
      keys.push(getRowKey(item, index))
      dig((item as any)[childrenColumnName])
    })
  }

  dig(data)

  return keys
}

export function computedExpandedClassName<RecordType>(
  cls: ExpandableConfig<RecordType>['expandedRowClassName'],
  record: RecordType,
  index: number,
  indent: number,
) {
  if (typeof cls === 'string') {
    return cls
  }
  if (typeof cls === 'function') {
    return cls(record, index, indent)
  }
  return ''
}
