import type {
  BaseSelectPublicShared,
  BaseSelectSemanticName,
} from '@vapor-component/select'
import type { ExpandAction, IconType } from '@vapor-component/tree'
import type { CSSProperties, CSSProperties as _CSSProperties } from 'vue'

import type {
  CheckedStrategy,
  DataNode,
  FieldNames,
  SafeKey,
  SemanticName,
  TreeSelectClassNames,
  TreeSelectStyles,
} from './interface'

export interface SearchConfig {
  searchValue?: string
  onSearch?: (value: string) => void
  autoClearSearchValue?: boolean
  filterTreeNode?:
    | boolean
    | ((inputValue: string, treeNode: DataNode) => boolean)
  treeNodeFilterProp?: string
}

export interface TreeSelectProps<
  ValueType = any,
  OptionType extends DataNode = DataNode,
>
  extends /* @vue-ignore */ Omit<
    BaseSelectPublicShared,
    'classNames' | 'styles' | 'mode' | 'onSearch' | 'onPopupVisibleChange'
  > {
  prefixCls?: string
  id?: string
  classNames?: Partial<Record<SemanticName | BaseSelectSemanticName, string>> &
    TreeSelectClassNames
  styles?: Partial<
    Record<SemanticName | BaseSelectSemanticName, CSSProperties>
  > &
    TreeSelectStyles

  // Value
  value?: ValueType
  defaultValue?: ValueType

  // Search
  showSearch?: boolean | SearchConfig

  // Select
  treeNodeLabelProp?: string

  // Field Names
  fieldNames?: FieldNames

  // Mode
  multiple?: boolean
  treeCheckable?: boolean
  treeCheckStrictly?: boolean
  labelInValue?: boolean
  maxCount?: number
  showCheckedStrategy?: CheckedStrategy

  // Data
  treeData?: OptionType[]
  treeDataSimpleMode?: boolean | SimpleModeConfig
  loadData?: (dataNode: any) => Promise<unknown>
  treeLoadedKeys?: SafeKey[]

  // Expanded
  treeDefaultExpandAll?: boolean
  treeExpandedKeys?: SafeKey[]
  treeDefaultExpandedKeys?: SafeKey[]
  treeExpandAction?: ExpandAction

  // Options
  virtual?: boolean
  listHeight?: number
  listItemHeight?: number
  listItemScrollOffset?: number
  treeTitleRender?: (node: OptionType) => any

  // Tree
  treeLine?: boolean
  treeIcon?: IconType
  showTreeIcon?: boolean
  switcherIcon?: IconType

  onPopupVisibleChange?: (open: boolean) => void
  popupMatchSelectWidth?: boolean | number
  onPopupScroll?: (event: Event) => void
  onSearch?: (value: string) => void
  onChange?: (value: ValueType, labelList: any[] | null, extra: any) => void
  onSelect?: (value: ValueType, option: OptionType) => void
  onDeselect?: (value: ValueType, option: OptionType) => void
  onTreeExpand?: (expandedKeys: SafeKey[]) => void
  onTreeLoad?: (loadedKeys: SafeKey[]) => void
}

export type {
  CheckedStrategy,
  DataNode,
  DefaultValueType,
  FieldNames,
  LabeledValueType,
  SafeKey,
  SelectSource,
  SimpleModeConfig,
} from './interface'
