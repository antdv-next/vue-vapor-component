import type { ComputedRef, MaybeRef, ToRefs } from 'vue'

import type { StackConfig } from '../interface'

import { computed, reactive, toRefs, unref, watchEffect } from 'vue'

const DEFAULT_OFFSET = 8
const DEFAULT_THRESHOLD = 3

type StackParams = Exclude<StackConfig, boolean>

export default function useStack(
  config?: MaybeRef<StackConfig | undefined>,
): [ComputedRef<boolean>, ToRefs<StackParams>] {
  const result: StackParams = reactive({
    offset: DEFAULT_OFFSET,
    threshold: DEFAULT_THRESHOLD,
  })

  watchEffect(() => {
    const value = unref(config)
    if (value && typeof value === 'object') {
      result.offset = value.offset ?? DEFAULT_OFFSET
      result.threshold = value.threshold ?? DEFAULT_THRESHOLD
    }
  })

  return [computed(() => !!unref(config)), toRefs(result)]
}
