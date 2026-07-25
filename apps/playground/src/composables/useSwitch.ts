import { ref } from 'vue'

export function useSwitch() {
  const checked = ref(false)
  return { checked }
}
