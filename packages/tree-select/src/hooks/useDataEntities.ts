import type { DataEntity } from '@vapor-component/tree'
import type { Ref } from 'vue'

import type { DataNode, FieldNames, SafeKey } from '../interface'

import { convertDataToEntities } from '@vapor-component/tree'
import { shallowRef, watchEffect } from 'vue'

export default function useDataEntities(
  treeData: Ref<DataNode[]>,
  fieldNames: Ref<FieldNames>,
): {
  valueEntities: Ref<Map<SafeKey, DataEntity>>
  keyEntities: Ref<Record<string, DataEntity>>
} {
  const valueEntities = shallowRef<Map<SafeKey, DataEntity>>(new Map())
  const keyEntities = shallowRef<Record<string, DataEntity>>({})

  watchEffect(() => {
    const mergedFieldNames = fieldNames.value as any
    const collection = convertDataToEntities(treeData.value as any, {
      fieldNames: mergedFieldNames,
      initWrapper: (wrapper: any) => ({
        ...wrapper,
        valueEntities: new Map(),
      }),
      processEntity: (entity: DataEntity, wrapper: any) => {
        const val = (entity.node as any)[mergedFieldNames.value || 'value']
        wrapper.valueEntities.set(val, entity)
      },
    }) as any

    keyEntities.value = collection.keyEntities
    valueEntities.value = collection.valueEntities
  })

  return { valueEntities, keyEntities }
}
