import type { Ref } from 'vue'

import { computed, onMounted, shallowRef, watch } from 'vue'

function internalMacroTask(fn: VoidFunction) {
  const channel = new MessageChannel()
  channel.port1.onmessage = fn
  channel.port2.postMessage(null)
}

export function macroTask(fn: VoidFunction, times = 1) {
  if (times <= 0) {
    fn()
    return
  }
  internalMacroTask(() => {
    macroTask(fn, times - 1)
  })
}

export type TriggerOpenType = (
  nextOpen?: boolean,
  config?: { cancelFun?: () => boolean },
) => void

export default function useOpen(
  defaultOpen: boolean,
  propOpen: Ref<boolean | null>,
  onOpen: (nextOpen: boolean) => void,
  postOpen: (nextOpen: boolean) => boolean,
) {
  const rendered = shallowRef(propOpen.value ?? false)
  onMounted(() => {
    rendered.value = true
  })

  const stateOpen = shallowRef(propOpen.value ?? defaultOpen ?? false)
  watch(propOpen, () => {
    stateOpen.value = propOpen.value ?? false
  })

  const lock = shallowRef(false)

  const ssrSafeOpen = computed(() => (rendered.value ? stateOpen.value : false))
  const mergedOpen = computed(() => postOpen(ssrSafeOpen.value))

  const taskIdRef = shallowRef(0)

  const triggerEvent = (nextOpen: boolean) => {
    if (onOpen && mergedOpen.value !== nextOpen) {
      onOpen(nextOpen)
    }
    if (propOpen.value === null) {
      return
    }
    stateOpen.value = nextOpen
  }

  const triggerOpen: TriggerOpenType = (nextOpen, config = {}) => {
    const { cancelFun } = config
    taskIdRef.value += 1
    const id = taskIdRef.value

    const nextOpenVal =
      typeof nextOpen === 'boolean' ? nextOpen : !mergedOpen.value
    lock.value = !nextOpenVal

    function triggerUpdate() {
      if (id === taskIdRef.value && !cancelFun?.()) {
        triggerEvent(nextOpenVal)
        lock.value = false
      }
    }

    if (nextOpenVal) {
      triggerUpdate()
    } else {
      macroTask(() => {
        triggerUpdate()
      })
    }
  }

  return [ssrSafeOpen, mergedOpen, triggerOpen, lock] as const
}
