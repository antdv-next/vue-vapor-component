<script setup vapor lang="ts">
import type { SharedPanelProps } from '../../interface'
import { computed } from 'vue'
import { formatValue } from '../../utils/dateUtil'
import { providePanelContext, useInfo, useSharedPanelContext } from '../context'
import PanelBody from '../PanelBody.vue'
import PanelHeader from '../PanelHeader.vue'

defineOptions({ name: 'QuarterPanel', inheritAttrs: false })

const props = defineProps<SharedPanelProps<any>>()

const sharedContext = useSharedPanelContext()
const panelContext = computed(() => {
  const [info] = useInfo(props, 'quarter', sharedContext)
  return info
})
providePanelContext(panelContext)

// ========================= Render =========================
// `generateConfig` is optional on `SharedPanelProps` (it falls back to the
// picker context higher up) but every panel method below requires it, so
// narrow once and reuse. Exposed to the template too — the `superOffset` /
// `getStart` / `getEnd` arrows need it.
const generateConfig = computed(() => props.generateConfig!)

const panelPrefixCls = computed(() => `${props.prefixCls}-quarter-panel`)

const baseDate = computed(() => generateConfig.value.setMonth(props.pickerValue, 0))
const cellQuarterFormat = computed(() => props.locale?.cellQuarterFormat || '[Q]Q')
const yearFormat = computed(() => props.locale?.yearFormat || 'YYYY')

const getCellDate = (date: any, offset: number) =>
  generateConfig.value.addMonth(date, offset * 3)

const getCellText = (date: any) =>
  formatValue(date, {
    locale: props.locale!,
    format: cellQuarterFormat.value,
    generateConfig: generateConfig.value,
  })

const getCellClassName = () => ({
  [`${props.prefixCls}-cell-in-view`]: true,
})

const yearText = computed(() =>
  formatValue(props.pickerValue, {
    locale: props.locale!,
    format: yearFormat.value,
    generateConfig: generateConfig.value,
  }),
)
</script>

<template>
  <div :class="panelPrefixCls">
    <PanelHeader
      :super-offset="(distance: number, date: any) => generateConfig.addYear(date, distance)"
      :on-change="onPickerValueChange"
      :get-start="(date: any) => generateConfig.setMonth(date, 0)"
      :get-end="(date: any) => generateConfig.setMonth(date, 11)"
    >
      <button
        type="button"
        tabindex="-1"
        :aria-label="locale?.yearSelect"
        :class="`${prefixCls}-year-btn`"
        @click="onModeChange('year')"
      >
        {{ yearText }}
      </button>
    </PanelHeader>

    <PanelBody
      :row-num="1"
      :col-num="4"
      :base-date="baseDate"
      :title-format="locale?.fieldQuarterFormat"
      :get-cell-date="getCellDate"
      :get-cell-text="getCellText"
      :get-cell-class-name="getCellClassName"
    />
  </div>
</template>
