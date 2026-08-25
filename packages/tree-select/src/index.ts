import TreeSelect from './TreeSelect.vue'
import { SHOW_ALL, SHOW_CHILD, SHOW_PARENT } from './utils/strategyUtil'

export { SHOW_ALL, SHOW_CHILD, SHOW_PARENT }

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
export type { SearchConfig, TreeSelectProps } from './TreeSelect'

type TreeSelectType = typeof TreeSelect & {
  SHOW_ALL: typeof SHOW_ALL
  SHOW_PARENT: typeof SHOW_PARENT
  SHOW_CHILD: typeof SHOW_CHILD
}

const ExportTreeSelect = TreeSelect as TreeSelectType
ExportTreeSelect.SHOW_ALL = SHOW_ALL
ExportTreeSelect.SHOW_PARENT = SHOW_PARENT
ExportTreeSelect.SHOW_CHILD = SHOW_CHILD

export default ExportTreeSelect
