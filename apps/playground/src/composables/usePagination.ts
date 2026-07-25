import { ref } from 'vue'

export function usePagination() {
  const total = ref(100)
  return { total }
}
