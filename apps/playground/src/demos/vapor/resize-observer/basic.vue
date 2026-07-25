<script setup vapor lang="ts">
  import Checkbox from '@vapor-component/checkbox'
  import ResizeObserver from '@vapor-component/resize-observer'

  import { useResizeObserver } from '@/composables/useResizeObserver.ts'

  const { times, disabled, width, height, onResize } = useResizeObserver()
</script>

<template>
  <label>
    ResizeObserver:
    <div style="transform: scale(1.1); transform-origin: 0% 0%">
      <Checkbox :checked="disabled" @change="() => (disabled = !disabled)" />
      Disabled Observe >>> Resize times: {{ times }} {{ width }}/{{ height }}
    </div>
    <ResizeObserver :disabled="disabled" @resize="onResize">
      <textarea placeholder="I'm a textarea!" />
    </ResizeObserver>
  </label>
</template>
