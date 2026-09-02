<script setup vapor lang="ts">
  import type { BaseSelectRef } from '@vapor-component/select'
  import type { CascaderContextProps } from './interface'
  import useId from '@v-c/util/dist/hooks/useId'
  import useMergedState from '@v-c/util/dist/hooks/useMergedState'
  import { BaseSelect } from '@vapor-component/select'
  import { computed, shallowRef, toRef, useAttrs, watch } from 'vue'

  import type { CascaderProps } from './Cascader'
  import { useCascaderProvider } from './CascaderContextKey'
  import OptionList from './OptionList.vue'
  import useDisplayValues from './hooks/useDisplayValues'
  import useMissingValues from './hooks/useMissingValues'
  import useOptions from './hooks/useOptions'
  import useSearchConfig from './hooks/useSearchConfig'
  import useSearchOptions from './hooks/useSearchOptions'
  import useSelect from './hooks/useSelect'
  import useValues from './hooks/useValues'
  import {
    fillFieldNames,
    formatStrategyValues,
    SHOW_PARENT,
    toPathKeys,
    toRawValues,
  } from './utils'
  import { toPathOptions } from './utils/treeUtil'
  import { warningNullOptions } from './utils/warningPropsUtil'

  defineOptions({ name: 'VcCascader', inheritAttrs: false })

  const props = withDefaults(defineProps<CascaderProps>(), {
    prefixCls: 'vc-cascader',
    expandIcon: '>',
    showCheckedStrategy: SHOW_PARENT,
    popupMatchSelectWidth: false,
  })

  const emit = defineEmits<{
    'update:value': [value: any]
    'update:open': [open: boolean]
    change: [value: any, options: any]
  }>()

  const attrs = useAttrs()
  const baseSelectRef = shallowRef<BaseSelectRef | null>(null)

  defineExpose({
    focus: (options?: FocusOptions) => baseSelectRef.value?.focus(options),
    blur: () => baseSelectRef.value?.blur(),
  })

  const mergedId = useId(props.id)
  const multiple = computed(() => !!props.checkable)

  // ==================== Internal value ====================
  const internalRawValues = shallowRef(props.defaultValue ?? props.value)
  watch(
    () => props.value,
    (newVal) => {
      internalRawValues.value = newVal
    },
    { immediate: true },
  )

  const setRawValues = (values: any) => {
    internalRawValues.value = values
  }

  const rawValues = computed(() =>
    toRawValues(internalRawValues.value as any),
  )

  // ==================== FieldNames ====================
  const mergedFieldNames = computed(() => fillFieldNames(props.fieldNames))

  // ==================== Options ====================
  const [mergedOptions, getPathKeyEntities, getValueByKeyPath] = useOptions(
    mergedFieldNames,
    computed(() => props.options as any),
  )

  // ==================== Search ====================
  const [mergedShowSearch, searchConfig] = useSearchConfig(
    toRef(props, 'showSearch'),
    computed(() => ({
      autoClearSearchValue: props.autoClearSearchValue,
      searchValue: props.searchValue,
      onSearch: props.onSearch,
    })),
  )

  const mergedAutoClearSearchValue = computed(
    () => searchConfig.value.autoClearSearchValue !== false,
  )

  const [internalSearchValue, setSearchValue] = useMergedState('', {
    value: computed(() => searchConfig.value.searchValue) as any,
  })
  const mergedSearchValue = computed(() => internalSearchValue.value || '')

  const onInternalSearch = (
    searchText: string,
    info: { source: 'typing' | 'effect' | 'submit' | 'blur' },
  ) => {
    setSearchValue(searchText)
    if (info.source !== 'blur') {
      searchConfig.value.onSearch?.(searchText)
    }
  }

  const mergedPopupPrefixCls = computed(
    () => props.popupPrefixCls || props.prefixCls || 'vc-cascader',
  )

  const searchOptions = useSearchOptions(
    mergedSearchValue,
    mergedOptions,
    mergedFieldNames,
    mergedPopupPrefixCls,
    searchConfig,
    computed(() => !!props.changeOnSelect || multiple.value),
  )

  // ==================== Values ====================
  const getMissingValues = useMissingValues(mergedOptions, mergedFieldNames)

  const valuesInfo = useValues(
    multiple,
    toRef(props, 'checkStrictly'),
    rawValues,
    getPathKeyEntities,
    getValueByKeyPath,
    getMissingValues,
  )

  const checkedValues = computed(() => valuesInfo.value[0])
  const halfCheckedValues = computed(() => valuesInfo.value[1])
  const missingCheckedValues = computed(() => valuesInfo.value[2])

  const deDuplicatedValues = computed(() => {
    const checkedKeys = toPathKeys(checkedValues.value)
    const deduplicateKeys = props.checkStrictly
      ? checkedKeys
      : formatStrategyValues(
          checkedKeys,
          getPathKeyEntities,
          props.showCheckedStrategy ?? SHOW_PARENT,
        )

    return [
      ...missingCheckedValues.value,
      ...getValueByKeyPath(deduplicateKeys),
    ]
  })

  const displayValues = useDisplayValues(
    deDuplicatedValues,
    mergedOptions,
    mergedFieldNames,
    multiple,
    toRef(props, 'displayRender'),
  )

  const mergedShowCheckedStrategy = computed(
    () => props.showCheckedStrategy ?? SHOW_PARENT,
  )

  // ==================== Change ====================
  const triggerChange = (nextValues: any) => {
    setRawValues(nextValues)

    const nextRawValues = toRawValues(nextValues)

    const valueOptions = nextRawValues.map((valueCells) =>
      toPathOptions(
        valueCells,
        mergedOptions.value,
        mergedFieldNames.value,
      ).map((valueOpt) => valueOpt.option),
    )

    const triggerValues = multiple.value ? nextRawValues : nextRawValues[0]
    const triggerOptions = multiple.value ? valueOptions : valueOptions[0]

    emit('change', triggerValues as any, triggerOptions as any)

    const emitValue = multiple.value ? nextRawValues : nextRawValues[0]
    emit('update:value', emitValue)
  }

  // ==================== Select ====================
  const handleSelection = useSelect(
    multiple,
    toRef(props, 'checkStrictly'),
    triggerChange,
    checkedValues,
    halfCheckedValues,
    missingCheckedValues,
    getPathKeyEntities,
    getValueByKeyPath,
    mergedShowCheckedStrategy,
  )

  const onInternalSelect = (valuePath: any) => {
    if (!multiple.value || mergedAutoClearSearchValue.value) {
      setSearchValue('')
    }
    handleSelection(valuePath)
  }

  // ==================== Display Value change ====================
  const onDisplayValuesChange = (
    _values: any[],
    info: { type: string; values?: any[] },
  ) => {
    if (info.type === 'clear') {
      triggerChange([])
      return
    }

    const val = info.values?.[0] as
      | { valueCells: any }
      | undefined
    if (val?.valueCells) {
      onInternalSelect(val.valueCells)
    }
  }

  // ==================== Popup visible ====================
  const onInternalPopupVisibleChange = (open: boolean) => {
    emit('update:open', open)
  }

  // ==================== Warning ====================
  if ((import.meta as any).env?.DEV) {
    watch(
      [mergedOptions, mergedFieldNames],
      () => warningNullOptions(mergedOptions.value, mergedFieldNames.value),
      { immediate: true },
    )
  }

  // ==================== Context ====================
  const cascaderContext = computed<CascaderContextProps>(() => ({
    options: mergedOptions.value,
    fieldNames: mergedFieldNames.value,
    values: checkedValues.value,
    halfValues: halfCheckedValues.value,
    changeOnSelect: props.changeOnSelect,
    onSelect: onInternalSelect,
    checkable: props.checkable,
    searchOptions: searchOptions.value,
    popupPrefixCls: props.popupPrefixCls,
    loadData: props.loadData,
    expandTrigger: props.expandTrigger,
    expandIcon: props.expandIcon,
    loadingIcon: props.loadingIcon,
    popupMenuColumnStyle: props.popupMenuColumnStyle,
    optionRender: props.optionRender,
    classNames: props.classNames,
    styles: props.styles,
    direction: props.direction,
    disabled: props.disabled,
    notFoundContent: props.notFoundContent,
  }))

  useCascaderProvider(cascaderContext)

  // ==================== Computed ====================
  const emptyOptions = computed(() => {
    const currentOptions = mergedSearchValue.value
      ? searchOptions.value
      : mergedOptions.value
    return !currentOptions.length
  })

  const popupStyle = computed(() =>
    (mergedSearchValue.value && searchConfig.value.matchInputWidth) ||
    emptyOptions.value
      ? {}
      : {
          minWidth: 'auto',
        },
  )

  const mergedPopupStyle = computed(() => ({
    ...popupStyle.value,
    ...(props.popupStyle as any),
  }))

  // ==================== forwardProps ====================
  const omitKeyList: string[] = [
    'id',
    'prefixCls',
    'fieldNames',
    'optionRender',
    'value',
    'defaultValue',
    'changeOnSelect',
    'displayRender',
    'checkable',
    'checkStrictly',
    'showCheckedStrategy',
    'showSearch',
    'searchValue',
    'onSearch',
    'autoClearSearchValue',
    'expandTrigger',
    'options',
    'popupPrefixCls',
    'loadData',
    'popupMenuColumnStyle',
    'popupClassName',
    'popupStyle',
    'open',
    'defaultOpen',
    'placement',
    'builtinPlacements',
    'popupMatchSelectWidth',
    'expandIcon',
    'loadingIcon',
    'classNames',
    'styles',
    'disabled',
  ]

  const forwardProps = computed(() => {
    const result: Record<string, any> = {}
    for (const key of Reflect.ownKeys(props) as string[]) {
      if (!omitKeyList.includes(key)) {
        result[key] = (props as any)[key]
      }
    }
    return { ...result, ...attrs }
  })

  const mergedPopupMatchSelectWidth = computed(
    () => props.popupMatchSelectWidth ?? false,
  )
</script>

<template>
  <BaseSelect
    v-bind="forwardProps"
    ref="baseSelectRef"
    :id="mergedId"
    :prefix-cls="prefixCls"
    :mode="multiple ? 'multiple' : undefined"
    :class-names="classNames"
    :styles="styles"
    :display-values="displayValues"
    @display-values-change="onDisplayValuesChange"
    :show-search="mergedShowSearch"
    :search-value="mergedSearchValue"
    @search="onInternalSearch"
    :popup-match-select-width="mergedPopupMatchSelectWidth"
    :popup-style="mergedPopupStyle"
    :empty-options="emptyOptions"
    @popup-visible-change="onInternalPopupVisibleChange"
  >
    <template #optionList>
      <slot name="optionList" ref="listRef">
        <OptionList ref="listRef" />
      </slot>
    </template>
  </BaseSelect>
</template>
