import type { MaybeRefOrGetter } from 'vue'
import { warning } from '@v-c/util/dist/warning'
import { computed, toValue } from 'vue'

export type IsHandleDisabled = (index: number) => boolean
export type GetDisabledState = (rawValues: number[]) => [disabled: boolean, hasDisabledHandle: boolean]

export default function useDisabled(
  rawDisabled: MaybeRefOrGetter<boolean | boolean[] | undefined>,
): {
    isHandleDisabled: IsHandleDisabled
    getDisabledState: GetDisabledState
  } {
  const isHandleDisabled: IsHandleDisabled = (index: number) => {
    const value = toValue(rawDisabled)
    if (typeof value === 'boolean')
      return value
    return value?.[index] ?? false
  }

  const getDisabledState: GetDisabledState = (rawValues: number[]) => {
    const value = toValue(rawDisabled)
    if (typeof value === 'boolean')
      return [!!value, !!value && rawValues.length > 0]
    return [
      rawValues.length > 0 && rawValues.every((_, index) => isHandleDisabled(index)),
      rawValues.some((_, index) => isHandleDisabled(index)),
    ]
  }

  return { isHandleDisabled, getDisabledState }
}

export function useDisabledRefs(
  rawDisabled: MaybeRefOrGetter<boolean | boolean[] | undefined>,
  rawValues: MaybeRefOrGetter<number[]>,
) {
  const { isHandleDisabled, getDisabledState } = useDisabled(rawDisabled)
  const state = computed(() => getDisabledState(toValue(rawValues)))
  return {
    isHandleDisabled,
    getDisabledState,
    disabled: computed(() => state.value[0]),
    hasDisabledHandle: computed(() => state.value[1]),
  }
}
