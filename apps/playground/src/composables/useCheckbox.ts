import { ref } from 'vue'

export function useCheckbox() {
  const checked = ref(false)
  return { checked }
}
