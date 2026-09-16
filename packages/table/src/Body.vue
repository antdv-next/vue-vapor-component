<script setup vapor lang="ts">
  import { clsx } from '@v-c/util'
  import { computed } from 'vue'

  import BodyRow from './BodyRow.vue'
  import ExpandedRow from './ExpandedRow.vue'
  import useFlattenRecords from './hooks/useFlattenRecords'
  import MeasureRow from './MeasureRow.vue'
  import { useProvidePerfContext } from './PerfContextKey'
  import { useInjectTableContext } from './TableContextKey'
  import { getColumnsKey } from './utils/valueUtil'

  const props = defineProps<{
    data: readonly any[]
    measureColumnWidth: boolean
  }>()

  useProvidePerfContext()

  const context = useInjectTableContext()

  const bodyCls = computed(() => context.classNames?.body || ({} as any))
  const bodyStyles = computed(() => context.styles?.body || ({} as any))

  const flattenData = useFlattenRecords(
    computed(() => props.data),
    computed(() => context.childrenColumnName),
    computed(() => context.expandedKeys),
    computed(() => context.getRowKey),
  )

  const rowKeys = computed(() => flattenData.value.map(item => item.rowKey))

  const expandedRowInfo = computed(() => {
    const expandedColSpan =
      context.flattenColumns.length - (context.expandedRowOffset || 0)
    let expandedStickyStart = 0
    for (let i = 0; i < (context.expandedRowOffset || 0); i += 1) {
      expandedStickyStart += context.colWidths[i] || 0
    }
    return {
      offset: context.expandedRowOffset || 0,
      colSpan: expandedColSpan,
      sticky: expandedStickyStart,
    }
  })

  const columnsKey = computed(() => getColumnsKey(context.flattenColumns))
</script>

<template>
  <component
    :is="context.getComponent(['body', 'wrapper'], 'tbody')"
    :style="bodyStyles.wrapper"
    :class="clsx(`${context.prefixCls}-tbody`, bodyCls.wrapper)"
  >
    <MeasureRow
      v-if="measureColumnWidth"
      :prefix-cls="context.prefixCls"
      :columns-key="columnsKey"
      :on-column-resize="context.onColumnResize"
      :columns="context.flattenColumns"
    />

    <template v-if="data.length">
      <BodyRow
        v-for="(item, idx) in flattenData"
        :key="item.rowKey"
        :class-names="bodyCls"
        :styles="bodyStyles"
        :row-key="item.rowKey"
        :row-keys="rowKeys"
        :record="item.record"
        :index="idx"
        :render-index="item.index"
        :row-component="context.getComponent(['body', 'row'], 'tr')"
        :cell-component="context.getComponent(['body', 'cell'], 'td')"
        :scope-cell-component="context.getComponent(['body', 'cell'], 'th')"
        :indent="item.indent"
        :expanded-row-info="expandedRowInfo"
      >
        <template
          v-if="context.hasExpandedRowSlot"
          #expandedRowRender="{ record, index, indent, expanded }"
        >
          <slot
            name="expandedRowRender"
            :record="record"
            :index="index"
            :indent="indent"
            :expanded="expanded"
          />
        </template>
        <template
          v-if="context.hasRenderSlot"
          #render="{ value, record, index, column }"
        >
          <slot
            name="render"
            :value="value"
            :record="record"
            :index="index"
            :column="column"
          />
        </template>
      </BodyRow>
    </template>

    <ExpandedRow
      v-else
      expanded
      :class-name="`${context.prefixCls}-placeholder`"
      :prefix-cls="context.prefixCls"
      :component="context.getComponent(['body', 'row'], 'tr')"
      :cell-component="context.getComponent(['body', 'cell'], 'td')"
      :col-span="context.flattenColumns.length"
      is-empty
    >
      <slot name="empty">
        {{ context.emptyNode }}
      </slot>
    </ExpandedRow>
  </component>
</template>
