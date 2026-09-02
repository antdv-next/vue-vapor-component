import type { DefaultOptionType, InternalFieldNames } from '../interface'
import { warning } from '@v-c/util'

export function warningNullOptions(
  options: DefaultOptionType[],
  fieldNames: InternalFieldNames,
) {
  if (options) {
    const recursiveOptions = (optionsList: DefaultOptionType[]) => {
      for (let i = 0; i < optionsList.length; i += 1) {
        const option = optionsList[i]

        if (option[fieldNames.value as string] === null) {
          warning(false, '`value` in Cascader options should not be `null`.')
          return true
        }

        const children = option[fieldNames.children as string]
        if (Array.isArray(children) && recursiveOptions(children)) {
          return true
        }
      }
    }

    recursiveOptions(options)
  }
}
