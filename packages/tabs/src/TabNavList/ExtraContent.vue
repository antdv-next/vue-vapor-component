<script setup vapor lang="ts">
  import type { ExtraContentProps, TabBarExtraMap } from '../interface'

  import { computed, useTemplateRef } from 'vue'

  const props = defineProps<ExtraContentProps>()

  const extraContentRef = useTemplateRef<HTMLDivElement>('extraContentRef')

  const isValidExtra = computed(() => {
    if (props.extra == null) return false
    return true
  })

  const childrenNodes = computed(() => {
    if (!props.extra) return null

    let assertExtra: TabBarExtraMap = {}
    if (typeof props.extra === 'object' && !Array.isArray(props.extra)) {
      assertExtra = props.extra as TabBarExtraMap
    } else {
      assertExtra.right = props.extra
    }

    return props.position === 'right' ? assertExtra.right : assertExtra.left
  })

  defineExpose({
    extraContentRef,
  })
</script>

<template>
  <div
    v-if="isValidExtra"
    ref="extraContentRef"
    :class="`${prefixCls}-extra-content`"
  >
    <template v-if="childrenNodes">{{ childrenNodes }}</template>
    <slot />
  </div>
</template>
