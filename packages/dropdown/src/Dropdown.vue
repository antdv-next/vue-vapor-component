<script setup vapor lang="ts">
  import type { ActionType } from '@vapor-component/trigger'

  import type { DropdownProps } from './interface'

  import { clsx } from '@v-c/util'
  import Trigger from '@vapor-component/trigger'
  import { computed, ref, shallowRef } from 'vue'

  import useAccessibility from './hooks/useAccessibility'
  import Overlay from './Overlay.vue'
  import placements from './placements'

  defineOptions({ name: 'VcDropdown', inheritAttrs: false })

  const props = withDefaults(defineProps<DropdownProps>(), {
    prefixCls: 'vc-dropdown',
    arrow: false,
    placement: 'bottomLeft',
    placements: () => placements,
    trigger: () => ['hover'] as any,
    visible: undefined,
    defaultVisible: undefined,
    autoFocus: undefined,
    minOverlayWidthMatchTrigger: undefined,
    align: {} as any,
  })

  const emit = defineEmits<{
    'visible-change': [visible: boolean]
    'overlay-click': [e: Event]
  }>()

  // Visible state
  const internalVisible = shallowRef(props.defaultVisible ?? false)
  const mergedVisible = computed(() => props.visible ?? internalVisible.value)

  const handleVisibleChange = (visible: boolean) => {
    internalVisible.value = visible
    emit('visible-change', visible)
  }

  // Motion
  const mergedMotionName = computed(() => {
    const { prefixCls, transitionName, animation } = props
    return animation ? `${prefixCls}-${animation}` : transitionName
  })

  // Open class
  const getOpenClassName = computed(() => {
    return props.openClassName ?? `${props.prefixCls}-open`
  })

  // Stretch
  const getMinOverlayWidthMatchTrigger = computed(() => {
    if (props.minOverlayWidthMatchTrigger !== undefined) {
      return props.minOverlayWidthMatchTrigger
    }
    return !props.alignPoint
  })

  // Hide action: if trigger includes contextMenu and no explicit hideAction, default to click
  const triggerHideAction = computed(() => {
    if (props.hideAction) return props.hideAction
    if (Array.isArray(props.trigger) && props.trigger.includes('contextMenu')) {
      return ['click'] as ActionType[]
    }
    return undefined
  })

  // Overlay click: close dropdown + emit
  const onOverlayClick = (e: Event) => {
    handleVisibleChange(false)
    emit('overlay-click', e)
  }

  // Refs
  const triggerRef = ref<any>()
  const overlayRef = shallowRef<any>()
  const childElementRef = computed(() => triggerRef.value?.nativeElement)

  useAccessibility({
    visible: mergedVisible,
    triggerRef: childElementRef as any,
    onVisibleChange: handleVisibleChange,
    autoFocus: computed(() => !!props.autoFocus) as any,
    overlayRef,
  })

  // Popup class
  const popupClassName = computed(() =>
    clsx(props.overlayClassName, {
      [`${props.prefixCls}-show-arrow`]: props.arrow,
    }),
  )
</script>

<template>
  <Trigger
    ref="triggerRef"
    :prefix-cls="prefixCls"
    :action="trigger"
    :show-action="showAction"
    :hide-action="triggerHideAction"
    :popup-placement="placement"
    :builtin-placements="placements"
    :popup-align="align"
    :popup-visible="mergedVisible"
    :popup-class-name="popupClassName"
    :popup-style="overlayStyle"
    :stretch="getMinOverlayWidthMatchTrigger ? 'minWidth' : ''"
    :get-popup-container="getPopupContainer"
    :popup-motion="{ name: mergedMotionName }"
    :mouse-enter-delay="mouseEnterDelay"
    :mouse-leave-delay="mouseLeaveDelay"
    :auto-destroy="autoDestroy"
    @open-change="handleVisibleChange"
    @popup-align="onPopupAlign"
  >
    <template #default="{ open, trigger: triggerProps, setRef }">
      <slot
        v-bind="{
          open,
          trigger: triggerProps,
          setRef,
          openClassName: getOpenClassName,
        }"
      />
    </template>
    <template #popup>
      <Overlay
        :ref="overlayRef"
        :prefix-cls="prefixCls"
        :arrow="arrow"
        @overlay-click="onOverlayClick"
      >
        <slot name="overlay">{{ overlay }}</slot>
      </Overlay>
    </template>
  </Trigger>
</template>
