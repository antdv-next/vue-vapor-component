import type { Key as VCKey, VueNode } from '@v-c/util/dist/type'
import type { ScrollTo as VirtualListScrollTo } from '@vapor-component/virtual-list'
import type { CSSProperties, VNode } from 'vue'

import type { AllowDropOptions } from './util'

export type Key = VCKey

type VirtualListScrollConfig = Exclude<
  NonNullable<Parameters<VirtualListScrollTo>[0]>,
  number
>
type ScrollTarget = Extract<VirtualListScrollConfig, { key: Key }>
type TreeScrollConfig =
  | (Exclude<VirtualListScrollConfig, ScrollTarget> & { autoExpand?: never })
  | (ScrollTarget & { autoExpand?: boolean })

export type ScrollTo = (scroll?: number | TreeScrollConfig | null) => void

export type SafeKey = Exclude<Key, bigint>

export type IconType = VueNode | ((props: TreeNodeProps) => VueNode)

export interface TreeNodeProps<TreeDataType extends BasicDataNode = DataNode> {
  eventKey?: Key
  prefixCls?: string
  className?: string
  style?: CSSProperties
  id?: Key
  treeId?: string

  expanded?: boolean
  selected?: boolean
  checked?: boolean
  loaded?: boolean
  loading?: boolean
  halfChecked?: boolean

  title?: VueNode | ((data: TreeDataType) => VueNode)
  dragOver?: boolean
  dragOverGapTop?: boolean
  dragOverGapBottom?: boolean
  pos?: string
  domRef?: HTMLDivElement
  data?: TreeDataType
  isStart?: boolean[]
  isEnd?: boolean[]
  active?: boolean

  isLeaf?: boolean
  checkable?: boolean
  selectable?: boolean
  disabled?: boolean
  disableCheckbox?: boolean
  icon?: IconType
  switcherIcon?: IconType
  children?: VueNode
}

export interface BasicDataNode {
  checkable?: boolean
  disabled?: boolean
  disableCheckbox?: boolean
  icon?: IconType
  isLeaf?: boolean
  selectable?: boolean
  switcherIcon?: IconType

  className?: string
  style?: CSSProperties
  [key: string]: any
}

export type FieldDataNode<
  T,
  ChildFieldName extends string = 'children',
> = BasicDataNode &
  T &
  Partial<Record<ChildFieldName, FieldDataNode<T, ChildFieldName>[]>>

export type DataNode = FieldDataNode<{
  key: Key
  title?: VueNode | ((data: DataNode) => VueNode)
}>

export type EventDataNode<TreeDataType> = {
  key: Key
  expanded: boolean
  selected: boolean
  checked: boolean
  loaded: boolean
  loading: boolean
  halfChecked: boolean
  dragOver: boolean
  dragOverGapTop: boolean
  dragOverGapBottom: boolean
  pos: string
  active: boolean
} & TreeDataType &
  BasicDataNode

export type NodeElement = VNode & {
  type: any & {
    isTreeNode?: boolean
  }
}

export interface Entity {
  node: NodeElement
  index: number
  key: Key
  pos: string
  parent?: Entity
  children?: Entity[]
}

export interface DataEntity<
  TreeDataType extends BasicDataNode = any,
> extends Omit<Entity, 'node' | 'parent' | 'children'> {
  node: TreeDataType
  nodes: TreeDataType[]
  parent?: DataEntity<TreeDataType>
  children?: DataEntity<TreeDataType>[]
  level: number
}

export type KeyEntities<DateType extends BasicDataNode = any> = Record<
  string,
  DataEntity<DateType>
>

export interface FlattenNode<TreeDataType extends BasicDataNode = DataNode> {
  parent: FlattenNode<TreeDataType> | null
  children: FlattenNode<TreeDataType>[]
  pos: string
  data: TreeDataType
  title: VueNode
  key: Key
  isStart: boolean[]
  isEnd: boolean[]
}

export type GetKey<RecordType> = (record: RecordType, index?: number) => Key
export type GetCheckDisabled<RecordType> = (record: RecordType) => boolean

export type Direction = 'ltr' | 'rtl'

export interface FieldNames {
  title?: string
  _title?: string[]
  key?: string
  children?: string
}

export type NodeMouseEventHandler<
  TreeDataType extends BasicDataNode = DataNode,
> = (e: MouseEvent, node: EventDataNode<TreeDataType>) => void

export type NodeDragEventHandler<
  TreeDataType extends BasicDataNode = DataNode,
> = (
  e: DragEvent,
  nodeProps: TreeNodeProps<TreeDataType>,
  outsideTree?: boolean,
) => void

export interface NodeMouseEventParams<
  TreeDataType extends BasicDataNode = DataNode,
> {
  event: MouseEvent
  node: EventDataNode<TreeDataType>
}

export interface NodeDragEventParams<
  TreeDataType extends BasicDataNode = DataNode,
> {
  event: DragEvent
  node: EventDataNode<TreeDataType>
}

export type DraggableFn = (node: DataNode) => boolean
export interface DraggableConfig {
  icon?: any | false
  nodeDraggable?: DraggableFn
}
export type DraggableUnion = DraggableFn | boolean | DraggableConfig

export type ExpandAction = false | 'click' | 'doubleClick'

export interface DropIndicatorRenderProps {
  dropPosition: -1 | 0 | 1
  dropLevelOffset: number
  indent: number
  prefixCls: string
  direction: Direction
}

export type SemanticName = 'itemIcon' | 'item' | 'itemTitle' | 'itemSwitcher'

export type TreeClassNames = Partial<Record<SemanticName, string>>
export type TreeStyles = Partial<Record<SemanticName, CSSProperties>>

export interface CheckInfo<TreeDataType extends BasicDataNode = DataNode> {
  event: 'check'
  node: EventDataNode<TreeDataType>
  checked: boolean
  nativeEvent: MouseEvent
  checkedNodes: TreeDataType[]
  checkedNodesPositions?: { node: TreeDataType; pos: string }[]
  halfCheckedKeys?: Key[]
}

export interface TreeProps<TreeDataType extends BasicDataNode = DataNode> {
  prefixCls?: string
  className?: string
  style?: CSSProperties
  styles?: TreeStyles
  classNames?: TreeClassNames
  focusable?: boolean
  activeKey?: Key | null
  tabIndex?: number
  treeData?: TreeDataType[]
  fieldNames?: FieldNames
  showLine?: boolean
  showIcon?: boolean
  icon?: IconType
  selectable?: boolean
  expandAction?: ExpandAction
  disabled?: boolean
  multiple?: boolean
  checkable?: boolean | VueNode
  checkStrictly?: boolean
  draggable?: DraggableUnion
  defaultExpandParent?: boolean
  autoExpandParent?: boolean
  defaultExpandAll?: boolean
  defaultExpandedKeys?: Key[]
  expandedKeys?: Key[]
  defaultCheckedKeys?: Key[]
  checkedKeys?: Key[] | { checked: Key[]; halfChecked: Key[] }
  defaultSelectedKeys?: Key[]
  selectedKeys?: Key[]
  allowDrop?: (options: AllowDropOptions<TreeDataType>) => boolean
  titleRender?: (node: TreeDataType) => any
  dropIndicatorRender?: (props: DropIndicatorRenderProps) => any
  loadData?: (treeNode: EventDataNode<TreeDataType>) => Promise<void>
  loadedKeys?: Key[]
  filterTreeNode?: (treeNode: EventDataNode<TreeDataType>) => boolean
  switcherIcon?: IconType

  height?: number
  itemHeight?: number
  scrollWidth?: number
  itemScrollOffset?: number
  virtual?: boolean

  direction?: Direction

  rootClassName?: string
  rootStyle?: CSSProperties
}

export interface TreeRef {
  scrollTo: ScrollTo
  onKeyDown: (event: KeyboardEvent) => void
}

export interface TreeContextProps<
  TreeDataType extends BasicDataNode = DataNode,
> {
  styles?: TreeStyles
  classNames?: TreeClassNames
  prefixCls: string
  selectable: boolean
  showIcon: boolean
  icon?: IconType
  switcherIcon?: IconType
  draggable?: DraggableConfig
  draggingNodeKey?: Key | null
  checkable: boolean | any
  checkStrictly: boolean
  disabled: boolean
  keyEntities: KeyEntities
  dropLevelOffset?: number | null
  dropContainerKey: Key | null
  dropTargetKey: Key | null
  dropPosition: -1 | 0 | 1 | null
  indent: number | null
  dropIndicatorRender: (props: DropIndicatorRenderProps) => any
  dragOverNodeKey: Key | null
  direction: Direction
  loadData?: (treeNode: EventDataNode<TreeDataType>) => Promise<void>
  filterTreeNode?: (treeNode: EventDataNode<TreeDataType>) => boolean
  titleRender?: (node: TreeDataType) => any
  allowDrop?: (options: AllowDropOptions<TreeDataType>) => boolean
  onNodeClick: NodeMouseEventHandler<TreeDataType>
  onNodeDoubleClick: NodeMouseEventHandler<TreeDataType>
  onNodeExpand: NodeMouseEventHandler<TreeDataType>
  onNodeSelect: NodeMouseEventHandler<TreeDataType>
  onNodeCheck: (
    e: MouseEvent,
    treeNode: EventDataNode<TreeDataType>,
    checked: boolean,
  ) => void
  onNodeLoad: (treeNode: EventDataNode<TreeDataType>) => void
  onNodeMouseEnter: NodeMouseEventHandler<TreeDataType>
  onNodeMouseLeave: NodeMouseEventHandler<TreeDataType>
  onNodeContextMenu: NodeMouseEventHandler<TreeDataType>
  onNodeDragStart: NodeDragEventHandler<TreeDataType>
  onNodeDragEnter: NodeDragEventHandler<TreeDataType>
  onNodeDragOver: NodeDragEventHandler<TreeDataType>
  onNodeDragLeave: NodeDragEventHandler<TreeDataType>
  onNodeDragEnd: NodeDragEventHandler<TreeDataType>
  onNodeDrop: NodeDragEventHandler<TreeDataType>
}
