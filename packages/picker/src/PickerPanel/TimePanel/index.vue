<script setup vapor lang="ts">
import type { SharedPanelProps } from '../../interface'
import { computed } from 'vue'
import { formatValue } from '../../utils/dateUtil'
import { providePanelContext, useInfo, useSharedPanelContext } from '../context'
import PanelHeader from '../PanelHeader.vue'
import TimePanelBody from './TimePanelBody/index.vue'

defineOptions({ name: 'TimePanel', inheritAttrs: false })

const props = defineProps<SharedPanelProps<any>>()

const sharedContext = useSharedPanelContext()
const panelContext = computed(() => {
  const [info] = useInfo(props, 'time', sharedContext)
  return info
})
providePanelContext(panelContext)

// ========================= Render =========================
const timeProps = computed(() =>
  typeof props.showTime === 'object' && props.showTime !== null
    ? (props.showTime as Record<string, any>) : {},
)

const panelPrefixCls = computed(() => `${props.prefixCls}-time-panel`)

const format = computed(() =>
  typeof props.showTime === 'object' && props.showTime && props.showTime.format
    ? props.showTime.format
    : (props.locale?.fieldTimeFormat || 'HH:mm:ss'),
)

const valueText = computed(() =>
  props.value
    ? formatValue(props.value, {
        locale: props.locale!,
        format: format.value,
        generateConfig: props.generateConfig!,
      })
    : ' ',
)
</script>

<template>
  <div :class="panelPrefixCls">
    <PanelHeader>{{ valueText }}</PanelHeader>
    <TimePanelBody v-bind="timeProps" />
  </div>
</template>
