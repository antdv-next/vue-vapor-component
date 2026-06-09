import type { CSSProperties, InjectionKey, TransitionProps } from 'vue'

import type {
  CollapsibleType,
  CollapseProps,
  Key,
  SemanticName,
} from './interface'

import { inject, provide } from 'vue'

export interface CollapseContextValue {
  prefixCls: string
  /** Active keys, always normalized to string[] */
  activeKeys: Key[]
  accordion?: boolean
  collapsible?: CollapsibleType
  openMotion?: TransitionProps
  destroyOnHidden?: boolean
  expandIcon?: CollapseProps['expandIcon']
  classNames?: Partial<Record<SemanticName, string>>
  styles?: Partial<Record<SemanticName, CSSProperties>>
  onItemClick: (key: Key) => void
}

const CollapseContextKey: InjectionKey<CollapseContextValue> =
  Symbol('CollapseContext')

export function useCollapseContext() {
  return inject(CollapseContextKey, null)
}

export function provideCollapseContext(value: CollapseContextValue) {
  provide(CollapseContextKey, value)
}
