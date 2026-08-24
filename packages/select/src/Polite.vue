<script setup vapor lang="ts">
  import type { DisplayValueType } from '../interface'

  import { computed } from 'vue'

  defineOptions({ name: 'Polite', inheritAttrs: false })

  const props = defineProps<{
    visible: boolean
    values: DisplayValueType[]
  }>()

  const MAX_COUNT = 50

  const displayText = computed(() => {
    if (!props.visible) return ''
    return (
      props.values
        .slice(0, MAX_COUNT)
        .map(({ label, value }) => {
          if (typeof label === 'number' || typeof label === 'string')
            return label
          return value
        })
        .join(', ') + (props.values.length > MAX_COUNT ? ', ...' : '')
    )
  })
</script>

<template v-if="visible">
  <span
    aria-live="polite"
    :style="{
      width: 0,
      height: 0,
      position: 'absolute',
      overflow: 'hidden',
      opacity: 0,
    }"
  >
    {{ displayText }}
  </span>
</template>
