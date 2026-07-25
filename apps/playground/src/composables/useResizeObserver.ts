import { ref } from 'vue'

export function useResizeObserver() {
  const times = ref(0)
  const disabled = ref(false)
  const width = ref(0)
  const height = ref(0)

  function onResize(size: { width: number; height: number }) {
    const { width: w, height: h } = size
    console.log('Resize:', '\n', 'BoundingBox', w, h, '\n', 'Offset')
    times.value += 1
    width.value = w
    height.value = h
  }

  return { times, disabled, width, height, onResize }
}
