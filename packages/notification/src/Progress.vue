<script setup vapor lang="ts">
  import type { NotificationProgressProps } from './interface'

  import { clsx } from '@v-c/util'

  defineOptions({ name: 'NotificationProgress', inheritAttrs: false })

  const { percent, className, style } = defineProps<NotificationProgressProps>()
</script>

<template>
  <progress
    :class="clsx(className)"
    :style="style"
    :value="percent"
    max="100"
  />
</template>
