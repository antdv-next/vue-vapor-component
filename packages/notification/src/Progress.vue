<script setup vapor lang="ts">
  import type { NotificationProgressProps } from './interface'

  import { clsx } from '@v-c/util'
  import { useAttrs } from 'vue'

  defineOptions({ name: 'NotificationProgress', inheritAttrs: false })

  const { percent } = defineProps<NotificationProgressProps>()
  const attrs = useAttrs()
</script>

<template>
  <progress
    :class="clsx((attrs as any).class)"
    :style="(attrs as any).style"
    :value="percent"
    max="100"
  />
</template>
