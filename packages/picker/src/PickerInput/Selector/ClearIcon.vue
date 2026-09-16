<script setup vapor lang="ts">
  import type { CSSProperties } from 'vue'

  import { clsx } from '@v-c/util'
  import { computed, useAttrs } from 'vue'

  import { usePickerContext } from '../context'

  defineOptions({ name: 'ClearIcon', inheritAttrs: false })

  const props = defineProps<{
    onClear: VoidFunction
  }>()

  const ctx = usePickerContext()
  const attrs = useAttrs()

  const prefixCls = computed(() => ctx.value.prefixCls || 'vc-picker')
  const classNames = computed(() => ctx.value.classNames)
  const styles = computed(() => ctx.value.styles)
  const locale = computed(() => ctx.value.locale)

  const mergedCls = computed(() =>
    clsx(
      `${prefixCls.value}-clear`,
      classNames.value?.suffix,
      attrs.class as string,
    ),
  )

  const mergedStyle = computed<CSSProperties>(() => {
    const base = styles.value?.suffix || {}
    const attrStyle = attrs.style as Record<string, any> | undefined
    if (
      attrStyle &&
      typeof attrStyle === 'object' &&
      !Array.isArray(attrStyle)
    ) {
      return { ...base, ...attrStyle }
    }
    return { ...base }
  })

  const clearBtnCls = computed(() => `${prefixCls.value}-clear-btn`)

  const onClearClick = (event: MouseEvent) => {
    event.stopPropagation()
    props.onClear()
  }

  const onMouseDown = (event: MouseEvent) => {
    event.preventDefault()
  }
</script>

<template>
  <button
    type="button"
    :aria-label="locale?.clear"
    :class="mergedCls"
    :style="mergedStyle"
    @mousedown="onMouseDown"
    @click="onClearClick"
  >
    <slot name="clearIcon" :class="clearBtnCls"></slot>
  </button>
</template>
