import type { BaseOptionType, DefaultOptionType } from '../Select'

export function convertChildrenToData<
  OptionType extends BaseOptionType = DefaultOptionType,
>(nodes: any[]): OptionType[] {
  return nodes
    .map((node: any): OptionType | null => {
      if (!node || typeof node !== 'object') {
        return null
      }

      const { value, label, ...restProps } = node || {}

      return {
        value: value !== undefined ? value : node.key,
        label: label ?? restProps.children,
        ...restProps,
      } as OptionType
    })
    .filter((data): data is OptionType => data !== null)
}
