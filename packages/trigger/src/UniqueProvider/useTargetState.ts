import type { UniqueShowOptions } from '../TriggerContextKey'

import { ref } from 'vue'

export default function useTargetState() {
  const options = ref<UniqueShowOptions>()
  const open = ref(false)
  const isAnimating = ref(false)
  const pendingOptionsRef = ref<UniqueShowOptions | null>(null)

  const trigger = (nextOptions: UniqueShowOptions | false) => {
    const wasOpen = open.value
    if (nextOptions === false) {
      pendingOptionsRef.value = null
      open.value = false
    } else {
      if (isAnimating.value && wasOpen) {
        pendingOptionsRef.value = nextOptions
      } else {
        open.value = true
        options.value = nextOptions
        pendingOptionsRef.value = null
        if (!wasOpen) isAnimating.value = true
      }
    }
  }

  const onVisibleChanged = (visible: boolean) => {
    if (visible) {
      isAnimating.value = false
      if (pendingOptionsRef.value) {
        options.value = pendingOptionsRef.value
        pendingOptionsRef.value = null
      }
    } else {
      isAnimating.value = false
      pendingOptionsRef.value = null
    }
  }

  return [trigger, open, options, onVisibleChanged] as const
}
