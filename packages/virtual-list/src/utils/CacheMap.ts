import type { Key } from '@v-c/util/dist/type'

import { shallowRef } from 'vue'

class CacheMap {
  maps: Record<string, number>
  id = shallowRef(0)
  diffRecords = new Map<Key, number>()

  constructor() {
    this.maps = Object.create(null)
  }

  set(key: Key, value: number) {
    this.diffRecords.set(key, this.maps[key as string])
    this.maps[key as string] = value
    this.id.value += 1
  }

  get(key: Key) {
    return this.maps[key as string]
  }

  resetRecord() {
    this.diffRecords.clear()
  }

  getRecord() {
    return this.diffRecords
  }
}

export default CacheMap
