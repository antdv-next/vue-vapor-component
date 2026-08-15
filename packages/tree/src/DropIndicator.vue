<script setup vapor lang="ts">
import type { CSSProperties } from 'vue'
import { computed } from 'vue'

defineOptions({ name: 'TreeDropIndicator' })

const props = defineProps<{
  dropPosition: -1 | 0 | 1
  dropLevelOffset: number
  indent: number
}>()

const style = computed<CSSProperties>(() => {
  const base: CSSProperties = {
    pointerEvents: 'none',
    position: 'absolute',
    right: 0,
    backgroundColor: 'red',
    height: 2,
  }

  switch (props.dropPosition) {
    case -1:
      return {
        ...base,
        top: 0,
        left: `${-props.dropLevelOffset * props.indent}px`,
      }
    case 1:
      return {
        ...base,
        bottom: 0,
        left: `${-props.dropLevelOffset * props.indent}px`,
      }
    case 0:
    default:
      return {
        ...base,
        bottom: 0,
        left: `${props.indent}px`,
      }
  }
})
</script>

<template>
  <div :style="style" />
</template>