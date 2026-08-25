import type { VueNode } from '@v-c/util/dist/type'
import type { Key } from '@vapor-component/tree'
import type { CSSProperties } from 'vue'

export type { Key }

export type SafeKey = Key

export interface DataNode extends Record<string, any> {
  key?: Key
  value?: Key
  title?: VueNode | ((data: DataNode) => VueNode)
  children?: DataNode[]
  disabled?: boolean
  disableCheckbox?: boolean
  checkable?: boolean
  selectable?: boolean
  isLeaf?: boolean
  icon?: any
  switcherIcon?: any
  [key: string]: any
}

export type SelectSource = 'option' | 'selection' | 'input' | 'clear'

export interface LabeledValueType {
  key?: Key
  value?: Key
  label?: any
  halfChecked?: boolean
  disabled?: boolean
}

export type DefaultValueType =
  | Key
  | LabeledValueType
  | (Key | LabeledValueType)[]

export interface SimpleModeConfig {
  id?: string
  pId?: string
  rootPId?: SafeKey | null
}

export interface FieldNames {
  value?: string
  label?: string
  children?: string
  _title?: string[]
}

export type CheckedStrategy = 'SHOW_ALL' | 'SHOW_PARENT' | 'SHOW_CHILD'

export type PopupSemantic = 'item' | 'itemTitle'

export type SemanticName =
  | 'prefix'
  | 'suffix'
  | 'input'
  | 'clear'
  | 'placeholder'
  | 'content'
  | 'item'
  | 'itemContent'
  | 'itemRemove'

export interface TreeSelectClassNames {
  popup?: Partial<Record<PopupSemantic, string>>
}

export interface TreeSelectStyles {
  popup?: Partial<Record<PopupSemantic, CSSProperties>>
}
