<script setup vapor lang="ts">
  import type { CSSMotionProps } from '@v-c/util/dist/utils/transition'
  import type { CSSProperties } from 'vue'

  import type { PopupProps } from '../interface'

  import { clsx } from '@v-c/util'
  import { getTransitionProps } from '@v-c/util/dist/utils/transition'
  import Portal from '@vapor-component/portal'
  import { useResizeObserver } from '@vapor-component/resize-observer'
  import { computed, ref, Transition, useAttrs, watchEffect } from 'vue'

  import { useFocusBoundary } from '../hooks/useFocusBoundary'
  import useOffsetStyle from '../hooks/useOffsetStyle'
  import Arrow from './Arrow.vue'

  defineOptions({ name: 'Popup', inheritAttrs: false })

  const attrs = useAttrs()
  const props = withDefaults(defineProps<PopupProps>(), {
    autoDestroy: true,
  })
  const emits = defineEmits()

  const focusBoundary = useFocusBoundary()
  const isMobile = computed(() => !!props.mobile)
  const isNodeVisible = computed(() => props.open || props.keepDom)

  const getPopupContainerNeedParams =
    typeof props.getPopupContainer === 'function' &&
    (props.getPopupContainer as any).length > 0

  const show = ref(!props.getPopupContainer || !getPopupContainerNeedParams)

  // Delay to show since getPopupContainer needs target element
  watchEffect(async () => {
    if (!show.value && getPopupContainerNeedParams && props.target) {
      show.value = true
    }
  })

  const onInternalResize = () => {
    props.onAlign?.()
  }

  const offsetStyle = useOffsetStyle(
    isMobile,
    computed(() => props.ready),
    computed(() => props.open),
    computed(() => props.align) as any,
    computed(() => props.offsetR),
    computed(() => props.offsetB),
    computed(() => props.offsetX),
    computed(() => props.offsetY),
  )

  const popupElementRef = ref<HTMLDivElement>()
  watchEffect(onCleanup => {
    if (
      props.open &&
      popupElementRef.value &&
      focusBoundary?.registerAllowedElement
    ) {
      onCleanup(focusBoundary.registerAllowedElement(popupElementRef.value))
    }
  })

  defineExpose({
    getElement: () => popupElementRef.value,
    nativeElement: popupElementRef,
  })

  useResizeObserver(
    computed(() => props.open),
    popupElementRef as any,
    onInternalResize,
  )

  // ======================== Motion ========================
  const mergedPopupMotion = computed(() =>
    isMobile.value ? props.mobile?.motion : props.motion,
  )
  const popupMotionName = computed(
    () =>
      (mergedPopupMotion.value as any)?.name ??
      (mergedPopupMotion.value as any)?.motionName,
  )
  const baseTransitionProps = popupMotionName.value
    ? getTransitionProps(popupMotionName.value, mergedPopupMotion.value)
    : { appear: true, ...(mergedPopupMotion.value || {}) }

  const mergedTransitionProps = {
    appear: true,
    ...baseTransitionProps,
    onBeforeEnter: (element: Element) => {
      props.onPrepare?.(element)
      ;(baseTransitionProps as any)?.onBeforeEnter?.(element)
    },
    onBeforeAppear: (element: Element) => {
      props.onPrepare?.(element)
      ;(baseTransitionProps as any)?.onBeforeAppear?.(element) ??
        (baseTransitionProps as any)?.onBeforeEnter?.(element)
    },
    onAfterEnter: (element: Element) => {
      ;(baseTransitionProps as any)?.onAfterEnter?.(element)
      setTimeout(() => {
        if (props.open) props.onVisibleChanged?.(true)
      }, 0)
    },
    onAfterAppear: (element: Element) => {
      ;(baseTransitionProps as any)?.onAfterAppear?.(element) ??
        (baseTransitionProps as any)?.onAfterEnter?.(element)
      setTimeout(() => {
        if (props.open) props.onVisibleChanged?.(true)
      }, 0)
    },
    onAfterLeave: (element: Element) => {
      ;(baseTransitionProps as any)?.onAfterLeave?.(element)
      props.onVisibleChanged?.(false)
    },
  }

  const cls = computed(() =>
    clsx(props.prefixCls, (attrs as any).class, props.className, {
      [`${props.prefixCls}-mobile`]: isMobile.value,
    }),
  )

  // Misc style for stretch & pointer events
  const miscStyle = computed<CSSProperties>(() => {
    const { stretch, targetHeight, targetWidth } = props
    const style: CSSProperties = {}
    if (stretch) {
      if (stretch.includes('height') && targetHeight) {
        style.height = `${targetHeight}px`
      } else if (stretch.includes('minHeight') && targetHeight) {
        style.minHeight = `${targetHeight}px`
      }
      if (stretch.includes('width') && targetWidth) {
        style.width = `${targetWidth}px`
      } else if (stretch.includes('minWidth') && targetWidth) {
        style.minWidth = `${targetWidth}px`
      }
    }
    if (!props.open) style.pointerEvents = 'none'
    return style
  })

  // Container: safe getPopupContainer for Portal
  const portalGetContainer = computed(() => {
    if (props.getPopupContainer === false) return false
    if (typeof props.getPopupContainer === 'function') {
      const fn = props.getPopupContainer as (node: HTMLElement) => HTMLElement
      return () => fn(props.target)
    }
    return props.getPopupContainer
  })
</script>

<template>
  <template v-if="show">
    <Portal
      :open="forceRender || isNodeVisible"
      :get-container="portalGetContainer"
      :auto-destroy="autoDestroy"
      :on-esc="onEsc"
    >
      <Transition v-bind="mergedTransitionProps">
        <div
          v-show="open"
          ref="popupElementRef"
          :class="cls"
          :style="[
            {
              '--arrow-x': `${arrowPos.x || 0}px`,
              '--arrow-y': `${arrowPos.y || 0}px`,
            },
            offsetStyle,
            miscStyle,
            { boxSizing: 'border-box', zIndex: zIndex },
            props.style,
          ]"
          @mouseenter="onMouseEnter"
          @mouseleave="onMouseLeave"
          @pointerenter="onPointerEnter"
          @click="onClick"
          @pointerdown="onPointerDownCapture"
        >
          <Arrow
            v-if="arrow && align"
            :prefix-cls="prefixCls"
            :arrow="arrow === true ? {} : arrow"
            :arrow-pos="arrowPos"
            :align="align"
          />

          <slot name="popup" />
        </div>
      </Transition>

      <slot />
    </Portal>
  </template>
</template>
