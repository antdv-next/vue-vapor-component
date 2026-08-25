import type { ExpandAction } from '@vapor-component/tree'
import type { DataEntity } from '@vapor-component/tree'
import type { ComputedRef, InjectionKey } from 'vue'

import type {
  CheckedStrategy,
  DataNode,
  FieldNames,
  Key,
  SelectSource,
} from './interface'
import type { TreeSelectProps } from './TreeSelect'

import { computed, inject, provide } from 'vue'

export interface TreeSelectContextProps {
  virtual?: boolean
  popupMatchSelectWidth?: boolean | number
  listHeight: number
  listItemHeight: number
  listItemScrollOffset?: number
  treeData: DataNode[]
  fieldNames: FieldNames
  onSelect: (
    value: Key,
    info: { selected: boolean; source?: SelectSource },
  ) => void
  treeExpandAction?: ExpandAction
  treeTitleRender?: (node: any) => any
  onPopupScroll?: (event: Event) => void
  leftMaxCount: number | null
  leafCountOnly: boolean
  valueEntities: Map<Key, DataEntity>
  showCheckedStrategy?: CheckedStrategy
  classNames?: TreeSelectProps['classNames']
  styles?: TreeSelectProps['styles']
}

const TreeSelectContextKey: InjectionKey<
  ComputedRef<TreeSelectContextProps | null>
> = Symbol('TreeSelectContext')

export function useTreeSelectProvider(
  value: ComputedRef<TreeSelectContextProps | null>,
) {
  provide(TreeSelectContextKey, value)
}

export function useTreeSelectContext(): ComputedRef<TreeSelectContextProps | null> {
  return inject(
    TreeSelectContextKey,
    computed(() => null),
  )
}
