<script setup vapor lang="ts">
  import type { CollectionProps, ResizeInfo, SizeInfo } from './interface'

  import { inject, provide, shallowRef } from 'vue'

  import { CollectionContext } from './context'

  defineOptions({ name: 'Collection' })


  const props = defineProps<CollectionProps>()


  const resizeIdRef = shallowRef(0)
  const resizeInfosRef = shallowRef<ResizeInfo[]>([])
  const onCollectionResize = inject(CollectionContext, () => {})
  function onResize(size: SizeInfo, element: HTMLElement, data: any) {
    const resizeId = resizeIdRef.value + 1
    resizeIdRef.value = resizeId
    resizeInfosRef.value.push({ size, element, data })
    Promise.resolve().then(() => {
      if (resizeIdRef.value === resizeId) {
        const resizeInfos = resizeInfosRef.value
        resizeInfosRef.value = []
        props.onBatchResize?.(resizeInfos)
      }
    })
    onCollectionResize?.(size, element, data)
  }


  provide(CollectionContext, onResize)
</script>

<template>
  <slot />
</template>
