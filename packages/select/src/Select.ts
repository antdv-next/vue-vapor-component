import type { VueNode } from '@v-c/util/dist/type'
import type { CSSProperties } from 'vue'

import type {
  BaseSelectSemanticName,
  BaseSelectPublicShared,
} from './BaseSelect/interface'
import type { DisplayValueType, RawValueType, RenderNode } from './interface'

export type OnActiveValue = (
  active: RawValueType | null,
  index: number,
  info?: { source?: 'keyboard' | 'mouse' },
) => void

export type OnInternalSelect = (
  value: RawValueType,
  info: { selected: boolean },
) => void

export interface LabelInValueType {
  label: VueNode
  value: RawValueType
}

export type DraftValueType =
  | RawValueType
  | LabelInValueType
  | DisplayValueType
  | (RawValueType | LabelInValueType | DisplayValueType)[]

export type FilterFunc = (inputValue: string, option?: any) => boolean

export interface FieldNames {
  value?: string
  label?: string
  groupLabel?: string
  options?: string
}

export interface BaseOptionType {
  disabled?: boolean
  className?: string
  title?: string
  [name: string]: any
}

export interface DefaultOptionType extends BaseOptionType {
  label?: VueNode
  value?: string | number | null
  children?: Omit<DefaultOptionType, 'children'>[]
}

export type SelectHandler<
  ValueType,
  OptionType extends BaseOptionType = DefaultOptionType,
> = (value: ValueType, option: OptionType) => void

export type SemanticName = BaseSelectSemanticName
export type PopupSemantic = 'listItem' | 'list'

export interface SearchConfig {
  searchValue?: string
  autoClearSearchValue?: boolean
  onSearch?: (value: string) => void
  filterOption?: FilterFunc | false
  filterSort?: (
    optionA: any,
    optionB: any,
    info: { searchValue: string },
  ) => number
  optionFilterProp?: string
}

export interface SelectProps extends BaseSelectPublicShared {
  prefixCls?: string
  id?: string
  backfill?: boolean
  fieldNames?: FieldNames
  showSearch?: boolean | SearchConfig
  optionLabelProp?: string
  options?: DefaultOptionType[]
  optionRender?: (
    oriOption: import('./interface').FlattenOptionData,
    info: { index: number },
  ) => any
  defaultActiveFirstOption?: boolean
  virtual?: boolean
  direction?: 'ltr' | 'rtl'
  listHeight?: number
  listItemHeight?: number
  labelRender?: (props: LabelInValueType) => any
  menuItemSelectedIcon?: RenderNode
  mode?: 'combobox' | 'multiple' | 'tags'
  labelInValue?: boolean
  value?: any | null
  defaultValue?: any | null
  maxCount?: number
  classNames?: Partial<Record<SemanticName, string>>
  styles?: Partial<Record<SemanticName, CSSProperties>>
  filterOption?: SearchConfig['filterOption']
  searchValue?: SearchConfig['searchValue']
  autoClearSearchValue?: SearchConfig['autoClearSearchValue']
  optionFilterProp?: SearchConfig['optionFilterProp']
  filterSort?: SearchConfig['filterSort']
  onSearch?: SearchConfig['onSearch']
  onChange?: SelectHandler<any>
  onSelect?: SelectHandler<any>
  onDeselect?: SelectHandler<any>
}
