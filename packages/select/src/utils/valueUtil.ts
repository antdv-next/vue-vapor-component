import type { Key } from '@v-c/util/dist/type'

import type { FlattenOptionData, RawValueType } from '../interface'
import type { BaseOptionType, FieldNames } from '../Select'

function getKey(data: BaseOptionType, index: number): Key {
  const { key } = data
  let value: RawValueType | undefined

  if ('value' in data) {
    value = data.value as RawValueType
  }

  if (key !== null && key !== undefined) {
    return key
  }
  if (value !== undefined) {
    return value
  }
  return `vc-index-key-${index}`
}

export function isValidCount(value?: number) {
  return typeof value !== 'undefined' && !Number.isNaN(value)
}

export function fillFieldNames(
  fieldNames: FieldNames | undefined,
  childrenAsData: boolean,
): Required<FieldNames> {
  const { label, value, options, groupLabel } = fieldNames || {}
  const mergedLabel = label || (childrenAsData ? 'children' : 'label')

  return {
    label: mergedLabel,
    value: value || 'value',
    options: options || 'options',
    groupLabel: groupLabel || mergedLabel,
  }
}

export function flattenOptions<
  OptionType extends BaseOptionType = DefaultOptionType,
>(
  options: OptionType[],
  {
    fieldNames,
    childrenAsData,
  }: { fieldNames?: FieldNames; childrenAsData?: boolean } = {},
): FlattenOptionData<OptionType>[] {
  const flattenList: FlattenOptionData<OptionType>[] = []

  const {
    label: fieldLabel,
    value: fieldValue,
    options: fieldOptions,
    groupLabel,
  } = fillFieldNames(fieldNames, false)

  function dig(list: OptionType[], isGroupOption: boolean) {
    if (!Array.isArray(list)) {
      return
    }

    list.forEach(data => {
      if (isGroupOption || !(fieldOptions in data)) {
        const value = data[fieldValue]
        flattenList.push({
          key: getKey(data, flattenList.length),
          groupOption: isGroupOption,
          data,
          label: data[fieldLabel],
          value,
        })
      } else {
        let grpLabel = data[groupLabel]
        if (grpLabel === undefined && childrenAsData) {
          grpLabel = data.label
        }

        flattenList.push({
          key: getKey(data, flattenList.length),
          group: true,
          data,
          label: grpLabel,
        })

        dig(data[fieldOptions], true)
      }
    })
  }

  dig(options, false)

  return flattenList
}

export interface DefaultOptionType {
  label?: any
  value?: string | number | null
  children?: Omit<DefaultOptionType, 'children'>[]
  [name: string]: any
}

export function getSeparatedContent(
  text: string,
  tokens: string[],
  end?: number,
): string[] | null {
  if (!tokens || !tokens.length) {
    return null
  }
  let match = false
  const separate = (
    str: string,
    [token, ...restTokens]: string[],
  ): string[] => {
    if (!token) {
      return [str]
    }
    const list = str.split(token)
    match = match || list.length > 1
    return list
      .reduce(
        (prevList, unitStr) => [...prevList, ...separate(unitStr, restTokens)],
        [] as string[],
      )
      .filter(Boolean)
  }
  const list = separate(text, tokens)
  if (match) {
    return typeof end !== 'undefined' ? list.slice(0, end) : list
  } else {
    return null
  }
}
