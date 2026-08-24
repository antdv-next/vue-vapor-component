import type { VueNode } from '@v-c/util/dist/type'
import type { Ref, ShallowRef } from 'vue'

import type { RawValueType } from '../interface'
import type { DefaultOptionType, FieldNames } from '../Select'

import { computed } from 'vue'

export interface OptionsResult<OptionType> {
  options: OptionType[]
  valueOptions: Map<RawValueType, OptionType>
  labelOptions: Map<VueNode, OptionType>
}

export default function useOptions<
  OptionType extends DefaultOptionType = DefaultOptionType,
>(
  options: Ref<OptionType[] | undefined>,
  childrenOptions: ShallowRef<OptionType[]>,
  fieldNames: Ref<FieldNames>,
  optionFilterProp: Ref<string | undefined>,
  optionLabelProp: Ref<string | undefined>,
): Ref<OptionsResult<OptionType>> {
  return computed<OptionsResult<OptionType>>(() => {
    let mergedOptions: OptionType[] = []

    if (options.value && options.value.length > 0) {
      mergedOptions = options.value
    } else if (childrenOptions.value && childrenOptions.value.length > 0) {
      mergedOptions = childrenOptions.value
    }

    const valueOptions = new Map<RawValueType, OptionType>()
    const labelOptions = new Map<VueNode, OptionType>()

    const setLabelOptions = (
      map: Map<VueNode, OptionType>,
      option: OptionType,
      key?: string,
    ) => {
      if (key && typeof key === 'string') {
        map.set(option[key], option)
      }
    }

    const dig = (optionList: OptionType[], isChildren = false) => {
      if (!Array.isArray(optionList)) return

      for (let i = 0; i < optionList.length; i += 1) {
        const option = optionList[i]
        if (!option) continue

        const optionsKey = fieldNames.value?.options || 'options'
        const valueKey = fieldNames.value?.value || 'value'
        const labelKey = fieldNames.value?.label || 'label'

        if (!option[optionsKey] || isChildren) {
          valueOptions.set(option[valueKey] as RawValueType, option)
          setLabelOptions(labelOptions, option, labelKey)
          setLabelOptions(labelOptions, option, optionFilterProp.value)
          setLabelOptions(labelOptions, option, optionLabelProp.value)
        } else {
          dig(option[optionsKey] as OptionType[], true)
        }
      }
    }

    dig(mergedOptions)

    return { options: mergedOptions, valueOptions, labelOptions }
  })
}
