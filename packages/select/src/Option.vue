<script setup vapor lang="ts">
  import type { DefaultOptionType } from './Select'

  defineOptions({ name: 'SelectOption' })
  defineProps<DefaultOptionType>()
</script>

<template vapor>
  <slot />
</template>
