import { ref } from 'vue'

export function useDialog() {
  const visible = ref(false)
  return { visible }
}
