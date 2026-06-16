<script setup vapor lang="ts">
  import type { CSSProperties } from 'vue'

  import type { DrawerPopupProps } from './interface'

  import { clsx } from '@v-c/util'
  import pickAttrs from '@v-c/util/dist/pickAttrs'
  import { getTransitionProps } from '@v-c/util/dist/utils/transition'
  import { computed, onBeforeUnmount, shallowRef, watch, useAttrs } from 'vue'

  import { useDrawerContext, useDrawerProvide } from './context'
  import DrawerPanel from './DrawerPanel.vue'
  import useDrag from './hooks/useDrag'
  import useFocusable from './hooks/useFocusable'
  import { parseWidthHeight } from './util'

  defineOptions({ name: 'DrawerPopup' })
  const props = withDefaults(defineProps<DrawerPopupProps>(), {
    prefixCls: 'vc-drawer',
    placement: 'right',
    autoFocus: true,
    keyboard: true,
    mask: true,
    maskClosable: true,
  })
  const attrs = useAttrs()

  const panelRef = shallowRef<HTMLDivElement>()
  const openRef = computed(() => props.open)
  const autoFocusRef = computed(() => props.autoFocus)
  const placementRef = computed(() => props.placement)
  const pushRef = computed(() => props.push)
  const maxSizeRef = computed(() => props.maxSize)
  const focusTrapRef = computed(() => props.focusTrap)
  const maskRef = computed(() => props.mask)

  useFocusable(
    () => panelRef.value as any,
    openRef,
    autoFocusRef,
    focusTrapRef,
    maskRef,
  )

  const pushed = shallowRef(false)
  const parentContext = useDrawerContext()

  const pushConfig = computed(() => {
    if (typeof pushRef.value === 'boolean') {
      return pushRef.value ? {} : { distance: 0 }
    } else {
      return pushRef.value || {}
    }
  })

  const pushDistance = computed(
    () =>
      pushConfig.value?.distance ?? parentContext.value?.pushDistance ?? 180,
  )
  const mergedContext = computed(() => {
    return {
      pushDistance: pushDistance.value,
      push: () => {
        pushed.value = true
      },
      pull: () => {
        pushed.value = false
      },
    }
  })
  useDrawerProvide(mergedContext)

  // Tell parent to push
  watch(
    openRef,
    () => {
      if (openRef.value) {
        parentContext?.value?.push?.()
      } else {
        parentContext.value?.pull?.()
      }
    },
    {
      immediate: true,
    },
  )

  onBeforeUnmount(() => {
    parentContext.value?.pull?.()
  })

  const currentSize = shallowRef<number>()

  const isHorizontal = computed(
    () => placementRef.value === 'left' || placementRef.value === 'right',
  )

  const mergedSize = computed(() => {
    const legacySize = isHorizontal.value ? props.width : props.height
    const nextMergedSize =
      props?.size ??
      legacySize ??
      currentSize.value ??
      props?.defaultSize ??
      (isHorizontal.value ? 378 : undefined)
    return parseWidthHeight(nextMergedSize)
  })

  const wrapperStyle = computed<CSSProperties>(() => {
    const nextWrapperStyle: CSSProperties = {}
    if (pushed.value && pushDistance.value) {
      switch (placementRef.value) {
        case 'top':
          nextWrapperStyle.transform = `translateY(${pushDistance.value}px)`
          break
        case 'bottom':
          nextWrapperStyle.transform = `translateY(${-pushDistance.value}px)`
          break
        case 'left':
          nextWrapperStyle.transform = `translateX(${pushDistance.value}px)`
          break
        default:
          nextWrapperStyle.transform = `translateX(${-pushDistance.value}px)`
          break
      }
    }
    if (isHorizontal.value) {
      const parseWidth = parseWidthHeight(mergedSize.value)
      nextWrapperStyle.width =
        typeof parseWidth === 'number' ? `${parseWidth}px` : parseWidth
    } else {
      const parseHeight = parseWidthHeight(mergedSize.value)
      nextWrapperStyle.height =
        typeof parseHeight === 'number' ? `${parseHeight}px` : parseHeight
    }
    return nextWrapperStyle
  })

  const wrapperRef = shallowRef<HTMLDivElement>()
  const isResizeable = computed(() => !!props.resizable)
  const resizeConfig = computed(() =>
    typeof props?.resizable === 'object' ? props?.resizable : {},
  )

  const onInternalResize = (size: number) => {
    currentSize.value = size
    resizeConfig?.value?.onResize?.(size)
  }

  const { dragElementProps, isDragging } = useDrag({
    prefixCls: computed(() => `${props.prefixCls}-resizable`),
    direction: placementRef,
    className: computed(() => props?.classNames?.dragger),
    style: computed(() => props?.styles?.dragger),
    maxSize: maxSizeRef,
    containerRef: wrapperRef,
    currentSize: mergedSize,
    onResize: onInternalResize,
    onResizeStart: () => resizeConfig?.value?.onResizeStart?.(),
    onResizeEnd: () => resizeConfig?.value?.onResizeEnd?.(),
  })

  const maskMotionProps = computed(() =>
    getTransitionProps(props.maskMotion?.name, props.maskMotion),
  )

  const onMaskClose = (e: MouseEvent) => {
    if (props.maskClosable && openRef.value) {
      props.onClose?.(e)
    }
  }

  const motionProps = computed(() =>
    typeof props.motion === 'function'
      ? props.motion(placementRef.value)
      : props.motion,
  )
  const panelMotionProps = computed(() =>
    getTransitionProps(motionProps.value?.name, motionProps.value),
  )

  const containerStyle = computed<CSSProperties>(() => {
    const style: CSSProperties = { ...props.rootStyle }
    if (props.zIndex) {
      style.zIndex = props.zIndex
    }
    return style
  })
</script>

<template>
  <div
    :class="[prefixCls, `${prefixCls}-${placement}`, rootClassName]"
    :style="containerStyle"
    tabindex="-1"
    ref="panelRef"
  >
    <template v-if="mask">
      <Transition key="mask" v-bind="maskMotionProps">
        <div
          v-show="open"
          :class="[`${prefixCls}-mask`, classNames?.mask, maskClassName]"
          :style="[maskStyle, styles?.mask]"
          @click="onMaskClose"
        />
      </Transition>
    </template>

    <Transition
      v-bind="panelMotionProps"
      @afterEnter="() => afterOpenChange?.(true)"
      @afterLeave="() => afterOpenChange?.(false)"
    >
      <div
        v-show="open"
        ref="wrapperRef"
        :class="[
          `${prefixCls}-content-wrapper`,
          isDragging && `${prefixCls}-content-wrapper-dragging`,
          classNames?.wrapper,
        ]"
        :style="[wrapperStyle, styles?.wrapper]"
        v-bind="pickAttrs(attrs, { data: true })"
      >
        <template v-if="isResizeable">
          <div v-bind="dragElementProps" />
        </template>

        <template v-if="drawerRender">
          <component :is="drawerRender" :node="DrawerPanel" />
        </template>
        <template v-else>
          <DrawerPanel
            :id="id"
            :prefixCls="prefixCls"
            :class="[attrs.class, classNames?.section]"
            :style="[attrs.style, styles?.section]"
            @mouseenter="onMouseEnter"
            @mouseover="onMouseOver"
            @mouseleave="onMouseLeave"
            @click="onClick"
            @keydown="onKeyDown"
            @keyup="onKeyUp"
          >
            <slot />
          </DrawerPanel>
        </template>
      </div>
    </Transition>
  </div>
</template>
