import type { Ref } from 'vue'

import { ref } from 'vue'

import channelUpdate from './channelUpdate'

type Updater<T> = T | ((origin: T) => T)

type UpdateCallbackFunc = () => void

type NotifyEffectUpdate = (callback: UpdateCallbackFunc) => void

/**
 * Batcher for record any useEffectState need update.
 */
export function useBatcher(): NotifyEffectUpdate {
  const updateFuncRef = ref<UpdateCallbackFunc[] | null>(null)

  const notifyEffectUpdate: NotifyEffectUpdate = callback => {
    if (!updateFuncRef.value) {
      updateFuncRef.value = []

      channelUpdate(() => {
        updateFuncRef.value!.forEach(fn => {
          fn()
        })
        updateFuncRef.value = null
      })
    }

    updateFuncRef.value.push(callback)
  }

  return notifyEffectUpdate
}

/**
 * Trigger state update by ref to save perf.
 */
export default function useEffectState<T>(
  notifyEffectUpdate: NotifyEffectUpdate,
  defaultValue?: T | null | undefined,
): [Ref<T | null | undefined>, (nextValue: Updater<T>) => void] {
  const stateValue = ref(defaultValue) as Ref<T | null | undefined>

  const setEffectVal = (nextValue: Updater<T>) => {
    notifyEffectUpdate(() => {
      if (typeof nextValue === 'function') {
        const updater = nextValue as (origin: T | null | undefined) => T
        stateValue.value = updater(stateValue.value as T)
      } else {
        stateValue.value = nextValue as any
      }
    })
  }

  return [stateValue, setEffectVal]
}
