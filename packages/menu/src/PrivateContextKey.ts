import type { InjectionKey } from 'vue'

import { provide, inject } from 'vue'

export type InternalRenderMenuItem = (
  originNode: any,
  menuItemProps: any,
  stateProps: { selected: boolean },
) => any

export type InternalRenderSubMenuItem = (
  originNode: any,
  subMenuItemProps: any,
  stateProps: {
    selected: boolean
    open: boolean
    active: boolean
    disabled: boolean
  },
) => any

export interface PrivateContextProps {
  _internalRenderMenuItem?: InternalRenderMenuItem
  _internalRenderSubMenuItem?: InternalRenderSubMenuItem
}

const PrivateContextKey: InjectionKey<PrivateContextProps> =
  Symbol('PrivateContext')

export function usePrivateProvider(context: PrivateContextProps) {
  provide(PrivateContextKey, context)
}

export function usePrivateContext() {
  return inject(PrivateContextKey, {} as PrivateContextProps)
}
