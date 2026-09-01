<script setup vapor lang="ts">
  import type { RenderIconInfo, RenderIconType, VueNode } from './interface'

  import { filterEmpty } from '@v-c/util/dist/props-util'
  import { computed } from 'vue'

  defineOptions({ name: 'VcMenuIcon' })

  const props = defineProps<{
    icon?: RenderIconType
    props?: RenderIconInfo
  }>()

  const iconNode = computed(() => {
    const icon = props.icon
    if (icon === null || icon === false) return null
    if (typeof icon === 'function') {
      const childIcons = (icon as any)(props.props)
      if (!childIcons) return null
      const childArray = Array.isArray(childIcons) ? childIcons : [childIcons]
      return filterEmpty(childArray)
    }
    if (typeof icon !== 'boolean') return icon
    return null
  })

  function isRenderable(value: any): value is VueNode {
    return value !== null && value !== undefined && value !== false
  }
</script>

<template>
  <template v-if="isRenderable(iconNode)">
    <slot v-if="Array.isArray(iconNode) ? false : true">
      {{
        typeof iconNode === 'string' || typeof iconNode === 'number'
          ? iconNode
          : ''
      }}
    </slot>
  </template>
  <slot v-else />
</template>
