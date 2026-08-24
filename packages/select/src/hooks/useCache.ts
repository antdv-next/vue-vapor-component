import type { Ref } from 'vue'

import type { RawValueType } from '../interface'
import type { DefaultOptionType, LabelInValueType } from '../Select'

import { computed } from 'vue'

export default function useCache(
  labeledValues: Ref<LabelInValueType[]>,
  valueOptions: Ref<Map<RawValueType, DefaultOptionType>>,
): [
  Ref<LabelInValueType[]>,
  (val: RawValueType) => DefaultOptionType | undefined,
] {
  const cache: {
    values: Map<RawValueType, LabelInValueType>
    options: Map<RawValueType, DefaultOptionType>
  } = {
    values: new Map(),
    options: new Map(),
  }

  const filledLabeledValues = computed<LabelInValueType[]>(() => {
    const { values: prevValueCache, options: prevOptionCache } = cache

    const patchedValues = labeledValues.value.map(item => {
      if (item.label === undefined) {
        return {
          ...item,
          label: prevValueCache.get(item.value)?.label,
        }
      }
      return item
    })

    const valueCache = new Map<RawValueType, LabelInValueType>()
    const optionCache = new Map<RawValueType, DefaultOptionType>()

    patchedValues.forEach(item => {
      valueCache.set(item.value, item)
      const option =
        valueOptions.value.get(item.value) || prevOptionCache.get(item.value)
      if (option) {
        optionCache.set(item.value, option)
      }
    })

    cache.values = valueCache
    cache.options = optionCache

    return patchedValues
  })

  const getOption = (val: RawValueType): DefaultOptionType | undefined => {
    return valueOptions.value.get(val) || cache.options.get(val)
  }

  return [filledLabeledValues, getOption]
}
