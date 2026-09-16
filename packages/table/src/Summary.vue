<script setup vapor lang="ts">
  import SummaryCell from './SummaryCell.vue'
  import SummaryRow from './SummaryRow.vue'

  defineOptions({
    // Summary.Row and Summary.Cell are attached via Pattern C export in index.ts

  })

  defineProps<{
    fixed?: 'top' | 'bottom'
  }>()
</script>

<template>
  <slot />
</template>
