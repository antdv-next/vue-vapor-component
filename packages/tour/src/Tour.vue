<script setup vapor lang="ts">
  import type { TriggerRef } from '@vapor-component/trigger'
  import type { CSSProperties } from 'vue'

  import type {
    TourProps,
    TourStepInfo,
    SemanticName,
    ClosableConfig,
  } from './interface'

  import { clsx } from '@v-c/util'
  import Trigger from '@vapor-component/trigger'
  import {
    computed,
    nextTick,
    onBeforeUnmount,
    shallowRef,
    unref,
    useAttrs,
    useSlots,
    useTemplateRef,
    watch,
  } from 'vue'

  import { useClosable } from './hooks/useClosable'
  import useTarget from './hooks/useTarget'
  import Mask from './Mask.vue'
  import { getPlacements } from './placements'
  import TourStep from './TourStep/index.vue'
  import { getPlacement } from './util'

  defineOptions({ name: 'VcTour', inheritAttrs: false })

  const props = withDefaults(defineProps<TourProps>(), {
    prefixCls: 'vc-tour',
    steps: () => [],
    zIndex: 1001,
    defaultCurrent: 0,
  })

  const attrs = useAttrs()
  const slots = useSlots()

  const emit = defineEmits<{
    change: [current: number]
    close: [current: number]
    finish: []
  }>()

  const triggerRef = shallowRef<TriggerRef>()
  const placeholderRef = useTemplateRef<HTMLDivElement>('placeholder')

  const inlineMode = computed(() => props.getPopupContainer === false)
  const prefixCls = computed(() => props.prefixCls)
  const steps = computed(() => unref(props.steps) || [])
  const stepCount = computed(() => steps.value.length)

  // ======================== Current ========================
  const mergedCurrent = shallowRef(
    typeof props.current === 'number' ? props.current : props.defaultCurrent,
  )
  const setMergedCurrent = (nextCurrent: number) => {
    if (typeof props.current === 'undefined') {
      mergedCurrent.value = nextCurrent
    }
  }
  watch(
    () => props.current,
    val => {
      if (typeof val === 'number') {
        mergedCurrent.value = val
      }
    },
  )

  // ======================== Open ========================
  const internalOpen = shallowRef<boolean | undefined>(
    typeof props.open === 'boolean' ? props.open : props.defaultOpen,
  )
  const setInternalOpen = (nextOpen?: boolean) => {
    if (typeof props.open === 'undefined') {
      internalOpen.value = nextOpen
    }
  }
  watch(
    () => props.open,
    val => {
      if (typeof val !== 'undefined') {
        internalOpen.value = val
      }
    },
  )

  const mergedOpen = computed(() => {
    if (mergedCurrent.value < 0 || mergedCurrent.value >= stepCount.value) {
      return false
    }
    return internalOpen.value ?? true
  })

  const hasOpened = shallowRef(mergedOpen.value)
  const openRef = shallowRef(mergedOpen.value)
  watch([mergedOpen], async () => {
    await nextTick()
    if (mergedOpen.value) {
      if (!openRef.value) {
        setMergedCurrent(0)
      }
      hasOpened.value = true
    }
    openRef.value = mergedOpen.value
  })

  // ======================== Step Info ========================
  const stepInfo = computed<TourStepInfo>(
    () => (steps.value[mergedCurrent.value] || {}) as TourStepInfo,
  )
  const stepStyle = computed(() => stepInfo.value.style)
  const stepClassName = computed(() => stepInfo.value.className)
  const stepClosable = computed(() => stepInfo.value.closable)
  const stepCloseIcon = computed(() => stepInfo.value.closeIcon)
  const rootClosable = computed(() => props.closable)
  const rootCloseIcon = computed(() => props.closeIcon)
  const tourClosable = useClosable(
    stepClosable,
    stepCloseIcon,
    rootClosable,
    rootCloseIcon,
  )

  // ======================== Mask ========================
  // In vapor mode, boolean-typed props coerce undefined → false,
  // which breaks `??` fallback chains (false ?? true → false).
  // Use `||` for the root-level mask prop to treat coerced false as "not set".
  const mergedMask = computed(() => {
    const stepMask = stepInfo.value.mask
    const mask = stepMask !== undefined ? stepMask : props.mask || true
    return mergedOpen.value && mask
  })
  const mergedShowMask = computed(() =>
    typeof mergedMask.value === 'boolean'
      ? mergedMask.value
      : !!mergedMask.value,
  )
  const mergedMaskStyle = computed<CSSProperties | undefined>(() =>
    typeof mergedMask.value === 'object' ? mergedMask.value.style : undefined,
  )
  const mergedMaskFill = computed(() =>
    typeof mergedMask.value === 'object' ? mergedMask.value.color : undefined,
  )
  const mergedMaskComponentStyles = computed<
    Partial<Record<SemanticName, CSSProperties>>
  >(() => ({
    ...(props.styles || {}),
    mask: {
      ...(props.styles?.mask || {}),
      ...(mergedMaskStyle.value || {}),
    },
  }))

  // ======================== Scroll Into View ========================
  const defaultScrollIntoViewOptions: ScrollIntoViewOptions = {
    block: 'center',
    inline: 'center',
  }
  const mergedScrollIntoViewOptions = computed(
    () =>
      stepInfo.value.scrollIntoViewOptions ??
      props.scrollIntoViewOptions ??
      defaultScrollIntoViewOptions,
  )

  // ======================== Target ========================
  const stepTarget = computed(() => unref(stepInfo.value.target))
  const [posInfo, targetElement] = useTarget(
    stepTarget,
    mergedOpen,
    computed(() => props.gap),
    mergedScrollIntoViewOptions,
    inlineMode,
    placeholderRef as any,
  )

  const mergedPlacement = computed(() =>
    getPlacement(
      targetElement.value,
      props.placement,
      stepInfo.value.placement,
    ),
  )

  // ======================== Arrow ========================
  const mergedArrow = computed(() => {
    if (!targetElement.value) {
      return false
    }
    if (typeof stepInfo.value.arrow !== 'undefined') {
      return stepInfo.value.arrow
    }
    return typeof props.arrow === 'undefined' ? true : props.arrow
  })

  const arrowPointAtCenter = computed(() =>
    typeof mergedArrow.value === 'object'
      ? mergedArrow.value.pointAtCenter
      : false,
  )

  watch(
    [arrowPointAtCenter, mergedCurrent],
    async () => {
      await nextTick()
      triggerRef.value?.forceAlign?.()
    },
    { immediate: true },
  )

  // ======================== Change ========================
  const onInternalChange = (nextCurrent: number) => {
    setMergedCurrent(nextCurrent)
    emit('change', nextCurrent)
  }

  const handleClose = () => {
    setInternalOpen(false)
    emit('close', mergedCurrent.value)
  }

  const onFinish = () => {
    handleClose()
    emit('finish')
  }

  // ======================== Placements ========================
  const mergedBuiltinPlacements = computed(() => {
    const { builtinPlacements } = props
    if (builtinPlacements) {
      return typeof builtinPlacements === 'function'
        ? builtinPlacements({ arrowPointAtCenter: arrowPointAtCenter.value })
        : builtinPlacements
    }
    return getPlacements(arrowPointAtCenter.value)
  })

  // ======================== Keyboard ========================
  const mergedKeyboard = computed(() => props.keyboard ?? true)

  const handleEscClose = ({
    event,
  }: {
    top: boolean
    event: KeyboardEvent
  }) => {
    if (mergedKeyboard.value && tourClosable.value !== null) {
      event.preventDefault()
      handleClose()
    }
  }

  const isEditableTarget = (e: KeyboardEvent) => {
    const target = e.target as HTMLElement
    if (!target) return false
    const tagName = target.tagName.toLowerCase()
    return (
      tagName === 'input' || tagName === 'textarea' || target.isContentEditable
    )
  }

  const keyboardHandler = (e: KeyboardEvent) => {
    if (isEditableTarget(e)) return

    if (
      mergedKeyboard.value &&
      e.key === 'ArrowLeft' &&
      mergedCurrent.value > 0
    ) {
      e.preventDefault()
      onInternalChange(mergedCurrent.value - 1)
    }

    if (
      mergedKeyboard.value &&
      e.key === 'ArrowRight' &&
      mergedCurrent.value < steps.value.length - 1
    ) {
      e.preventDefault()
      onInternalChange(mergedCurrent.value + 1)
    }
  }

  watch(
    mergedOpen,
    open => {
      if (typeof window === 'undefined') return
      if (open) {
        window.addEventListener('keydown', keyboardHandler)
      } else {
        window.removeEventListener('keydown', keyboardHandler)
      }
    },
    { immediate: true },
  )

  onBeforeUnmount(() => {
    if (typeof window === 'undefined') return
    window.removeEventListener('keydown', keyboardHandler)
  })

  // ======================== Placeholder ========================
  const CENTER_PLACEHOLDER: CSSProperties = {
    left: '50%',
    top: '50%',
    width: '1px',
    height: '1px',
  }

  const placeholderStyle = computed<CSSProperties>(() => {
    const base = posInfo.value
      ? {
          left: `${posInfo.value.left}px`,
          top: `${posInfo.value.top}px`,
          width: `${posInfo.value.width}px`,
          height: `${posInfo.value.height}px`,
        }
      : CENTER_PLACEHOLDER
    return {
      ...base,
      position: inlineMode.value ? 'absolute' : 'fixed',
      pointerEvents: 'none',
      ...(props.style || {}),
    }
  })

  const placeholderClassName = computed(() =>
    clsx(
      props.className,
      attrs.class as string,
      props.rootClassName,
      `${prefixCls.value}-target-placeholder`,
    ),
  )

  // ======================== Expose ========================
  defineExpose({
    nativeElement: computed(() => triggerRef.value?.nativeElement),
    popupElement: computed(() => triggerRef.value?.popupElement),
    forceAlign: () => {
      triggerRef.value?.forceAlign?.()
    },
  })
</script>

<template>
  <template v-if="mergedOpen || hasOpened">
    <Mask
      :get-popup-container="getPopupContainer"
      :styles="mergedMaskComponentStyles"
      :class-names="classNames"
      :z-index="zIndex - 1"
      :prefix-cls="prefixCls"
      :pos="posInfo"
      :show-mask="mergedShowMask"
      :fill="mergedMaskFill"
      :open="mergedOpen"
      :animated="animated"
      :root-class-name="rootClassName"
      :disabled-interaction="disabledInteraction"
      @esc="handleEscClose"
    />

    <Trigger
      :get-popup-container="getPopupContainer"
      :builtin-placements="mergedBuiltinPlacements"
      ref="triggerRef"
      :popup-style="stepStyle"
      :popup-placement="mergedPlacement"
      :popup-visible="mergedOpen"
      :popup-class-name="clsx(rootClassName, stepClassName)"
      :prefix-cls="prefixCls"
      :force-render="false"
      :auto-destroy="true"
      :z-index="zIndex"
      :arrow="!!mergedArrow"
      @popup-align="onPopupAlign"
    >
      <template #default="{ trigger: triggerProps, setRef }">
        <div
          :ref="setRef"
          v-bind="triggerProps"
          :class="placeholderClassName"
          :style="placeholderStyle"
        />
      </template>
      <template #popup>
        <TourStep
          :styles="styles"
          :class-names="classNames"
          :arrow="mergedArrow"
          :prefix-cls="prefixCls"
          :total="stepCount"
          @prev="() => onInternalChange(mergedCurrent - 1)"
          @next="() => onInternalChange(mergedCurrent + 1)"
          @close="handleClose"
          :current="mergedCurrent"
          @finish="onFinish"
          :closable="tourClosable"
          :title="stepInfo.title"
          :description="stepInfo.description"
          :close-icon="stepInfo.closeIcon"
          :class-name="stepClassName"
          :style="stepStyle"
        >
          <template v-if="slots.panel" #panel="data">
            <slot name="panel" v-bind:data="data" />
          </template>
        </TourStep>
      </template>
    </Trigger>
  </template>
</template>
