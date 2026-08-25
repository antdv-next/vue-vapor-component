import type { DataEntity } from '@vapor-component/tree'

import type { FieldNames, SafeKey } from '../interface'

import { isCheckDisabled } from './valueUtil'

export const SHOW_ALL = 'SHOW_ALL' as const
export const SHOW_PARENT = 'SHOW_PARENT' as const
export const SHOW_CHILD = 'SHOW_CHILD' as const

export type CheckedStrategy =
  | typeof SHOW_ALL
  | typeof SHOW_PARENT
  | typeof SHOW_CHILD

export function formatStrategyValues(
  values: SafeKey[],
  strategy: CheckedStrategy,
  keyEntities: Record<string, DataEntity>,
  fieldNames: FieldNames,
): SafeKey[] {
  const valueSet = new Set(values)
  const valueField = fieldNames.value || 'value'

  if (strategy === SHOW_CHILD) {
    return values.filter(key => {
      const entity = keyEntities[String(key)]
      return (
        !entity ||
        !entity.children ||
        !entity.children.some(({ node }: any) =>
          valueSet.has((node as any)[valueField]),
        ) ||
        !entity.children.every(
          ({ node }: any) =>
            isCheckDisabled(node as any) ||
            valueSet.has((node as any)[valueField]),
        )
      )
    })
  }

  if (strategy === SHOW_PARENT) {
    return values.filter(key => {
      const entity = keyEntities[String(key)]
      const parent = entity?.parent ?? null
      return (
        !parent ||
        isCheckDisabled(entity?.node as any) ||
        isCheckDisabled(parent.node as any) ||
        !valueSet.has(parent.key as any)
      )
    })
  }

  return values
}
