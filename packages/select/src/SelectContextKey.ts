import type { CSSProperties, Ref, InjectionKey } from 'vue'

import type { FlattenOptionData, RawValueType, RenderNode } from './interface'
import type {
  BaseOptionType,
  FieldNames,
  OnActiveValue,
  OnInternalSelect,
  PopupSemantic,
  SemanticName,
} from './Select'

import { inject, provide, ref } from 'vue'

export interface SelectContextProps {
  classNames?: Partial<Record<SemanticName, string>> & {
    popup?: Partial<Record<PopupSemantic, string>>
  }
  styles?: Partial<Record<SemanticName, CSSProperties>> & {
    popup?: Partial<Record<PopupSemantic, CSSProperties>>
  }
  options: BaseOptionType[]
  optionRender?: any
  flattenOptions: FlattenOptionData[]
  onActiveValue: OnActiveValue
  defaultActiveFirstOption?: boolean
  onSelect: OnInternalSelect
  menuItemSelectedIcon?: RenderNode
  rawValues: Set<RawValueType>
  fieldNames?: FieldNames
  virtual?: boolean
  direction?: 'ltr' | 'rtl'
  listHeight?: number
  listItemHeight?: number
  childrenAsData?: boolean
  maxCount?: number
}

const SelectContextKey: InjectionKey<Ref<SelectContextProps | null>> =
  Symbol('SelectContext')

export function useSelectProvider(value: Ref<SelectContextProps>) {
  provide(SelectContextKey, value)
}

export function useSelectContext() {
  return inject(SelectContextKey, ref(null) as Ref<SelectContextProps | null>)
}
