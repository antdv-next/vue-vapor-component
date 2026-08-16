<script setup vapor lang="ts">
  import type { ActionType } from '@vapor-component/trigger'

  import type { TooltipProps } from './interface'

  import { clsx } from '@v-c/util'
  import useId from '@v-c/util/dist/hooks/useId'
  import omit from '@v-c/util/dist/omit'
  import Trigger from '@vapor-component/trigger'
  import { computed, ref, useAttrs } from 'vue'

  import placements from './placements'
  import Popup from './Popup.vue'

  defineOptions({ name: 'VcTooltip' })
  const props = withDefaults(defineProps<TooltipProps>(), {
    mouseEnterDelay: 0,
    mouseLeaveDelay: 0.1,
    prefixCls: 'vc-tooltip',
    trigger: ['hover'] as any,
    placement: 'right',
    align: {} as any,
    showArrow: true,
    visible: undefined,
    defaultVisible: undefined,
    forceRender: undefined,
    fresh: undefined,
  })
  const attrs = useAttrs()
  const emit = defineEmits<{
    'visible-change': [visible: boolean]
  }>()
  const mergedId = useId(props.id)
  const triggerRef = ref<any>()

  const mergedArrow = computed(() => {
    const showArrow = props.showArrow
    const classNames = props.classNames
    const styles = props.styles || {}
    const arrowContent = props.arrowContent
    if (!showArrow) {
      return false
    }
    const arrowConfig = showArrow === true ? {} : showArrow
    return {
      ...arrowConfig,
      class: clsx(arrowConfig.className, classNames?.arrow),
      style: { ...arrowConfig.style, ...styles?.arrow },
      content: arrowConfig.content ?? arrowContent,
    }
  })

  const mergedArrowValue = computed(() => mergedArrow.value)

  defineExpose({
    nativeElement: computed(() => triggerRef.value?.nativeElement),
    popupElement: computed(() => triggerRef.value?.popupElement),
    forceAlign: () => {
      triggerRef.value?.forceAlign()
    },
  })
  const mergedPlacements = computed(() => props.builtinPlacements ?? placements)
  const extraProps = computed(() => {
    const hasVisible: { popupVisible?: boolean } = {}
    if ('visible' in props) {
      hasVisible.popupVisible = props.visible
    }
    return {
      ...omit(attrs, ['class', 'style']),
      ...hasVisible,
    }
  })
</script>

<template>
  <Trigger
    v-bind="extraProps as any"
    :popup-class-name="classNames?.root"
    :prefix-cls="prefixCls"
    :action="trigger"
    :builtin-placements="mergedPlacements"
    :popup-placement="placement"
    ref="triggerRef"
    :popup-align="align"
    :get-popup-container="getTooltipContainer"
    @open-change="v => emit('visible-change', v)"
    :after-open-change="afterVisibleChange"
    :popup-motion="motion"
    :default-popup-visible="defaultVisible"
    :auto-destroy="destroyOnHidden"
    :mouse-leave-delay="mouseLeaveDelay"
    :popup-style="styles?.root"
    :mouse-enter-delay="mouseEnterDelay"
    :arrow="mergedArrowValue as any"
    :unique-container-class-name="classNames?.uniqueContainer"
    :unique-container-style="styles?.uniqueContainer"
  >
    <template #default="{ open, trigger, setRef }">
      <slot
        v-bind="{
          'aria-describedby': overlay && open ? mergedId : undefined,
          trigger,
          setRef,
        }"
      />
    </template>
    <template #popup>
      <Popup
        key="content"
        :prefix-cls="prefixCls"
        :id="mergedId"
        :class-names="classNames"
        :styles="styles"
      >
        <slot name="overlay">{{ overlay }}</slot>
      </Popup>
    </template>
  </Trigger>
</template>
