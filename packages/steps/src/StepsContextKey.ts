import type { ComputedRef, InjectionKey } from 'vue'

import type { ComponentType, StepsProps } from './interface'

import { computed, inject, provide } from 'vue'

export interface StepsContextValue {
  prefixCls: string
  ItemComponent: ComponentType
  classNames: NonNullable<StepsProps['classNames']>
  styles: NonNullable<StepsProps['styles']>
}

const StepsContextKey: InjectionKey<ComputedRef<StepsContextValue | null>> =
  Symbol('StepsContext')

export function useStepsContext(): ComputedRef<StepsContextValue | null> {
  return inject(
    StepsContextKey,
    computed(() => null),
  )
}

export function provideStepsContext(
  value: ComputedRef<StepsContextValue | null>,
) {
  provide(StepsContextKey, value)
}
