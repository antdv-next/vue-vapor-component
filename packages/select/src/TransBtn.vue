<script setup vapor lang="ts">
  import type { RenderNode } from '../interface'

  import { useAttrs } from 'vue'

  defineOptions({ name: 'TransBtn', inheritAttrs: false })

  const props = defineProps<{
    customizeIcon?: RenderNode
    customizeIconProps?: any
  }>()

  const emit = defineEmits<{
    mousedown: [event: MouseEvent]
    click: [event: MouseEvent]
  }>()

  const attrs = useAttrs()

  const mergedStyle = {
    userSelect: 'none' as const,
    WebkitUserSelect: 'none' as const,
    ...(!Array.isArray(attrs.style) &&
    typeof attrs.style === 'object' &&
    attrs.style
      ? attrs.style
      : {}),
  }
</script>

<template>
  <span
    :class="attrs.class"
    :style="mergedStyle"
    unselectable="on"
    aria-hidden
    @mousedown="
      e => {
        e.preventDefault()
        emit('mousedown', e)
      }
    "
    @click="e => emit('click', e)"
  >
    <template v-if="customizeIcon !== undefined">
      <slot name="customizeIcon" v-bind="customizeIconProps">{{
        customizeIcon
      }}</slot>
    </template>
    <span
      v-else
      :class="
        typeof attrs.class === 'string'
          ? attrs.class.split(/\s+/).map((cls: string) => `${cls}-icon`)
          : undefined
      "
    >
      <slot />
    </span>
  </span>
</template>
