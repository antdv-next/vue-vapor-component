<script setup vapor lang="ts">
  import type { InputHTMLAttributes } from 'vue'

  import pickAttrs from '@v-c/util/dist/pickAttrs'
  import { computed, shallowRef } from 'vue'

  import useBaseProps from '../../hooks/useBaseProps'
  import { useSelectInputContext } from '../SelectInputContextKey'
  import MultipleContent from './MultipleContent.vue'
  import SingleContent from './SingleContent.vue'

  defineOptions({ name: 'SelectContent', inheritAttrs: false })

  const selectInputContext = useSelectInputContext()
  const baseProps = useBaseProps()

  const inputRef = shallowRef<any>()
  defineExpose({
    input: computed(() => inputRef.value?.input?.value),
  })

  const multiple = computed(() => selectInputContext.value?.multiple)
  const onInputKeyDown = computed(
    () => selectInputContext.value?.onInputKeyDown,
  )
  const showSearch = computed(() => baseProps.value?.showSearch)

  const ariaProps = computed(() =>
    pickAttrs(baseProps.value ?? {}, { aria: true }),
  )

  const sharedInputProps = computed<InputHTMLAttributes>(() => ({
    ...ariaProps.value,
    onKeydown: onInputKeyDown.value,
    readonly: !showSearch.value,
    tabindex: baseProps.value?.tabIndex,
  }))
</script>

<template>
  <MultipleContent
    v-if="multiple"
    ref="inputRef"
    :input-props="sharedInputProps"
  />
  <SingleContent v-else ref="inputRef" :input-props="sharedInputProps" />
</template>
