<script setup vapor lang="ts">
  import type { PortalProps } from '@vapor-component/portal'

  import type { ActionType, ArrowTypeOuter, TriggerProps } from './interface'
  import type {
    TriggerContextProps,
    UniqueShowOptions,
  } from './TriggerContextKey'

  import { clsx } from '@v-c/util'
  import { getShadowRoot } from '@v-c/util/dist/Dom/shadow'
  import { useResizeObserver } from '@vapor-component/resize-observer'
  import {
    computed,
    nextTick,
    reactive,
    ref,
    shallowRef,
    useAttrs,
    useId,
    watch,
    watchEffect,
  } from 'vue'

  import useAction from './hooks/useAction'
  import useAlign from './hooks/useAlign'
  import useDelay from './hooks/useDelay'
  import useWatch from './hooks/useWatch'
  import useWinClick from './hooks/useWinClick'
  import Popup from './Popup/index.vue'
  import Mask from './Popup/Mask.vue'
  import {
    TriggerContextProvider,
    useTriggerContext,
    useUniqueContext,
  } from './TriggerContextKey'
  import { getAlignPopupClassName } from './util'

  defineOptions({ name: 'Trigger', inheritAttrs: false })

  const props = withDefaults(defineProps<TriggerProps>(), {
    prefixCls: 'vc-trigger-popup',
    action: 'hover' as ActionType,
    mouseLeaveDelay: 0.1,
    maskClosable: true,
    builtinPlacements: () => ({}),
    popup: undefined as any,
    popupVisible: undefined as any,
    defaultPopupVisible: undefined as any,
  })

  const attrs = useAttrs()

  const emit = defineEmits<{
    'open-change': [visible: boolean]
    'popup-visible-change': [visible: boolean]
    'popup-align': [element: HTMLElement, align: unknown]
  }>()

  // ======================== State ========================
  const mergedAutoDestroy = computed(() => props.autoDestroy ?? false)
  const openUncontrolled = computed(() => props.popupVisible === undefined)
  const isMobile = computed(() => !!props.mobile)

  // ======================== Context ========================
  const subPopupElements = ref<Record<string, HTMLElement | null>>({})
  const parentContext = useTriggerContext()
  const context = computed<TriggerContextProps>(() => ({
    registerSubPopup(id, subPopupEle) {
      if (subPopupEle) subPopupElements.value[id] = subPopupEle
      else delete subPopupElements.value[id]
      parentContext?.value?.registerSubPopup(id, subPopupEle)
    },
  }))

  const uniqueContext = useUniqueContext()

  // ======================== Refs ========================
  const id = useId()
  const popupEle = shallowRef<HTMLDivElement | null>(null)
  const externalPopupRef = shallowRef<HTMLDivElement | null>(null)
  const targetEle = shallowRef<HTMLElement>()
  const externalForwardRef = shallowRef<HTMLElement | null>(null)

  const setPopupRef = ((element: HTMLElement | Element | null) => {
    if (element instanceof HTMLDivElement) {
      externalPopupRef.value = element
      if (popupEle.value !== element) popupEle.value = element
      parentContext?.value?.registerSubPopup(id, element ?? null)
    }
  }) as any

  const setTargetRef = ((element: HTMLElement | Element | null) => {
    if (
      element &&
      element instanceof HTMLElement &&
      targetEle.value !== element
    ) {
      targetEle.value = element
      externalForwardRef.value = element
    } else if (!element) {
      targetEle.value = undefined
      externalForwardRef.value = null
    }
  }) as any
  // Expose as setup-scoped name so Vapor template ref="setRef" resolves it
  // Exposed as setup-scoped variable so both vapor and vdom template compilers
  // can resolve ref="setRef". Also available via slot as :set-ref="setRef".
  const setRef = setTargetRef as any

  // ======================== Children Props ========================
  const originChildProps = reactive<Record<string, any>>({})
  const baseActionProps = shallowRef<Record<string, any>>({})
  const hoverActionProps = shallowRef<Record<string, any>>({})
  const cloneProps = computed(() => ({
    ...baseActionProps.value,
    ...hoverActionProps.value,
  }))

  // ======================== Utility ========================
  const inPopupOrChild = (ele: EventTarget) => {
    const childDOM = targetEle.value
    return (
      childDOM?.contains(ele as HTMLElement) ||
      (childDOM && getShadowRoot(childDOM)?.host === ele) ||
      ele === childDOM ||
      popupEle.value?.contains(ele as HTMLElement) ||
      (popupEle.value && getShadowRoot(popupEle.value)?.host === ele) ||
      ele === popupEle.value ||
      Object.values(subPopupElements.value).some(
        subPopupEle =>
          subPopupEle?.contains(ele as HTMLElement) || ele === subPopupEle,
      )
    )
  }

  const innerArrow = computed<ArrowTypeOuter | undefined>(() =>
    props.arrow ? (props.arrow !== true ? { ...props.arrow } : {}) : undefined,
  )

  // ======================== Open ========================
  const internalOpen = ref(props.defaultPopupVisible ?? false)
  const mergedOpen = computed(() => props.popupVisible ?? internalOpen.value)

  watch(
    () => props.popupVisible,
    async nextVisible => {
      if (nextVisible !== undefined) {
        await nextTick()
        internalOpen.value = nextVisible
      }
    },
  )

  const getUniqueOptions = (delay: number = 0): UniqueShowOptions => ({
    id,
    popup: props.popup,
    target: targetEle.value as HTMLElement,
    delay,
    prefixCls: props.prefixCls,
    popupClassName: props.popupClassName,
    uniqueContainerClassName: props.uniqueContainerClassName,
    uniqueContainerStyle: props.uniqueContainerStyle,
    popupStyle: props.popupStyle,
    popupPlacement: props.popupPlacement,
    builtinPlacements: props.builtinPlacements,
    popupAlign: props.popupAlign,
    zIndex: props.zIndex,
    mask: props.mask,
    maskClosable: props.maskClosable,
    popupMotion: props.popupMotion,
    maskMotion: props.maskMotion,
    arrow: innerArrow.value,
    getPopupContainer: props.getPopupContainer,
    getPopupClassNameFromAlign: props.getPopupClassNameFromAlign,
    onEsc,
  })

  watch([mergedOpen, targetEle], () => {
    if (
      uniqueContext &&
      props.unique &&
      targetEle.value &&
      !openUncontrolled.value &&
      !parentContext?.value
    ) {
      if (mergedOpen.value)
        uniqueContext.show(
          getUniqueOptions(props.mouseEnterDelay ?? 0) as any,
          () => mergedOpen.value,
        )
      else uniqueContext.hide(props.mouseLeaveDelay || 0)
    }
  })

  const openRef = shallowRef(mergedOpen.value)
  watch(mergedOpen, () => {
    openRef.value = mergedOpen.value
  })

  const internalTriggerOpen = (nextOpen: boolean) => {
    if (mergedOpen.value !== nextOpen) {
      internalOpen.value = nextOpen
      emit('open-change', nextOpen)
      emit('popup-visible-change', nextOpen)
    }
  }

  const delayInvoke = useDelay()
  const triggerOpen = (nextOpen: boolean, delay: number = 0) => {
    if (props.popupVisible !== undefined) {
      delayInvoke(() => internalTriggerOpen(nextOpen), delay)
      return
    }
    if (
      uniqueContext &&
      props.unique &&
      openUncontrolled.value &&
      !parentContext?.value
    ) {
      if (nextOpen)
        uniqueContext.show(
          getUniqueOptions(delay) as any,
          () => mergedOpen.value,
        )
      else uniqueContext.hide(delay)
      return
    }
    delayInvoke(() => internalTriggerOpen(nextOpen), delay)
  }

  function onEsc({ top }: Parameters<NonNullable<PortalProps['onEsc']>>[0]) {
    if (top) triggerOpen(false)
  }

  // ======================== Motion ========================
  const inMotion = ref(false)
  const motionPrepareResolve = shallowRef<VoidFunction>()
  watch(mergedOpen, v => {
    if (v) inMotion.value = true
  })

  // triggerAlign is defined as let below (after useAlign), but the watch callback
  // runs during transition (after setup completes) so triggerAlign will be defined by then.
  let triggerAlign = () => {} // placeholder, reassigned below

  watch(
    [motionPrepareResolve],
    () => {
      if (motionPrepareResolve.value) {
        triggerAlign()
        motionPrepareResolve.value()
        motionPrepareResolve.value = undefined
      }
    },
    {
      flush: 'post',
    },
  )

  // ======================== Align ========================
  const mousePos = ref<[number, number] | null>(null)
  const setMousePosByEvent = (event: any) => {
    mousePos.value = [event.clientX, event.clientY]
  }

  const [
    ready,
    offsetX,
    offsetY,
    offsetR,
    offsetB,
    arrowX,
    arrowY,
    scaleX,
    scaleY,
    alignInfo,
    onAlign,
  ] = useAlign(
    mergedOpen,
    popupEle as any,
    computed(() =>
      props.alignPoint && mousePos.value ? mousePos.value : targetEle.value,
    ) as any,
    computed(() => props.popupPlacement) as any,
    computed(() => props.builtinPlacements) as any,
    computed(() => props.popupAlign) as any,
    (e: HTMLElement, a) => {
      emit('popup-align', e, a)
    },
    isMobile,
  )

  const [showActions, hideActions] = useAction(
    computed(() => props.action!),
    computed(() => props.showAction!),
    computed(() => props.hideAction!),
  )
  const clickToShow = computed(() => showActions.value?.has('click'))
  const clickToHide = computed(
    () =>
      hideActions.value?.has('click') || hideActions.value?.has('contextmenu'),
  )

  triggerAlign = () => {
    if (!inMotion.value) onAlign()
    else onAlign(true)
  }

  const onScroll = () => {
    if (openRef.value && props.alignPoint && clickToHide.value)
      triggerOpen(false)
  }

  useWatch(
    mergedOpen,
    targetEle as any,
    popupEle as any,
    triggerAlign,
    onScroll,
  )

  watch([mousePos, () => props.popupPlacement], async () => {
    await nextTick()
    triggerAlign()
  })

  watch(
    () => JSON.stringify(props.popupAlign),
    async () => {
      await nextTick()
      const { builtinPlacements, popupPlacement } = props
      if (mergedOpen.value && !builtinPlacements?.[popupPlacement!])
        triggerAlign()
    },
  )

  const alignedClassName = computed(() =>
    clsx(
      getAlignPopupClassName(
        props.builtinPlacements!,
        props.prefixCls!,
        alignInfo.value,
        props.alignPoint!,
      ),
      props.getPopupClassNameFromAlign?.(alignInfo.value),
    ),
  )

  defineExpose({
    setRef,
    nativeElement: externalForwardRef,
    popupElement: externalPopupRef,
    forceAlign: triggerAlign,
  })

  // ======================== Stretch ========================
  const targetWidth = shallowRef(0)
  const targetHeight = shallowRef(0)

  const syncTargetSize = () => {
    if (props.stretch && targetEle.value) {
      const rect = targetEle.value.getBoundingClientRect()
      targetWidth.value = rect.width
      targetHeight.value = rect.height
    }
  }
  const onTargetResize = () => {
    syncTargetSize()
    triggerAlign()
  }

  const onVisibleChanged = (visible: boolean) => {
    inMotion.value = false
    triggerAlign()
    props.afterOpenChange?.(visible)
    props.afterPopupVisibleChange?.(visible)
  }

  const onPrepare = (element?: Element) => {
    if (element && !popupEle.value) popupEle.value = element as HTMLDivElement
    syncTargetSize()
    return new Promise<void>(resolve => {
      motionPrepareResolve.value = resolve
      inMotion.value = true
    })
  }

  // ======================== Action Helpers ========================
  const wrapperAction = (
    target: Record<string, any>,
    eventName: string,
    nextOpen: boolean,
    delay?: number,
    callback?: (event: Event) => void,
    ignoreCheck?: () => boolean,
  ) => {
    target[eventName] = (event: any, ...args: any[]) => {
      if (!ignoreCheck || !ignoreCheck()) {
        callback?.(event)
        triggerOpen(nextOpen, delay)
      }
      originChildProps[eventName]?.(event, ...args)
    }
  }

  // ======================== Touch / Click ========================
  const touchToShow = computed(() => showActions.value?.has('touch'))
  const touchToHide = computed(() => hideActions.value?.has('touch'))
  const touchedRef = ref(false)

  watchEffect(() => {
    const nextCloneProps: Record<string, any> = {}
    if (touchToShow.value || touchToHide.value) {
      nextCloneProps.onTouchstart = (...args: any[]) => {
        touchedRef.value = true
        if (openRef.value && touchToHide.value) triggerOpen(false)
        else if (!openRef.value && touchToShow.value) triggerOpen(true)
        originChildProps.onTouchstart?.(...args)
      }
    }
    if (clickToShow.value || clickToHide.value) {
      nextCloneProps.onClick = (event: MouseEvent, ...args: any[]) => {
        if (openRef.value && clickToHide.value) triggerOpen(false)
        else if (!openRef.value && clickToShow.value) {
          setMousePosByEvent(event)
          triggerOpen(true)
        }
        originChildProps?.onClick?.(event, ...args)
        touchedRef.value = false
      }
    }
    baseActionProps.value = nextCloneProps
  })

  const onPopupPointerDown = useWinClick(
    mergedOpen,
    computed(() => clickToHide.value || touchToHide.value),
    targetEle as any,
    popupEle as any,
    computed(() => props.mask) as any,
    computed(() => props.maskClosable) as any,
    inPopupOrChild,
    triggerOpen,
  )

  // ======================== Hover / Focus ========================
  const hoverToShow = computed(() => showActions.value?.has('hover'))
  const hoverToHide = computed(() => hideActions.value?.has('hover'))

  const onPopupMouseEnter = shallowRef<() => void>(() => {})
  const onPopupMouseLeave = shallowRef<() => void>(() => {})
  const ignoreMouseTrigger = () => touchedRef.value

  watchEffect(() => {
    const {
      mouseEnterDelay,
      mouseLeaveDelay,
      alignPoint,
      focusDelay,
      blurDelay,
    } = props
    const nextHoverProps: Record<string, any> = {}

    if (hoverToShow.value) {
      wrapperAction(
        nextHoverProps,
        'onMouseenter',
        true,
        mouseEnterDelay,
        setMousePosByEvent,
        ignoreMouseTrigger,
      )
      wrapperAction(
        nextHoverProps,
        'onPointerenter',
        true,
        mouseEnterDelay,
        setMousePosByEvent,
        ignoreMouseTrigger,
      )
      onPopupMouseEnter.value = (event: any) => {
        if (
          (mergedOpen.value || inMotion.value) &&
          popupEle.value?.contains(event.target as HTMLElement)
        ) {
          triggerOpen(true, mouseEnterDelay)
        }
      }
      if (alignPoint)
        nextHoverProps.onMouseMove = (event: any) =>
          originChildProps.onMousemove?.(event)
    } else onPopupMouseEnter.value = () => {}

    if (hoverToHide.value) {
      wrapperAction(
        nextHoverProps,
        'onMouseleave',
        false,
        mouseLeaveDelay,
        undefined,
        ignoreMouseTrigger,
      )
      wrapperAction(
        nextHoverProps,
        'onPointerleave',
        false,
        mouseLeaveDelay,
        undefined,
        ignoreMouseTrigger,
      )
      onPopupMouseLeave.value = (event: MouseEvent) => {
        if (inMotion.value) return
        if (event.relatedTarget && inPopupOrChild(event.relatedTarget)) return
        triggerOpen(false, mouseLeaveDelay)
      }
    } else onPopupMouseLeave.value = () => {}

    if (showActions.value.has('focus'))
      wrapperAction(nextHoverProps, 'onFocus', true, focusDelay)
    if (hideActions.value.has('focus'))
      wrapperAction(nextHoverProps, 'onBlur', false, blurDelay)
    if (showActions.value.has('contextmenu')) {
      nextHoverProps.onContextmenu = (event: any, ...args: any[]) => {
        if (openRef.value && hideActions.value.has('contextmenu'))
          triggerOpen(false)
        else {
          setMousePosByEvent(event)
          triggerOpen(true)
        }
        event.preventDefault()
        originChildProps.onContextmenu?.(event, ...args)
      }
    }
    hoverActionProps.value = nextHoverProps
  })

  // ======================== Render ========================
  const shouldRender = computed(
    () => props.forceRender || mergedOpen.value || inMotion.value,
  )

  // Once rendered, keep Popup in DOM (never destroy) so transitions work correctly.
  // Without this, closing the popup destroys TriggerContextProvider → re-opens re-mount,
  // causing transition lifecycle corruption.
  const rendered = shallowRef(false)
  watchEffect(() => {
    rendered.value ||= props.forceRender || mergedOpen.value || inMotion.value
  })

  useResizeObserver(mergedOpen, targetEle, onTargetResize)

  // ======================== Trigger Props for Slot ========================
  // Merge trigger action event handlers + attrs event handlers for the child element
  const triggerProps = computed(() => {
    const merged = { ...cloneProps.value } as Record<string, any>

    // Merge attrs event handlers (passed from parent) with trigger action handlers
    const passedEventList = [
      'onContextmenu',
      'onClick',
      'onMousedown',
      'onTouchstart',
      'onMouseenter',
      'onMouseleave',
      'onFocus',
      'onBlur',
    ]
    for (const eventName of passedEventList) {
      if (attrs[eventName]) {
        const attrHandler = attrs[eventName] as (...args: any[]) => void
        merged[eventName] = (...args: any[]) => {
          if (merged[eventName]) merged[eventName](...args)
          attrHandler(...args)
        }
      }
    }

    // Include ref so vdom template resolves it via v-bind;
    // also exposed separately via slot as :set-ref="setRef" for vapor
    merged.ref = setTargetRef as any
    return merged
  })

  // ======================== Mask ========================
  // Merge mask/maskMotion from mobile config
  const mergedMask = computed(() =>
    isMobile.value ? !!props.mobile?.mask : props.mask,
  )
  const mergedMaskMotion = computed(() =>
    isMobile.value ? props.mobile?.maskMotion : props.maskMotion,
  )
</script>

<template>
  <slot :open="mergedOpen" :trigger="triggerProps" :set-ref="setRef" />
  <Mask
    v-if="mergedOpen"
    :prefix-cls="prefixCls"
    :open="mergedOpen"
    :z-index="zIndex"
    :mask="mergedMask"
    :motion="mergedMaskMotion"
    :mobile="isMobile"
    :style="{ zIndex: zIndex + 1 }"
  />
  <TriggerContextProvider
    v-if="rendered && (!uniqueContext || !unique)"
    :register-sub-popup="context.registerSubPopup"
  >
    <Popup
      :ref="setPopupRef"
      :prefix-cls="prefixCls"
      :popup="popup"
      :class="clsx(popupClassName, !isMobile && alignedClassName)"
      :style="popupStyle"
      :target="targetEle"
      :motion="popupMotion"
      :force-render="forceRender"
      :auto-destroy="mergedAutoDestroy"
      :get-container="getPopupContainer"
      :z-index="zIndex"
      :open="mergedOpen"
      :keep-dom="inMotion"
      :fresh="fresh"
      :align="alignInfo"
      :arrow="innerArrow"
      :arrow-pos="{ x: arrowX, y: arrowY }"
      :ready="ready"
      :offset-x="offsetX"
      :offset-y="offsetY"
      :offset-r="offsetR"
      :offset-b="offsetB"
      :stretch="stretch"
      :target-width="targetWidth / scaleX"
      :target-height="targetHeight / scaleY"
      :mobile="mobile"
      @mouse-enter="onPopupMouseEnter"
      @mouse-leave="onPopupMouseLeave"
      @pointer-enter="onPopupMouseEnter"
      @click="onPopupClick"
      @esc="onEsc"
      @pointer-down-capture="onPopupPointerDown"
      @visible-changed="onVisibleChanged"
      @prepare="onPrepare"
      @align="triggerAlign"
    >
      <template #popup>
        <slot name="popup">{{ popup }}</slot>
      </template>
    </Popup>
  </TriggerContextProvider>
</template>
