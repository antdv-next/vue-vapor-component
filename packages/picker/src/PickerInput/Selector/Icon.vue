<script setup vapor lang="ts">
import type { CSSProperties } from 'vue'

import { clsx } from '@v-c/util'
import { computed, useAttrs } from 'vue'

import { usePickerContext } from '../context'

defineOptions({ name: 'Icon', inheritAttrs: false })

const ctx = usePickerContext()
const attrs = useAttrs()

const prefixCls = computed(() => ctx.value.prefixCls || 'vc-picker')
const classNames = computed(() => ctx.value.classNames)
const styles = computed(() => ctx.value.styles)

const mergedCls = computed(() =>
  clsx(`${prefixCls.value}-suffix`, classNames.value?.suffix, attrs.class as string),
)

const mergedStyle = computed<CSSProperties>(() => {
  const base = styles.value?.suffix || {}
  const attrStyle = attrs.style as Record<string, any> | undefined
  if (attrStyle && typeof attrStyle === 'object' && !Array.isArray(attrStyle)) {
    return { ...base, ...attrStyle }
  }
  return { ...base }
})
</script>

<template>
  <span :class="mergedCls" :style="mergedStyle">
    <slot></slot>
  </span>
</template>
