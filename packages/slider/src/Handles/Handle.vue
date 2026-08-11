<script setup vapor lang="ts">
  import type { CSSProperties } from 'vue'
  import type { OnStartMove, SliderClassNames, SliderStyles } from '../interface'
  import { clsx } from '@v-c/util'
  import KeyCode from '@v-c/util/dist/KeyCode'
  import { computed, useSlots, useTemplateRef } from 'vue'
  import { useInjectSlider } from '../SliderContextKey'
  import { getDirectionStyle, getIndex } from '../util'

  defineOptions({ name: 'SliderHandle' })

  const props = withDefaults(defineProps<{
    prefixCls: string
    value: number
    valueIndex?: number | null
    dragging?: boolean
    draggingDelete?: boolean
    onStartMove: OnStartMove
    onDelete: (index: number) => void
    onOffsetChange: (offset: number | 'min' | 'max', valueIndex: number) => void
    onFocus?: (e: FocusEvent, index: number) => void
    onMouseenter?: (e: MouseEvent, index: number) => void
    onBlur?: (e: FocusEvent, index: number) => void
    onChangeComplete?: () => void
    classNames?: SliderClassNames
    styles?: SliderStyles
    mock?: boolean
    style?: CSSProperties
  }>(), {
    prefixCls: 'vc-slider',
    value: 0,
    valueIndex: null,
    dragging: false,
    draggingDelete: false,
  })

  const slots = useSlots()
  const sliderContext = useInjectSlider()
  const handleNodeRef = useTemplateRef<HTMLDivElement>('handleNode')

  const sliderCtx = computed(() => sliderContext.value)
  const mergedDisabled = computed(() =>
    sliderCtx.value.disabled || sliderCtx.value.isHandleDisabled(props.valueIndex ?? 0),
  )

  const positionStyle = computed<CSSProperties>(() =>
    getDirectionStyle(sliderCtx.value.direction, props.value, sliderCtx.value.min, sliderCtx.value.max),
  )

  const handlePrefixCls = computed(() => `${props.prefixCls}-handle`)

  const handleCls = computed(() =>
    clsx(
      handlePrefixCls.value,
      {
        [`${handlePrefixCls.value}-${props.valueIndex! + 1}`]: props.valueIndex !== null && sliderCtx.value.range,
        [`${handlePrefixCls.value}-dragging`]: props.dragging,
        [`${handlePrefixCls.value}-dragging-delete`]: props.draggingDelete,
        [`${handlePrefixCls.value}-disabled`]: mergedDisabled.value,
      },
      sliderCtx.value.classNames?.handle,
    ),
  )

  const handleStyle = computed<CSSProperties>(() => ({
    ...positionStyle.value,
    ...(props.style || {}),
    ...sliderCtx.value.styles?.handle,
  }))

  const ariaOrientation = computed(() =>
    sliderCtx.value.direction === 'ltr' || sliderCtx.value.direction === 'rtl' ? 'horizontal' : 'vertical',
  )

  const slotData = computed(() => ({
    prefixCls: props.prefixCls,
    value: props.value,
    valueIndex: props.valueIndex,
    dragging: props.dragging,
    draggingDelete: props.draggingDelete,
    node: handleNodeRef.value,
    className: handleCls.value,
    style: handleStyle.value,
    isPhantom: props.valueIndex === null,
  }))

  const tabIndexVal = computed(() => {
    if (mergedDisabled.value) return undefined
    return props.valueIndex !== null ? getIndex(sliderCtx.value.tabIndex, props.valueIndex) : undefined
  })

  function onInternalStartMove(e: MouseEvent | TouchEvent) {
    if (mergedDisabled.value) {
      e.stopPropagation()
      return
    }
    props.onStartMove(e, props.valueIndex ?? -1)
  }

  function onInternalFocus(e: FocusEvent) {
    props.onFocus?.(e, props.valueIndex ?? -1)
  }

  function onInternalMouseEnter(e: MouseEvent) {
    props.onMouseenter?.(e, props.valueIndex ?? -1)
  }

  function onKeyDown(e: KeyboardEvent) {
    if (mergedDisabled.value || !sliderCtx.value.keyboard) return

    let offset: number | 'min' | 'max' | null = null
    const dir = sliderCtx.value.direction

    switch (e.which || e.keyCode) {
      case KeyCode.LEFT:
        offset = dir === 'ltr' || dir === 'btt' ? -1 : 1
        break
      case KeyCode.RIGHT:
        offset = dir === 'ltr' || dir === 'btt' ? 1 : -1
        break
      case KeyCode.UP:
        offset = dir !== 'ttb' ? 1 : -1
        break
      case KeyCode.DOWN:
        offset = dir !== 'ttb' ? -1 : 1
        break
      case KeyCode.HOME:
        offset = 'min'
        break
      case KeyCode.END:
        offset = 'max'
        break
      case KeyCode.PAGE_UP:
        offset = 2
        break
      case KeyCode.PAGE_DOWN:
        offset = -2
        break
      case KeyCode.BACKSPACE:
      case KeyCode.DELETE:
        props.onDelete(props.valueIndex ?? 0)
        return
    }

    if (offset !== null) {
      e.preventDefault()
      props.onOffsetChange(offset, props.valueIndex ?? 0)
    }
  }

  function onKeyUp(e: KeyboardEvent) {
    switch (e.which || e.keyCode) {
      case KeyCode.LEFT:
      case KeyCode.RIGHT:
      case KeyCode.UP:
      case KeyCode.DOWN:
      case KeyCode.HOME:
      case KeyCode.END:
      case KeyCode.PAGE_UP:
      case KeyCode.PAGE_DOWN:
        props.onChangeComplete?.()
    }
  }

  defineExpose({
    focus: () => handleNodeRef.value?.focus(),
  })
</script>

<template>
  <div
    v-if="!slots.handle"
    ref="handleNode"
    :class="handleCls"
    :style="handleStyle"
    :tabindex="valueIndex !== null ? tabIndexVal : undefined"
    :role="valueIndex !== null ? 'slider' : undefined"
    :aria-valuemin="valueIndex !== null ? sliderCtx.min : undefined"
    :aria-valuemax="valueIndex !== null ? sliderCtx.max : undefined"
    :aria-valuenow="valueIndex !== null ? value : undefined"
    :aria-disabled="valueIndex !== null ? mergedDisabled : undefined"
    :aria-label="valueIndex !== null ? getIndex(sliderCtx.ariaLabelForHandle, valueIndex) : undefined"
    :aria-labelledby="valueIndex !== null ? getIndex(sliderCtx.ariaLabelledByForHandle, valueIndex) : undefined"
    :aria-required="valueIndex !== null ? getIndex(sliderCtx.ariaRequired, valueIndex) : undefined"
    :aria-valuetext="valueIndex !== null ? getIndex(sliderCtx.ariaValueTextFormatterForHandle, valueIndex)?.(value) : undefined"
    :aria-orientation="valueIndex !== null ? ariaOrientation : undefined"
    @mousedown="onInternalStartMove"
    @touchstart="onInternalStartMove"
    @focus="onInternalFocus"
    @mouseenter="onInternalMouseEnter"
    @keydown="onKeyDown"
    @keyup="onKeyUp"
  />
  <slot
    v-else
    name="handle"
    v-bind:data="slotData"
  />
</template>