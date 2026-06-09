<script setup vapor lang="ts">
  import type { PrevNextProps } from './prevNextTypes'

  import { clsx } from '@v-c/util'
  import { computed } from 'vue'

  defineOptions({ name: 'ImagePreviewPrevNext' })

  const props = defineProps<PrevNextProps>()

  const switchCls = computed(() => `${props.prefixCls}-switch`)
  const prevIcon = computed(() => props.icons?.prev ?? props.icons?.left)
  const nextIcon = computed(() => props.icons?.next ?? props.icons?.right)
  const prevDisabled = computed(() => props.current === 0)
  const nextDisabled = computed(() => props.current === props.count - 1)

  const prevBtnCls = computed(() =>
    clsx(switchCls.value, `${switchCls.value}-prev`, {
      [`${switchCls.value}-disabled`]: prevDisabled.value,
    }),
  )
  const nextBtnCls = computed(() =>
    clsx(switchCls.value, `${switchCls.value}-next`, {
      [`${switchCls.value}-disabled`]: nextDisabled.value,
    }),
  )

  function onPrevClick() {
    if (!prevDisabled.value) props.onActive(-1)
  }
  function onNextClick() {
    if (!nextDisabled.value) props.onActive(1)
  }
</script>

<template>
  <button type="button" :class="prevBtnCls" @click="onPrevClick">
    <slot name="prevIcon"></slot>
  </button>
  <button type="button" :class="nextBtnCls" @click="onNextClick">
    <slot name="nextIcon"></slot>
  </button>
</template>
