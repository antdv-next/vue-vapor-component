<script setup vapor lang="ts">
  import SummaryCell from './SummaryCell.vue'
  import SummaryRow from './SummaryRow.vue'

  defineOptions({ name: 'Summary' })

  defineProps<{
    fixed?: 'top' | 'bottom'
  }>()
</script>

<template>
  <slot />
</template>
