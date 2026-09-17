import { ref } from 'vue'

export function useCheckbox() {
  const checked = ref(false)
  const disabled = ref(false)
  const toggleDisabled = () => {
    disabled.value = !disabled.value
  }
  return { checked, disabled, toggleDisabled }
}
