<script setup vapor lang="ts">
  defineOptions({
    inheritAttrs: false,
  })
</script>

<template>
  <div v-bind="$attrs">
    <slot />
  </div>
</template>
