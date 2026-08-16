<script setup vapor lang="ts">
  import type { CSSProperties } from 'vue'

  import type { Group } from './interface'

  import { clsx } from '@v-c/util'

  defineOptions({ name: 'GroupHeader' })

  const props = defineProps<{
    group: Group
    groupKey: any
    groupItems: any[]
    prefixCls: string
    fixed?: boolean
    sticky?: boolean
    className?: string
    style?: CSSProperties
  }>()

  const nodeCls = clsx(
    `${props.prefixCls}-group-header`,
    {
      [`${props.prefixCls}-group-header-sticky`]: props.sticky,
      [`${props.prefixCls}-group-header-fixed`]: props.fixed,
    },
    props.className,
  )

  const titleContent = props.group.title
    ? props.group.title(props.groupKey, props.groupItems)
    : props.groupKey
</script>

<template>
  <div :class="nodeCls" :style="style">
    {{ titleContent }}
  </div>
</template>
