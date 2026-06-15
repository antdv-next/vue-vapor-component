<script setup vapor lang="ts">
  import type { CSSProperties, HTMLAttributes } from 'vue'

  import { classNames } from '@v-c/util'
  import { getTransitionProps } from '@v-c/util/dist/utils/transition'
  import { computed } from 'vue'

  interface MaskProps {
    prefixCls: string
    visible: boolean
    motionName?: string
    style?: CSSProperties
    maskProps?: HTMLAttributes
    className?: string
  }
  defineOptions({ name: 'Mask' })
  const props = defineProps<MaskProps>()
  const transitionProps = computed(() => getTransitionProps(props.motionName))
</script>

<template>
  <Transition v-bind="transitionProps" key="mask">
    <template v-if="visible">
      <div
        :style="style"
        :class="classNames(`${prefixCls}-mask`, className)"
        v-bind="maskProps"
      />
    </template>
  </Transition>
</template>
