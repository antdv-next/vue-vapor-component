import Cascader from './Cascader.vue'
import Panel from './Panel.vue'
import { SHOW_CHILD, SHOW_PARENT } from './utils/commonUtil'

export type {
  BaseOptionType,
  DefaultOptionType,
  FieldNames,
  InternalFieldNames,
  SearchConfig,
  SingleValueType,
  ShowCheckedStrategy,
} from './interface'
export type { CascaderProps } from './Cascader'

export { Panel, SHOW_CHILD, SHOW_PARENT }

type CascaderType = typeof Cascader & {
  Panel: typeof Panel
  SHOW_PARENT: typeof SHOW_PARENT
  SHOW_CHILD: typeof SHOW_CHILD
}

const ExportCascader = Cascader as CascaderType
ExportCascader.Panel = Panel
ExportCascader.SHOW_PARENT = SHOW_PARENT
ExportCascader.SHOW_CHILD = SHOW_CHILD

export default ExportCascader
