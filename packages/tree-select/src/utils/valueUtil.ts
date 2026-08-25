import type { DataNode, FieldNames, SafeKey } from '../interface'

export function toArray<T>(value: T | T[]): T[] {
  return Array.isArray(value) ? value : value !== undefined ? [value] : []
}

export function fillFieldNames(fieldNames?: FieldNames): FieldNames & {
  _title: string[]
  key: string
  children: string
  value: string
} {
  const { label, value, children } = fieldNames || {}
  return {
    _title: label ? [label] : ['title', 'label'],
    value: value || 'value',
    key: value || 'value',
    children: children || 'children',
    ...(label ? { label } : {}),
    ...(children ? { children } : {}),
  } as any
}

export function isCheckDisabled(node: DataNode): boolean {
  return (
    !node || node.disabled || node.disableCheckbox || node.checkable === false
  )
}

export function getAllKeys(
  treeData: DataNode[],
  fieldNames: FieldNames,
): SafeKey[] {
  const keys: SafeKey[] = []
  const childrenField = fieldNames.children || 'children'
  const valueField = fieldNames.value || 'value'

  const dig = (list: DataNode[]): void => {
    list.forEach(item => {
      const children = (item as any)[childrenField] as DataNode[] | undefined
      if (children) {
        keys.push((item as any)[valueField] as SafeKey)
        dig(children)
      }
    })
  }

  dig(treeData)
  return keys
}

export const isNil = (val: any): boolean => val === null || val === undefined

export function getLabel(item: DataNode, fieldNames: FieldNames): any {
  const titleList = fieldNames._title || ['title', 'label']
  for (let i = 0; i < titleList.length; i += 1) {
    const title = (item as any)[titleList[i]]
    if (title !== undefined) {
      return title
    }
  }
  return undefined
}
