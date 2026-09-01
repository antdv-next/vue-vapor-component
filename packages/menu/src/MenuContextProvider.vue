<script setup vapor lang="ts">
  import type { MenuContextProps } from './MenuContextKey'

  import { computed } from 'vue'

  import { useMenuContextProvider } from './MenuContextKey'

  defineOptions({ name: 'VcMenuContextProvider' })

  const props = defineProps<{
    value: MenuContextProps
  }>()

  useMenuContextProvider(computed(() => props.value) as any)
</script>

<template>
  <slot />
</template>
