import type { InjectionKey, CSSProperties } from 'vue'

import { inject } from 'vue'

export interface StepIconSemanticContextValue {
  className?: string
  style?: CSSProperties
}

export const StepIconSemanticKey: InjectionKey<StepIconSemanticContextValue> =
  Symbol('StepIconSemanticContext')

export function useStepIconSemanticContext():
  | StepIconSemanticContextValue
  | undefined {
  return inject(StepIconSemanticKey, undefined)
}
