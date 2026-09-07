import type { Key, VueNode } from '@v-c/util/dist/type'

import type { EditableConfig } from './interface'

import { isEmptyElement } from '@v-c/util/dist/props-util'

export const tabsGlobal = {
  uuid: 0,
}

export function setUUid(uuid: number) {
  tabsGlobal.uuid = uuid
}
export function getUUid() {
  return tabsGlobal.uuid
}

/**
 * We trade Map as deps which may change with same value but different ref object.
 * We should make it as hash for deps
 */
export function stringify<K extends PropertyKey, V>(
  obj: Record<K, V> | Map<K, V>,
) {
  let tgt: Record<K, V>

  if (obj instanceof Map) {
    tgt = {} as any
    obj.forEach((v, k) => {
      tgt[k] = v
    })
  } else {
    tgt = obj
  }

  return JSON.stringify(tgt)
}

export function getRemovable(
  closable?: boolean,
  closeIcon?: VueNode,
  editable?: EditableConfig,
  disabled?: boolean,
) {
  if (
    !editable ||
    disabled ||
    closable === false ||
    (closable === undefined &&
      (isEmptyElement(closeIcon) || closeIcon === null))
  ) {
    return false
  }
  return true
}

const VC_TABS_DOUBLE_QUOTE = 'TABS_DQ'

export function genDataNodeKey(key: Key): string {
  return String(key).replace(/"/g, VC_TABS_DOUBLE_QUOTE)
}
