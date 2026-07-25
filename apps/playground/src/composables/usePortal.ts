import { computed, ref } from 'vue'

export function usePortal() {
  const show = ref(true)
  const customizeContainer = ref(false)
  const lock = ref(false)
  const divRef = ref<HTMLDivElement | null>(null)

  const getContainer = computed(() =>
    customizeContainer.value ? () => divRef.value : undefined,
  )
  const contentCls = computed(() => (customizeContainer.value ? '' : 'abs'))

  function toggleShow() {
    show.value = !show.value
  }
  function toggleCustomizeContainer() {
    customizeContainer.value = !customizeContainer.value
  }
  function toggleLock() {
    lock.value = !lock.value
  }

  return {
    show,
    customizeContainer,
    lock,
    divRef,
    getContainer,
    contentCls,
    toggleShow,
    toggleCustomizeContainer,
    toggleLock,
  }
}
