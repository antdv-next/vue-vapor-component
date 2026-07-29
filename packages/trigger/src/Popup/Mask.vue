<script setup vapor lang="ts">
  import type { MaskProps } from '../interface'

  import { clsx } from '@v-c/util'
  import { getTransitionProps } from '@v-c/util/dist/utils/transition'
  import { computed, useAttrs } from 'vue'

  defineOptions({ name: 'Mask', inheritAttrs: false })

  const attrs = useAttrs()
  const props = defineProps<MaskProps>()

  const transitionProps = computed(() =>
    getTransitionProps((props.motion as any)?.name, props.motion),
  )
</script>

<template>
  <Transition v-bind="transitionProps">
    <div
      v-if="mask && open"
      :style="{ zIndex: zIndex }"
      :class="clsx(`${prefixCls}-mask`, mobile && `${prefixCls}-mask-mobile`)"
      v-bind="attrs"
    />
  </Transition>
</template>
