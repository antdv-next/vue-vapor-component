<script setup vapor lang="ts">
  import type { Key } from './interface'

  import { useLayoutEffect } from '@v-c/util/dist/hooks/useLayoutEffect'
  import ResizeObserver from '@vapor-component/resize-observer'
  import { ref } from 'vue'

  const props = defineProps<{
    columnKey: Key
    onColumnResize: (key: Key, width: number) => void
    title?: any
  }>()

  const cellRef = ref<HTMLTableCellElement | null>(null)

  useLayoutEffect(() => {
    if (cellRef.value) {
      props.onColumnResize(props.columnKey, cellRef.value.offsetWidth)
    }
  }, [])
</script>

<template>
  <ResizeObserver :data="columnKey">
    <td
      ref="cellRef"
      style="
        padding-top: 0;
        padding-bottom: 0;
        border-top: 0;
        border-bottom: 0;
        height: 0;
      "
    >
      <div style="height: 0; overflow: hidden; font-weight: bold">
        {{ title || '\u00A0' }}
      </div>
    </td>
  </ResizeObserver>
</template>
