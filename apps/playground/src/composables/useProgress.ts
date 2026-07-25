import { ref } from 'vue'

export function useProgress() {
  const percent = ref<number>(9)
  const color = ref<string>('#3FC7FA')

  function changeState() {
    const colorMap = ['#3FC7FA', '#85D262', '#FE8C6A']
    color.value = colorMap[Math.floor(Math.random() * 3)]
    percent.value = Math.floor(Math.random() * 100)
  }

  function changeIncrease() {
    if (percent.value < 100) percent.value += 1
  }

  function changeReduce() {
    if (percent.value > 0) percent.value -= 1
  }

  return { percent, color, changeState, changeIncrease, changeReduce }
}
