import type { ComputedRef, InjectionKey } from 'vue'

import type { OverflowContextType } from './interface'

import { inject } from 'vue'

export const OverflowContextKey: InjectionKey<
  ComputedRef<OverflowContextType | null>
> = Symbol('OverflowContext')

export function useInjectOverflowContext() {
  return inject(OverflowContextKey, null)
}
