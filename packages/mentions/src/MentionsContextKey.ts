import type { MentionsContextProps } from './interface'
import type { ComputedRef, InjectionKey } from 'vue'
import { inject, provide } from 'vue'

const MentionsContextKey: InjectionKey<ComputedRef<MentionsContextProps>> =
  Symbol('MentionsContext')

export function useMentionsContext() {
  return inject(MentionsContextKey, null)
}

export function useMentionsContextProvider(
  value: ComputedRef<MentionsContextProps>,
) {
  provide(MentionsContextKey, value)
}
