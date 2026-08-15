import type { BasicDataNode, DataNode } from '../interface'

export default function getEntity<TreeDataType extends BasicDataNode = any>(
  keyEntities: Record<string, any>,
  key: any,
) {
  return keyEntities[String(key)]
}
