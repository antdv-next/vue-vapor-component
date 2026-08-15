import type { ComputedRef, InjectionKey } from 'vue'
import type { DataNode, TreeContextProps } from './interface'

import { computed, inject, provide } from 'vue'

export interface UnstableContextValue {
  nodeDisabled?: (n: DataNode) => boolean
}

export const TreeContextKey: InjectionKey<ComputedRef<TreeContextProps<any> | null>> =
  Symbol('TreeContext')

export const UnstableContextKey: InjectionKey<ComputedRef<UnstableContextValue | null>> =
  Symbol('UnstableTreeContext')

export function useTreeContext(): ComputedRef<TreeContextProps<any> | null> {
  return inject(
    TreeContextKey,
    computed(() => null),
  )
}

export function provideTreeContext(
  value: ComputedRef<TreeContextProps<any> | null>,
) {
  provide(TreeContextKey, value)
}

export function useUnstableContext(): ComputedRef<UnstableContextValue | null> {
  return inject(
    UnstableContextKey,
    computed(() => null),
  )
}