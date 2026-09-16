<script setup vapor lang="ts">
  import type { CustomizeComponent } from './interface'

  import Cell from './Cell.vue'
  import { useInjectTableContext } from './TableContextKey'

  defineProps<{
    prefixCls: string
    component: CustomizeComponent
    cellComponent: CustomizeComponent
    className: string
    expanded: boolean
    colSpan: number
    isEmpty?: boolean
    stickyOffset?: number
  }>()

  const context = useInjectTableContext()
</script>

<template>
  <component
    :is="component"
    :class="className"
    :style="{ display: expanded ? null : 'none' }"
  >
    <Cell
      :component="cellComponent"
      :prefix-cls="prefixCls"
      :col-span="colSpan"
    >
      <template #default>
        <div
          v-if="
            isEmpty
              ? context.horizonScroll && context.componentWidth
              : context.fixColumn
          "
          :style="{
            width: `${context.componentWidth - (stickyOffset || 0) - (context.fixHeader && !isEmpty ? context.scrollbarSize : 0)}px`,
            position: 'sticky',
            left: `${stickyOffset || 0}px`,
            overflow: 'hidden',
          }"
          :class="`${prefixCls}-expanded-row-fixed`"
        >
          <slot />
        </div>
        <slot v-else />
      </template>
    </Cell>
  </component>
</template>
