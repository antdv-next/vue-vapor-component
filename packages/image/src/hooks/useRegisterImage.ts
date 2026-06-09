import type { Ref } from 'vue'

import type { ImageElementProps } from '../interface'

import { onBeforeUnmount, onMounted, shallowRef, watch } from 'vue'

import { usePreviewGroupContext } from '../context'

let uid = 0

export default function useRegisterImage(
  canPreview: Ref<boolean>,
  data: Ref<ImageElementProps>,
) {
  uid += 1
  const id = shallowRef(String(uid))

  const groupContext = usePreviewGroupContext()

  const registerData = () => ({
    data: data.value,
    canPreview: canPreview.value,
  })

  let unRegister: VoidFunction | undefined

  onMounted(() => {
    if (groupContext) {
      unRegister = groupContext.register(id.value, registerData())
    }
  })

  watch(
    [canPreview, data],
    () => {
      if (groupContext) {
        groupContext.register(id.value, registerData())
      }
    },
    { deep: true },
  )

  onBeforeUnmount(() => {
    unRegister?.()
  })

  return id.value
}
