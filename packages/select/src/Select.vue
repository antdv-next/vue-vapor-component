<script setup vapor lang="ts">
  import type { VueNode } from '@v-c/util/dist/type'

  import type { BaseSelectRef } from './BaseSelect/interface'
  import type {
    DefaultOptionType,
    LabelInValueType,
    DraftValueType,
    SelectProps,
  } from './Select'

  import useId from '@v-c/util/dist/hooks/useId'
  import omit from '@v-c/util/dist/omit'
  import { computed, shallowRef, toRef, useAttrs } from 'vue'

  import BaseSelect from './BaseSelect.vue'
  import {
    useCache,
    useFilterOptions,
    useOptions,
    useRefFunc,
    useSearchConfig,
  } from './hooks'
  import OptionList from './OptionList.vue'
  import { useSelectProvider } from './SelectContextKey'
  import {
    isComboNoValue,
    toArray,
    injectPropsWithOption,
  } from './utils/commonUtil'
  import { fillFieldNames, flattenOptions } from './utils/valueUtil'

  defineOptions({ name: 'VcSelect', inheritAttrs: false })

  const props = withDefaults(defineProps<SelectProps>(), {
    prefixCls: 'vc-select',
    popupMatchSelectWidth: true,
    listHeight: 200,
    listItemHeight: 20,
    filterOption: true,
  })

  const emit = defineEmits<{
    'update:value': [value: any]
    change: [value: any, option: any]
    select: [value: any, option: any]
    deselect: [value: any, option: any]
    focus: [event: FocusEvent]
    blur: [event: FocusEvent]
  }>()

  // Keys handled internally by Select — excluded from the props forwarded to BaseSelect.
  // Everything else (allowClear, disabled, loading, suffixIcon, prefix, suffix,
  // clearIcon, removeIcon, open, tokenSeparators, popupStyle, placement, etc.)
  // must reach BaseSelect, so we spread them via v-bind="forwardProps".
  const omitKeyList: string[] = [
    'id',
    'mode',
    'prefixCls',
    'backfill',
    'fieldNames',
    'showSearch',
    'searchValue',
    'onSearch',
    'autoClearSearchValue',
    'filterOption',
    'optionFilterProp',
    'filterSort',
    'onSelect',
    'onDeselect',
    'onActive',
    'popupMatchSelectWidth',
    'optionLabelProp',
    'options',
    'optionRender',
    'children',
    'defaultActiveFirstOption',
    'menuItemSelectedIcon',
    'virtual',
    'direction',
    'listHeight',
    'listItemHeight',
    'labelRender',
    'value',
    'defaultValue',
    'labelInValue',
    'onChange',
    'maxCount',
    'classNames',
    'styles',
  ]

  const attrs = useAttrs()

  const baseSelectRef = shallowRef<BaseSelectRef | null>(null)

  defineExpose({
    focus: () => baseSelectRef.value?.focus(),
    blur: () => baseSelectRef.value?.blur(),
    scrollTo: (arg: any) => baseSelectRef.value?.scrollTo?.(arg),
  })

  const mergedId = useId(props.id)
  const multiple = shallowRef(
    props.mode === 'multiple' || props.mode === 'tags',
  )

  const [mergedShowSearch, searchConfig] = useSearchConfig(
    toRef(props, 'showSearch'),
    {
      filterOption: toRef(props, 'filterOption'),
      searchValue: toRef(props, 'searchValue'),
      optionFilterProp: toRef(props, 'optionFilterProp'),
      filterSort: toRef(props, 'filterSort'),
      onSearch: toRef(props, 'onSearch'),
      autoClearSearchValue: toRef(props, 'autoClearSearchValue'),
    },
    toRef(props, 'mode'),
  )

  const normalizedOptionFilterProps = computed(
    () => searchConfig.value?.optionFilterProp,
  )
  const mergedFilterOption = computed(() =>
    props.mode === 'combobox' && searchConfig.value.filterOption === undefined
      ? false
      : searchConfig.value.filterOption,
  )

  const mergedFieldNames = fillFieldNames(props.fieldNames, false)

  const internalSearchValue = shallowRef(props.searchValue || '')
  const setSearchValue = (val: string) => {
    internalSearchValue.value = val
  }
  const mergedSearchValue = computed(() => internalSearchValue.value || '')

  const childrenOptionsRef = shallowRef<any[]>([])
  const parsedOptions = useOptions(
    toRef(props, 'options'),
    childrenOptionsRef,
    { value: mergedFieldNames } as any,
    normalizedOptionFilterProps,
    toRef(props, 'optionLabelProp'),
  )
  const valueOptions = computed(() => parsedOptions.value.valueOptions)
  const labelOptions = computed(() => parsedOptions.value.labelOptions)
  const mergedOptions = computed(() => parsedOptions.value.options)

  const convert2LabelValues = (
    draftValues: DraftValueType,
  ): LabelInValueType[] => {
    const valueList = toArray(draftValues)
    return valueList.map(val => {
      let rawValue: any
      let rawLabel: VueNode
      let rawDisabled: boolean | undefined
      let rawTitle: string | undefined

      if (!val || typeof val !== 'object') {
        rawValue = val
      } else {
        rawLabel = (val as LabelInValueType).label
        rawValue = (val as LabelInValueType).value
      }

      const option = valueOptions.value.get(rawValue)
      if (option) {
        if (rawLabel === undefined) {
          rawLabel = option?.[props.optionLabelProp || mergedFieldNames.label]
        }
        rawDisabled = option?.disabled
        rawTitle = option?.title
      }

      return {
        label: rawLabel,
        value: rawValue,
        key: rawValue,
        disabled: rawDisabled,
        title: rawTitle,
      }
    })
  }

  const internalValue = shallowRef(props.value ?? props.defaultValue)
  const setInternalValue = (val: any) => {
    internalValue.value = val
  }

  const rawLabeledValues = computed(() => {
    const newVal =
      multiple.value && internalValue.value === null ? [] : internalValue.value
    const values = convert2LabelValues(newVal)
    if (props.mode === 'combobox' && isComboNoValue(values[0]?.value)) return []
    return values
  })

  const [mergedValues, getMixedOption] = useCache(
    rawLabeledValues,
    valueOptions,
  )

  const displayValues = computed(() => {
    if (!props.mode && mergedValues.value.length === 1) {
      const first = mergedValues.value[0]
      if (
        (first.value === null || first.value === '') &&
        (first.label === null || first.label === undefined)
      )
        return []
    }
    return mergedValues.value.map(item => ({
      ...item,
      label:
        (typeof props.labelRender === 'function'
          ? props.labelRender(item)
          : item.label) ?? item.value,
    }))
  })

  const rawValues = computed(() => {
    return new Set(mergedValues.value.map((val: any) => val.value))
  })

  const createTagOption = useRefFunc((val: any, label?: VueNode) => ({
    [mergedFieldNames.value]: val,
    [mergedFieldNames.label]: label ?? val,
  }))

  const filledTagOptions = computed(() => {
    if (props.mode !== 'tags') return mergedOptions.value
    const cloneOptions = [...mergedOptions.value]
    const existOptions = (v: any) => valueOptions.value.has(v)
    ;[...mergedValues.value]
      .sort((a: any, b: any) => (a.value < b.value ? -1 : 1))
      .forEach((item: any) => {
        if (!existOptions(item.value))
          cloneOptions.push(createTagOption(item.value, item.label))
      })
    return cloneOptions
  })

  const filteredOptions = useFilterOptions(
    filledTagOptions,
    { value: mergedFieldNames } as any,
    mergedSearchValue,
    mergedFilterOption,
    normalizedOptionFilterProps,
  )

  const filledSearchOptions = computed(() => {
    if (props.mode !== 'tags' || !mergedSearchValue.value)
      return filteredOptions.value
    const some = filteredOptions.value.some(
      (item: any) =>
        item[props.optionFilterProp || 'value'] === mergedSearchValue.value,
    )
    if (some) return filteredOptions.value
    const someVal = filteredOptions.value.some(
      (item: any) => item[mergedFieldNames.value] === mergedSearchValue.value,
    )
    if (someVal) return filteredOptions.value
    if (valueOptions.value.get(mergedSearchValue.value)?.disabled)
      return filteredOptions.value
    return [createTagOption(mergedSearchValue.value), ...filteredOptions.value]
  })

  const sorter = (inputOptions: DefaultOptionType[]): DefaultOptionType[] => {
    const sorted = [...inputOptions].sort((a, b) =>
      searchConfig.value.filterSort!(a, b, {
        searchValue: mergedSearchValue.value,
      }),
    )
    return sorted.map(item => {
      if (Array.isArray(item.options)) {
        return {
          ...item,
          options:
            item.options.length > 0 ? sorter(item.options) : item.options,
        }
      }
      return item
    })
  }

  const orderedFilteredOptions = computed(() => {
    if (!searchConfig.value.filterSort) return filledSearchOptions.value
    return sorter(filledSearchOptions.value)
  })

  const displayOptions = computed(() => {
    return flattenOptions(orderedFilteredOptions.value, {
      fieldNames: mergedFieldNames,
      childrenAsData: false,
    })
  })

  const triggerChange = (values: DraftValueType) => {
    const labeledValues = convert2LabelValues(values)
    const prevValues = mergedValues.value
    setInternalValue(labeledValues)
    if (
      labeledValues.length !== prevValues.length ||
      labeledValues.some(
        (newVal, i) => (prevValues[i] as any)?.value !== newVal?.value,
      )
    ) {
      const returnValues = props.labelInValue
        ? labeledValues.map(({ label: l, value: v }) => ({
            label: l,
            value: v,
          }))
        : labeledValues.map(v => v.value)
      const returnOptions = labeledValues.map(v =>
        injectPropsWithOption(getMixedOption(v.value)),
      )
      const returnValue = multiple.value ? returnValues : returnValues[0]
      const returnOption = multiple.value ? returnOptions : returnOptions[0]
      props.onChange?.(returnValue, returnOption)
      emit('update:value', returnValue)
    }
  }

  const activeValue = shallowRef<string | null>(null)
  const accessibilityIndex = shallowRef(0)

  const onActiveValue = (
    active: any,
    index: number,
    { source = 'keyboard' } = {},
  ) => {
    accessibilityIndex.value = index
    if (
      props.backfill &&
      props.mode === 'combobox' &&
      active !== null &&
      source === 'keyboard'
    ) {
      activeValue.value = String(active)
    }
  }

  const triggerSelect = (val: any, selected: boolean, type?: string) => {
    const option = getMixedOption(val)
    const wrappedValue = props.labelInValue
      ? { label: option?.[mergedFieldNames.label], value: val }
      : val
    const opt = injectPropsWithOption(option)
    if (selected) props.onSelect?.(wrappedValue, opt)
    else if (!selected && type !== 'clear')
      props.onDeselect?.(wrappedValue, opt)
  }

  const onInternalSelect = useRefFunc(
    (val: any, info: { selected: boolean }) => {
      const mergedSelect = multiple.value ? info.selected : true
      const cloneValues = mergedSelect
        ? multiple.value
          ? [...mergedValues.value, val]
          : [val]
        : mergedValues.value.filter((v: any) => v.value !== val)
      triggerChange(cloneValues)
      triggerSelect(val, mergedSelect)
      if (props.mode === 'combobox') {
        activeValue.value = ''
      } else if (!multiple.value || searchConfig.value.autoClearSearchValue) {
        setSearchValue('')
        activeValue.value = ''
      }
    },
  )

  const onDisplayValuesChange = (
    nextValues: any[],
    info: { type: string; values: any[] },
  ) => {
    triggerChange(nextValues)
    if (info.type === 'remove' || info.type === 'clear') {
      info.values.forEach((item: any) =>
        triggerSelect(item.value, false, info.type),
      )
    }
  }

  const onInternalSearch = (
    searchText: string,
    info: { source: 'typing' | 'effect' | 'submit' | 'blur' },
  ) => {
    setSearchValue(searchText)
    activeValue.value = null
    if (info.source === 'submit') {
      const formatted = (searchText || '').trim()
      if (formatted) {
        if (valueOptions.value.get(formatted)?.disabled) {
          setSearchValue('')
          return
        }
        const newRawValues = Array.from(
          new Set([...rawValues.value, formatted]),
        )
        triggerChange(newRawValues)
        triggerSelect(formatted, true)
        setSearchValue('')
      }
      return
    }
    if (info.source !== 'blur') {
      if (props.mode === 'combobox') triggerChange(searchText)
      props.onSearch?.(searchText)
    }
  }

  const onInternalSearchSplit = (words: string[]) => {
    let patchValues: any[] = words
    if (props.mode !== 'tags') {
      patchValues = words
        .map(word => labelOptions.value.get(word)?.[mergedFieldNames.value])
        .filter((v: any) => v !== undefined)
    }
    if (props.mode === 'tags') {
      patchValues = patchValues.filter(
        val => !valueOptions.value.get(val)?.disabled,
      )
    }
    const newRawValues = Array.from(
      new Set([...rawValues.value, ...patchValues]),
    )
    triggerChange(newRawValues)
    newRawValues.forEach(v => triggerSelect(v, true))
  }

  const selectContext = computed(() => ({
    options: mergedOptions.value,
    valueOptions: valueOptions.value,
    labelOptions: labelOptions.value,
    flattenOptions: displayOptions.value,
    onActiveValue,
    defaultActiveFirstOption:
      props.defaultActiveFirstOption !== undefined
        ? props.defaultActiveFirstOption
        : props.mode !== 'combobox',
    onSelect: onInternalSelect,
    menuItemSelectedIcon: props.menuItemSelectedIcon,
    rawValues: rawValues.value,
    fieldNames: mergedFieldNames,
    virtual: props.virtual !== false && props.popupMatchSelectWidth !== false,
    direction: props.direction,
    listHeight: props.listHeight,
    listItemHeight: props.listItemHeight,
    childrenAsData: false,
    maxCount: props.maxCount,
    optionRender: props.optionRender,
    classNames: props.classNames,
    styles: props.styles,
  }))

  useSelectProvider(selectContext)

  // Props to forward to BaseSelect: everything except internally-handled keys.
  // NOTE: 不能用 `{ ...props }` spread —— vapor props proxy 的
  // getOwnPropertyDescriptor 对 emit-listened 的 onXxx 返回 undefined,
  // 导致 spread 丢掉 onFocus/onBlur 等事件 handler。必须用 Reflect.ownKeys
  // + props[key] (get 陷阱) 显式读取。
  const forwardProps = computed(() => {
    const result: Record<string, any> = {}
    for (const key of Reflect.ownKeys(props) as string[]) {
      if (!omitKeyList.includes(key)) {
        result[key] = (props as any)[key]
      }
    }
    return { ...result, ...attrs }
  })
</script>

<template>
  <BaseSelect
    v-bind="forwardProps"
    ref="baseSelectRef"
    :id="mergedId"
    :prefix-cls="prefixCls"
    :mode="mode"
    :class-names="classNames"
    :styles="styles"
    :display-values="displayValues"
    @display-values-change="onDisplayValuesChange"
    :max-count="maxCount"
    :placeholder="placeholder"
    :direction="direction"
    :show-search="mergedShowSearch"
    :search-value="mergedSearchValue"
    @search="onInternalSearch"
    :auto-clear-search-value="searchConfig.autoClearSearchValue"
    @search-split="onInternalSearchSplit"
    :popup-match-select-width="popupMatchSelectWidth"
    :option-list="OptionList"
    :empty-options="!displayOptions.length"
    :active-value="activeValue || undefined"
    :active-descendant-id="`${mergedId}_list_${accessibilityIndex}`"
  />
</template>
