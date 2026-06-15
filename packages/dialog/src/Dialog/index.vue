<script setup vapor lang="ts">
  import type { CSSProperties } from 'vue'

  import type { IDialogPropTypes } from '../IDialogPropTypes'
  import type { ContentRef } from './Content/interface'

  import { warning } from '@v-c/util'
  import contains from '@v-c/util/dist/Dom/contains'
  import pickAttrs from '@v-c/util/dist/pickAttrs'
  import { computed, nextTick, shallowRef, useId, watch } from 'vue'

  import { getMotionName } from '../util'
  import { panelSlots } from '../util'
  import Content from './Content/index.vue'
  import Mask from './Mask.vue'
  defineOptions({ name: 'Index' })
  const props = withDefaults(defineProps<IDialogPropTypes>(), {
    prefixCls: 'vc-dialog',
    visible: false,
    // keyboard: true,
    focusTriggerAfterClose: true,
    closable: true,
    mask: true,
    maskClosable: true,
    forceRender: false,
  })
  if (process.env.NODE_ENV !== 'production') {
    ;['wrapStyle', 'bodyStyle', 'maskStyle'].forEach(prop => {
      warning(
        !(prop in props && (props as any)[prop]),
        `${prop} is deprecated, please use styles instead.`,
      )
    })
    if ('wrapClassName' in props && props.wrapClassName) {
      warning(
        false,
        `wrapClassName is deprecated, please use classNames instead.`,
      )
    }
  }
  const lastOutSideActiveElementRef = shallowRef<HTMLDivElement | null>(null)
  const wrapperRef = shallowRef<HTMLDivElement>()
  const contentRef = shallowRef<ContentRef>()
  const animatedVisible = shallowRef(props.visible)
  const isFixedPos = shallowRef(false)
  // ========================== Init ==========================
  const ariaId = useId()

  function saveLastOutSideActiveElementRef() {
    if (!contains(wrapperRef.value, (document as any).activeElement)) {
      lastOutSideActiveElementRef.value =
        document.activeElement as HTMLDivElement
    }
  }
  function focusDialogContent() {
    if (!contains(wrapperRef.value, (document as any).activeElement)) {
      contentRef.value?.focus?.()
    }
  }

  // ========================= Events =========================
  function onDialogVisibleChanged(newVisible: boolean) {
    // Try to focus
    if (newVisible) {
      focusDialogContent()
    } else {
      const _animatedVisible = animatedVisible.value
      // Clean up scroll bar & focus back
      animatedVisible.value = false

      if (
        props.mask &&
        lastOutSideActiveElementRef.value &&
        props.focusTriggerAfterClose
      ) {
        try {
          lastOutSideActiveElementRef.value?.focus?.({ preventScroll: true })
        } catch (e) {
          // Do nothing
        }
        lastOutSideActiveElementRef.value = null
      }

      // Trigger afterClose only when change visible from true to false
      if (_animatedVisible) {
        props?.afterClose?.()
      }
    }

    props?.afterOpenChange?.(newVisible)
  }

  function onInternalClose(e: any) {
    props?.onClose?.(e)
  }

  // >>> Content
  const mouseDownOnMaskRef = shallowRef(false)

  // >>> Wrapper
  // Close only when element not on dialog
  let onWrapperClick: any = null
  watch(
    () => props.maskClosable,
    () => {
      if (props.maskClosable) {
        onWrapperClick = (e: any) => {
          if (wrapperRef.value === e.target && mouseDownOnMaskRef.value) {
            onInternalClose(e)
          }
        }
      } else {
        onWrapperClick = null
      }
    },
    {
      immediate: true,
    },
  )

  function onWrapperMouseDown(e: MouseEvent) {
    mouseDownOnMaskRef.value = e.target === wrapperRef.value
  }
  // function onWrapperKeyDown(e: any) {
  //   if (props.keyboard && e === KeyCode.ESC) {
  //     e.stopPropagation()
  //     onInternalClose(e)
  //   }
  // }

  // ========================= Effect =========================
  watch(
    () => props.visible,
    () => {
      if (props.visible) {
        mouseDownOnMaskRef.value = false
        animatedVisible.value = true
        saveLastOutSideActiveElementRef()
        nextTick(() => {
          const wrapEl = wrapperRef.value
          if (wrapEl) {
            const computedStyle = getComputedStyle(wrapEl)
            isFixedPos.value = computedStyle.position === 'fixed'
          }
        })

        if (
          !getMotionName(
            props.prefixCls!,
            props.transitionName,
            props.animation,
          )
        ) {
          nextTick(() => {
            onDialogVisibleChanged(true)
          })
        }
      } else if (
        animatedVisible.value &&
        !getMotionName(props.prefixCls!, props.transitionName, props.animation)
      ) {
        onDialogVisibleChanged(false)
      }
    },
    {
      immediate: true,
    },
  )
  const mergedStyle = computed<CSSProperties>(() => ({
    zIndex: props.zIndex,
    ...props.wrapStyle,
    ...props.styles?.wrapper,
    display: !animatedVisible.value ? 'none' : undefined,
  }))
</script>

<template>
  <div
    :class="[`${prefixCls}-root`, rootClassName]"
    :style="rootStyle"
    v-bind="pickAttrs(props, { data: true })"
  >
    <Mask
      :prefixCls="prefixCls"
      :visible="!!(mask && visible)"
      :motionName="getMotionName(prefixCls!, maskTransitionName, maskAnimation)"
      :style="{ zIndex, ...maskStyle, ...styles?.mask }"
      :maskProps="maskProps"
      :className="classNames?.mask"
    />
    <div
      :class="[`${prefixCls}-wrap`, wrapClassName, classNames?.wrapper]"
      ref="wrapperRef"
      @click="e => onWrapperClick?.(e)"
      @mousedown="e => onWrapperMouseDown?.(e)"
      :style="mergedStyle"
      v-bind="wrapProps"
    >
      <Content
        v-bind="{
          ...props,
          onClose: onInternalClose,
          onVisibleChanged: onDialogVisibleChanged,
        }"
        ref="contentRef"
        :closable="closable"
        :ariaId="ariaId"
        :prefixCls="prefixCls!"
        :visible="!!visible"
        :isFixedPos="isFixedPos"
        :motionName="getMotionName(prefixCls!, transitionName, animation)!"
      >
        <template v-for="slotName in panelSlots" #[slotName]>
          <slot :name="slotName" />
        </template>
      </Content>
    </div>
  </div>
</template>
