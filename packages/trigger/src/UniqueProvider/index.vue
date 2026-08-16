<script setup vapor lang="ts">
  import type { UniqueProviderProps, UniqueShowOptions } from '../interface'
  import type { TriggerContextProps } from '../TriggerContextKey'

  import { clsx } from '@v-c/util'
  import { computed, ref, shallowRef, watch } from 'vue'

  import useAlign from '../hooks/useAlign'
  import useDelay from '../hooks/useDelay'
  import Popup from '../Popup/index.vue'
  import {
    TriggerContextProvider,
    UniqueContextProvider,
    useTriggerContext,
  } from '../TriggerContextKey'
  import { getAlignPopupClassName } from '../util'
  import useTargetState from './useTargetState'

  defineOptions({ name: 'UniqueProvider' })

  const props = defineProps<UniqueProviderProps>()

  const [trigger, open, options, onTargetVisibleChanged] = useTargetState()

  const mergedOptions = computed<UniqueShowOptions | undefined>(() => {
    if (!options.value || !props.postTriggerProps) return options.value
    return props.postTriggerProps(options.value)
  })

  // ======================== Popup ========================
  const popupEle = shallowRef<HTMLDivElement | null>(null)
  const popupSize = ref<{ width: number; height: number } | null>(null)
  const externalPopupRef = shallowRef<HTMLDivElement | null>(null)

  const setPopupRef = ((element: HTMLElement | Element | null) => {
    if (element instanceof HTMLDivElement) {
      externalPopupRef.value = element
      if (popupEle.value !== element) popupEle.value = element
    }
  }) as any

  // ======================== Register ========================
  const isOpenRef = shallowRef<(() => boolean) | null>()
  const delayInvoke = useDelay()

  const show = (showOptions: UniqueShowOptions, isOpen: () => boolean) => {
    isOpenRef.value = isOpen
    delayInvoke(() => {
      trigger(showOptions)
    }, showOptions.delay)
  }

  const hide = (delay: number) => {
    delayInvoke(() => {
      if (isOpenRef.value?.()) return
      trigger(false)
    }, delay)
  }

  // ======================== Align ========================
  const [
    ready,
    offsetX,
    offsetY,
    offsetR,
    offsetB,
    arrowX,
    arrowY,
    _scaleX,
    _scaleY,
    alignInfo,
    onAlign,
  ] = useAlign(
    open,
    popupEle as any,
    computed(() => mergedOptions.value?.target as HTMLElement) as any,
    computed(() => mergedOptions.value?.popupPlacement) as any,
    computed(() => mergedOptions.value?.builtinPlacements || {}) as any,
    computed(() => mergedOptions.value?.popupAlign) as any,
    undefined,
    ref(false),
  )

  // ======================== Motion ========================
  const inMotion = shallowRef(false)
  watch(open, () => {
    if (open.value) inMotion.value = true
  })

  const triggerAlign = () => {
    if (!inMotion.value) onAlign()
  }

  const onVisibleChanged = (visible: boolean) => {
    onTargetVisibleChanged(visible)
    inMotion.value = false
    onAlign()
  }

  const alignedClassName = computed(() => {
    if (!mergedOptions.value) return ''
    const baseClassName = getAlignPopupClassName(
      mergedOptions.value?.builtinPlacements || {},
      mergedOptions.value.prefixCls || '',
      alignInfo.value,
      false,
    )
    return clsx(
      baseClassName,
      mergedOptions.value?.getPopupClassNameFromAlign?.(alignInfo.value),
    )
  })

  watch(
    () => mergedOptions.value?.target,
    () => {
      onAlign()
    },
  )

  const onPrepare = (element?: Element) => {
    if (element && !popupEle.value) popupEle.value = element as HTMLDivElement
    onAlign()
    return Promise.resolve()
  }

  // ======================== Trigger Context ========================
  const subPopupElements = ref<Record<string, HTMLElement | null>>({})
  const parentContext = useTriggerContext()
  const triggerContextValue = computed<TriggerContextProps>(() => ({
    registerSubPopup: (id, subPopupEle) => {
      if (subPopupEle) subPopupElements.value[id] = subPopupEle
      else delete subPopupElements.value[id]
      parentContext?.value?.registerSubPopup(id, subPopupEle)
    },
  }))

  const prefixCls = mergedOptions.value?.prefixCls
</script>

<template>
  <UniqueContextProvider :show="show" :hide="hide">
    <slot />
    <template v-if="mergedOptions">
      <TriggerContextProvider
        :register-sub-popup="triggerContextValue.registerSubPopup"
      >
        <Popup
          :ref="setPopupRef"
          :prefix-cls="prefixCls!"
          :popup="mergedOptions.popup"
          :class="
            clsx(
              mergedOptions.popupClassName,
              alignedClassName,
              `${prefixCls}-unique-controlled`,
            )
          "
          :style="mergedOptions.popupStyle"
          :target="mergedOptions.target"
          :open="open"
          :keep-dom="true"
          :fresh="true"
          :auto-destroy="false"
          :ready="ready"
          :offset-x="offsetX"
          :offset-y="offsetY"
          :offset-r="offsetR"
          :offset-b="offsetB"
          :arrow-pos="{ x: arrowX, y: arrowY }"
          :align="alignInfo"
          :z-index="mergedOptions.zIndex"
          :mask="mergedOptions.mask"
          :arrow="mergedOptions.arrow"
          :motion="mergedOptions.popupMotion"
          :mask-motion="mergedOptions.maskMotion"
          :get-container="mergedOptions.getPopupContainer"
          @esc="mergedOptions.onEsc"
          @visible-changed="onVisibleChanged"
          @align="triggerAlign"
          @prepare="onPrepare"
          @resize="
            (size: any) => {
              popupSize = { width: size.offsetWidth, height: size.offsetHeight }
            }
          "
        />
      </TriggerContextProvider>
    </template>
  </UniqueContextProvider>
</template>
