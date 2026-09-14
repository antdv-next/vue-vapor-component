import type { Ref } from 'vue'
import raf from '@v-c/util/dist/raf'
import { computed, nextTick, onBeforeUnmount, ref, watch } from 'vue'

/**
 * Vapor coerces absent boolean props to `false`, collapsing the
 * "uncontrolled" (`undefined`) and "controlled-to-`false`" states.
 * When `value` is `false` and `defaultValue` is also `false`, the prop was
 * almost certainly never provided (vapor coercion), not explicitly set.
 * 检测 uncontrolled 状态。vapor 把缺省布尔 prop 强制成 `false`，
 * 当 `value` 和 `defaultValue` 都是 `false` 时，说明 prop 从未提供。
 */
function isUncontrolled<T>(value: T | undefined, defaultValue: T): boolean {
  if (value === undefined) return true
  if (value === false && defaultValue === false) return true
  return false
}

export default function useDelayState<T>(
  value: Ref<T | undefined>,
  defaultValue: T,
  onChange?: (next: T) => void,
) {
  const internalValue = ref(defaultValue)
  const state = computed(() => (isUncontrolled(value.value, defaultValue) ? internalValue.value : value.value))

  const nextValueRef = ref(state.value)
  const rafRef = ref<number>()

  const cancelRaf = () => {
    if (rafRef.value) {
      raf.cancel(rafRef.value)
    }
  }

  const doUpdate = () => {
    if (isUncontrolled(value.value, defaultValue)) {
      nextTick(() => {
        internalValue.value = nextValueRef.value
      })
    }

    if (onChange && state.value !== nextValueRef.value) {
      onChange(nextValueRef.value)
    }
  }

  const updateValue = (next: T, immediately?: boolean) => {
    cancelRaf()
    nextValueRef.value = next

    if (next || immediately) {
      doUpdate()
    }
    else {
      rafRef.value = raf(doUpdate)
    }
  }

  watch(value, () => {
    if (!isUncontrolled(value.value, defaultValue)) {
      nextValueRef.value = value.value
    }
  })

  onBeforeUnmount(() => {
    cancelRaf()
  })

  return [state, updateValue] as const
}
