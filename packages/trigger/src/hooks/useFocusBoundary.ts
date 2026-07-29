import type { InjectionKey } from 'vue'

import { inject } from 'vue'

export interface FocusBoundaryContextProps {
  registerAllowedElement: (element: HTMLElement) => VoidFunction
}

const FocusBoundaryContextKey: InjectionKey<FocusBoundaryContextProps | null> =
  Symbol('FocusBoundaryContext')

export function useFocusBoundary() {
  return inject(FocusBoundaryContextKey, null)
}
