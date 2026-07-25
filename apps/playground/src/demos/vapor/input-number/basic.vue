<script setup vapor lang="ts">
  import InputNumber from '@vapor-component/input-number'

  import { useInputNumber } from '@/composables/useInputNumber.ts'
  import '@/styles/input-number.less'

  const { value } = useInputNumber()
</script>

<template>
  <label>
    InputNumber:
    <InputNumber v-model:value="value" :min="1" :max="5" prefix="$" />
  </label>
</template>
