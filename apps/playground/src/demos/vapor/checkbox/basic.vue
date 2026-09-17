<script setup vapor lang="ts">
  import Checkbox from '@vapor-component/checkbox'

  import { useCheckbox } from '@/composables/useCheckbox'

  const { checked, disabled, toggleDisabled } = useCheckbox()
</script>

<template>
  <label>
    checkbox:
    <Checkbox :checked="checked" @change="e => (checked = e.target.checked)" :disabled="disabled" />
    <Checkbox v-model:checked="checked" :disabled="disabled" />
    <button @click="toggleDisabled">toggle</button>  
  </label>
</template>
