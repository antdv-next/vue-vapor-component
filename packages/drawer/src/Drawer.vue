<script setup vapor lang="ts">
  import type { PortalProps } from '@vapor-component/portal'

  import type { DrawerProps } from './interface'

  import canUseDom from '@v-c/util/dist/Dom/canUseDom'
  import { omit } from '@v-c/util/dist/utils/omit'
  import Portal from '@vapor-component/portal'
  import { computed, nextTick, shallowRef, watch, useAttrs } from 'vue'

  import { useRefProvide } from './context'
  import DrawerPopup from './DrawerPopup.vue'
  import { warnCheck } from './util'

  defineOptions({ name: 'Drawer' })
  const props = withDefaults(defineProps<DrawerProps>(), {
    prefixCls: 'vc-drawer',
    placement: 'right',
    autoFocus: true,
    keyboard: true,
    mask: true,
    maskClosable: true,
    destroyOnHidden: false,
  })
  const emit = defineEmits<{
    close: [e?: MouseEvent | KeyboardEvent]
    'after-open-change': [open: boolean]
    'mouse-enter': [e: MouseEvent]
    'mouse-over': [e: MouseEvent]
    'mouse-leave': [e: MouseEvent]
    click: [e: MouseEvent]
    keydown: [e: KeyboardEvent]
    keyup: [e: KeyboardEvent]
  }>()
  const attrs = useAttrs()

  const mergedOpen = shallowRef<boolean>(!!props.open)
  const mergedProps = computed(() => {
    return {
      ...(attrs as Record<string, any>),
      ...(props as Record<string, any>),
      open: mergedOpen.value,
    } as DrawerProps
  })

  if (process.env.NODE_ENV !== 'production') {
    warnCheck(mergedProps.value)
  }

  const animatedVisible = shallowRef(
    !!(mergedProps.value.forceRender || mergedOpen.value),
  )
  const prefixCls = computed(() => mergedProps.value.prefixCls ?? 'vc-drawer')
  const lastActiveRef = shallowRef<HTMLElement | null>(null)
  const popupRef = shallowRef<any>()

  const externalPanelRef = shallowRef<any>()
  watch(
    () => mergedProps.value.panelRef,
    () => {
      externalPanelRef.value = mergedProps.value.panelRef
    },
    { immediate: true },
  )

  const { panel } = useRefProvide(el => {
    const refTarget = externalPanelRef.value
    if (typeof refTarget === 'function') {
      refTarget(el)
    } else if (
      refTarget &&
      typeof refTarget === 'object' &&
      'value' in refTarget
    ) {
      refTarget.value = el
    }
  })

  watch(
    mergedOpen,
    visible => {
      if (visible) {
        animatedVisible.value = true
        lastActiveRef.value = canUseDom()
          ? (document.activeElement as HTMLElement)
          : null
      }
    },
    { immediate: true },
  )

  const internalAfterOpenChange = (nextVisible: boolean) => {
    nextTick(() => {
      animatedVisible.value = nextVisible
    })
    emit('after-open-change', nextVisible)

    if (
      !nextVisible &&
      mergedProps.value?.focusTriggerAfterClose !== false &&
      lastActiveRef.value
    ) {
      const panelEl = popupRef.value?.panelRef?.value as
        | HTMLDivElement
        | undefined
      if (panelEl && !panelEl.contains(lastActiveRef.value)) {
        try {
          lastActiveRef.value?.focus?.({ preventScroll: true } as any)
        } catch (e) {
          // Do nothing
        }
      }
    }
  }

  const onEsc: PortalProps['onEsc'] = ({ top, event }) => {
    if (top && props.keyboard) {
      event.stopPropagation()
      emit('close', event)
    }
  }

  watch(
    () => props.open,
    () => {
      mergedOpen.value = !!props.open
    },
  )

  defineExpose({
    panel,
    popupRef,
  })
</script>

<template>
  <template v-if="!forceRender && !animatedVisible && !open && destroyOnHidden">
    <!-- Do nothing -->
  </template>
  <template v-else>
    <Portal
      :open="open || forceRender || animatedVisible"
      :autoDestroy="false"
      @esc="onEsc"
      :getContainer="getContainer"
      :autoLock="mask !== false && (open || animatedVisible)"
    >
      <DrawerPopup
        ref="popupRef"
        v-bind="omit(mergedProps, ['onClose', 'afterOpenChange'])"
        @mouseenter="e => emit('mouse-enter', e)"
        @mouseover="e => emit('mouse-over', e)"
        @mouseleave="e => emit('mouse-leave', e)"
        @click="e => emit('click', e)"
        @keydown="e => emit('keydown', e)"
        @keyup="e => emit('keyup', e)"
        @close="e => emit('close', e)"
        @after-open-change="internalAfterOpenChange"
        :mask="mask !== false"
        :maskClosable="maskClosable !== false"
        :placement="placement ?? 'right'"
        :autoFocus="autoFocus !== false"
        :keyboard="keyboard !== false"
        :prefixCls="prefixCls"
        :inline="getContainer === false"
        :open="open"
      >
        <slot />
      </DrawerPopup>
    </Portal>
  </template>
</template>
