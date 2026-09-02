import type {
  DefaultOptionType,
  InternalFieldNames,
  LegacyKey,
  ShowCheckedStrategy,
  SingleValueType,
} from '../interface'
import type { GetEntities } from '../hooks/useEntities'
import { SHOW_CHILD } from './commonUtil'

export function formatStrategyValues(
  pathKeys: LegacyKey[],
  getKeyPathEntities: GetEntities,
  showCheckedStrategy?: ShowCheckedStrategy,
) {
  const valueSet = new Set(pathKeys)
  const keyPathEntities = getKeyPathEntities()

  return pathKeys.filter((key) => {
    const entity = keyPathEntities[key]
    const parent = entity ? entity.parent : null
    const children = entity ? entity.children : null

    if (entity && entity.node.disabled) {
      return true
    }

    return showCheckedStrategy === SHOW_CHILD
      ? !(children && children.some((child) => child.key && valueSet.has(child.key)))
      : !(parent && !parent.node.disabled && valueSet.has(parent.key))
  })
}

export function toPathOptions(
  valueCells: SingleValueType,
  options: DefaultOptionType[],
  fieldNames: InternalFieldNames,
  stringMode = false,
) {
  let currentList: DefaultOptionType[] = options
  const valueOptions: {
    value: SingleValueType[number]
    index: number
    option: DefaultOptionType
  }[] = []

  for (let i = 0; i < valueCells.length; i += 1) {
    const valueCell = valueCells[i]
    const foundIndex = currentList?.findIndex((option) => {
      const val = option[fieldNames.value as string]
      return stringMode ? String(val) === String(valueCell) : val === valueCell
    })
    const foundOption =
      foundIndex !== -1 ? currentList?.[foundIndex] : (null as any)

    valueOptions.push({
      value: foundOption?.[fieldNames.value as string] ?? valueCell,
      index: foundIndex,
      option: foundOption as DefaultOptionType,
    })

    currentList = foundOption?.[fieldNames.children as string] || []
  }

  return valueOptions
}
