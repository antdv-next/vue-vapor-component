<script setup vapor lang="ts">
  import type { GenerateConfig } from '../../generate'
  import type { SharedPanelProps } from '../../interface'

  import { clsx } from '@v-c/util'
  import { computed } from 'vue'

  import { isInRange, isSameWeek } from '../../utils/dateUtil'
  import DatePanel from '../DatePanel/index.vue'

  defineOptions({ name: 'WeekPanel', inheritAttrs: false })

  const props = defineProps<SharedPanelProps<any>>()

  const rowPrefixCls = computed(() => `${props.prefixCls}-week-panel-row`)

  const rowClassName = (currentDate: any) => {
    const generateConfig = (props.generateConfig || {}) as GenerateConfig<any>
    const localeName = props.locale?.locale
    const rowCls = `${rowPrefixCls.value}`
    const rangeCls: Record<string, boolean> = {}

    if (props.hoverRangeValue) {
      const [rangeStart, rangeEnd] = props.hoverRangeValue
      const isRangeStart = isSameWeek(
        generateConfig,
        localeName!,
        rangeStart,
        currentDate,
      )
      const isRangeEnd = isSameWeek(
        generateConfig,
        localeName!,
        rangeEnd,
        currentDate,
      )

      rangeCls[`${rowCls}-range-start`] = isRangeStart
      rangeCls[`${rowCls}-range-end`] = isRangeEnd
      rangeCls[`${rowCls}-range-hover`] =
        !isRangeStart &&
        !isRangeEnd &&
        isInRange(generateConfig, rangeStart, rangeEnd, currentDate)
    }

    if (props.hoverValue) {
      rangeCls[`${rowCls}-hover`] = props.hoverValue.some((date: any) =>
        isSameWeek(generateConfig, localeName!, currentDate, date),
      )
    }

    return clsx(
      rowCls,
      {
        [`${rowCls}-selected`]:
          !props.hoverRangeValue &&
          isSameWeek(generateConfig, localeName!, props.value, currentDate),
      },
      rangeCls,
    )
  }
</script>

<template>
  <DatePanel
    v-bind="props"
    :mode="`week`"
    :panel-name="`week`"
    :row-class-name="rowClassName"
  />
</template>
