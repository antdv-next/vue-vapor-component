import { ref } from 'vue'

export function useOverflow() {
  const data = ref([
    { key: 'item-1', label: 'Item 1' },
    { key: 'item-2', label: 'Item 2' },
    { key: 'item-3', label: 'Item 3' },
    { key: 'item-4', label: 'Item 4' },
    { key: 'item-5', label: 'Item 5' },
  ])
  return { data }
}
