import type { SelectProps } from './Select'

import BaseSelect from './BaseSelect.vue'
import { useBaseProps } from './hooks'
import OptGroup from './OptGroup.vue'
import Option from './Option.vue'
import OptionList from './OptionList.vue'
import Select from './Select.vue'
import { useSelectContext, useSelectProvider } from './SelectContextKey'

export {
  BaseSelect,
  Option,
  OptGroup,
  OptionList,
  Select,
  useBaseProps,
  useSelectContext,
  useSelectProvider,
}

export type {
  BaseOptionType,
  DefaultOptionType,
  DraftValueType,
  FieldNames,
  FilterFunc,
  LabelInValueType,
  OnActiveValue,
  OnInternalSelect,
  SearchConfig,
  SelectHandler,
  SelectProps,
} from './Select'
export type {
  BaseSelectProps,
  BaseSelectPropsWithoutPrivate,
  BaseSelectRef,
  BaseSelectSemanticName,
  CustomTagProps,
  RefOptionListProps,
} from './BaseSelect/interface'
export type {
  DisplayInfoType,
  DisplayValueType,
  FlattenOptionData,
  Mode,
  Placement,
  RawValueType,
  RenderNode,
} from './interface'

export default Select
