import Tree from './Tree.vue'
import TreeNode from './TreeNode.vue'
import MotionTreeNode from './MotionTreeNode.vue'
import useTree from './hooks/useTree'

export { TreeNode, MotionTreeNode, useTree }
export { TreeContextKey, UnstableContextKey, useTreeContext, provideTreeContext, useUnstableContext } from './TreeContextKey'
export { arrAdd, arrDel, calcDropPosition, calcSelectedKeys, conductExpandParent, getDragChildrenKeys, isFirstChild, isLastChild, parseCheckedKeys, posToArr } from './util'
export { conductCheck, isCheckDisabled } from './utils/conductUtil'
export { convertDataToEntities, convertTreeToData, fillFieldNames, flattenTreeData, getTreeNodeProps, convertNodePropsToEventData, isLeafNode, warningWithoutKey } from './utils/treeUtil'
export { findExpandedKeys, getExpandRange } from './utils/diffUtil'
export { default as getEntity } from './utils/keyUtil'
export type * from './interface'

type TreeType = typeof Tree & { TreeNode: typeof TreeNode; MotionTreeNode: typeof MotionTreeNode }
const ExportTree = Tree as TreeType
ExportTree.TreeNode = TreeNode
ExportTree.MotionTreeNode = MotionTreeNode
export default ExportTree