<script setup vapor lang="ts">
  import Collapse from '@vapor-component/collapse'

  import { useCollapse } from '@/composables/useCollapse.ts'
  import '@/styles/collapse.less'

  const { activeKey, items } = useCollapse()
</script>

<template>
  <label>
    Collapse:
    <Collapse
      :active-key="activeKey"
      :items="items"
      @change="k => (activeKey = k)"
    />
  </label>
</template>
