import type { PortalProps } from '@vapor-component/portal'
import type { CSSProperties, InjectionKey, Ref } from 'vue'

import type { AlignType, ArrowTypeOuter, BuildInPlacements } from './interface'
import type { TriggerProps } from './interface'

import { computed, defineVaporComponent, inject, provide } from 'vue'

// ===================== Nest =====================

export interface TriggerContextProps {
  registerSubPopup: (id: string, node: HTMLElement | null) => void
}

export const TriggerContextKey: InjectionKey<Ref<TriggerContextProps>> =
  Symbol('TriggerContextKey')

export function useTriggerContext() {
  return inject(TriggerContextKey, undefined)
}

export const TriggerContextProvider = defineVaporComponent<TriggerContextProps>(
  (props, { slots }) => {
    provide(
      TriggerContextKey,
      computed(() => props),
    )
    return slots?.default?.()
  },
  {
    props: {
      registerSubPopup: { type: Function, required: true },
    },
  },
)

// ==================== Unique ====================

export interface UniqueShowOptions {
  id: string
  popup: TriggerProps['popup']
  target: HTMLElement
  delay: number
  prefixCls?: string
  popupClassName?: string
  uniqueContainerClassName?: string
  uniqueContainerStyle?: CSSProperties
  popupStyle?: CSSProperties
  popupPlacement?: string
  builtinPlacements?: BuildInPlacements
  popupAlign?: AlignType
  zIndex?: number
  mask?: boolean
  maskClosable?: boolean
  popupMotion?: any
  maskMotion?: any
  arrow?: ArrowTypeOuter
  getPopupContainer?: TriggerProps['getPopupContainer']
  getPopupClassNameFromAlign?: (align: AlignType) => string
  onEsc?: PortalProps['onEsc']
}

export interface UniqueContextProps {
  show: (options: UniqueShowOptions, isOpen: () => boolean) => void
  hide: (delay: number) => void
}

export const UniqueContextKey: InjectionKey<UniqueContextProps> =
  Symbol('UniqueContextKey')

export function useUniqueContext() {
  return inject(UniqueContextKey, undefined)
}

export const UniqueContextProvider = defineVaporComponent<UniqueContextProps>(
  (props, { slots }) => {
    provide(UniqueContextKey, props)
    return slots?.default?.()
  },
)
