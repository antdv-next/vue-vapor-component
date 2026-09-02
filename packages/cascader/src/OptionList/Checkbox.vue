<script setup vapor lang="ts">
  import { clsx } from '@v-c/util'
  import { computed } from 'vue'
  import { useCascaderContext } from '../CascaderContextKey'

  const props = defineProps<{
    prefixCls: string
    checked?: boolean
    halfChecked?: boolean
    disabled?: boolean
    disableCheckbox?: boolean
  }>()

  const context = useCascaderContext()
  const checkable = computed(() => context.value?.checkable)
  const customCheckbox = computed(
    () => typeof checkable.value !== 'boolean' ? checkable.value : null,
  )

  const nodeCls = computed(() =>
    clsx(`${props.prefixCls}`, {
      [`${props.prefixCls}-checked`]: props.checked,
      [`${props.prefixCls}-indeterminate`]: !props.checked && props.halfChecked,
      [`${props.prefixCls}-disabled`]: props.disabled || props.disableCheckbox,
    }),
  )
</script>

<template>
  <span :class="nodeCls">
    <template v-if="customCheckbox">{{ customCheckbox }}</template>
  </span>
</template>
