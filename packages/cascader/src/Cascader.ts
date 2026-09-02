import type { VueNode } from '@v-c/util/dist/type'
import type { CSSProperties } from 'vue'
import type {
  CascaderClassNames,
  CascaderStyles,
  DefaultOptionType,
  FieldNames,
  SearchConfig,
  ShowCheckedStrategy,
  SingleValueType,
} from './interface'

export interface CascaderProps {
  // MISC
  id?: string
  prefixCls?: string
  fieldNames?: FieldNames
  optionRender?: (option: DefaultOptionType) => VueNode
  direction?: 'ltr' | 'rtl'

  // Value
  changeOnSelect?: boolean
  displayRender?: (
    label: string[],
    selectedOptions?: DefaultOptionType[],
  ) => VueNode
  checkable?: boolean
  checkStrictly?: boolean
  showCheckedStrategy?: ShowCheckedStrategy
  value?: SingleValueType | SingleValueType[]
  defaultValue?: SingleValueType | SingleValueType[]

  // Search
  showSearch?: boolean | SearchConfig
  autoClearSearchValue?: boolean
  searchValue?: string
  onSearch?: (value: string) => void

  // Trigger
  expandTrigger?: 'hover' | 'click'

  // Options
  options?: DefaultOptionType[]
  popupPrefixCls?: string
  loadData?: (selectOptions: DefaultOptionType[]) => void
  popupMenuColumnStyle?: CSSProperties

  // Popup
  popupClassName?: string
  popupStyle?: CSSProperties
  open?: boolean
  defaultOpen?: boolean
  placement?: string
  builtinPlacements?: any
  popupMatchSelectWidth?: boolean

  // Icon
  expandIcon?: VueNode
  loadingIcon?: VueNode

  // Style
  classNames?: CascaderClassNames
  styles?: CascaderStyles

  // Disabled
  disabled?: boolean

  // Misc from BaseSelect
  placeholder?: VueNode
  autoFocus?: boolean
  allowClear?: boolean
  notFoundContent?: VueNode
  suffixIcon?: VueNode
  prefix?: VueNode
  title?: string
  tabIndex?: number
}
