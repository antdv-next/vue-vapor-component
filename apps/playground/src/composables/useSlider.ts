import { ref } from 'vue'

export function useSlider() {
  const value = ref(20)
  const rangeValue = ref([20, 50])
  const marksValue = ref(35)
  const disabledValue = ref(30)
  const verticalValue = ref(50)

  const marks = {
    0: '0°C',
    25: '25°C',
    50: '50°C',
    75: '75°C',
    100: {
      style: { color: '#f5222d' },
      label: '100°C',
    },
  }

  return {
    value,
    rangeValue,
    marksValue,
    disabledValue,
    verticalValue,
    marks,
  }
}
