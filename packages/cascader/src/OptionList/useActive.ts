import type { Ref } from 'vue'
import type { LegacyKey } from '../interface'
import { ref, watch } from 'vue'
import { useCascaderContext } from '../CascaderContextKey'

function useActive(
  multiple: Ref<boolean>,
  open: Ref<boolean>,
): [Ref<LegacyKey[]>, (activeValueCells: LegacyKey[]) => void] {
  const context = useCascaderContext()
  const activeValueCells = ref<LegacyKey[]>([])

  watch(
    [open, () => context.value?.values?.[0]],
    () => {
      if (!multiple.value) {
        activeValueCells.value = context.value?.values?.[0] || []
      }
    },
    { immediate: true },
  )

  const setActiveValueCells = (next: LegacyKey[]) => {
    activeValueCells.value = next
  }

  return [activeValueCells, setActiveValueCells]
}

export default useActive
