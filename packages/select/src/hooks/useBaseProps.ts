import type { Ref, InjectionKey } from 'vue'

import type { BaseSelectProps } from '../BaseSelect/interface'

import { inject, provide, ref } from 'vue'

export interface BaseSelectContextProps extends BaseSelectProps {
  triggerOpen: boolean
  multiple: boolean
  toggleOpen: (open?: boolean) => void
  lockOptions: boolean
  rawOpen: boolean
}

const BaseSelectContext: InjectionKey<Ref<BaseSelectContextProps | null>> =
  Symbol('BaseSelectContext')

export function useBaseSelectProvider(context: Ref<BaseSelectContextProps>) {
  provide(BaseSelectContext, context)
}

export default function useBaseProps() {
  return inject(
    BaseSelectContext,
    ref(null) as Ref<BaseSelectContextProps | null>,
  )
}
