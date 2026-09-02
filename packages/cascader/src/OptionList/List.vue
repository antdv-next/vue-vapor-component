<script setup vapor lang="ts">
  import type { DefaultOptionType, LegacyKey, SingleValueType } from '../interface'
  import { clsx } from '@v-c/util'
  import {
    computed,
    nextTick,
    onBeforeUpdate,
    ref,
    shallowRef,
    watch,
    watchEffect,
  } from 'vue'
  import { useCascaderContext } from '../CascaderContextKey'
  import {
    getFullPathKeys,
    isLeaf,
    scrollIntoParentView,
    toPathKey,
    toPathKeys,
    toPathValueStr,
  } from '../utils/commonUtil'
  import { toPathOptions } from '../utils/treeUtil'
  import Column, { FIX_LABEL } from './Column.vue'
  import useActive from './useActive'
  import useKeyboard from './useKeyboard'

  const props = withDefaults(
    defineProps<{
      prefixCls: string
      multiple?: boolean
      searchValue?: string
      toggleOpen?: (open?: boolean) => void
      notFoundContent?: any
      direction?: 'ltr' | 'rtl'
      open?: boolean
      disabled?: boolean
      lockOptions?: boolean
    }>(),
    {
      prefixCls: '',
      multiple: false,
      searchValue: '',
      toggleOpen: () => {},
      open: false,
      direction: 'ltr',
      disabled: false,
      lockOptions: false,
    },
  )

  const containerRef = ref<HTMLDivElement | null>(null)
  const rtl = computed(() => props.direction === 'rtl')
  const context = useCascaderContext()
  const mergedPrefixCls = computed(
    () => context.value?.popupPrefixCls || props.prefixCls,
  )
  const mergedFieldNames = computed(() => context.value?.fieldNames || null)

  // ========================= loadData =========================
  const loadingKeys = ref<LegacyKey[]>([])

  const internalLoadData = (valueCells: LegacyKey[]) => {
    if (!context.value?.loadData || props.searchValue) {
      return
    }

    const fieldNames = mergedFieldNames.value
    const options = context.value?.options || []
    if (!fieldNames) {
      return
    }

    const optionList = toPathOptions(
      valueCells as SingleValueType,
      options,
      fieldNames,
    )
    const rawOptions = optionList.map(({ option }) => option)
    const lastOption = rawOptions[rawOptions.length - 1]

    if (lastOption && !isLeaf(lastOption, fieldNames)) {
      const pathKey = toPathKey(valueCells as SingleValueType)
      loadingKeys.value = [...loadingKeys.value, pathKey]
      context.value.loadData(rawOptions)
    }
  }

  watchEffect(() => {
    const fieldNames = mergedFieldNames.value
    const options = context.value?.options || []

    if (!loadingKeys.value.length || !fieldNames) {
      return
    }

    const nextLoadingKeys = loadingKeys.value.filter((loadingKey) => {
      const valueStrCells = toPathValueStr(String(loadingKey))
      const optionList = toPathOptions(
        valueStrCells as SingleValueType,
        options,
        fieldNames,
        true,
      ).map(({ option }) => option)
      const lastOption = optionList[optionList.length - 1]

      return !(
        !lastOption ||
        (lastOption as any)[fieldNames.children] ||
        isLeaf(lastOption, fieldNames)
      )
    })

    const isSame =
      nextLoadingKeys.length === loadingKeys.value.length &&
      nextLoadingKeys.every((key, index) => key === loadingKeys.value[index])

    if (!isSame) {
      loadingKeys.value = nextLoadingKeys
    }
  })

  // ========================== Values ==========================
  const checkedSet = computed(() =>
    new Set(toPathKeys(context.value?.values || [])),
  )
  const halfCheckedSet = computed(() =>
    new Set(toPathKeys(context.value?.halfValues || [])),
  )

  // ====================== Accessibility =======================
  const [activeValueCells, setActiveValueCells] = useActive(
    computed(() => !!props.multiple),
    computed(() => !!props.open),
  )

  // =========================== Path ===========================
  const onPathOpen = (nextValueCells: LegacyKey[]) => {
    setActiveValueCells(nextValueCells)
    internalLoadData(nextValueCells)
  }

  const isSelectable = (option: DefaultOptionType) => {
    if (props.disabled) {
      return false
    }

    const fieldNames = mergedFieldNames.value
    if (!fieldNames) {
      return false
    }
    const isMergedLeaf = isLeaf(option, fieldNames)

    return (
      !option.disabled &&
      (isMergedLeaf || context.value?.changeOnSelect || !!props.multiple)
    )
  }

  const onPathSelect = (valuePath: SingleValueType, leaf: boolean, fromKeyboard = false) => {
    context.value?.onSelect(valuePath)

    if (
      !props.multiple &&
      (leaf ||
        (context.value?.changeOnSelect &&
          (context.value?.expandTrigger === 'hover' || fromKeyboard)))
    ) {
      props.toggleOpen?.(false)
    }
  }

  // ========================== Options ==========================
  const filteredOptions = computed(() => {
    if (props.searchValue) {
      return context.value?.searchOptions || []
    }
    return context.value?.options || []
  })

  const mergedOptions = shallowRef<DefaultOptionType[]>(filteredOptions.value)
  onBeforeUpdate(() => {
    if (
      !!props.open &&
      !props.lockOptions &&
      mergedOptions.value !== filteredOptions.value
    ) {
      mergedOptions.value = filteredOptions.value
    }
  })

  // ========================== Column ==========================
  const optionColumns = computed(() => {
    const fieldNames = mergedFieldNames.value
    if (!fieldNames) {
      return []
    }

    const optionList: { options: DefaultOptionType[] }[] = [
      { options: mergedOptions.value },
    ]
    let currentList: DefaultOptionType[] = mergedOptions.value

    const fullPathKeys = getFullPathKeys(currentList, fieldNames)

    for (let i = 0; i < activeValueCells.value.length; i += 1) {
      const activeValueCell = activeValueCells.value[i]
      const currentOption = currentList.find((_option, index) => {
        const opt = _option as Record<string, any>
        const pk = fullPathKeys[index]
        const val = pk ? toPathKey(pk as LegacyKey[]) : opt[fieldNames.value]
        return val === activeValueCell
      })

      const subOptions = (currentOption as any)?.[fieldNames.children]
      if (!subOptions?.length) {
        break
      }

      currentList = subOptions
      optionList.push({ options: subOptions })
    }

    return optionList
  })

  // ========================= Keyboard =========================
  const onKeyboardSelect = (
    selectValueCells: SingleValueType,
    option: DefaultOptionType,
  ) => {
    if (isSelectable(option) && mergedFieldNames.value) {
      onPathSelect(
        selectValueCells,
        isLeaf(option, mergedFieldNames.value),
        true,
      )
    }
  }

  const keyboardConfig = useKeyboard(
    mergedOptions as any,
    mergedFieldNames.value as any,
    activeValueCells,
    onPathOpen,
    onKeyboardSelect,
    {
      direction: computed(() => props.direction),
      searchValue: computed(() => props.searchValue || ''),
      toggleOpen: props.toggleOpen!,
      open: computed(() => !!props.open),
    },
  )

  defineExpose({
    onKeyDown: (e: KeyboardEvent) => keyboardConfig.onKeyDown(e),
    onKeyUp: () => keyboardConfig.onKeyUp(),
    scrollTo: keyboardConfig.scrollTo,
  })

  // >>>>> Active Scroll
  watch(
    [() => activeValueCells.value, () => props.searchValue],
    () => {
      if (props.searchValue) {
        return
      }
      nextTick(() => {
        for (let i = 0; i < activeValueCells.value.length; i += 1) {
          const cellPath = activeValueCells.value.slice(0, i + 1)
          const cellKeyPath = toPathKey(cellPath as SingleValueType)
          const escaped = cellKeyPath.replace(/"/g, '\\"')
          const ele = containerRef.value?.querySelector<HTMLElement>(
            `li[data-path-key="${escaped}"]`,
          )
          if (ele) {
            scrollIntoParentView(ele)
          }
        }
      })
    },
    { deep: true },
  )

  const isEmpty = computed(() => !optionColumns.value[0]?.options?.length)

  const emptyList = computed<DefaultOptionType[]>(() => {
    const fieldNames = mergedFieldNames.value
    if (!fieldNames) return []
    return [
      {
        [fieldNames.value as 'value']: '__EMPTY__',
        [FIX_LABEL as 'label']: props.notFoundContent || 'Not Found',
        disabled: true,
      } as DefaultOptionType,
    ]
  })

  const mergedOptionColumns = computed(() =>
    isEmpty.value ? [{ options: emptyList.value }] : optionColumns.value,
  )
</script>

<template>
  <div
    :class="
      clsx(`${mergedPrefixCls}-menus`, {
        [`${mergedPrefixCls}-menu-empty`]: isEmpty,
        [`${mergedPrefixCls}-rtl`]: rtl,
      })
    "
    ref="containerRef"
  >
    <template v-for="(col, index) in mergedOptionColumns" :key="index">
      <Column
        :prefix-cls="mergedPrefixCls"
        :options="col.options"
        :multiple="!isEmpty && multiple"
        :prev-value-path="activeValueCells.slice(0, index)"
        :active-value="activeValueCells[index]"
        :checked-set="checkedSet"
        :half-checked-set="halfCheckedSet"
        :loading-keys="loadingKeys"
        :disabled="disabled"
        @select="(path, leaf) => onPathSelect(path as SingleValueType, leaf)"
        @active="onPathOpen"
        @toggle-open="(open: boolean) => toggleOpen?.(open)"
      />
    </template>
  </div>
</template>
