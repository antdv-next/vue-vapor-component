import type { ComputedRef, InjectionKey } from 'vue'
import type { CascaderContextProps } from './interface'
import { computed, inject, provide } from 'vue'

const CascaderContextKey: InjectionKey<
  ComputedRef<CascaderContextProps | null>
> = Symbol('CascaderContext')

export function useCascaderProvider(
  value: ComputedRef<CascaderContextProps | null>,
) {
  provide(CascaderContextKey, value)
}

export function useCascaderContext(): ComputedRef<CascaderContextProps | null> {
  return inject(CascaderContextKey, computed(() => null))
}
