import type { DataEntity } from '@vapor-component/tree'
import type { Ref } from 'vue'
import type {
  DefaultOptionType,
  InternalFieldNames,
  LegacyKey,
} from '../interface'
import { convertDataToEntities } from '@vapor-component/tree'
import { shallowRef } from 'vue'
import { VALUE_SPLIT } from '../utils/commonUtil'

export interface OptionsInfo {
  keyEntities: Record<string, DataEntity>
  pathKeyEntities: Record<string, DataEntity>
}

export type GetEntities = () => Record<string, DataEntity>

export default function useEntities(
  options: Ref<DefaultOptionType[]>,
  fieldNames: Ref<InternalFieldNames>,
) {
  const cacheRef = shallowRef<{
    options: DefaultOptionType[]
    fieldNames: InternalFieldNames | null
    info: OptionsInfo
  }>({
    options: [],
    fieldNames: null,
    info: { keyEntities: {}, pathKeyEntities: {} },
  })

  const getEntities: GetEntities = () => {
    const mergedOptions = options.value
    const mergedFieldNames = fieldNames.value

    if (
      cacheRef.value.options !== mergedOptions ||
      cacheRef.value.fieldNames !== mergedFieldNames
    ) {
      cacheRef.value.options = mergedOptions
      cacheRef.value.fieldNames = mergedFieldNames

      const valField = mergedFieldNames.value as string

      cacheRef.value.info = convertDataToEntities(
        mergedOptions as any,
        {
          fieldNames: mergedFieldNames,
          externalGetKey: (node: any) => (node as Record<string, any>)[valField],
          initWrapper: (wrapper: any) => ({
            ...wrapper,
            pathKeyEntities: {},
          }),
          processEntity: (entity: DataEntity, wrapper: any) => {
            const pathKey = (entity.nodes as DefaultOptionType[])
              .map(
                (node) => (node as Record<string, any>)[valField],
              )
              .join(VALUE_SPLIT)

            ;(wrapper as OptionsInfo).pathKeyEntities[pathKey] = entity
            entity.key = pathKey as LegacyKey
          },
        },
      ) as unknown as OptionsInfo
    }

    return cacheRef.value.info.pathKeyEntities
  }

  return getEntities
}
