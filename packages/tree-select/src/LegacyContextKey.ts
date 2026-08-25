import type { ExpandAction, IconType } from '@vapor-component/tree'
import type { ComputedRef, InjectionKey } from 'vue'

import type { Key, SafeKey } from './interface'

import { computed, inject, provide } from 'vue'

export interface LegacyContextProps {
  checkable: boolean | any
  loadData?: (dataNode: any) => Promise<unknown>
  treeLoadedKeys?: SafeKey[]
  onTreeLoad?: (loadedKeys: SafeKey[]) => void
  checkedKeys: Key[]
  halfCheckedKeys: Key[]
  treeDefaultExpandAll?: boolean
  treeExpandedKeys?: Key[]
  treeDefaultExpandedKeys: Key[]
  onTreeExpand?: (keys: Key[]) => void
  treeIcon?: IconType
  showTreeIcon?: boolean
  switcherIcon?: IconType
  treeLine?: boolean
  treeNodeFilterProp: string
  keyEntities: Record<string, any>
  treeExpandAction?: ExpandAction
  treeTitleRender?: (node: any) => any
  onPopupScroll?: (event: Event) => void
  disabled?: boolean
}

const LegacyContextKey: InjectionKey<ComputedRef<LegacyContextProps | null>> =
  Symbol('LegacyTreeSelectContext')

export function useLegacyProvider(
  value: ComputedRef<LegacyContextProps | null>,
) {
  provide(LegacyContextKey, value)
}

export function useLegacyContext(): ComputedRef<LegacyContextProps | null> {
  return inject(
    LegacyContextKey,
    computed(() => null),
  )
}
