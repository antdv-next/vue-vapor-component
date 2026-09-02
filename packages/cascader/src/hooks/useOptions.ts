import type { Ref } from 'vue'
import type { DefaultOptionType, InternalFieldNames, LegacyKey, SingleValueType } from '../interface'
import type { GetEntities } from './useEntities'
import { computed } from 'vue'
import useEntities from './useEntities'

export default function useOptions(
  mergedFieldNames: Ref<InternalFieldNames>,
  options: Ref<DefaultOptionType[] | undefined>,
): [
  mergedOptions: Ref<DefaultOptionType[]>,
  getPathKeyEntities: GetEntities,
  getValueByKeyPath: (pathKeys: LegacyKey[]) => SingleValueType[],
] {
  const emptyOptions: DefaultOptionType[] = []
  const mergedOptions = computed(() => options.value || emptyOptions)

  const getPathKeyEntities = useEntities(mergedOptions, mergedFieldNames)

  const getValueByKeyPath = (pathKeys: LegacyKey[]): SingleValueType[] => {
    const keyPathEntities = getPathKeyEntities()
    const valField = mergedFieldNames.value.value as string

    return pathKeys.map((pathKey) => {
      const { nodes } = keyPathEntities[pathKey]
      return nodes.map(
        (node) => (node as Record<string, any>)[valField],
      )
    })
  }

  return [mergedOptions, getPathKeyEntities, getValueByKeyPath]
}
