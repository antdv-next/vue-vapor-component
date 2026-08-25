<script setup vapor lang="ts">
  import type { BaseSelectRef } from '@vapor-component/select'
  import type { DataEntity, Key } from '@vapor-component/tree'

  import type {
    CheckedStrategy,
    DataNode,
    DefaultValueType,
    FieldNames,
    LabeledValueType,
    SafeKey,
  } from './interface'
  import type { TreeSelectProps } from './TreeSelect'

  import useId from '@v-c/util/dist/hooks/useId'
  import { BaseSelect } from '@vapor-component/select'
  import { conductCheck } from '@vapor-component/tree'
  import { computed, shallowRef, toRef, useAttrs, watch } from 'vue'

  import {
    useCache,
    useCheckedKeys,
    useDataEntities,
    useFilterTreeData,
    useRefFunc,
    useSearchConfig,
    useTreeData,
  } from './hooks'
  import { useLegacyProvider } from './LegacyContextKey'
  import OptionList from './OptionList.vue'
  import { useTreeSelectProvider } from './TreeSelectContextKey'
  import {
    formatStrategyValues,
    SHOW_ALL,
    SHOW_CHILD,
  } from './utils/strategyUtil'
  import { fillFieldNames, getLabel, isNil, toArray } from './utils/valueUtil'

  defineOptions({ name: 'VcTreeSelect', inheritAttrs: false })

  const props = withDefaults(defineProps<TreeSelectProps>(), {
    prefixCls: 'vc-tree-select',
    listHeight: 200,
    listItemHeight: 20,
    listItemScrollOffset: 0,
    popupMatchSelectWidth: true,
  })

  const emit = defineEmits<{
    'update:value': [value: any]
  }>()

  const attrs = useAttrs()
  const baseSelectRef = shallowRef<BaseSelectRef | null>(null)

  defineExpose({
    focus: () => baseSelectRef.value?.focus(),
    blur: () => baseSelectRef.value?.blur(),
    scrollTo: (arg: any) => baseSelectRef.value?.scrollTo?.(arg),
  })

  const mergedId = useId(props.id)

  // ==================== Computed flags ====================
  const treeConduction = computed(
    () => !!props.treeCheckable && !props.treeCheckStrictly,
  )
  const mergedCheckable = computed(
    () => props.treeCheckable || props.treeCheckStrictly,
  )
  const mergedLabelInValue = computed(
    () => !!props.treeCheckStrictly || !!props.labelInValue,
  )
  const mergedMultiple = computed(
    () => !!mergedCheckable.value || !!props.multiple,
  )
  const mergedShowCheckedStrategy = computed<CheckedStrategy>(() => {
    if (!props.treeCheckable) return SHOW_ALL
    return props.showCheckedStrategy || SHOW_CHILD
  })

  // ==================== FieldNames ====================
  const mergedFieldNames = computed(() => fillFieldNames(props.fieldNames))

  // ==================== Search ====================
  const searchProps = computed(() => ({
    searchValue: undefined as string | undefined,
    inputValue: undefined as string | undefined,
    onSearch: props.onSearch,
    autoClearSearchValue: undefined,
    filterTreeNode: undefined,
    treeNodeFilterProp: undefined,
  }))

  const [mergedShowSearch, searchConfig] = useSearchConfig(
    toRef(props, 'showSearch'),
    searchProps,
  )

  const mergedTreeNodeFilterProp = computed(
    () => searchConfig.value.treeNodeFilterProp || 'value',
  )
  const mergedAutoClearSearchValue = computed(
    () => searchConfig.value.autoClearSearchValue !== false,
  )

  const internalSearchValue = shallowRef('')
  const setSearchValue = (val: string) => {
    internalSearchValue.value = val
  }
  const mergedSearchValue = computed(() => internalSearchValue.value || '')

  const onInternalSearch = (searchText: string) => {
    setSearchValue(searchText)
    searchConfig.value.onSearch?.(searchText)
  }

  // ==================== Data pipeline ====================
  const mergedSourceTreeData = computed<DataNode[]>(() => props.treeData ?? [])

  const mergedTreeData = useTreeData(
    mergedSourceTreeData,
    toRef(props, 'treeDataSimpleMode'),
  )

  const { keyEntities, valueEntities } = useDataEntities(
    mergedTreeData,
    mergedFieldNames,
  )

  const filteredTreeData = useFilterTreeData(
    mergedTreeData,
    mergedSearchValue,
    {
      fieldNames: mergedFieldNames,
      treeNodeFilterProp: mergedTreeNodeFilterProp,
      filterTreeNode: computed(() => searchConfig.value.filterTreeNode),
    },
  )

  // ==================== Value conversion ====================
  function isRawValue(value: SafeKey | LabeledValueType): value is SafeKey {
    return !value || typeof value !== 'object'
  }

  const toLabeledValues = (
    draftValues: DefaultValueType,
  ): LabeledValueType[] => {
    const values = toArray(draftValues)
    return values.map(val => {
      if (isRawValue(val as any)) return { value: val }
      return val as LabeledValueType
    })
  }

  const convert2LabelValues = (
    draftValues: DefaultValueType,
  ): LabeledValueType[] => {
    const values = toLabeledValues(draftValues)
    return values.map(item => {
      let {
        label: rawLabel,
        value: rawValue,
        halfChecked: rawHalfChecked,
      } = item
      let rawDisabled: boolean | undefined

      const entity = valueEntities.value.get(rawValue as SafeKey)
      if (entity) {
        const node = entity.node as DataNode
        if (props.treeNodeLabelProp) {
          rawLabel = rawLabel ?? (node as any)[props.treeNodeLabelProp]
        } else {
          rawLabel = rawLabel ?? getLabel(node, mergedFieldNames.value)
        }
        rawDisabled = node.disabled
      } else if (rawLabel === undefined) {
        const labelInValueItem = toLabeledValues(internalValue.value).find(
          (labeledItem: any) => labeledItem.value === rawValue,
        )
        rawLabel = labelInValueItem?.label
      }

      return {
        label: rawLabel,
        value: rawValue,
        halfChecked: rawHalfChecked,
        disabled: rawDisabled,
      }
    })
  }

  // ==================== Internal value ====================
  const internalValue = shallowRef(props.defaultValue ?? props.value)
  watch(
    () => props.value,
    newVal => {
      internalValue.value = newVal
    },
    { immediate: true },
  )
  const setInternalValue = (val: any) => {
    internalValue.value = val
  }

  const rawMixedLabeledValues = computed<LabeledValueType[]>(() =>
    toLabeledValues(internalValue.value === null ? [] : internalValue.value),
  )
  const rawLabeledValues = computed<LabeledValueType[]>(() =>
    rawMixedLabeledValues.value.filter(item => !item.halfChecked),
  )
  const rawHalfLabeledValues = computed<LabeledValueType[]>(() =>
    rawMixedLabeledValues.value.filter(item => !!item.halfChecked),
  )
  const rawValues = computed(() =>
    rawLabeledValues.value.map(item => item.value!),
  )

  const [rawCheckedValues, rawHalfCheckedValues] = useCheckedKeys(
    rawLabeledValues,
    rawHalfLabeledValues,
    treeConduction,
    keyEntities,
  )

  // ==================== Display values ====================
  const displayValues = computed<LabeledValueType[]>(() => {
    const displayKeys = formatStrategyValues(
      rawCheckedValues.value as SafeKey[],
      mergedShowCheckedStrategy.value,
      keyEntities.value,
      mergedFieldNames.value,
    )
    const valueField = mergedFieldNames.value.value || 'value'
    const values = displayKeys.map(
      key => keyEntities.value[String(key)]?.node?.[valueField] ?? key,
    )
    const rawDisplayValues = convert2LabelValues(values)
    const firstVal = rawDisplayValues[0] as any
    if (
      !mergedMultiple.value &&
      firstVal &&
      isNil(firstVal.value) &&
      isNil(firstVal.label)
    ) {
      return []
    }
    return rawDisplayValues.map(item => ({
      ...item,
      label: item.label ?? item.value,
    }))
  })

  const [cachedDisplayValues] = useCache(displayValues)

  // ==================== MaxCount ====================
  const mergedMaxCount = computed(() => {
    if (
      mergedMultiple.value &&
      (mergedShowCheckedStrategy.value === SHOW_CHILD ||
        props.treeCheckStrictly ||
        !props.treeCheckable)
    ) {
      return props.maxCount
    }
    return null
  })

  // ==================== triggerChange ====================
  const triggerChange = useRefFunc(
    (
      newRawValues: SafeKey[],
      extra: { triggerValue?: SafeKey; selected?: boolean } = {},
      source: 'option' | 'selection' | 'input' | 'clear' = 'option',
    ) => {
      const formattedKeyList = formatStrategyValues(
        newRawValues,
        mergedShowCheckedStrategy.value,
        keyEntities.value,
        mergedFieldNames.value,
      )

      if (
        mergedMaxCount.value &&
        formattedKeyList.length > mergedMaxCount.value
      ) {
        return
      }

      const labeledValues = convert2LabelValues(newRawValues)
      setInternalValue(labeledValues)

      if (mergedAutoClearSearchValue.value) {
        setSearchValue('')
      }

      if (!props.onChange) return

      let eventValues: SafeKey[] = newRawValues
      if (treeConduction.value) {
        const valueField = mergedFieldNames.value.value || 'value'
        eventValues = formattedKeyList.map(key => {
          const entity = valueEntities.value.get(key)
          return entity ? (entity.node as any)[valueField] : key
        })
      }

      let returnRawValues: SafeKey[] = eventValues
      if (props.treeCheckStrictly) {
        const halfValues = rawHalfLabeledValues.value.filter(
          item => !eventValues.includes(item.value as SafeKey),
        )
        returnRawValues = [
          ...returnRawValues,
          ...(halfValues.map(item => item.value!) as SafeKey[]),
        ]
      }

      const returnLabeledValues = convert2LabelValues(returnRawValues)
      const additionalInfo: any = {
        preValue: rawLabeledValues.value,
        triggerValue: extra.triggerValue,
      }
      if (mergedCheckable.value) {
        additionalInfo.checked = extra.selected
      } else {
        additionalInfo.selected = extra.selected
      }

      const returnValues = mergedLabelInValue.value
        ? returnLabeledValues
        : returnLabeledValues.map(item => item.value)
      const returnValue = mergedMultiple.value
        ? returnValues
        : (returnValues as any[])[0]
      const labelList = mergedLabelInValue.value
        ? null
        : returnLabeledValues.map(item => item.label)

      props.onChange(returnValue as any, labelList, additionalInfo)
      emit('update:value', returnValue)
    },
  )

  // ==================== onOptionSelect ====================
  const onOptionSelect = (
    selectedKey: SafeKey,
    info: {
      selected: boolean
      source?: 'option' | 'selection' | 'input' | 'clear'
    },
  ) => {
    const entity = keyEntities.value[String(selectedKey)] as
      | DataEntity
      | undefined
    const node = entity?.node as DataNode | undefined
    const valueField = mergedFieldNames.value.value || 'value'
    const selectedValue = node?.[valueField] ?? selectedKey

    if (!mergedMultiple.value) {
      triggerChange(
        [selectedValue as SafeKey],
        { selected: true, triggerValue: selectedValue as SafeKey },
        'option',
      )
    } else {
      let newRawValues = info.selected
        ? ([...rawValues.value, selectedValue] as SafeKey[])
        : (rawCheckedValues.value as SafeKey[]).filter(v => v !== selectedValue)

      if (treeConduction.value) {
        const missingRawValues: SafeKey[] = []
        const existRawValues: SafeKey[] = []
        newRawValues.forEach(val => {
          if (valueEntities.value.has(val)) existRawValues.push(val)
          else missingRawValues.push(val)
        })

        const keyList = existRawValues.map(val => {
          const entity = valueEntities.value.get(val)
          return entity?.key ?? val
        })

        let checkedKeys: Key[]
        if (info.selected) {
          checkedKeys = conductCheck(
            keyList as any,
            true,
            keyEntities.value,
          ).checkedKeys
        } else {
          checkedKeys = conductCheck(
            keyList as any,
            { checked: false, halfCheckedKeys: rawHalfCheckedValues.value },
            keyEntities.value,
          ).checkedKeys
        }

        newRawValues = [
          ...missingRawValues,
          ...(checkedKeys.map(key => {
            const e = keyEntities.value[String(key)] as DataEntity | undefined
            return e?.node?.[valueField] ?? key
          }) as SafeKey[]),
        ]
      }

      triggerChange(
        newRawValues,
        { selected: info.selected, triggerValue: selectedValue as SafeKey },
        info.source || 'option',
      )
    }

    if (info.selected || !mergedMultiple.value) {
      props.onSelect?.(selectedValue as any, node)
    } else {
      props.onDeselect?.(selectedValue as any, node)
    }
  }

  // ==================== Popup visible ====================
  const onInternalPopupVisibleChange = (open: boolean) => {
    props.onPopupVisibleChange?.(open)
  }

  // ==================== Display values change ====================
  const onDisplayValuesChange = useRefFunc((newValues: any[], info: any) => {
    const newRawValues = newValues.map((item: any) => item.value)
    if (info.type === 'clear') {
      triggerChange(newRawValues, {}, 'clear')
      return
    }
    if (info.values?.length) {
      onOptionSelect(info.values[0].value, {
        selected: false,
        source: 'selection',
      })
    }
  })

  // ==================== Tree expand / load ====================
  const onTreeExpand = (keys: Key[]) => {
    props.onTreeExpand?.(keys as SafeKey[])
  }

  const onTreeLoad = (keys: SafeKey[]) => {
    props.onTreeLoad?.(keys)
  }

  // ==================== Contexts ====================
  const treeSelectContext = computed(() => ({
    virtual: props.virtual,
    popupMatchSelectWidth: props.popupMatchSelectWidth,
    listHeight: props.listHeight,
    listItemHeight: props.listItemHeight,
    listItemScrollOffset: props.listItemScrollOffset,
    treeData: filteredTreeData.value,
    fieldNames: mergedFieldNames.value,
    onSelect: onOptionSelect,
    treeExpandAction: props.treeExpandAction,
    treeTitleRender: props.treeTitleRender,
    onPopupScroll: props.onPopupScroll,
    leftMaxCount:
      props.maxCount === undefined
        ? null
        : props.maxCount - cachedDisplayValues.value.length,
    leafCountOnly:
      mergedShowCheckedStrategy.value === SHOW_CHILD &&
      !props.treeCheckStrictly &&
      !!props.treeCheckable,
    valueEntities: valueEntities.value,
    classNames: props.classNames,
    styles: props.styles,
    showCheckedStrategy: mergedShowCheckedStrategy.value,
  }))

  useTreeSelectProvider(treeSelectContext)

  const legacyContext = computed(() => ({
    checkable: mergedCheckable.value,
    loadData: props.loadData,
    treeLoadedKeys: props.treeLoadedKeys,
    onTreeLoad: onTreeLoad,
    checkedKeys: rawCheckedValues.value,
    halfCheckedKeys: rawHalfCheckedValues.value,
    treeDefaultExpandAll: props.treeDefaultExpandAll,
    treeExpandedKeys: props.treeExpandedKeys,
    treeDefaultExpandedKeys: props.treeDefaultExpandedKeys || [],
    onTreeExpand: onTreeExpand,
    treeIcon: props.treeIcon,
    showTreeIcon: props.showTreeIcon,
    switcherIcon: props.switcherIcon,
    treeLine: props.treeLine,
    treeNodeFilterProp: mergedTreeNodeFilterProp.value,
    keyEntities: keyEntities.value,
    treeExpandAction: props.treeExpandAction,
    treeTitleRender: props.treeTitleRender,
    onPopupScroll: props.onPopupScroll,
    disabled: props.disabled,
  }))

  useLegacyProvider(legacyContext)

  // ==================== forwardProps ====================
  // Keys handled internally by TreeSelect — excluded from forwarding to BaseSelect.
  const omitKeyList: string[] = [
    'id',
    'prefixCls',
    'value',
    'defaultValue',
    'onChange',
    'showSearch',
    'searchValue',
    'inputValue',
    'onSearch',
    'autoClearSearchValue',
    'filterTreeNode',
    'treeNodeFilterProp',
    'onSelect',
    'onDeselect',
    'showCheckedStrategy',
    'treeNodeLabelProp',
    'fieldNames',
    'multiple',
    'treeCheckable',
    'treeCheckStrictly',
    'labelInValue',
    'maxCount',
    'treeData',
    'treeDataSimpleMode',
    'treeDefaultExpandAll',
    'treeExpandedKeys',
    'treeDefaultExpandedKeys',
    'onTreeExpand',
    'treeExpandAction',
    'virtual',
    'listHeight',
    'listItemHeight',
    'listItemScrollOffset',
    'onPopupVisibleChange',
    'popupMatchSelectWidth',
    'treeTitleRender',
    'treeLine',
    'treeIcon',
    'showTreeIcon',
    'switcherIcon',
    'treeLoadedKeys',
    'onTreeLoad',
    'loadData',
    'onPopupScroll',
    'classNames',
    'styles',
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
</script>

<template>
  <BaseSelect
    v-bind="forwardProps"
    ref="baseSelectRef"
    :id="mergedId"
    :prefix-cls="prefixCls"
    :mode="mergedMultiple ? 'multiple' : undefined"
    :class-names="classNames"
    :styles="styles"
    :display-values="cachedDisplayValues"
    @display-values-change="onDisplayValuesChange"
    :max-count="maxCount"
    :show-search="mergedShowSearch"
    :search-value="mergedSearchValue"
    @search="onInternalSearch"
    :auto-clear-search-value="mergedAutoClearSearchValue"
    :popup-match-select-width="popupMatchSelectWidth"
    :empty-options="!mergedTreeData.length"
    @popup-visible-change="onInternalPopupVisibleChange"
  >
    <template #optionList>
      <slot name="optionList" ref="listRef">
        <OptionList ref="listRef" />
      </slot>
    </template>
  </BaseSelect>
</template>
