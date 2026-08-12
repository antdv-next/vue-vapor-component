<script setup vapor lang="ts">
  import type { CSSProperties, Slot } from 'vue'
  import type { SemanticName } from '../interface'
  import type { ClosableConfig, DefaultPanelSlotData } from '../interface'
  import type { VueNode } from '@v-c/util/dist/type'

  import { computed, useSlots } from 'vue'
  import DefaultPanel from './DefaultPanel.vue'

  defineOptions({ name: 'TourStep', inheritAttrs: false })

  const props = withDefaults(defineProps<{
    prefixCls?: string
    current?: number
    total?: number
    title?: VueNode
    description?: VueNode
    placement?: string
    className?: string
    style?: CSSProperties
    mask?: boolean | { style?: CSSProperties; color?: string }
    scrollIntoViewOptions?: boolean | ScrollIntoViewOptions
    closeIcon?: VueNode
    closable?: ClosableConfig | null
    arrow?: boolean | { pointAtCenter: boolean }
    onPrev?: () => void
    onNext?: () => void
    onClose?: () => void
    onFinish?: () => void
    classNames?: Partial<Record<SemanticName, string>>
    styles?: Partial<Record<SemanticName, CSSProperties>>
  }>(), {
    prefixCls: 'vc-tour',
    current: 0,
    total: 1,
    onPrev: () => {},
    onNext: () => {},
    onClose: () => {},
    onFinish: () => {},
    closable: null,
  })

  const slots = useSlots()

  const panelData = computed<DefaultPanelSlotData>(() => ({
    prefixCls: props.prefixCls,
    current: props.current,
    total: props.total,
    title: props.title,
    description: props.description,
    onClose: props.onClose,
    onPrev: props.onPrev,
    onNext: props.onNext,
    onFinish: props.onFinish,
    closable: props.closable,
    classNames: props.classNames || {},
    styles: props.styles || {},
  }))
</script>

<template>
  <slot v-if="slots.panel" name="panel" v-bind:panel-data="panelData" />
  <DefaultPanel
    v-else
    :prefix-cls="prefixCls"
    :current="current"
    :total="total"
    :title="title"
    :description="description"
    :on-close="onClose"
    :on-prev="onPrev"
    :on-next="onNext"
    :on-finish="onFinish"
    :closable="closable"
    :close-icon="closeIcon"
    :class-names="classNames"
    :styles="styles"
  />
</template>
