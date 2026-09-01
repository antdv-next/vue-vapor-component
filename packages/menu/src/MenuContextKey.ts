import type { CSSMotionProps } from '@v-c/util/dist/utils/transition'
import type { InjectionKey, Ref } from 'vue'
import type { CSSProperties } from 'vue'

import type {
  BuiltinPlacements,
  MenuClickEventHandler,
  MenuMode,
  PopupRender,
  RenderIconType,
  TriggerSubMenuAction,
} from './interface'
import type { SubMenuSemanticName } from './SubMenuProps'

import omit from '@v-c/util/dist/omit'
import { computed, provide, inject } from 'vue'

export interface MenuContextProps {
  prefixCls: string
  classes?: Partial<Record<SubMenuSemanticName, string>>
  styles?: Partial<Record<SubMenuSemanticName, CSSProperties>>
  rootClass?: string
  openKeys: string[]
  rtl?: boolean
  disabled?: boolean
  overflowDisabled?: boolean
  mode: MenuMode
  activeKey: string
  onActive: (key: string) => void
  onInactive: (key: string) => void
  selectedKeys: string[]
  inlineIndent: number
  motion?: CSSMotionProps
  defaultMotions?: Partial<{ [key in MenuMode | 'other']: CSSMotionProps }>
  subMenuOpenDelay: number
  subMenuCloseDelay: number
  forceSubMenuRender?: boolean
  builtinPlacements?: BuiltinPlacements
  triggerSubMenuAction?: TriggerSubMenuAction
  popupRender?: PopupRender
  onItemClick: MenuClickEventHandler
  onOpenChange: (key: string, open: boolean) => void
  getPopupContainer?: (node: HTMLElement) => HTMLElement
  itemIcon?: RenderIconType
  expandIcon?: RenderIconType
}

const MenuContextKey: InjectionKey<Ref<MenuContextProps>> =
  Symbol('MenuContext')

export function useMenuContext() {
  return inject(MenuContextKey, null)
}

export function useMenuContextProvider(context: Ref<MenuContextProps>) {
  provide(MenuContextKey, context)
}

function mergeProps(
  origin: MenuContextProps,
  target: Partial<MenuContextProps>,
): MenuContextProps {
  const clone = { ...origin }
  Object.keys(target).forEach(key => {
    const value = (target as any)[key]
    if (value !== undefined) {
      ;(clone as any)[key] = value
    }
  })
  return clone
}

export interface InheritableContextProps extends Partial<MenuContextProps> {
  overflowDisabled?: boolean
  locked?: boolean
}
