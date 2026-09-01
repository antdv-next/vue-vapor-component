import { warning } from '@v-c/util'

export function warnItemProp<T extends { item: any }>({
  item,
  ...restInfo
}: T): T {
  Object.defineProperty(restInfo, 'item', {
    get: () => {
      warning(false, '`info.item` is deprecated. Use `info.itemData` instead.')
      return item
    },
  })
  return restInfo as T
}
