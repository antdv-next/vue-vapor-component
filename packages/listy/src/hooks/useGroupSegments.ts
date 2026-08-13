import type { ComputedRef } from 'vue'
import type { Group } from '../interface'
import { computed } from 'vue'

export interface GroupSegmentItem {
  item: any
  index: number
}

export default function useGroupSegments(
  data: any[],
  group: Group | undefined,
): ComputedRef<Map<any, GroupSegmentItem[]>> {
  return computed(() => {
    const map = new Map<any, GroupSegmentItem[]>()
    if (!group) return map

    data.forEach((item, index) => {
      const groupKey = typeof group.key === 'function'
        ? group.key(item)
        : group.key
      const groupItems = map.get(groupKey)
      const groupSegmentItem = { item, index }

      if (groupItems) {
        groupItems.push(groupSegmentItem)
      }
      else {
        map.set(groupKey, [groupSegmentItem])
      }
    })

    return map
  })
}