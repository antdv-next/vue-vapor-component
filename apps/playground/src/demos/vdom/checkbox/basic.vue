<script setup lang="ts">
  import Checkbox from '@vapor-component/checkbox'

  import { useCheckbox } from '@/composables/useCheckbox.ts'

  const { checked } = useCheckbox()
</script>

<template>
  <label>
    checkbox:
    <Checkbox :checked="checked" @change="e => (checked = e.target.checked)" />
  </label>
</template>
