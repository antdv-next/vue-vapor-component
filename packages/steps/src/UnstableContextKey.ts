import type { InjectionKey, Ref } from 'vue'

import { inject, provide, ref } from 'vue'

export interface UnstableContextValue {
  /**
   * Used for Timeline component `reverse` prop.
   * Safe to remove if refactor.
   */
  railFollowPrevStatus?: Ref<boolean>
}

const UnstableContextKey: InjectionKey<UnstableContextValue> =
  Symbol('UnstableContext')

export function useUnstableContext(): UnstableContextValue {
  return inject(UnstableContextKey, {
    railFollowPrevStatus: ref(),
  } as UnstableContextValue)
}

export function provideUnstableContext(value: UnstableContextValue) {
  provide(UnstableContextKey, value)
}
