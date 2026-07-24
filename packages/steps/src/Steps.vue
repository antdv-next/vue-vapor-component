<script setup vapor lang="ts">
  import type { StepsProps } from './interface'

  import { clsx } from '@v-c/util'
  import { computed, useAttrs } from 'vue'

  import Step from './Step.vue'
  import {
    type StepsContextValue,
    provideStepsContext,
  } from './StepsContextKey'

  defineOptions({ name: 'Steps', inheritAttrs: false })

  const props = withDefaults(defineProps<StepsProps>(), {
    prefixCls: 'vc-steps',
    status: 'process',
    current: 0,
    initial: 0,
  })
  const slots = defineSlots<{
    iconRender?: () => any
    itemRender?: () => any
    itemWrapperRender?: () => any
  }>()

  const attrs = useAttrs()

  // ============================= layout =============================
  const isVertical = computed(() => props.orientation === 'vertical')
  const mergedOrientation = computed(() =>
    isVertical.value ? 'vertical' : 'horizontal',
  )
  const mergeTitlePlacement = computed(() =>
    !isVertical.value && props.titlePlacement === 'vertical'
      ? 'vertical'
      : 'horizontal',
  )

  // ============================== Data ==============================
  const mergedItems = computed(() => (props.items || []).filter(Boolean))

  const statuses = computed(() =>
    mergedItems.value.map((item, index) => {
      const itemStatus = item.status
      const stepNumber = (props.initial ?? 0) + index
      if (!itemStatus) {
        if (stepNumber === props.current) {
          return props.status
        } else if (stepNumber < (props.current ?? 0)) {
          return 'finish'
        }
        return 'wait'
      }
      return itemStatus
    }),
  )

  // ============================= Context ============================
  const stepsContext = computed<StepsContextValue | null>(() => ({
    prefixCls: props.prefixCls,
    ItemComponent: props.components?.item ?? 'div',
    classNames: props.classNames ?? {},
    styles: props.styles ?? {},
  }))
  provideStepsContext(stepsContext)

  // ============================= events =============================
  function onStepClick(next: number) {
    if (props.onChange && props.current !== next) {
      props.onChange(next)
    }
  }

  // ============================= styles =============================
  const classString = computed(() =>
    clsx(
      props.prefixCls,
      `${props.prefixCls}-${mergedOrientation.value}`,
      `${props.prefixCls}-title-${mergeTitlePlacement.value}`,
      props.rootClassName,
      attrs.class,
      (props.classNames ?? {}).root,
    ),
  )

  const mergedStyle = computed(() => ({
    ...(attrs.style as any),
    ...props.style,
    ...props.styles?.root,
  }))
</script>

<template>
  <component
    :is="components?.root ?? 'div'"
    :class="classString"
    :style="mergedStyle"
    v-bind="$attrs"
  >
    <template
      v-for="(item, index) in mergedItems"
      :key="(initial ?? 0) + index"
    >
      <Step
        :prefix-cls="prefixCls"
        :class-names="classNames ?? {}"
        :styles="styles ?? {}"
        :data="{ ...item, status: statuses[index] }"
        :next-status="statuses[index + 1]"
        :active="(initial ?? 0) + index === current"
        :index="(initial ?? 0) + index"
        :last="mergedItems.length - 1 === index"
        :on-click="onChange ? onStepClick : undefined"
      >
        <template v-if="slots.iconRender" #iconRender="slotProps">
          <slot name="iconRender" v-bind="slotProps"></slot>
        </template>
        <template v-if="slots.itemRender" #itemRender="slotProps">
          <slot name="itemRender" v-bind="slotProps"></slot>
        </template>
        <template v-if="slots.itemWrapperRender" #itemWrapperRender="slotProps">
          <slot name="itemWrapperRender" v-bind="slotProps"></slot>
        </template>
      </Step>
    </template>
  </component>
</template>
