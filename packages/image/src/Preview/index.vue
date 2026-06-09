<script setup vapor lang="ts">
  import type { CSSProperties } from 'vue'

  import type { ImgInfo } from '../imageTypes'
  import type { PreviewProps } from './types'

  import { clsx } from '@v-c/util'
  import canUseDom from '@v-c/util/dist/Dom/canUseDom'
  import { useLockFocus } from '@v-c/util/dist/Dom/focus'
  import { KeyCodeStr } from '@v-c/util/dist/KeyCode'
  import { getTransitionProps } from '@v-c/util/dist/utils/transition'
  import Portal from '@vapor-component/portal'
  import {
    computed,
    h,
    nextTick,
    shallowRef,
    Transition,
    useAttrs,
    useSlots,
    watch,
    watchEffect,
  } from 'vue'

  import { usePreviewGroupContext } from '../context'
  import useImageTransform from '../hooks/useImageTransform'
  import useMouseEvent from '../hooks/useMouseEvent'
  import useStatus from '../hooks/useStatus'
  import useTouchEvent from '../hooks/useTouchEvent'
  import { BASE_SCALE_RATIO } from '../previewConfig'
  import Footer from './Footer.vue'
  import PrevNext from './PrevNext.vue'

  defineOptions({ name: 'ImagePreview', inheritAttrs: false })

  const props = withDefaults(defineProps<PreviewProps>(), {
    movable: true,
    scaleStep: 0.5,
    minScale: 1,
    maxScale: 50,
    motionName: 'fade',
    current: 0,
    count: 1,
    icons: () => ({}),
    maskClosable: true,
  })

  const attrs = useAttrs()
  const slots = useSlots()
  const groupContext = usePreviewGroupContext()

  const showLeftOrRightSwitches = computed(
    () => !!groupContext && props.count > 1,
  )
  const showOperationsProgress = computed(
    () => !!groupContext && props.count >= 1,
  )

  // ======================== Transform =========================
  const imgEl = shallowRef<HTMLImageElement>()
  const wrapperRef = shallowRef<HTMLDivElement | null>(null)
  const triggerRef = shallowRef<HTMLElement | null>(null)

  const enableTransition = shallowRef(true)
  watch(enableTransition, async val => {
    if (!val) {
      await nextTick()
      enableTransition.value = true
    }
  })

  const { transform, resetTransform, updateTransform, dispatchZoomChange } =
    useImageTransform(
      imgEl as any,
      computed(() => props.minScale),
      computed(() => props.maxScale),
      info => props.onTransform?.(info),
    )

  const { isMoving, onMouseDown, onWheel } = useMouseEvent(
    imgEl as any,
    computed(() => props.movable),
    computed(() => !!props.open),
    computed(() => props.scaleStep),
    transform as any,
    updateTransform,
    dispatchZoomChange,
  )

  const { isTouching, onTouchStart, onTouchMove, onTouchEnd } = useTouchEvent(
    imgEl as any,
    computed(() => props.movable),
    computed(() => !!props.open),
    computed(() => props.minScale),
    transform as any,
    updateTransform,
    dispatchZoomChange,
  )

  watch(
    () => props.open,
    open => {
      if (!open) {
        resetTransform('close')
      }
    },
  )

  watch(
    () => props.open,
    open => {
      if (open && canUseDom()) {
        triggerRef.value = document.activeElement as HTMLElement | null
      }
    },
  )

  // ========================== Image ===========================
  const onDoubleClick = (event: MouseEvent) => {
    if (!props.open) return

    if (transform.value.scale !== 1) {
      updateTransform({ x: 0, y: 0, scale: 1 }, 'doubleClick')
    } else {
      dispatchZoomChange(
        BASE_SCALE_RATIO + props.scaleStep,
        'doubleClick',
        event.clientX,
        event.clientY,
      )
    }
  }

  // ======================== Operation =========================
  const onZoomIn = () => {
    dispatchZoomChange(BASE_SCALE_RATIO + props.scaleStep, 'zoomIn')
  }
  const onZoomOut = () => {
    dispatchZoomChange(
      BASE_SCALE_RATIO / (BASE_SCALE_RATIO + props.scaleStep),
      'zoomOut',
    )
  }
  const onRotateRight = () => {
    updateTransform({ rotate: transform.value.rotate + 90 }, 'rotateRight')
  }
  const onRotateLeft = () => {
    updateTransform({ rotate: transform.value.rotate - 90 }, 'rotateLeft')
  }
  const onFlipX = () => {
    updateTransform({ flipX: !transform.value.flipX }, 'flipX')
  }
  const onFlipY = () => {
    updateTransform({ flipY: !transform.value.flipY }, 'flipY')
  }
  const onReset = () => {
    resetTransform('reset')
  }
  const onActive = (offset: number) => {
    const nextCurrent = props.current + offset
    if (nextCurrent >= 0 && nextCurrent <= props.count - 1) {
      enableTransition.value = false
      resetTransform(offset < 0 ? 'prev' : 'next')
      props.onChange?.(nextCurrent, props.current)
    }
  }

  // >>>>> Keyboard
  const onKeyDown = (event: KeyboardEvent) => {
    if (!props.open) return
    if (showLeftOrRightSwitches.value) {
      if (event.key === KeyCodeStr.ArrowLeft) onActive(-1)
      else if (event.key === KeyCodeStr.ArrowRight) onActive(1)
    }
  }

  watchEffect(onCleanup => {
    if (!canUseDom()) return
    if (props.open) {
      window.addEventListener('keydown', onKeyDown)
    }
    onCleanup(() => {
      window.removeEventListener('keydown', onKeyDown)
    })
  })

  // ======================= Lock Scroll ========================
  const animatedVisible = shallowRef(props?.open ?? false)
  watch(
    () => props.open,
    open => {
      if (open) animatedVisible.value = true
    },
  )

  // ========================== Portal ==========================
  const portalRender = shallowRef(props?.open ?? false)
  watch(
    () => props.open,
    open => {
      if (open) portalRender.value = true
    },
  )

  const onVisibleChanged = (nextVisible: boolean) => {
    if (!nextVisible) {
      animatedVisible.value = false
      portalRender.value = false
      triggerRef.value?.focus?.()
      triggerRef.value = null
    }
    props.afterOpenChange?.(nextVisible)
  }

  // ========================= Status ===========================
  const setImgRef = (el?: HTMLImageElement) => {
    imgEl.value = el
  }
  const [getImgRef, srcAndOnload] = useStatus({
    src: computed(() => props.src),
    fallback: computed(() => props.fallback),
  })

  const onImgRef = (el: any) => {
    setImgRef(el as HTMLImageElement)
    getImgRef(el as HTMLImageElement)
  }

  // =========================== Focus ============================
  const focusTrap = computed(() => props.focusTrap ?? true)
  useLockFocus(
    computed(() => !!(focusTrap.value && props.open && portalRender.value)),
    () => wrapperRef.value,
  )

  // ========================== Render ==========================
  const mergedAlt = computed(
    () => props.alt ?? (props.imgCommonProps as any)?.alt,
  )

  const bodyStyle = computed<CSSProperties>(() => {
    const s: CSSProperties = { ...(props.styles?.body ?? {}) }
    if (props.mousePosition) {
      s.transformOrigin = `${props.mousePosition.x}px ${props.mousePosition.y}px`
    }
    return s
  })

  const image = computed<ImgInfo>(() => ({
    url: props.src || '',
    alt: mergedAlt.value || '',
    ...(props.imageInfo as any),
  }))

  const imgTransformStyle = computed<CSSProperties>(() => ({
    transform: `translate3d(${transform.value.x}px, ${transform.value.y}px, 0) scale3d(${transform.value.flipX ? '-' : ''}${transform.value.scale}, ${transform.value.flipY ? '-' : ''}${transform.value.scale}, 1) rotate(${transform.value.rotate}deg)`,
    transitionDuration:
      !enableTransition.value || isTouching.value ? '0s' : undefined,
  }))

  const mergedRootStyle = computed<CSSProperties>(() => {
    const s: CSSProperties = {
      ...(props.styles?.root ?? {}),
      ...(attrs.style as CSSProperties),
    }
    if (props.zIndex) s.zIndex = props.zIndex
    return s
  })

  const mergedRootCls = computed(() =>
    clsx(props.prefixCls, props.rootClassName, props.classNames?.root, {
      [`${props.prefixCls}-movable`]: props.movable,
      [`${props.prefixCls}-moving`]: isMoving.value,
    }),
  )

  const transitionProps = computed(() => getTransitionProps(props.motionName))

  const showClose = computed(
    () =>
      (props.closeIcon !== false && props.closeIcon !== null) ||
      !!slots.closeIcon,
  )

  // imageRender support
  const renderedImage = computed(() => {
    if (!props.imageRender) return null
    const imgNode = h('img', {
      ...props.imgCommonProps,
      src: (srcAndOnload.value as any).src,
      ref: onImgRef,
      width: props.width,
      height: props.height,
      class: `${props.prefixCls}-img`,
      alt: mergedAlt.value,
      onLoad: (srcAndOnload.value as any).onLoad,
      style: imgTransformStyle.value,
      onWheel,
      onMousedown: onMouseDown,
      onDblclick: onDoubleClick,
      onTouchstart: onTouchStart,
      onTouchmove: onTouchMove,
      onTouchend: onTouchEnd,
      onTouchcancel: onTouchEnd,
    })
    return {
      imgNode, 
      transform: transform.value,
      image: image.value,
      ...(groupContext ? { current: props.current } : {}),
    }
  })

  const portalOpen = computed(
    () => props.open || animatedVisible.value || portalRender.value,
  )
  const shouldShowContent = computed(() => portalRender.value && props.open)

  const onMaskClick = () => {
    if (props.maskClosable) props.onClose?.()
  }

  const handleCloseBtnClick = () => {
    props.onClose?.()
  }

  const handlePortalEsc = ({ top }: { top: boolean }) => {
    if (top) props.onClose?.()
  }
</script>

<template>
  <Portal
    :open="portalOpen"
    :getContainer="getContainer"
    :autoLock="open || animatedVisible"
    @esc="handlePortalEsc"
  >
    <Transition
      v-bind="transitionProps"
      @after-enter="onVisibleChanged(true)"
      @after-leave="onVisibleChanged(false)"
    >
      <div
        v-if="shouldShowContent"
        ref="wrapperRef"
        :class="mergedRootCls"
        :style="mergedRootStyle"
        role="dialog"
        aria-modal="true"
        :aria-label="mergedAlt"
        :tabindex="-1"
      >
        <!-- Mask -->
        <div
          :class="clsx(`${prefixCls}-mask`, classNames?.mask)"
          :style="styles?.mask"
          @click="onMaskClick"
        />

        <!-- Body -->
        <div
          :class="clsx(`${prefixCls}-body`, classNames?.body)"
          :style="bodyStyle"
        >
          <slot name="imageRender" v-bind="renderedImage">
            <img
              v-bind="imgCommonProps"
              :ref="onImgRef"
              :src="(srcAndOnload as any).src"
              :width="width"
              :height="height"
              :class="`${prefixCls}-img`"
              :alt="mergedAlt"
              :style="imgTransformStyle"
              @load="(srcAndOnload as any).onLoad"
              @wheel="onWheel"
              @mousedown="onMouseDown"
              @dblclick="onDoubleClick"
              @touchstart="onTouchStart"
              @touchmove="onTouchMove"
              @touchend="onTouchEnd"
              @touchcancel="onTouchEnd"
            />
          </slot>
        </div>

        <!-- Switch prev or next -->
        <PrevNext
          v-if="showLeftOrRightSwitches"
          :prefixCls="prefixCls"
          :current="current"
          :count="count"
          :icons="icons"
          :onActive="onActive"
        >
          <template #prevIcon>
            <slot name="prevIcon"></slot>
          </template>
          <template #nextIcon>
            <slot name="nextIcon"></slot>
          </template>
        </PrevNext>

        <!-- Footer -->
        <Footer
          :prefixCls="prefixCls"
          :showProgress="showOperationsProgress"
          :showClose="showClose"
          :current="current"
          :count="count"
          :showSwitch="showLeftOrRightSwitches"
          :classNames="(classNames as any) ?? {}"
          :styles="(styles as any) ?? {}"
          :image="image"
          :transform="transform"
          :icons="icons"
          :countRender="countRender"
          :scale="transform.scale"
          :minScale="minScale"
          :maxScale="maxScale"
          :onActive="onActive"
          :onFlipY="onFlipY"
          :onFlipX="onFlipX"
          :onRotateLeft="onRotateLeft"
          :onRotateRight="onRotateRight"
          :onZoomOut="onZoomOut"
          :onZoomIn="onZoomIn"
          :onClose="handleCloseBtnClick"
          :onReset="onReset"
        >
          <template #actionsRender="actionsProps">
            <slot name="actionsRender" v-bind="actionsProps" />
          </template>
          <template #closeIcon>
            <slot name="closeIcon"></slot>
          </template>
          <template #countRender>
            <slot name="countRender"></slot>
          </template>
        </Footer>
      </div>
    </Transition>
  </Portal>
</template>
