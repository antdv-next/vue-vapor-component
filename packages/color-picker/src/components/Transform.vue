<script setup vapor lang="ts">
  import type { TransformProps } from '../interface'

  import { useTemplateRef } from 'vue'

  defineOptions({ name: 'ColorPickerTransform' })

  const { x, y } = defineProps<TransformProps>()

  const transformDomRef = useTemplateRef<HTMLDivElement>('transform')

  defineExpose({ transformDomRef })
</script>

<template>
  <div
    ref="transform"
    :style="{
      position: 'absolute',
      left: `${x}%`,
      top: `${y}%`,
      zIndex: 1,
      transform: 'translate(-50%, -50%)',
    }"
  >
    <slot />
  </div>
</template>
