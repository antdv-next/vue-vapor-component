import type { VueNode } from '@v-c/util/dist/type'
import type { Ref } from 'vue'

import type { DefaultOptionType, FieldNames, FilterFunc } from '../Select'

import { computed } from 'vue'

import { injectPropsWithOption, toArray } from '../utils/commonUtil'

function includes(test: VueNode, search: string): boolean {
  return toArray(test).join('').toUpperCase().includes(search)
}

export default function useFilterOptions(
  options: Ref<DefaultOptionType[]>,
  fieldNames: Ref<FieldNames>,
  searchValue: Ref<string | undefined>,
  filterOption: Ref<FilterFunc | boolean | undefined>,
  optionFilterProp: Ref<string | undefined>,
) {
  return computed<DefaultOptionType[]>(() => {
    if (!searchValue.value) return options.value
    if (filterOption.value === false) return options.value

    const {
      options: fieldOptions,
      label: fieldLabel,
      value: fieldValue,
    } = fieldNames.value

    const filteredOptions: DefaultOptionType[] = []
    const customizeFilter = typeof filterOption.value === 'function'
    const upperSearch = searchValue.value.toUpperCase()

    const defaultFilter: FilterFunc = (
      _: string,
      option?: DefaultOptionType,
    ) => {
      if (!option) return false
      if (optionFilterProp.value) {
        return includes(option[optionFilterProp.value], upperSearch)
      }
      if (option[fieldOptions!]) {
        return includes(
          option[fieldLabel !== 'children' ? fieldLabel! : 'label'],
          upperSearch,
        )
      }
      return includes(option[fieldLabel!], upperSearch)
    }

    const filterFunc: FilterFunc = customizeFilter
      ? (filterOption.value as FilterFunc)
      : defaultFilter

    const wrapOption: (opt: DefaultOptionType) => DefaultOptionType =
      customizeFilter ? opt => injectPropsWithOption(opt) : opt => opt

    options.value.forEach(item => {
      if (item[fieldOptions!]) {
        const matchGroup = filterFunc(searchValue.value!, wrapOption(item))
        if (matchGroup) {
          filteredOptions.push(item)
        } else {
          const subOptions = (
            item[fieldOptions!] as DefaultOptionType[]
          ).filter((subItem: DefaultOptionType) =>
            filterFunc(searchValue.value!, wrapOption(subItem)),
          )
          if (subOptions.length) {
            filteredOptions.push({
              ...item,
              [fieldOptions!]: subOptions,
            })
          }
        }
        return
      }

      const match = filterFunc(searchValue.value!, wrapOption(item))
      if (match) {
        filteredOptions.push(item)
      }
    })

    return filteredOptions
  })
}
