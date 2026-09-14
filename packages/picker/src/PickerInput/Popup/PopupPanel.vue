<script setup vapor lang="ts">
import type { PopupPanelProps } from './interface'
import type { PickerHackContextProps } from '../../PickerPanel/context'
import type { PanelMode } from '../../interface'
import { computed } from 'vue'
import PickerPanel from '../../PickerPanel/index.vue'
import { PickerHackContextProvider } from '../../PickerPanel/context'
import { cloneProps } from '../../utils/miscUtil'
import { usePickerContext } from '../context'
import { offsetPanelDate } from '../hooks/useRangePickerValue'

defineOptions({ name: 'PopupPanel', inheritAttrs: false })

const props = defineProps<PopupPanelProps>()

// Keys added by the popup / footer layers. They are stripped before forwarding
// to `<PickerPanel>` so they never land on the panel root div through `attrs`.
// popup / footer 层独有的 key，转发给 `<PickerPanel>` 前剔除，避免经 `attrs`
// 落到面板根 div 上。
const NON_PANEL_KEYS = [
  'multiplePanel',
  'range',
  'renderExtraFooter',
  'invalid',
  'onSubmit',
  'needConfirm',
  'onNow',
  'internalMode',
] as const

const ctx = usePickerContext()

const prefixCls = computed(() => ctx.value.prefixCls || 'vc-picker')
const picker = computed(() => props.picker)
const pickerValue = computed(() => props.pickerValue)
const needConfirm = computed(() => props.needConfirm)
const onSubmit = computed(() => props.onSubmit)
const range = computed(() => props.range)
const hoverValue = computed(() => props.hoverValue)
const multiplePanel = computed(() => props.multiplePanel)
const onPickerValueChange = computed(() => props.onPickerValueChange)

// ======================== Offset ========================
const internalOffsetDate = (date: any, offset: number) =>
  offsetPanelDate(
    ctx.value?.generateConfig as any,
    picker.value as PanelMode,
    date,
    offset,
  )

const nextPickerValue = computed(() => internalOffsetDate(pickerValue.value, 1))

// Outside
const onSecondPickerValueChange = (nextDate: any) =>
  onPickerValueChange.value(internalOffsetDate(nextDate, -1))

// ======================== Context ========================
const sharedContext = computed<PickerHackContextProps>(() => ({
  onCellDblClick: () => {
    if (needConfirm.value) onSubmit.value?.()
  },
}))

const leftHackContext = computed(() => ({
  ...sharedContext.value,
  hideNext: true,
}))
const rightHackContext = computed(() => ({
  ...sharedContext.value,
  hidePrev: true,
}))

const hideHeader = computed(() => picker.value === 'time')

// ========================= Props =========================
// `cloneProps` instead of `{...props}` (rule 18): a vapor props proxy's
// `getOwnPropertyDescriptor` trap returns `undefined` for emit-listened keys,
// so the spread operator silently drops every `onXxx` handler.
// 用 `cloneProps` 替代 `{...props}`（规则 18）：vapor 的 props proxy 对
// emit 绑定的 key 返回 `undefined`，spread 会静默丢掉所有 `onXxx` 处理器。
const panelProps = computed(() => {
  const baseProps = cloneProps(props as any, NON_PANEL_KEYS)

  baseProps.hoverValue = null as any
  baseProps.hoverRangeValue = null as any
  baseProps.hideHeader = hideHeader.value

  if (range.value) {
    baseProps.hoverRangeValue = hoverValue.value as any
  }
  else {
    baseProps.hoverValue = hoverValue.value as any
  }
  return baseProps
})

const rightPanelProps = computed(() => {
  const { onPickerValueChange: _, ...rest } = panelProps.value
  return {
    ...rest,
    pickerValue: nextPickerValue.value,
    onPickerValueChange: onSecondPickerValueChange,
  }
})

const panelsCls = computed(() => `${prefixCls.value}-panels`)
</script>

<template>
  <div v-if="multiplePanel" :class="panelsCls">
    <PickerHackContextProvider :value="leftHackContext">
      <PickerPanel v-bind="panelProps" />
    </PickerHackContextProvider>
    <PickerHackContextProvider :value="rightHackContext">
      <PickerPanel v-bind="rightPanelProps" />
    </PickerHackContextProvider>
  </div>
  <PickerHackContextProvider v-else :value="sharedContext">
    <PickerPanel v-bind="panelProps" />
  </PickerHackContextProvider>
</template>
