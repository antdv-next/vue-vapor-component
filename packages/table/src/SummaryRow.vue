<script setup vapor lang="ts">
  import type { CSSProperties } from 'vue'

  const props = defineProps<{
    className?: string
    style?: CSSProperties
  }>()

  const emit = defineEmits<{
    click: [event: MouseEvent]
  }>()
</script>

<template>
  <tr :class="className" :style="style" @click="emit('click', $event)">
    <slot />
  </tr>
</template>
