import type { Ref } from 'vue'

import { ref } from 'vue'

export default function useOriginScroll(
  isScrollAtTop: Ref<boolean>,
  isScrollAtBottom: Ref<boolean>,
  isScrollAtLeft: Ref<boolean>,
  isScrollAtRight: Ref<boolean>,
) {
  const lockRef = ref(false)
  let lockTimeout: ReturnType<typeof setTimeout> | null = null

  function lockScroll() {
    if (lockTimeout) clearTimeout(lockTimeout)

    lockRef.value = true

    lockTimeout = setTimeout(() => {
      lockRef.value = false
    }, 50)
  }

  return (isHorizontal: boolean, delta: number, smoothOffset = false) => {
    const originScroll = isHorizontal
      ? (delta < 0 && isScrollAtLeft.value) ||
        (delta > 0 && isScrollAtRight.value)
      : (delta < 0 && isScrollAtTop.value) ||
        (delta > 0 && isScrollAtBottom.value)

    if (smoothOffset && originScroll) {
      if (lockTimeout) clearTimeout(lockTimeout)
      lockRef.value = false
    } else if (!originScroll || lockRef.value) {
      lockScroll()
    }

    return !lockRef.value && originScroll
  }
}
