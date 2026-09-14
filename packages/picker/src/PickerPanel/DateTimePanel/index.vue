<script setup vapor lang="ts">
import type { SharedPanelProps } from '../../interface'
import type { DatePanelProps } from '../DatePanel/index.vue'
import { omit } from '@v-c/util'
import { computed } from 'vue'
import useTimeInfo from '../../hooks/useTimeInfo'
import { fillTime } from '../../utils/dateUtil'
import DatePanel from '../DatePanel/index.vue'
import TimePanel from '../TimePanel/index.vue'

defineOptions({ name: 'DateTimePanel', inheritAttrs: false })

const props = defineProps<SharedPanelProps<any>>()

// ========================= Hook =========================
const generateConfig = computed(() => props.generateConfig!)
const showTime = computed(() =>
  typeof props.showTime === 'object' ? (props.showTime as Record<string, any>) : {},
)

const [getValidTime] = useTimeInfo(generateConfig, showTime)

// ======================== Render ========================
const panelPrefixCls = computed(() => `${props.prefixCls}-datetime-panel`)

const mergeTime = (date: any) => {
  if (props.value) return fillTime(generateConfig.value, date, props.value)
  return fillTime(generateConfig.value, date, props.pickerValue)
}

const onDateHover = (date: any) => {
  props.onHover?.(date ? mergeTime(date) : date)
}

const onDateSelect = (date: any) => {
  const cloneDate = mergeTime(date)
  props.onSelect?.(getValidTime(cloneDate, cloneDate))
}

// Rule 15: wrap in `computed` so the object stays reactive in the template.
// Annotate with `DatePanelProps<any>` so vue-tsc can verify the props passed
// via `v-bind`; `omit(...)` returns the remaining `SharedPanelProps` keys and
// the spread adds the overridden handlers.
// 规则 15：用 `computed` 包裹使对象在模板中保持响应式。
// 用 `DatePanelProps<any>` 标注类型，以便 vue-tsc 能验证 `v-bind` 传递的 props。
const datePanelProps = computed<DatePanelProps<any>>(() => ({
  ...omit(props, ['onSelect', 'onHover']),
  onSelect: onDateSelect,
  onHover: onDateHover,
}))
</script>

<template>
  <div :class="panelPrefixCls">
    <DatePanel v-bind="datePanelProps" />
    <TimePanel v-bind="props" />
  </div>
</template>
