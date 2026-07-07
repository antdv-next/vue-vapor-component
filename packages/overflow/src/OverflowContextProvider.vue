<script setup vapor lang="ts">
  import type { OverflowContextType } from './interface'

  import { computed, provide } from 'vue'

  import { OverflowContextKey } from './OverflowContextKey'

  defineOptions({ name: 'OverflowContextProvider', inheritAttrs: false })

  const props = defineProps<{
    value?: OverflowContextType | null
  }>()

  provide(
    OverflowContextKey,
    computed(() => props.value ?? null),
  )
</script>

<template>
  <slot />
</template>
