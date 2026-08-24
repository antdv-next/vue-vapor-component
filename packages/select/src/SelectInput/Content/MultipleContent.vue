<script setup vapor lang="ts">
  import type { VueNode } from '@v-c/util/dist/type'
  import type { InputHTMLAttributes } from 'vue'

  import { clsx } from '@v-c/util'
  import { computed, shallowRef } from 'vue'

  import useBaseProps from '../../hooks/useBaseProps'
  import TransBtn from '../../TransBtn.vue'
  import { getTitle } from '../../utils/commonUtil'
  import { isValidCount } from '../../utils/valueUtil'
  import Input from '../Input.vue'
  import { useSelectInputContext } from '../SelectInputContextKey'
  import Placeholder from './Placeholder.vue'

  defineOptions({ name: 'MultipleContent', inheritAttrs: false })

  const props = defineProps<{ inputProps: InputHTMLAttributes }>()
  const selectInputContext = useSelectInputContext()
  const baseProps = useBaseProps()

  const inputRef = shallowRef<any>()
  defineExpose({ input: inputRef })

  const prefixCls = computed(() => selectInputContext.value?.prefixCls ?? '')
  const displayValues = computed(
    () => selectInputContext.value?.displayValues ?? [],
  )
  const searchValue = computed(
    () => selectInputContext.value?.searchValue ?? '',
  )
  const mode = computed(() => selectInputContext.value?.mode)
  const onSelectorRemove = computed(
    () => selectInputContext.value?.onSelectorRemove,
  )

  const disabled = computed(() => baseProps.value?.disabled ?? false)
  const showSearch = computed(() => baseProps.value?.showSearch ?? false)
  const triggerOpen = computed(() => baseProps.value?.open ?? false)
  const toggleOpen = computed(() => baseProps.value?.toggleOpen)
  const autoClearSearchValue = computed(
    () => baseProps.value?.autoClearSearchValue,
  )
  const maxTagCount = computed(() => baseProps.value?.maxTagCount)
  const maxTagTextLength = computed(() => baseProps.value?.maxTagTextLength)
  const maxTagPlaceholder = computed(() => baseProps.value?.maxTagPlaceholder)
  const maxCount = computed(() => baseProps.value?.maxCount)
  const classNamesConfig = computed(() => baseProps.value?.classNames)
  const stylesConfig = computed(() => baseProps.value?.styles)
  const removeIcon = computed(() => baseProps.value?.removeIcon ?? '×')

  const selectionItemPrefixCls = computed(
    () => `${prefixCls.value}-selection-item`,
  )

  const computedSearchValue = computed(() => {
    if (
      !triggerOpen.value &&
      mode.value === 'multiple' &&
      autoClearSearchValue.value !== false
    ) {
      return ''
    }
    return searchValue.value
  })

  const reachedMaxCount = computed(
    () =>
      mode.value !== 'combobox' &&
      isValidCount(maxCount.value) &&
      displayValues.value.length >= maxCount.value!,
  )
  const inputValue = computed(() =>
    showSearch.value ? computedSearchValue.value || '' : '',
  )
  const inputEditable = computed(
    () => showSearch.value && !disabled.value && !reachedMaxCount.value,
  )

  // Tag count logic
  const isMaxTagResponsive = computed(() => maxTagCount.value === 'responsive')
  const visibleCount = computed(() => {
    if (isMaxTagResponsive.value) return displayValues.value.length
    if (typeof maxTagCount.value === 'number')
      return Math.min(displayValues.value.length, maxTagCount.value)
    return displayValues.value.length
  })
  const visibleValues = computed(() =>
    displayValues.value.slice(0, visibleCount.value),
  )
  const omittedCount = computed(
    () => displayValues.value.length - visibleCount.value,
  )
  const showRest = computed(() => {
    if (isMaxTagResponsive.value) return false
    return typeof maxTagCount.value === 'number' && omittedCount.value > 0
  })

  const restContent = computed<VueNode>(() => {
    if (typeof maxTagPlaceholder.value === 'function') {
      return maxTagPlaceholder.value(
        displayValues.value.slice(visibleCount.value),
      )
    }
    return maxTagPlaceholder.value ?? `+ ${omittedCount.value} ...`
  })

  const onToggleOpen = (e: MouseEvent) => {
    e.stopPropagation()
    toggleOpen.value?.(!triggerOpen.value)
  }

  const onRemove = (valueItem: { value?: any }) => {
    onSelectorRemove.value?.(valueItem as any)
  }

  function getDisplayLabel(label: any): any {
    if (
      typeof maxTagTextLength.value === 'number' &&
      (typeof label === 'string' || typeof label === 'number')
    ) {
      const strLabel = String(label)
      if (strLabel.length > maxTagTextLength.value) {
        return `${strLabel.slice(0, maxTagTextLength.value)}...`
      }
    }
    return label
  }

  function onRemoveMouseDown(e: MouseEvent, valueItem: { value?: any }) {
    e.preventDefault()
    e.stopPropagation()
    onRemove(valueItem)
  }
</script>

<template>
  <div
    :class="clsx(`${prefixCls}-content`, classNamesConfig?.content)"
    :style="stylesConfig?.content"
  >
    <Placeholder v-if="!visibleValues.length && !inputValue" />

    <template
      v-for="valueItem in visibleValues"
      :key="valueItem.key ?? valueItem.value ?? String(valueItem.label)"
    >
      <span
        :title="getTitle(valueItem)"
        :class="
          clsx(
            selectionItemPrefixCls,
            { [`${selectionItemPrefixCls}-disabled`]: valueItem.disabled },
            classNamesConfig?.item,
          )
        "
        :style="stylesConfig?.item"
        @mousedown="onToggleOpen"
      >
        <span
          :class="
            clsx(
              `${selectionItemPrefixCls}-content`,
              classNamesConfig?.itemContent,
            )
          "
          :style="stylesConfig?.itemContent"
        >
          {{ getDisplayLabel(valueItem.label) }}
        </span>
        <TransBtn
          v-if="!disabled && !valueItem.disabled"
          :class="
            clsx(
              `${selectionItemPrefixCls}-remove`,
              classNamesConfig?.itemRemove,
            )
          "
          :style="stylesConfig?.itemRemove"
          @mousedown="(e: MouseEvent) => onRemoveMouseDown(e, valueItem)"
        >
          <!-- {{ removeIcon }} -->
          <component :is="removeIcon" />
        </TransBtn>
      </span>
    </template>

    <span v-if="showRest" :class="`${selectionItemPrefixCls}-omitted`">
      {{ restContent }}
    </span>

    <Input
      ref="inputRef"
      :disabled="disabled"
      :read-only="!inputEditable"
      v-bind="props.inputProps"
      :value="inputValue || ''"
      :sync-width="true"
    />
  </div>
</template>
