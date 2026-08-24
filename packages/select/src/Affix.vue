<script setup vapor lang="ts">
  import { useAttrs } from 'vue'

  defineOptions({ name: 'Affix', inheritAttrs: false })

  const attrs = useAttrs()
</script>

<template>
  <div v-bind="attrs">
    <slot />
  </div>
</template>
