import type { ComputedRef, Ref } from 'vue'
import type { LegacyKey, SingleValueType } from '../interface'
import type { GetMissValues } from './useMissingValues'
import { conductCheck } from '@vapor-component/tree'
import { computed } from 'vue'
import { toPathKeys } from '../utils/commonUtil'

export default function useValues(
  multiple: Ref<boolean>,
  checkStrictly: Ref<boolean>,
  rawValues: Ref<SingleValueType[]>,
  getPathKeyEntities: () => Record<string, any>,
  getValueByKeyPath: (pathKeys: LegacyKey[]) => SingleValueType[],
  getMissingValues: GetMissValues,
): ComputedRef<[
  checkedValues: SingleValueType[],
  halfCheckedValues: SingleValueType[],
  missingCheckedValues: SingleValueType[],
]> {
  return computed(() => {
    const [existValues, missingValues] = getMissingValues(rawValues.value)

    if (!multiple.value || !rawValues.value.length) {
      return [existValues, [], missingValues]
    }

    const keyPathValues = toPathKeys(existValues)

    if (checkStrictly.value) {
      return [getValueByKeyPath(keyPathValues), [], missingValues]
    }

    const keyPathEntities = getPathKeyEntities()

    const result = conductCheck(keyPathValues, true, keyPathEntities) as {
      checkedKeys: LegacyKey[]
      halfCheckedKeys: LegacyKey[]
    }

    const checkedKeys = result.checkedKeys
    const halfCheckedKeys = result.halfCheckedKeys

    return [
      getValueByKeyPath(checkedKeys),
      getValueByKeyPath(halfCheckedKeys),
      missingValues,
    ]
  })
}
