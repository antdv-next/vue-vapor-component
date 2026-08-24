import type { VueNode } from '@v-c/util/dist/type'
import type { Ref, InjectionKey } from 'vue'
import type { CSSProperties } from 'vue'

import type { ComponentsConfig } from '../hooks'
import type { DisplayValueType, Mode, RenderNode } from '../interface'

import { inject, provide, ref } from 'vue'

export interface SelectInputProps {
  prefixCls: string
  prefix?: VueNode
  suffix?: VueNode
  clearIcon?: VueNode
  clearLabel?: string
  removeIcon?: RenderNode
  multiple?: boolean
  displayValues: DisplayValueType[]
  placeholder?: VueNode
  searchValue?: string
  activeValue?: string
  mode?: Mode
  maxLength?: number
  autoFocus?: boolean
  onSearch?: (
    searchText: string,
    fromTyping: boolean,
    isCompositing: boolean,
  ) => void
  onSearchSubmit?: (searchText: string) => void
  onInputBlur?: () => void
  onClearMouseDown?: (event: MouseEvent) => void
  onInputKeyDown?: (event: KeyboardEvent) => void
  onSelectorRemove?: (value: DisplayValueType) => void
  tokenWithEnter?: boolean
  className?: string
  style?: CSSProperties
  focused?: boolean
  components: ComponentsConfig
  onFocus?: (event: FocusEvent) => void
  onBlur?: (event: FocusEvent) => void
  onKeyDown?: (event: KeyboardEvent) => void
  onKeyUp?: (event: KeyboardEvent) => void
  onMouseDown?: (event: MouseEvent) => void
}

export type ContentContextProps = SelectInputProps

const SelectInputKey: InjectionKey<Ref<ContentContextProps>> =
  Symbol('SelectInputContext')

export function useSelectInputContext() {
  return inject(SelectInputKey, ref(null) as Ref<ContentContextProps | null>)
}

export function useSelectInputProvider(context: Ref<ContentContextProps>) {
  provide(SelectInputKey, context)
}
