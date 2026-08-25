import type { Ref } from 'vue'

import type { DataNode, FieldNames } from '../interface'
import type { TreeSelectProps } from '../TreeSelect'

import { computed } from 'vue'

type FilterFn =
  NonNullable<TreeSelectProps['showSearch']> extends infer T
    ? T extends { filterTreeNode?: any }
      ? T['filterTreeNode']
      : never
    : never

export default function useFilterTreeData(
  treeData: Ref<DataNode[]>,
  searchValue: Ref<string>,
  options: {
    fieldNames: Ref<FieldNames>
    treeNodeFilterProp: Ref<string>
    filterTreeNode: Ref<
      | boolean
      | ((inputValue: string, treeNode: DataNode) => boolean)
      | undefined
    >
  },
): Ref<DataNode[]> {
  return computed(() => {
    const { children: fieldChildren } = options.fieldNames.value
    const mergedSearchValue = searchValue.value
    const childrenField = fieldChildren || 'children'
    const valueField = options.fieldNames.value.value || 'value'

    if (!mergedSearchValue || options.filterTreeNode.value === false) {
      return treeData.value
    }

    const filterOptionFunc =
      typeof options.filterTreeNode.value === 'function'
        ? options.filterTreeNode.value
        : (_: string, dataNode: DataNode) =>
            String(
              (dataNode as any)[options.treeNodeFilterProp.value || valueField],
            )
              .toUpperCase()
              .includes(mergedSearchValue.toUpperCase())

    const filterTreeNodes = (nodes: DataNode[], keepAll = false): DataNode[] =>
      nodes.reduce<DataNode[]>((filtered, node) => {
        const children = (node as any)[childrenField] as DataNode[] | undefined
        const isMatch =
          keepAll || filterOptionFunc(mergedSearchValue, node as any)
        const filteredChildren = filterTreeNodes(children || [], isMatch)

        if (isMatch || filteredChildren.length) {
          filtered.push({
            ...node,
            isLeaf: undefined,
            [childrenField]: filteredChildren,
          })
        }
        return filtered
      }, [])

    return filterTreeNodes(treeData.value)
  })
}
