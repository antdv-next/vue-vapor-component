<script setup vapor lang="ts">
  import { useBaseProps } from '@vapor-component/select'
  import { computed, ref } from 'vue'
  import RawOptionList from './OptionList/List.vue'

  const listRef = ref<any>(null)
  const baseProps = useBaseProps()

  const mergedOpen = computed(() => baseProps.value?.rawOpen || false)
  const mergedDirection = computed(
    () => baseProps.value?.direction || 'ltr',
  )
  const mergedDisabled = computed(() => !!baseProps.value?.disabled)
  const mergedLockOptions = computed(() => !!baseProps.value?.lockOptions)
  const mergedMultiple = computed(
    () => baseProps.value?.mode === 'multiple' || baseProps.value?.mode === 'tags',
  )

  const mergedPrefixCls = computed(() => baseProps.value?.prefixCls || '')

  defineExpose({
    onKeyDown: (e: KeyboardEvent) => listRef.value?.onKeyDown(e),
    onKeyUp: (e: KeyboardEvent) => listRef.value?.onKeyUp(e),
  })
</script>

<template>
  <RawOptionList
    ref="listRef"
    :prefix-cls="mergedPrefixCls"
    :multiple="mergedMultiple"
    :toggle-open="baseProps?.toggleOpen"
    :open="mergedOpen"
    :direction="mergedDirection"
    :disabled="mergedDisabled"
    :lock-options="mergedLockOptions"
  />
</template>
