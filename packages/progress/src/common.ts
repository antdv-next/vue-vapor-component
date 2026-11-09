import type { Ref } from 'vue'

import { onMounted, shallowRef } from 'vue'

export function useTransitionDuration<
  T extends SVGElement = SVGPathElement,
>(): Ref<T[]> {
  const pathsRef = shallowRef<T[]>([])
  const prevTimeStamp = shallowRef<number>()
  onMounted(() => {
    const now = Date.now()
    let updated = false
    pathsRef.value.forEach(path => {
      if (!path) return
      updated = true
      if (!path.style) {
        ;(path as any).style = {}
      }
      const pathStyle = path.style
      pathStyle.transitionDuration = '.3s, .3s, .3s, .06s'
      if (prevTimeStamp.value && now - prevTimeStamp.value < 100) {
        pathStyle.transitionDuration = '0s, 0s'
      }
      if (updated) {
        prevTimeStamp.value = Date.now()
      }
    })
  })
  return pathsRef
}
