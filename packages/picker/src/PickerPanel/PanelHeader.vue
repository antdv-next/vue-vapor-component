<script setup vapor lang="ts">
  import type { CSSProperties } from 'vue'

  import { clsx } from '@v-c/util'
  import { computed } from 'vue'

  import { isSameOrAfter } from '../utils/dateUtil'
  import { usePanelContext, usePickerHackContext } from './context'

  defineOptions({ name: 'PanelHeader', inheritAttrs: false })

  const props = defineProps<{
    offset?: (distance: number, date: any) => any
    superOffset?: (distance: number, date: any) => any
    onChange?: (date: any) => void
    getStart?: (date: any) => any
    getEnd?: (date: any) => any
  }>()

  const context = usePanelContext()!
  const pickerHackContext = usePickerHackContext()

  const HIDDEN_STYLE: CSSProperties = { visibility: 'hidden' }

  // ======================= Disabled =======================
  const disabledOffsetPrev = computed<boolean>(() => {
    const ctx = context.value
    if (!ctx.minDate || !props.offset || !props.getEnd) return false
    const prevPanelLimitDate = props.getEnd(props.offset(-1, ctx.pickerValue))
    return !isSameOrAfter(
      ctx.generateConfig as any,
      ctx.locale as any,
      prevPanelLimitDate,
      ctx.minDate,
      ctx.panelType,
    )
  })

  const disabledSuperOffsetPrev = computed<boolean>(() => {
    const ctx = context.value
    if (!ctx.minDate || !props.superOffset || !props.getEnd) return false
    const prevPanelLimitDate = props.getEnd(
      props.superOffset(-1, ctx.pickerValue),
    )
    return !isSameOrAfter(
      ctx.generateConfig as any,
      ctx.locale as any,
      prevPanelLimitDate,
      ctx.minDate,
      ctx.panelType,
    )
  })

  const disabledOffsetNext = computed<boolean>(() => {
    const ctx = context.value
    if (!ctx.maxDate || !props.offset || !props.getStart) return false
    const nextPanelLimitDate = props.getStart(props.offset(1, ctx.pickerValue))
    return !isSameOrAfter(
      ctx.generateConfig as any,
      ctx.locale as any,
      ctx.maxDate,
      nextPanelLimitDate,
      ctx.panelType,
    )
  })

  const disabledSuperOffsetNext = computed<boolean>(() => {
    const ctx = context.value
    if (!ctx.maxDate || !props.superOffset || !props.getStart) return false
    const nextPanelLimitDate = props.getStart(
      props.superOffset(1, ctx.pickerValue),
    )
    return !isSameOrAfter(
      ctx.generateConfig as any,
      ctx.locale as any,
      ctx.maxDate,
      nextPanelLimitDate,
      ctx.panelType,
    )
  })

  // ======================== Render ========================
  const hideHeader = computed<boolean>(
    () => !!pickerHackContext?.value?.hideHeader,
  )
  const hidePrev = computed<boolean>(() => !!pickerHackContext?.value?.hidePrev)
  const hideNext = computed<boolean>(() => !!pickerHackContext?.value?.hideNext)

  const prefixCls = computed(() => context.value.prefixCls)
  const panelClassNames = computed(() => context.value.classNames)
  const styles = computed(() => context.value.styles)
  const locale = computed(() => context.value.locale)

  const prevIcon = computed(() => context.value.prevIcon ?? '‹')
  const nextIcon = computed(() => context.value.nextIcon ?? '›')
  const superPrevIcon = computed(() => context.value.superPrevIcon ?? '«')
  const superNextIcon = computed(() => context.value.superNextIcon ?? '»')

  const headerPrefixCls = computed(() => `${prefixCls.value}-header`)
  const prevBtnCls = computed(() => `${headerPrefixCls.value}-prev-btn`)
  const nextBtnCls = computed(() => `${headerPrefixCls.value}-next-btn`)
  const superPrevBtnCls = computed(
    () => `${headerPrefixCls.value}-super-prev-btn`,
  )
  const superNextBtnCls = computed(
    () => `${headerPrefixCls.value}-super-next-btn`,
  )

  const headerCls = computed(() =>
    clsx(headerPrefixCls.value, panelClassNames.value?.header),
  )

  const onOffset = (distance: number) => {
    const ctx = context.value
    if (props.offset && props.onChange) {
      props.onChange(props.offset(distance, ctx.pickerValue))
    }
  }

  const onSuperOffset = (distance: number) => {
    const ctx = context.value
    if (props.superOffset && props.onChange) {
      props.onChange(props.superOffset(distance, ctx.pickerValue))
    }
  }
</script>

<template>
  <div v-if="!hideHeader" :class="headerCls" :style="styles.header">
    <button
      v-if="superOffset"
      type="button"
      tabindex="-1"
      :aria-label="locale?.previousYear"
      :class="
        clsx(
          superPrevBtnCls,
          disabledSuperOffsetPrev && `${superPrevBtnCls}-disabled`,
        )
      "
      :disabled="disabledSuperOffsetPrev"
      :style="hidePrev ? HIDDEN_STYLE : {}"
      @click="onSuperOffset(-1)"
    >
      {{ superPrevIcon }}
    </button>
    <button
      v-if="offset"
      type="button"
      tabindex="-1"
      :aria-label="locale?.previousMonth"
      :class="clsx(prevBtnCls, disabledOffsetPrev && `${prevBtnCls}-disabled`)"
      :disabled="disabledOffsetPrev"
      :style="hidePrev ? HIDDEN_STYLE : {}"
      @click="onOffset(-1)"
    >
      {{ prevIcon }}
    </button>
    <div :class="`${headerPrefixCls}-view`">
      <slot />
    </div>
    <button
      v-if="offset"
      type="button"
      tabindex="-1"
      :aria-label="locale?.nextMonth"
      :class="clsx(nextBtnCls, disabledOffsetNext && `${nextBtnCls}-disabled`)"
      :disabled="disabledOffsetNext"
      :style="hideNext ? HIDDEN_STYLE : {}"
      @click="onOffset(1)"
    >
      {{ nextIcon }}
    </button>
    <button
      v-if="superOffset"
      type="button"
      tabindex="-1"
      :aria-label="locale?.nextYear"
      :class="
        clsx(
          superNextBtnCls,
          disabledSuperOffsetNext && `${superNextBtnCls}-disabled`,
        )
      "
      :disabled="disabledSuperOffsetNext"
      :style="hideNext ? HIDDEN_STYLE : {}"
      @click="onSuperOffset(1)"
    >
      {{ superNextIcon }}
    </button>
  </div>
</template>
