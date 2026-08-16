<script setup vapor lang="ts">
  import type { CSSProperties } from 'vue'

  import type { Status } from './interface'

  import { clsx } from '@v-c/util'
  import { computed } from 'vue'

  defineOptions({ name: 'VcRail', inheritAttrs: false })

  const props = withDefaults(
    defineProps<{
      prefixCls: string
      className?: string
      status?: Status
      style?: CSSProperties
    }>(),
    {},
  )
  const nodeCls = computed(() => {
    const { prefixCls, className, status } = props
    const railCls = `${prefixCls}-rail`
    return clsx(railCls, `${railCls}-${status}`, className)
  })
</script>

<template>
  <div :class="nodeCls" :style="style"></div>
</template>
