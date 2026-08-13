import type { Key } from '@v-c/util/dist/type'
import type { Ref } from 'vue'
import type { GetKey, GetSize, ScrollAlign, ScrollOffset, ScrollOffsetInfo } from '../interface'
import type CacheMap from '../utils/CacheMap'
import { warning } from '@v-c/util'
import { shallowRef, watch } from 'vue'

const MAX_TIMES = 10

function getOffset(rawOffset: ScrollOffset, info: ScrollOffsetInfo) {
  const resolvedOffset = typeof rawOffset === 'function' ? rawOffset(info) : rawOffset
  return Number.isFinite(resolvedOffset) ? resolvedOffset : 0
}

export default function useScrollTo(
  containerRef: Ref<HTMLDivElement>,
  data: Ref<any[]>,
  heights: CacheMap,
  itemHeight: Ref<number>,
  getKey: GetKey<any>,
  getSize: GetSize,
  collectHeight: () => void,
  syncScrollTop: (newTop: number) => void,
  triggerFlash: () => void,
): [(arg: number | { index?: number; key?: Key; align?: ScrollAlign; offset?: ScrollOffset }) => void, () => number] {
  const syncState = shallowRef<{
    times: number
    index: number
    offset: ScrollOffset
    originAlign: ScrollAlign
    targetAlign?: 'top' | 'bottom'
    lastTop?: number
  } | null>(null)

  const getTotalHeight = () => {
    let totalHeight = 0
    for (let i = 0; i < data.value.length; i += 1) {
      const key = getKey(data.value[i])
      const cacheHeight = heights.get(key)
      totalHeight += (cacheHeight === undefined ? itemHeight.value : cacheHeight)
    }
    return totalHeight
  }

  watch(
    syncState,
    () => {
      if (syncState.value && syncState.value.times < MAX_TIMES) {
        if (!containerRef.value) {
          syncState.value = { ...syncState.value }
          return
        }

        collectHeight()

        const { targetAlign, originAlign, index, offset: rawOffset } = syncState.value
        const mergedAlign = targetAlign || originAlign
        const offset = getOffset(rawOffset, { getSize, align: mergedAlign })

        const height = containerRef.value.clientHeight
        let needCollectHeight = false
        let newTargetAlign: 'top' | 'bottom' | null = targetAlign ?? null
        let targetTop: number | null = null

        if (height) {
          let stackTop = 0
          let itemTop = 0
          let itemBottom = 0

          const maxLen = Math.min(data.value.length - 1, index)

          for (let i = 0; i <= maxLen; i += 1) {
            const key = getKey(data.value[i])
            itemTop = stackTop
            const cacheHeight = heights.get(key)
            itemBottom = itemTop + (cacheHeight === undefined ? itemHeight.value : cacheHeight)
            stackTop = itemBottom
          }

          let leftHeight = mergedAlign === 'top' ? offset : height - offset
          for (let i = maxLen; i >= 0; i -= 1) {
            const key = getKey(data.value[i])
            const cacheHeight = heights.get(key)

            if (cacheHeight === undefined) {
              needCollectHeight = true
              break
            }

            leftHeight -= cacheHeight
            if (leftHeight <= 0) {
              break
            }
          }

          switch (mergedAlign) {
            case 'top':
              targetTop = itemTop - offset
              break
            case 'bottom':
              targetTop = itemBottom - height + offset
              break
            default: {
              const { scrollTop } = containerRef.value
              const scrollBottom = scrollTop + height
              if (itemTop < scrollTop) {
                newTargetAlign = 'top'
              }
              else if (itemBottom > scrollBottom) {
                newTargetAlign = 'bottom'
              }
            }
          }

          if (targetTop !== null) {
            syncScrollTop(targetTop)
          }

          if (targetTop !== syncState.value.lastTop) {
            needCollectHeight = true
          }
        }

        if (needCollectHeight) {
          syncState.value = {
            ...syncState.value,
            times: syncState.value.times + 1,
            targetAlign: newTargetAlign as any,
            lastTop: targetTop as any,
          }
        }
      }
      else if (syncState.value?.times === MAX_TIMES) {
        warning(
          false,
          'Seems `scrollTo` with `rc-virtual-list` reach the max limitation. Please fire issue for us. Thanks.',
        )
      }
    },
    {
      immediate: true,
      flush: 'post',
    },
  )

  const scrollTo = (arg: number | { index?: number; key?: Key; align?: ScrollAlign; offset?: ScrollOffset } | null | undefined) => {
    if (arg === null || arg === undefined) {
      triggerFlash()
      return
    }

    if (typeof arg === 'number') {
      syncScrollTop(arg)
    }
    else if (arg && typeof arg === 'object') {
      let index: number
      const { align } = arg

      if ('index' in arg && arg.index !== undefined) {
        index = arg.index
      }
      else {
        index = data.value.findIndex(item => getKey(item) === arg.key)
      }

      const rawOffset = arg.offset ?? 0

      syncState.value = {
        times: 0,
        index,
        offset: rawOffset,
        originAlign: (align as ScrollAlign) ?? 'top',
      }
    }
  }

  return [scrollTo, getTotalHeight]
}
