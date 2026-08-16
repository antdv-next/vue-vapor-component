<script setup vapor lang="ts">
  import type { CSSProperties, Ref } from 'vue'

  import type {
    AriaValueFormat,
    Direction,
    InternalMarkObj,
    OnStartMove,
    RangeConfig,
    SliderContextProps,
    SliderProps,
    ValueType,
  } from './interface'

  import { clsx } from '@v-c/util'
  import isEqual from '@v-c/util/dist/isEqual'
  import warning from '@v-c/util/dist/warning'
  import {
    computed,
    defineEmits,
    nextTick,
    onMounted,
    ref,
    shallowRef,
    toRef,
    useAttrs,
    useSlots,
    watch,
    watchEffect,
  } from 'vue'

  import Handles from './Handles/index.vue'
  import useDisabled from './hooks/useDisabled'
  import useDrag from './hooks/useDrag'
  import useOffset, { getClosestEnabledHandleIndex } from './hooks/useOffset'
  import useRange from './hooks/useRange'
  import Marks from './Marks/index.vue'
  import { useProviderSliderContext } from './SliderContextKey'
  import Steps from './Steps/index.vue'
  import Tracks from './Tracks/index.vue'

  defineOptions({ name: 'VcSlider', inheritAttrs: false })

  const props = withDefaults(defineProps<SliderProps>(), {
    prefixCls: 'vc-slider',
    keyboard: true,
    disabled: false,
    min: 0,
    max: 100,
    step: 1,
    allowCross: true,
    pushable: false,
    included: true,
    tabIndex: 0,
    track: true,
  })

  const emit = defineEmits<{
    change: [value: ValueType]
    'before-change': [value: ValueType]
    'after-change': [value: ValueType]
    'change-complete': [value: ValueType]
    focus: [e: FocusEvent]
    blur: [e: FocusEvent]
  }>()

  const attrs = useAttrs()
  const slots = useSlots()
  const containerRef = shallowRef<HTMLDivElement | null>(null)
  const handlesRef = shallowRef<any | null>(null)

  // ============================ Disabled ============================
  const rawDisabled = computed(() => props.disabled ?? false)
  const { isHandleDisabled, getDisabledState } = useDisabled(rawDisabled)

  // ============================ Direction ============================
  const direction = computed<Direction>(() => {
    if (props.vertical) {
      return props.reverse ? 'ttb' : 'btt'
    }
    return props.reverse ? 'rtl' : 'ltr'
  })

  // ============================ Range ============================
  const rangeConfig = computed(() => {
    const [
      rangeEnabled,
      rangeEditable,
      rangeDraggableTrack,
      minCount,
      maxCount,
    ] = useRange(props.range)
    return {
      rangeEnabled,
      rangeEditable,
      rangeDraggableTrack,
      minCount,
      maxCount,
    }
  })
  const rangeEnabled = computed(() => rangeConfig.value.rangeEnabled)
  const rangeEditable = computed(() => rangeConfig.value.rangeEditable)
  const rangeDraggableTrack = computed(
    () => rangeConfig.value.rangeDraggableTrack,
  )
  const minCount = computed(() => rangeConfig.value.minCount ?? 0)
  const maxCount = computed(() => rangeConfig.value.maxCount)

  // ============================ Min/Max ============================
  const mergedMin = computed(() =>
    Number.isFinite(props.min ?? 0) ? (props.min ?? 0) : 0,
  )
  const mergedMax = computed(() =>
    Number.isFinite(props.max ?? 100) ? (props.max ?? 100) : 100,
  )

  // ============================ Step ============================
  const mergedStep = computed<number | null>(() => {
    const step = props.step ?? 1
    if (step !== null && step <= 0) return 1
    return step
  })

  // ============================ Push ============================
  const mergedPush = computed<false | number | null>(() => {
    const pushable = props.pushable ?? false
    if (typeof pushable === 'boolean') {
      return pushable ? mergedStep.value : false
    }
    return pushable >= 0 ? pushable : false
  })

  // ============================ Marks ============================
  const markList = computed<InternalMarkObj[]>(() => {
    return Object.keys(props.marks || {})
      .map(key => {
        const mark = props.marks?.[key]
        const markObj: InternalMarkObj = { value: Number(key) }

        if (
          mark &&
          typeof mark === 'object' &&
          ('label' in mark || 'style' in mark)
        ) {
          markObj.style = (mark as any).style
          markObj.label = (mark as any).label
        } else {
          markObj.label = mark
        }

        return markObj
      })
      .filter(({ label }) => label || typeof label === 'number')
      .sort((a, b) => a.value - b.value)
  })

  // ============================ Offset ============================
  const [formatValue, offsetValuesFn] = useOffset(
    mergedMin,
    mergedMax,
    mergedStep,
    markList,
    computed(() => props.allowCross ?? true),
    mergedPush,
    isHandleDisabled,
  )
  const formatValueRef = computed(() => formatValue)
  const offsetValuesRef = computed(() => offsetValuesFn)

  // ============================ Values ============================
  const mergedValue = shallowRef<ValueType | null | undefined>(
    props.value !== undefined ? props.value : props.defaultValue,
  )

  watch(
    () => props.value,
    val => {
      if (val !== undefined) {
        mergedValue.value = val
      }
    },
  )

  const rawValues = computed<number[]>(() => {
    const valueList =
      mergedValue.value === null || mergedValue.value === undefined
        ? []
        : Array.isArray(mergedValue.value)
          ? [...mergedValue.value]
          : [mergedValue.value]

    const [val0 = mergedMin.value] = valueList
    let returnValues: number[] = mergedValue.value === null ? [] : [val0]

    if (rangeEnabled.value) {
      returnValues = [...valueList]

      if (typeof props.count === 'number' || mergedValue.value === undefined) {
        const pointCount =
          typeof props.count === 'number' && props.count >= 0
            ? props.count + 1
            : 2
        returnValues = returnValues.slice(0, pointCount)
        while (returnValues.length < pointCount) {
          returnValues.push(
            returnValues[returnValues.length - 1] ?? mergedMin.value,
          )
        }
      }
      returnValues.sort((a, b) => a - b)
    }

    returnValues.forEach((val, index) => {
      returnValues[index] = formatValue(val)
    })

    return returnValues
  })

  // ============================ Change ============================
  const getTriggerValue = (triggerValues: number[]): ValueType =>
    (rangeEnabled.value ? triggerValues : triggerValues[0]) as ValueType

  const triggerChange = (nextValues: number[]) => {
    const cloneNextValues = [...nextValues].sort((a, b) => a - b)

    if (!isEqual(cloneNextValues, rawValues.value, true)) {
      const triggerValue = getTriggerValue(cloneNextValues)
      emit('change', triggerValue)
    }

    mergedValue.value = cloneNextValues as ValueType
  }

  const finishChange = (draggingDelete?: boolean) => {
    if (draggingDelete) {
      handlesRef.value?.hideHelp?.()
    }

    const finishValue = getTriggerValue(rawValues.value)
    emit('after-change', finishValue)
    emit('change-complete', finishValue)
  }

  // ============================ Disabled State ============================
  const disabledState = computed(() => getDisabledState(rawValues.value))
  const disabled = computed(() => disabledState.value[0])
  const hasDisabledHandle = computed(() => disabledState.value[1])
  const effectiveRangeEditable = computed(
    () => rangeEditable.value && !hasDisabledHandle.value,
  )

  // ============================ Delete ============================
  const onDelete = (index: number) => {
    if (
      disabled.value ||
      !effectiveRangeEditable.value ||
      rawValues.value.length <= minCount.value
    ) {
      return
    }

    const cloneNextValues = [...rawValues.value]
    cloneNextValues.splice(index, 1)

    const triggerValue = getTriggerValue(cloneNextValues)
    emit('before-change', triggerValue)
    triggerChange(cloneNextValues)

    const nextFocusIndex = Math.max(0, index - 1)
    handlesRef.value?.hideHelp?.()
    handlesRef.value?.focus?.(nextFocusIndex)
  }

  // ============================ Drag ============================
  const effectiveRangeEditableRef = computed(() => effectiveRangeEditable.value)
  const minCountRef = computed(() => minCount.value)

  const [
    draggingIndex,
    draggingValue,
    draggingDelete,
    cacheValues,
    onStartDrag,
  ] = useDrag(
    containerRef as unknown as Ref<HTMLDivElement>,
    direction,
    rawValues,
    mergedMin,
    mergedMax,
    formatValueRef,
    triggerChange,
    finishChange,
    offsetValuesRef,
    effectiveRangeEditableRef,
    minCountRef,
    isHandleDisabled,
  )

  // ============================ Click ============================
  const changeToCloseValue = (newValue: number, e?: MouseEvent) => {
    if (disabled.value) return

    const valueIndex = rawValues.value.length
      ? getClosestEnabledHandleIndex(
          rawValues.value,
          newValue,
          mergedMin.value,
          mergedMax.value,
          mergedPush.value,
          isHandleDisabled,
        )
      : 0

    if (valueIndex === -1) return

    const cloneNextValues = [...rawValues.value]

    let valueBeforeIndex = 0
    const valueDist = rawValues.value.length
      ? Math.abs(newValue - rawValues.value[valueIndex])
      : mergedMax.value - mergedMin.value

    rawValues.value.forEach((val, index) => {
      if (val < newValue) {
        valueBeforeIndex = index
      }
    })

    let focusIndex = valueIndex

    if (
      effectiveRangeEditable.value &&
      valueDist !== 0 &&
      (!maxCount.value || rawValues.value.length < maxCount.value)
    ) {
      cloneNextValues.splice(valueBeforeIndex + 1, 0, newValue)
      focusIndex = valueBeforeIndex + 1
    } else {
      cloneNextValues[valueIndex] = newValue
      focusIndex = valueIndex
    }

    if (
      rangeEnabled.value &&
      !rawValues.value.length &&
      props.count === undefined
    ) {
      cloneNextValues.push(newValue)
    }

    const nextValue = getTriggerValue(cloneNextValues)
    emit('before-change', nextValue)
    triggerChange(cloneNextValues)

    if (e) {
      ;(document.activeElement as HTMLElement)?.blur?.()
      handlesRef.value?.focus?.(focusIndex)
      onStartDrag(e, focusIndex, cloneNextValues)
    } else {
      emit('after-change', nextValue)
      emit('change-complete', nextValue)
    }
  }

  const onSliderMouseDown = (e: MouseEvent) => {
    e.preventDefault()

    const rect = containerRef.value?.getBoundingClientRect()
    if (!rect) return

    const { width, height, left, top, bottom, right } = rect
    const { clientX, clientY } = e

    let percent: number
    switch (direction.value) {
      case 'btt':
        percent = (bottom - clientY) / height
        break
      case 'ttb':
        percent = (clientY - top) / height
        break
      case 'rtl':
        percent = (right - clientX) / width
        break
      default:
        percent = (clientX - left) / width
    }

    const nextValue =
      mergedMin.value + percent * (mergedMax.value - mergedMin.value)
    changeToCloseValue(formatValue(nextValue), e)
  }

  // ============================ Keyboard ============================
  const keyboardValue = shallowRef<{ value: number; index: number } | null>(
    null,
  )

  const onHandleOffsetChange = (
    offset: number | 'min' | 'max',
    valueIndex: number,
  ) => {
    if (disabled.value || isHandleDisabled(valueIndex)) return

    const next = offsetValuesFn(rawValues.value, offset, valueIndex)

    const currentValue = getTriggerValue(rawValues.value)
    emit('before-change', currentValue)
    triggerChange(next.values)

    keyboardValue.value = { value: next.value, index: valueIndex }
  }

  watch(keyboardValue, val => {
    if (val !== null) {
      const valueIndex =
        rawValues.value[val.index] === val.value
          ? val.index
          : rawValues.value.indexOf(val.value)
      if (valueIndex >= 0) {
        handlesRef.value?.focus?.(valueIndex)
      }
    }
    keyboardValue.value = null
  })

  // ============================ Draggable Track ============================
  const mergedDraggableTrack = computed(() => {
    if (rangeDraggableTrack.value && mergedStep.value === null) {
      if (process.env.NODE_ENV !== 'production') {
        warning(
          false,
          '`draggableTrack` is not supported when `step` is `null`.',
        )
      }
      return false
    }
    return rangeDraggableTrack.value
  })

  const onStartMove: OnStartMove = (e, valueIndex) => {
    onStartDrag(e, valueIndex)
    const triggerValue = getTriggerValue(rawValues.value)
    emit('before-change', triggerValue)
  }

  // ============================ Dragging watch ============================
  const dragging = computed(() => draggingIndex.value !== -1)
  watch(dragging, isDragging => {
    if (
      !isDragging &&
      draggingValue.value !== null &&
      draggingValue.value !== undefined
    ) {
      const valueIndex = rawValues.value.lastIndexOf(draggingValue.value)
      if (valueIndex >= 0) {
        handlesRef.value?.focus?.(valueIndex)
      }
    }
  })

  // ============================ Included ============================
  const sortedCacheValues = computed(() =>
    [...cacheValues.value].sort((a, b) => a - b),
  )
  const includedRange = computed<[number, number]>(() => {
    if (!rangeEnabled.value) {
      return [mergedMin.value, sortedCacheValues.value[0] ?? mergedMin.value]
    }
    if (!sortedCacheValues.value.length) {
      return [mergedMin.value, mergedMin.value]
    }
    return [
      sortedCacheValues.value[0],
      sortedCacheValues.value[sortedCacheValues.value.length - 1],
    ]
  })
  const includedStart = computed(() => includedRange.value[0])
  const includedEnd = computed(() => includedRange.value[1])

  // ============================ Refs ============================
  defineExpose({
    focus: () => {
      handlesRef.value?.focus?.(0)
    },
    blur: () => {
      const { activeElement } = document
      if (containerRef.value?.contains(activeElement)) {
        ;(activeElement as HTMLElement)?.blur()
      }
    },
  })

  // ============================ Auto Focus ============================
  onMounted(() => {
    if (props.autoFocus) {
      nextTick(() => {
        handlesRef.value?.focus?.(0)
      })
    }
  })

  // ============================ Context ============================
  const sliderContext = computed<SliderContextProps>(() => ({
    min: mergedMin.value,
    max: mergedMax.value,
    direction: direction.value,
    disabled: disabled.value,
    keyboard: props.keyboard ?? true,
    step: mergedStep.value,
    included: props.included ?? true,
    includedStart: includedStart.value,
    includedEnd: includedEnd.value,
    range: rangeEnabled.value,
    tabIndex: props.tabIndex ?? 0,
    ariaLabelForHandle: props.ariaLabelForHandle,
    ariaLabelledByForHandle: props.ariaLabelledByForHandle,
    ariaRequired: props.ariaRequired,
    ariaValueTextFormatterForHandle: props.ariaValueTextFormatterForHandle,
    styles: props.styles || {},
    classNames: props.classNames || {},
    isHandleDisabled,
  }))

  useProviderSliderContext(sliderContext)

  // ============================ ClassName / Style ============================
  const mergedClassName = computed(() =>
    clsx(props.prefixCls ?? 'vc-slider', props.className, attrs.class as any, {
      [`${props.prefixCls ?? 'vc-slider'}-disabled`]: disabled.value,
      [`${props.prefixCls ?? 'vc-slider'}-vertical`]: props.vertical,
      [`${props.prefixCls ?? 'vc-slider'}-horizontal`]: !props.vertical,
      [`${props.prefixCls ?? 'vc-slider'}-with-marks`]:
        markList.value.length > 0,
    }),
  )

  const mergedStyle = computed<CSSProperties>(() => ({
    ...(props.style as CSSProperties),
    ...(attrs.style as CSSProperties),
  }))
</script>

<template>
  <div
    ref="containerRef"
    :class="mergedClassName"
    :style="mergedStyle"
    :id="id"
    @mousedown="onSliderMouseDown"
  >
    <div
      :class="clsx(`${prefixCls ?? 'vc-slider'}-rail`, classNames?.rail)"
      :style="{ ...(railStyle || {}), ...(styles?.rail || {}) }"
    />

    <Tracks
      v-if="track !== false"
      :prefix-cls="prefixCls ?? 'vc-slider'"
      :track-style="trackStyle"
      :values="rawValues"
      :start-point="startPoint"
      @start-move="mergedDraggableTrack ? onStartMove : undefined"
    />

    <Steps
      :prefix-cls="prefixCls ?? 'vc-slider'"
      :marks="markList"
      :dots="dots"
      :style="dotStyle"
      :active-style="activeDotStyle"
    />

    <Handles
      ref="handlesRef"
      :prefix-cls="prefixCls ?? 'vc-slider'"
      :values="cacheValues"
      :handle-style="handleStyle"
      :dragging-index="draggingIndex"
      :dragging-delete="draggingDelete"
      @start-move="onStartMove"
      @offset-change="onHandleOffsetChange"
      @focus="(e: FocusEvent) => emit('focus', e)"
      @delete="effectiveRangeEditable ? onDelete : () => {}"
      @change-complete="finishChange"
    >
      <template v-if="slots.handle" #handle="data">
        <slot name="handle" v-bind:data="data" />
      </template>
      <template v-if="slots['active-handle']" #active-handle="data">
        <slot name="active-handle" v-bind:data="data" />
      </template>
    </Handles>

    <Marks
      :prefix-cls="prefixCls ?? 'vc-slider'"
      :marks="markList"
      @click="changeToCloseValue"
    >
      <template #mark="{ point, label }">
        {{ label }}
      </template>
    </Marks>
  </div>
</template>
