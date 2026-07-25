import { ref } from 'vue'

export function useMutateObserver() {
  const internalRef = ref<HTMLElement | null>(null)
  const flag = ref(true)

  function onMutate(mutations: MutationRecord[], observer: MutationObserver) {
    console.log(mutations)
    console.log(observer)
    console.log(internalRef)
  }

  return { internalRef, flag, onMutate }
}
