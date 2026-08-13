import type { Key } from '@v-c/util/dist/type'

export type KeyType = 'item' | 'group'

export function toTaggedKey(oriKey: Key, type: KeyType): string {
  return `${type}:${oriKey}`
}