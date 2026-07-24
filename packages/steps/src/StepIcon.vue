<script setup vapor lang="ts">
  import type { CSSProperties } from 'vue'

  import { clsx } from '@v-c/util'
  import { computed } from 'vue'

  import { useStepIconSemanticContext } from './StepIconSemanticKey'
  import { useStepsContext } from './StepsContextKey'

  defineOptions({ name: 'VcStepIcon', inheritAttrs: false })

  const stepsContext = useStepsContext()
  const stepIconSemanticContext = useStepIconSemanticContext()

  const { prefixCls, classNames = {}, styles = {} } = stepsContext.value ?? {}
  const { className: itemClassName, style: itemStyle } =
    stepIconSemanticContext ?? {}

  const itemCls = `${prefixCls}-item`

  const nodeCls = computed(() =>
    clsx(`${itemCls}-icon`, (classNames as any).itemIcon, itemClassName),
  )

  const nodeStyle = computed(() => ({
    ...(styles as any).itemIcon,
    ...itemStyle,
  }))
</script>

<template>
  <div :class="nodeCls" :style="nodeStyle">
    <slot />
  </div>
</template>
