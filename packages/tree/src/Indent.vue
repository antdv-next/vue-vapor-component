<script setup vapor lang="ts">
  import type { CSSProperties } from 'vue'

  import { clsx } from '@v-c/util'
  import { computed } from 'vue'

  defineOptions({ name: 'TreeIndent', inheritAttrs: false })

  const props = defineProps<{
    prefixCls: string
    level: number
    isStart?: boolean[]
    isEnd?: boolean[]
  }>()

  const baseClassName = computed(() => `${props.prefixCls}-indent-unit`)

  const indentUnits = computed(() => {
    const result: { cls: string; style: CSSProperties }[] = []
    for (let i = 0; i < props.level; i += 1) {
      result.push({
        cls: clsx(baseClassName.value, {
          [`${baseClassName.value}-start`]: props.isStart?.[i],
          [`${baseClassName.value}-end`]: props.isEnd?.[i],
        }),
        style: {},
      })
    }
    return result
  })

  const containerStyle = computed<CSSProperties>(() => ({}))
</script>

<template>
  <span
    role="presentation"
    :class="`${prefixCls}-indent`"
    :style="containerStyle"
  >
    <span v-for="(unit, i) in indentUnits" :key="i" :class="unit.cls" />
  </span>
</template>
