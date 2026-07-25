<script setup vapor lang="ts">
  import Switch from '@vapor-component/switch'

  import { useSwitch } from '@/composables/useSwitch.ts'
  import '@/styles/switch.less'

  const { checked } = useSwitch()
</script>

<template>
  <label>
    switch:
    <Switch
      v-model:checked="checked"
      checked-children="开"
      un-checked-children="关"
      @change="e => console.log(e)"
    />
  </label>
</template>
