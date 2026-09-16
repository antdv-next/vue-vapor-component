<script setup vapor lang="ts">
  import type { ColumnType, Key } from './interface'

  import isVisible from '@v-c/util/dist/Dom/isVisible'
  import { filterEmpty } from '@v-c/util/dist/props-util'
  import ResizeObserver from '@vapor-component/resize-observer'
  import { cloneVNode, isVNode, ref } from 'vue'

  import MeasureCell from './MeasureCell.vue'
  import { useInjectTableContext } from './TableContextKey'

  const props = defineProps<{
    prefixCls: string
    onColumnResize: (key: Key, width: number) => void
    columnsKey: Key[]
    columns: readonly ColumnType<any>[]
  }>()

  const rowRef = ref<HTMLTableRowElement | null>(null)
  const { measureRowRender } = useInjectTableContext()

  function cloneTitle(title: any): any {
    if (Array.isArray(title)) {
      return title.map(node => cloneTitle(node))
    }
    if (isVNode(title)) {
      const cloned: any = cloneVNode(title, { ref: undefined })
      let children = cloned.children
      if (
        cloned.children?.default &&
        typeof cloned.children.default === 'function'
      ) {
        children = filterEmpty(cloned.children?.default?.())
        if (Array.isArray(children)) {
          children = children.map((child: any) => cloneTitle(child))
        } else if (isVNode(children)) {
          children = cloneTitle(children)
        }
        cloned.children.default = () => children
      } else if (Array.isArray(children)) {
        cloned.children = children.map((child: any) => cloneTitle(child))
      }

      return cloned
    }
    return title
  }

  function onBatchResize(infoList: any[]) {
    if (isVisible(rowRef.value as any)) {
      infoList.forEach(({ data: columnKey, size }) => {
        props.onColumnResize(columnKey, size.offsetWidth)
      })
    }
  }
</script>

<template>
  <tr
    aria-hidden="true"
    :class="`${prefixCls}-measure-row`"
    style="height: 0"
    ref="rowRef"
  >
    <ResizeObserver.Collection :on-batch-resize="onBatchResize">
      <MeasureCell
        v-for="columnKey in columnsKey"
        :key="columnKey"
        :column-key="columnKey"
        :on-column-resize="onColumnResize"
        :title="cloneTitle(columns.find(c => c.key === columnKey)?.title)"
      />
    </ResizeObserver.Collection>
  </tr>
</template>
