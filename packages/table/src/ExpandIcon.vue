<script setup vapor lang="ts">
  import type { ExpandIconProps } from './interface'

  import { clsx } from '@v-c/util'

  const props = defineProps<{
    prefixCls: string
    type: 'row' | 'all'
    record?: any
    expanded: boolean
    expandable: boolean
    onClick: (event: MouseEvent) => void
  }>()

  function getClass() {
    const expandClassName = `${props.prefixCls}-row-expand-icon`

    if (!props.expandable) {
      return clsx(expandClassName, `${props.prefixCls}-row-spaced`)
    }

    return clsx(expandClassName, {
      [`${props.prefixCls}-row-expanded`]: props.expanded,
      [`${props.prefixCls}-row-collapsed`]: !props.expanded,
    })
  }
</script>

<template>
  <span v-if="!expandable" :class="getClass()" />
  <button
    v-else-if="type === 'all'"
    type="button"
    :aria-expanded="expanded"
    :aria-label="expanded ? 'Collapse all rows' : 'Expand all rows'"
    :class="getClass()"
    @click="onClick"
  />
  <span v-else :class="getClass()" @click="onClick" />
</template>
