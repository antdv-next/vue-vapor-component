<script setup vapor lang="ts">
  import type { InputHTMLAttributes } from 'vue'

  import { clsx } from '@v-c/util'
  import { computed, shallowRef, watch } from 'vue'

  import useBaseProps from '../../hooks/useBaseProps'
  import { useSelectContext } from '../../SelectContextKey'
  import { getTitle } from '../../utils/commonUtil'
  import Input from '../Input.vue'
  import { useSelectInputContext } from '../SelectInputContextKey'
  import Placeholder from './Placeholder.vue'

  defineOptions({ name: 'SingleContent', inheritAttrs: false })

  const props = defineProps<{ inputProps: InputHTMLAttributes }>()
  const selectInputContext = useSelectInputContext()
  const baseProps = useBaseProps()
  const selectContext = useSelectContext()

  const inputChanged = shallowRef(false)
  const inputRef = shallowRef<any>()

  const combobox = computed(() => selectInputContext.value?.mode === 'combobox')
  const displayValue = computed(
    () => selectInputContext.value?.displayValues?.[0],
  )

  const mergedSearchValue = computed(() => {
    if (
      combobox.value &&
      selectInputContext.value?.activeValue &&
      !inputChanged.value &&
      baseProps.value?.open
    ) {
      return selectInputContext.value.activeValue
    }
    return baseProps.value?.showSearch
      ? selectInputContext.value?.searchValue
      : ''
  })

  const optionClassName = computed(() => {
    if (displayValue.value && selectContext.value?.flattenOptions) {
      const option = selectContext.value.flattenOptions.find(
        opt => opt.value === displayValue.value?.value,
      )
      if (option?.data) {
        return option.data.className || option.data.class
      }
    }
    return undefined
  })

  const optionStyle = computed(() => {
    if (displayValue.value && selectContext.value?.flattenOptions) {
      const option = selectContext.value.flattenOptions.find(
        opt => opt.value === displayValue.value?.value,
      )
      if (option?.data) return option.data.style
    }
    return undefined
  })

  const optionTitle = computed(() => {
    let titleValue: string | undefined
    if (displayValue.value && selectContext.value?.flattenOptions) {
      const option = selectContext.value.flattenOptions.find(
        opt => opt.value === displayValue.value?.value,
      )
      if (option?.data) titleValue = getTitle(option.data)
    }
    if (displayValue.value && !titleValue) {
      titleValue = getTitle(displayValue.value)
    }
    if (baseProps.value?.title !== undefined) {
      titleValue = baseProps.value.title
    }
    return titleValue
  })

  const hasOptionStyle = computed(
    () => !!optionClassName.value || !!optionStyle.value,
  )

  watch(
    [combobox, () => selectInputContext.value?.activeValue],
    () => {
      if (combobox.value) inputChanged.value = false
    },
    { immediate: true },
  )

  defineExpose({ input: inputRef })

  const showHasValueCls = computed(() => {
    return (
      displayValue.value &&
      displayValue.value.label !== null &&
      displayValue.value.label !== undefined &&
      String(displayValue.value.label).trim() !== ''
    )
  })

  const shouldRenderValue = computed(
    () => !(combobox.value && selectInputContext.value?.components?.input),
  )

  const onInputChange = () => {
    inputChanged.value = true
  }
</script>

<template>
  <div
    :class="
      clsx(
        `${selectInputContext?.prefixCls}-content`,
        showHasValueCls && `${selectInputContext?.prefixCls}-content-has-value`,
        mergedSearchValue &&
          `${selectInputContext?.prefixCls}-content-has-search-value`,
        hasOptionStyle &&
          `${selectInputContext?.prefixCls}-content-has-option-style`,
        baseProps?.classNames?.content,
      )
    "
    :style="baseProps?.styles?.content"
    :title="hasOptionStyle ? undefined : optionTitle"
  >
    <template v-if="shouldRenderValue">
      <template v-if="displayValue">
        <div
          v-if="hasOptionStyle"
          :class="
            clsx(
              `${selectInputContext?.prefixCls}-content-value`,
              optionClassName,
            )
          "
          :style="{
            ...(mergedSearchValue ? { visibility: 'hidden' as const } : {}),
            ...optionStyle,
          }"
          :title="optionTitle"
        >
          {{ displayValue.label }}
        </div>
        <template v-else>{{ displayValue.label }}</template>
      </template>
      <Placeholder v-else :show="!mergedSearchValue" />
    </template>
    <Input
      ref="inputRef"
      v-bind="inputProps"
      :value="mergedSearchValue"
      :max-length="
        selectInputContext?.mode === 'combobox'
          ? selectInputContext?.maxLength
          : undefined
      "
      @change="onInputChange"
    />
  </div>
</template>
