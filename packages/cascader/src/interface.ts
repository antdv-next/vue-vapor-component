import type { VueNode } from '@v-c/util/dist/type'
import type { CSSProperties } from 'vue'
import { SHOW_PARENT, SHOW_CHILD } from './utils/commonUtil'

export interface BaseOptionType {
  disabled?: boolean
  disableCheckbox?: boolean
  label?: VueNode
  value?: string | number | null
  children?: DefaultOptionType[]
  isLeaf?: boolean
}

export type DefaultOptionType = BaseOptionType & Record<string, any>

export interface FieldNames {
  label?: keyof DefaultOptionType
  value?: keyof DefaultOptionType | string
  children?: keyof DefaultOptionType
}

export interface InternalFieldNames extends Required<FieldNames> {
  label: string
  value: string
  children: string
  key: string
}

export type SingleValueType = (string | number)[]
export type LegacyKey = string | number
export type InternalValueType = SingleValueType | SingleValueType[]
export type ShowCheckedStrategy = typeof SHOW_PARENT | typeof SHOW_CHILD

export interface SearchConfig {
  filter?: (
    inputValue: string,
    options: DefaultOptionType[],
    fieldNames: InternalFieldNames,
  ) => boolean
  render?: (
    inputValue: string,
    path: DefaultOptionType[],
    prefixCls: string,
    fieldNames: InternalFieldNames,
  ) => VueNode
  sort?: (
    a: DefaultOptionType[],
    b: DefaultOptionType[],
    inputValue: string,
    fieldNames: InternalFieldNames,
  ) => number
  matchInputWidth?: boolean
  limit?: number | false
  searchValue?: string
  onSearch?: (value: string) => void
  autoClearSearchValue?: boolean
}

export type BaseSelectSemanticName =
  | 'prefix'
  | 'suffix'
  | 'input'
  | 'clear'
  | 'placeholder'
  | 'content'
  | 'item'
  | 'itemContent'
  | 'itemRemove'

export type PopupSemantic = 'list' | 'listItem'

export type CascaderClassNames = Partial<Record<BaseSelectSemanticName, string>> & {
  popup?: Partial<Record<PopupSemantic, string>>
}
export type CascaderStyles = Partial<Record<BaseSelectSemanticName, CSSProperties>> & {
  popup?: Partial<Record<PopupSemantic, CSSProperties>>
}

export interface CascaderContextProps {
  options: DefaultOptionType[]
  fieldNames: InternalFieldNames
  values: SingleValueType[]
  halfValues: SingleValueType[]
  changeOnSelect?: boolean
  onSelect: (valuePath: SingleValueType) => void
  checkable?: boolean | VueNode
  searchOptions: DefaultOptionType[]
  popupPrefixCls?: string
  loadData?: (selectOptions: DefaultOptionType[]) => void
  expandTrigger?: 'hover' | 'click'
  expandIcon?: VueNode
  loadingIcon?: VueNode
  popupMenuColumnStyle?: CSSProperties
  optionRender?: (option: DefaultOptionType) => VueNode
  classNames?: CascaderClassNames
  styles?: CascaderStyles
  direction?: 'ltr' | 'rtl'
  disabled?: boolean
  notFoundContent?: VueNode
}
