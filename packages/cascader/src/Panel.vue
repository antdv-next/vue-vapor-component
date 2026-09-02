<script setup vapor lang="ts">
  import type { DefaultOptionType, SingleValueType } from './interface'
  import { clsx } from '@v-c/util'
  import { computed, shallowRef, toRef, watch } from 'vue'

  import type { CascaderProps } from './Cascader'
  import { useCascaderProvider } from './CascaderContextKey'
  import useMissingValues from './hooks/useMissingValues'
  import useOptions from './hooks/useOptions'
  import useSelect from './hooks/useSelect'
  import useValues from './hooks/useValues'
  import RawOptionList from './OptionList/List.vue'
  import {
    fillFieldNames,
    SHOW_PARENT,
    toRawValues,
  } from './utils'
  import { toPathOptions } from './utils/treeUtil'

  const props = withDefaults(
    defineProps<Pick<CascaderProps, 'value' | 'defaultValue' | 'changeOnSelect' | 'options' | 'prefixCls' | 'checkable' | 'checkStrictly' | 'fieldNames' | 'showCheckedStrategy' | 'loadData' | 'expandTrigger' | 'expandIcon' | 'loadingIcon' | 'disabled' | 'optionRender'> & {
      className?: string
      style?: any
      direction?: 'ltr' | 'rtl'
      notFoundContent?: any
    }>(),
    {
      prefixCls: 'vc-cascader',
      expandIcon: '>',
      showCheckedStrategy: SHOW_PARENT,
      notFoundContent: 'Not Found',
    },
  )

  const emit = defineEmits<{
    'update:value': [value: any]
    change: [value: any, options: any]
  }>()

  const multiple = computed(() => !!props.checkable)

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

  const rawValues = computed(() => toRawValues(internalRawValues.value as any))
  const mergedFieldNames = computed(() => fillFieldNames(props.fieldNames))

  const [mergedOptions, getPathKeyEntities, getValueByKeyPath] = useOptions(
    mergedFieldNames,
    computed(() => props.options as any),
  )

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

  const mergedShowCheckedStrategy = computed(
    () => props.showCheckedStrategy ?? SHOW_PARENT,
  )

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

  const onInternalSelect = (valuePath: SingleValueType) => {
    handleSelection(valuePath)
  }

  const cascaderContext = computed(() => ({
    options: mergedOptions.value,
    fieldNames: mergedFieldNames.value,
    values: checkedValues.value,
    halfValues: halfCheckedValues.value,
    changeOnSelect: props.changeOnSelect,
    onSelect: onInternalSelect,
    checkable: props.checkable,
    searchOptions: [],
    popupPrefixCls: undefined,
    loadData: props.loadData,
    expandTrigger: props.expandTrigger,
    expandIcon:
      props.expandIcon !== undefined ? props.expandIcon : (props.expandIcon as any),
    loadingIcon: props.loadingIcon,
    popupMenuColumnStyle: undefined,
    optionRender: props.optionRender,
    classNames: undefined,
    styles: undefined,
    direction: props.direction,
    disabled: props.disabled,
    notFoundContent: props.notFoundContent,
  }))

  useCascaderProvider(cascaderContext)

  const panelPrefixCls = computed(
    () => `${props.prefixCls ?? 'vc-cascader'}-panel`,
  )
  const isEmpty = computed(() => !mergedOptions.value.length)

  const panelCls = computed(() =>
    clsx(
      panelPrefixCls.value,
      {
        [`${panelPrefixCls.value}-rtl`]: props.direction === 'rtl',
        [`${panelPrefixCls.value}-empty`]: isEmpty.value,
      },
      props.className,
    ),
  )
</script>

<template>
  <div :class="panelCls" :style="props.style">
    <template v-if="isEmpty">{{ notFoundContent ?? 'Not Found' }}</template>
    <template v-else>
      <RawOptionList
        :prefix-cls="prefixCls ?? 'vc-cascader'"
        :multiple="multiple"
        :search-value="''"
        :open="true"
        :direction="direction"
        :disabled="disabled"
      />
    </template>
  </div>
</template>
