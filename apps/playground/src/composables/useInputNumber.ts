import { ref } from 'vue'

export function useInputNumber() {
  const value = ref(1)
  return { value }
}
